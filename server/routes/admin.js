const express = require('express');
const router = express.Router();
const { Transaction, Wallet, User } = require('../models');
const pricingService = require('../services/pricingService');
const revenueCollectionService = require('../services/revenueCollectionService');

// Admin authentication middleware (you can enhance this)
const adminAuth = (req, res, next) => {
  // For now, we'll just check if user is admin
  // In production, implement proper admin authentication
  const isAdmin = req.headers['x-admin-key'] === process.env.ADMIN_KEY || 
                  req.query.adminKey === process.env.ADMIN_KEY;
  
  if (!isAdmin) {
    return res.status(401).json({ 
      success: false, 
      message: 'Admin access required' 
    });
  }
  
  next();
};

// Apply admin auth to all routes
router.use(adminAuth);

// Get loyalty analytics overview
router.get('/loyalty/overview', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Set date range (default to last 30 days)
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    // Get all transactions in date range
    const transactions = await Transaction.find({
      createdAt: { $gte: start, $lte: end },
      type: 'payment',
      'metadata.service': { $in: ['airtime', 'data'] }
    }).sort({ createdAt: -1 });

    // Calculate metrics
    const totalTransactions = transactions.length;
    const totalVolume = transactions.reduce((sum, t) => sum + t.amount, 0);
    
    // Group by service
    const airtimeTransactions = transactions.filter(t => t.metadata.service === 'airtime');
    const dataTransactions = transactions.filter(t => t.metadata.service === 'data');
    
    // Calculate cashback metrics
    const cashbackTransactions = await Transaction.find({
      createdAt: { $gte: start, $lte: end },
      type: 'deposit',
      'metadata.type': 'cashback'
    });
    
    const totalCashbackGiven = cashbackTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    // Daily breakdown
    const dailyStats = {};
    transactions.forEach(transaction => {
      const date = transaction.createdAt.toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = {
          date,
          airtime: 0,
          data: 0,
          total: 0,
          volume: 0,
          cashback: 0
        };
      }
      
      dailyStats[date].total++;
      dailyStats[date].volume += transaction.amount;
      
      if (transaction.metadata.service === 'airtime') {
        dailyStats[date].airtime++;
      } else if (transaction.metadata.service === 'data') {
        dailyStats[date].data++;
      }
    });
    
    // Add cashback data to daily stats
    cashbackTransactions.forEach(transaction => {
      const date = transaction.createdAt.toISOString().split('T')[0];
      if (dailyStats[date]) {
        dailyStats[date].cashback += transaction.amount;
      }
    });
    
    const dailyBreakdown = Object.values(dailyStats).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
    
    // Top users by volume
    const userStats = {};
    transactions.forEach(transaction => {
      const userId = transaction.userId.toString();
      if (!userStats[userId]) {
        userStats[userId] = {
          userId,
          totalTransactions: 0,
          totalVolume: 0,
          airtimeCount: 0,
          dataCount: 0,
          cashbackEarned: 0
        };
      }
      
      userStats[userId].totalTransactions++;
      userStats[userId].totalVolume += transaction.amount;
      
      if (transaction.metadata.service === 'airtime') {
        userStats[userId].airtimeCount++;
      } else if (transaction.metadata.service === 'data') {
        userStats[userId].dataCount++;
      }
    });
    
    // Add cashback data to user stats
    cashbackTransactions.forEach(transaction => {
      const userId = transaction.userId.toString();
      if (userStats[userId]) {
        userStats[userId].cashbackEarned += transaction.amount;
      }
    });
    
    const topUsers = Object.values(userStats)
      .sort((a, b) => b.totalVolume - a.totalVolume)
      .slice(0, 10);
    
    // Service breakdown
    const serviceBreakdown = {
      airtime: {
        transactions: airtimeTransactions.length,
        volume: airtimeTransactions.reduce((sum, t) => sum + t.amount, 0),
        averageTransaction: airtimeTransactions.length > 0 ? 
          airtimeTransactions.reduce((sum, t) => sum + t.amount, 0) / airtimeTransactions.length : 0
      },
      data: {
        transactions: dataTransactions.length,
        volume: dataTransactions.reduce((sum, t) => sum + t.amount, 0),
        averageTransaction: dataTransactions.length > 0 ? 
          dataTransactions.reduce((sum, t) => sum + t.amount, 0) / dataTransactions.length : 0
      }
    };
    
    res.json({
      success: true,
      analytics: {
        overview: {
          totalTransactions,
          totalVolume,
          totalCashbackGiven,
          averageTransactionValue: totalTransactions > 0 ? totalVolume / totalTransactions : 0,
          cashbackRate: totalVolume > 0 ? (totalCashbackGiven / totalVolume) * 100 : 0,
          dateRange: { start, end }
        },
        serviceBreakdown,
        dailyBreakdown,
        topUsers,
        summary: {
          airtimeTransactions: airtimeTransactions.length,
          dataTransactions: dataTransactions.length,
          totalUsers: Object.keys(userStats).length,
          averageDailyTransactions: dailyBreakdown.length > 0 ? 
            dailyBreakdown.reduce((sum, day) => sum + day.total, 0) / dailyBreakdown.length : 0
        }
      }
    });
  } catch (error) {
    console.error('Loyalty analytics error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch loyalty analytics' 
    });
  }
});

// Get user-specific loyalty data
router.get('/loyalty/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 30 } = req.query;
    
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    // Get user's transactions
    const transactions = await Transaction.find({
      userId,
      createdAt: { $gte: startDate },
      type: 'payment',
      'metadata.service': { $in: ['airtime', 'data'] }
    }).sort({ createdAt: -1 });
    
    // Get user's cashback transactions
    const cashbackTransactions = await Transaction.find({
      userId,
      createdAt: { $gte: startDate },
      type: 'deposit',
      'metadata.type': 'cashback'
    }).sort({ createdAt: -1 });
    
    // Calculate daily purchase counts
    const dailyCounts = {};
    transactions.forEach(transaction => {
      const date = transaction.createdAt.toISOString().split('T')[0];
      if (!dailyCounts[date]) {
        dailyCounts[date] = { airtime: 0, data: 0, total: 0 };
      }
      
      dailyCounts[date].total++;
      if (transaction.metadata.service === 'airtime') {
        dailyCounts[date].airtime++;
      } else if (transaction.metadata.service === 'data') {
        dailyCounts[date].data++;
      }
    });
    
    // Calculate loyalty metrics
    const totalVolume = transactions.reduce((sum, t) => sum + t.amount, 0);
    const totalCashback = cashbackTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    // Get current loyalty status
    const airtimeCount = await pricingService.getDailyPurchaseCount(userId, 'airtime');
    const dataCount = await pricingService.getDailyPurchaseCount(userId, 'data');
    
    res.json({
      success: true,
      userLoyalty: {
        userId,
        currentStatus: {
          airtimeDailyPurchases: airtimeCount,
          dataDailyPurchases: dataCount,
          totalDailyPurchases: airtimeCount + dataCount,
          isEligibleForCashback: (airtimeCount + dataCount) >= 3
        },
        periodStats: {
          totalTransactions: transactions.length,
          totalVolume,
          totalCashback,
          averageTransactionValue: transactions.length > 0 ? totalVolume / transactions.length : 0,
          cashbackRate: totalVolume > 0 ? (totalCashback / totalVolume) * 100 : 0
        },
        dailyBreakdown: Object.entries(dailyCounts).map(([date, counts]) => ({
          date,
          ...counts
        })).sort((a, b) => new Date(a.date) - new Date(b.date)),
        recentTransactions: transactions.slice(0, 10),
        recentCashback: cashbackTransactions.slice(0, 10)
      }
    });
  } catch (error) {
    console.error('User loyalty data error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch user loyalty data' 
    });
  }
});

// Get real-time loyalty metrics
router.get('/loyalty/realtime', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Today's transactions
    const todayTransactions = await Transaction.find({
      createdAt: { $gte: today, $lt: tomorrow },
      type: 'payment',
      'metadata.service': { $in: ['airtime', 'data'] }
    });
    
    // Today's cashback
    const todayCashback = await Transaction.find({
      createdAt: { $gte: today, $lt: tomorrow },
      type: 'deposit',
      'metadata.type': 'cashback'
    });
    
    // Active users today (users who made at least one purchase)
    const activeUsers = [...new Set(todayTransactions.map(t => t.userId.toString()))];
    
    // Users eligible for cashback
    const eligibleUsers = [];
    for (const userId of activeUsers) {
      const airtimeCount = await pricingService.getDailyPurchaseCount(userId, 'airtime');
      const dataCount = await pricingService.getDailyPurchaseCount(userId, 'data');
      if (airtimeCount + dataCount >= 3) {
        eligibleUsers.push(userId);
      }
    }
    
    res.json({
      success: true,
      realtime: {
        today: {
          transactions: todayTransactions.length,
          volume: todayTransactions.reduce((sum, t) => sum + t.amount, 0),
          cashbackGiven: todayCashback.reduce((sum, t) => sum + t.amount, 0),
          activeUsers: activeUsers.length,
          eligibleUsers: eligibleUsers.length
        },
        hourlyBreakdown: getHourlyBreakdown(todayTransactions),
        topServices: getTopServices(todayTransactions)
      }
    });
  } catch (error) {
    console.error('Real-time loyalty error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch real-time data' 
    });
  }
});

// Get revenue analytics
router.get('/revenue/overview', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Set date range (default to last 30 days)
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    // Get all revenue transactions in date range
    const revenueTransactions = await Transaction.find({
      createdAt: { $gte: start, $lte: end },
      type: 'revenue'
    }).sort({ createdAt: -1 });

    // Calculate total revenue
    const totalRevenue = revenueTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    // Group by service type
    const serviceRevenue = {};
    revenueTransactions.forEach(transaction => {
      const service = transaction.metadata.service || 'unknown';
      if (!serviceRevenue[service]) {
        serviceRevenue[service] = { count: 0, amount: 0 };
      }
      serviceRevenue[service].count++;
      serviceRevenue[service].amount += transaction.amount;
    });
    
    // Daily revenue breakdown
    const dailyRevenue = {};
    revenueTransactions.forEach(transaction => {
      const date = transaction.createdAt.toISOString().split('T')[0];
      if (!dailyRevenue[date]) {
        dailyRevenue[date] = { date, amount: 0, count: 0 };
      }
      dailyRevenue[date].amount += transaction.amount;
      dailyRevenue[date].count++;
    });
    
    const dailyBreakdown = Object.values(dailyRevenue).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
    
    // Transfer fee revenue specifically
    const transferFeeRevenue = revenueTransactions.filter(t => 
      t.metadata.service === 'transfer_fee'
    );
    const totalTransferFees = transferFeeRevenue.reduce((sum, t) => sum + t.amount, 0);
    
    // Bill payment revenue
    const billRevenue = revenueTransactions.filter(t => 
      t.metadata.service === 'bill_fee'
    );
    const totalBillFees = billRevenue.reduce((sum, t) => sum + t.amount, 0);
    
    res.json({
      success: true,
      revenue: {
        overview: {
          totalRevenue,
          totalTransactions: revenueTransactions.length,
          averageRevenuePerTransaction: revenueTransactions.length > 0 ? 
            totalRevenue / revenueTransactions.length : 0,
          dateRange: { start, end }
        },
        serviceBreakdown: Object.entries(serviceRevenue).map(([service, data]) => ({
          service,
          count: data.count,
          amount: data.amount,
          percentage: totalRevenue > 0 ? (data.amount / totalRevenue) * 100 : 0
        })),
        dailyBreakdown,
        transferFees: {
          total: totalTransferFees,
          count: transferFeeRevenue.length,
          average: transferFeeRevenue.length > 0 ? totalTransferFees / transferFeeRevenue.length : 0
        },
        billFees: {
          total: totalBillFees,
          count: billRevenue.length,
          average: billRevenue.length > 0 ? totalBillFees / billRevenue.length : 0
        },
        recentTransactions: revenueTransactions.slice(0, 20)
      }
    });
  } catch (error) {
    console.error('Revenue analytics error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch revenue analytics' 
    });
  }
});

// Get revenue by service type
router.get('/revenue/service/:service', async (req, res) => {
  try {
    const { service } = req.params;
    const { startDate, endDate } = req.query;
    
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const revenueTransactions = await Transaction.find({
      createdAt: { $gte: start, $lte: end },
      type: 'revenue',
      'metadata.service': service
    }).sort({ createdAt: -1 });
    
    const totalRevenue = revenueTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    res.json({
      success: true,
      serviceRevenue: {
        service,
        totalRevenue,
        count: revenueTransactions.length,
        average: revenueTransactions.length > 0 ? totalRevenue / revenueTransactions.length : 0,
        transactions: revenueTransactions
      }
    });
  } catch (error) {
    console.error('Service revenue error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch service revenue' 
    });
  }
});

// ===== REVENUE COLLECTION ENDPOINTS =====

// Get uncollected revenue
router.get('/revenue/uncollected', async (req, res) => {
  try {
    const result = await revenueCollectionService.getUncollectedRevenue();
    
    if (!result.success) {
      return res.status(500).json({ 
        success: false, 
        message: result.error 
      });
    }

    res.json({
      success: true,
      uncollectedRevenue: result
    });
  } catch (error) {
    console.error('Uncollected revenue error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch uncollected revenue' 
    });
  }
});

// Collect revenue to admin bank account
router.post('/revenue/collect', async (req, res) => {
  try {
    const { amount } = req.body; // Optional: specific amount to collect
    
    const result = await revenueCollectionService.collectRevenue(amount);
    
    if (!result.success) {
      return res.status(400).json({ 
        success: false, 
        message: result.error 
      });
    }

    res.json({
      success: true,
      message: result.message,
      collection: result
    });
  } catch (error) {
    console.error('Revenue collection error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to collect revenue' 
    });
  }
});

// Get revenue collection history
router.get('/revenue/collections', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    
    const result = await revenueCollectionService.getCollectionHistory(parseInt(limit));
    
    if (!result.success) {
      return res.status(500).json({ 
        success: false, 
        message: result.error 
      });
    }

    res.json({
      success: true,
      collections: result.collections
    });
  } catch (error) {
    console.error('Collection history error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch collection history' 
    });
  }
});

// Get revenue summary
router.get('/revenue/summary', async (req, res) => {
  try {
    const result = await revenueCollectionService.getRevenueSummary();
    
    if (!result.success) {
      return res.status(500).json({ 
        success: false, 
        message: result.error 
      });
    }

    res.json({
      success: true,
      summary: result.summary
    });
  } catch (error) {
    console.error('Revenue summary error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch revenue summary' 
    });
  }
});

// Helper functions
function getHourlyBreakdown(transactions) {
  const hourly = Array(24).fill(0);
  transactions.forEach(transaction => {
    const hour = transaction.createdAt.getHours();
    hourly[hour]++;
  });
  return hourly.map((count, hour) => ({ hour, count }));
}

function getTopServices(transactions) {
  const services = {};
  transactions.forEach(transaction => {
    const service = transaction.metadata.service;
    if (!services[service]) {
      services[service] = { count: 0, volume: 0 };
    }
    services[service].count++;
    services[service].volume += transaction.amount;
  });
  
  return Object.entries(services)
    .map(([service, data]) => ({ service, ...data }))
    .sort((a, b) => b.count - a.count);
}

module.exports = router;


