const { Transaction } = require('../models');
const hybridBankingService = require('./hybridBankingService');

class RevenueCollectionService {
  constructor() {
    this.adminBankAccount = {
      accountNumber: process.env.ADMIN_BANK_ACCOUNT,
      bankCode: process.env.ADMIN_BANK_CODE,
      accountName: process.env.ADMIN_ACCOUNT_NAME || 'PaxCash Admin'
    };
  }

  // Get total uncollected revenue
  async getUncollectedRevenue() {
    try {
      // Get all revenue transactions that haven't been collected
      const uncollectedRevenue = await Transaction.find({
        type: 'revenue',
        'metadata.collected': { $ne: true }
      });

      const totalAmount = uncollectedRevenue.reduce((sum, t) => sum + t.amount, 0);
      
      return {
        success: true,
        totalAmount,
        transactionCount: uncollectedRevenue.length,
        transactions: uncollectedRevenue
      };
    } catch (error) {
      console.error('Error getting uncollected revenue:', error);
      return { success: false, error: error.message };
    }
  }

  // Collect revenue to admin bank account
  async collectRevenue(amount = null) {
    try {
      // Get uncollected revenue
      const revenueData = await this.getUncollectedRevenue();
      
      if (!revenueData.success) {
        throw new Error(revenueData.error);
      }

      const collectAmount = amount || revenueData.totalAmount;
      
      if (collectAmount <= 0) {
        return {
          success: true,
          message: 'No revenue to collect',
          amount: 0
        };
      }

      // Validate admin bank account details
      if (!this.adminBankAccount.accountNumber || !this.adminBankAccount.bankCode) {
        throw new Error('Admin bank account details not configured');
      }

      // Transfer to admin bank account using Flutterwave
      const transferResult = await hybridBankingService.completeTransfer(
        this.adminBankAccount.accountNumber,
        this.adminBankAccount.bankCode,
        collectAmount,
        `Revenue collection - PaxCash Admin`,
        this.adminBankAccount.accountName
      );

      if (!transferResult.success) {
        throw new Error(`Transfer failed: ${transferResult.error}`);
      }

      // Mark revenue transactions as collected
      await Transaction.updateMany(
        {
          type: 'revenue',
          'metadata.collected': { $ne: true }
        },
        {
          $set: {
            'metadata.collected': true,
            'metadata.collectedAt': new Date(),
            'metadata.collectionReference': transferResult.data.reference
          }
        }
      );

      // Create collection record
      const collectionTransaction = new Transaction({
        userId: 'system',
        type: 'revenue',
        amount: -collectAmount, // Negative amount for withdrawal
        description: `Revenue collection to admin bank account`,
        status: 'completed',
        reference: `COLLECTION_${Date.now()}`,
        completedAt: new Date(),
        metadata: {
          type: 'revenue_collection',
          collectedAmount: collectAmount,
          adminAccount: this.adminBankAccount,
          transferReference: transferResult.data.reference,
          collectedTransactionCount: revenueData.transactionCount
        }
      });

      await collectionTransaction.save();

      return {
        success: true,
        message: 'Revenue collected successfully',
        amount: collectAmount,
        transferReference: transferResult.data.reference,
        collectedTransactions: revenueData.transactionCount
      };

    } catch (error) {
      console.error('Revenue collection error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get revenue collection history
  async getCollectionHistory(limit = 50) {
    try {
      const collections = await Transaction.find({
        type: 'revenue',
        'metadata.type': 'revenue_collection'
      })
      .sort({ createdAt: -1 })
      .limit(limit);

      return {
        success: true,
        collections
      };
    } catch (error) {
      console.error('Error getting collection history:', error);
      return { success: false, error: error.message };
    }
  }

  // Get revenue summary
  async getRevenueSummary() {
    try {
      const totalRevenue = await Transaction.aggregate([
        { $match: { type: 'revenue', 'metadata.type': { $ne: 'revenue_collection' } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      const collectedRevenue = await Transaction.aggregate([
        { $match: { type: 'revenue', 'metadata.type': 'revenue_collection' } },
        { $group: { _id: null, total: { $sum: { $abs: '$amount' } } } }
      ]);

      const uncollectedRevenue = await this.getUncollectedRevenue();

      return {
        success: true,
        summary: {
          totalRevenueGenerated: totalRevenue[0]?.total || 0,
          totalCollected: collectedRevenue[0]?.total || 0,
          uncollected: uncollectedRevenue.totalAmount || 0,
          availableForCollection: uncollectedRevenue.totalAmount || 0
        }
      };
    } catch (error) {
      console.error('Error getting revenue summary:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new RevenueCollectionService();


