const axios = require('axios');

class PricingService {
  constructor() {
    // Pricing configuration
    this.pricing = {
      // Transfer fees
      transfer: {
        tier1: {
          maxAmount: 2500,
          fee: 50 // ₦50 for transfers below ₦2,500
        },
        tier2: {
          minAmount: 2500,
          fee: 100 // ₦100 for transfers ₦2,500 and above
        },
        minAmount: 100, // Minimum transfer amount
        maxAmount: 1000000 // Maximum transfer amount
      },
      
      // Airtime fees (loyalty cashback)
      airtime: {
        loyaltyThreshold: 3, // Purchase 3+ times per day for cashback
        cashbackPercentage: 2, // 2% cashback on 3rd+ purchase
        minAmount: 50, // Minimum airtime amount
        maxAmount: 50000, // Maximum airtime amount
        dailyReset: true // Reset counter daily
      },
      
      // Data fees (loyalty cashback)
      data: {
        loyaltyThreshold: 3, // Purchase 3+ times per day for cashback
        cashbackPercentage: 2, // 2% cashback on 3rd+ purchase
        minAmount: 100, // Minimum data amount
        maxAmount: 100000, // Maximum data amount
        dailyReset: true // Reset counter daily
      },
      
      // Bill payment fees
      bills: {
        flatFee: 0, // Free bill payments
        percentageFee: 0, // 0% percentage
        minAmount: 100, // Minimum bill amount
        maxAmount: 500000 // Maximum bill amount
      },
      
      // Virtual account fees
      virtualAccount: {
        setupFee: 0, // Free setup
        maintenanceFee: 0, // Free maintenance
        transactionFee: 0 // Free transactions
      }
    };
  }

  // Calculate transfer fees
  calculateTransferFee(amount) {
    const { tier1, tier2, minAmount, maxAmount } = this.pricing.transfer;
    
    // Validate amount
    if (amount < minAmount) {
      throw new Error(`Minimum transfer amount is ₦${minAmount}`);
    }
    if (amount > maxAmount) {
      throw new Error(`Maximum transfer amount is ₦${maxAmount}`);
    }
    
    // Determine which tier applies
    let fee, tier;
    if (amount < tier1.maxAmount) {
      fee = tier1.fee;
      tier = 'tier1';
    } else {
      fee = tier2.fee;
      tier = 'tier2';
    }
    
    return {
      amount: amount,
      fee: fee,
      tier: tier,
      totalDeduction: amount + fee,
      netAmount: amount,
      feeDescription: amount < tier1.maxAmount ? 
        `₦${fee} fee for transfers below ₦${tier1.maxAmount}` : 
        `₦${fee} fee for transfers ₦${tier2.minAmount} and above`
    };
  }

  // Calculate airtime pricing with loyalty cashback
  calculateAirtimePricing(amount, dailyPurchaseCount = 0) {
    const { loyaltyThreshold, cashbackPercentage, minAmount, maxAmount } = this.pricing.airtime;
    
    // Validate amount
    if (amount < minAmount) {
      throw new Error(`Minimum airtime amount is ₦${minAmount}`);
    }
    if (amount > maxAmount) {
      throw new Error(`Maximum airtime amount is ₦${maxAmount}`);
    }
    
    // Check if user qualifies for cashback
    const isEligibleForCashback = dailyPurchaseCount >= loyaltyThreshold;
    const cashbackAmount = isEligibleForCashback ? (amount * cashbackPercentage) / 100 : 0;
    
    return {
      originalAmount: amount,
      userPays: amount, // User always pays full amount upfront
      dailyPurchaseCount: dailyPurchaseCount,
      isEligibleForCashback: isEligibleForCashback,
      cashbackPercentage: isEligibleForCashback ? cashbackPercentage : 0,
      cashbackAmount: cashbackAmount,
      netCost: amount - cashbackAmount, // Actual cost after cashback
      nextPurchaseForCashback: Math.max(0, loyaltyThreshold - dailyPurchaseCount),
      message: isEligibleForCashback ? 
        `You qualify for ${cashbackPercentage}% cashback!` : 
        `Make ${loyaltyThreshold - dailyPurchaseCount} more purchase(s) today to unlock ${cashbackPercentage}% cashback`
    };
  }

  // Calculate data pricing with loyalty cashback
  calculateDataPricing(amount, dailyPurchaseCount = 0) {
    const { loyaltyThreshold, cashbackPercentage, minAmount, maxAmount } = this.pricing.data;
    
    // Validate amount
    if (amount < minAmount) {
      throw new Error(`Minimum data amount is ₦${minAmount}`);
    }
    if (amount > maxAmount) {
      throw new Error(`Maximum data amount is ₦${maxAmount}`);
    }
    
    // Check if user qualifies for cashback
    const isEligibleForCashback = dailyPurchaseCount >= loyaltyThreshold;
    const cashbackAmount = isEligibleForCashback ? (amount * cashbackPercentage) / 100 : 0;
    
    return {
      originalAmount: amount,
      userPays: amount, // User always pays full amount upfront
      dailyPurchaseCount: dailyPurchaseCount,
      isEligibleForCashback: isEligibleForCashback,
      cashbackPercentage: isEligibleForCashback ? cashbackPercentage : 0,
      cashbackAmount: cashbackAmount,
      netCost: amount - cashbackAmount, // Actual cost after cashback
      nextPurchaseForCashback: Math.max(0, loyaltyThreshold - dailyPurchaseCount),
      message: isEligibleForCashback ? 
        `You qualify for ${cashbackPercentage}% cashback!` : 
        `Make ${loyaltyThreshold - dailyPurchaseCount} more purchase(s) today to unlock ${cashbackPercentage}% cashback`
    };
  }

  // Calculate bill payment fees
  calculateBillFee(amount) {
    const { flatFee, percentageFee, minAmount, maxAmount } = this.pricing.bills;
    
    // Validate amount
    if (amount < minAmount) {
      throw new Error(`Minimum bill amount is ₦${minAmount}`);
    }
    if (amount > maxAmount) {
      throw new Error(`Maximum bill amount is ₦${maxAmount}`);
    }
    
    const percentageAmount = (amount * percentageFee) / 100;
    const totalFee = flatFee + percentageAmount;
    
    return {
      amount: amount,
      flatFee: flatFee,
      percentageFee: percentageAmount,
      totalFee: totalFee,
      totalDeduction: amount + totalFee,
      netAmount: amount
    };
  }

  // Get pricing information for display
  getPricingInfo() {
    return {
      transfer: {
        description: "Bank Transfers",
        tier1: {
          maxAmount: this.pricing.transfer.tier1.maxAmount,
          fee: this.pricing.transfer.tier1.fee,
          description: `₦${this.pricing.transfer.tier1.fee} for transfers below ₦${this.pricing.transfer.tier1.maxAmount}`
        },
        tier2: {
          minAmount: this.pricing.transfer.tier2.minAmount,
          fee: this.pricing.transfer.tier2.fee,
          description: `₦${this.pricing.transfer.tier2.fee} for transfers ₦${this.pricing.transfer.tier2.minAmount} and above`
        },
        minAmount: this.pricing.transfer.minAmount,
        maxAmount: this.pricing.transfer.maxAmount,
        example: this.calculateTransferFee(1000)
      },
      airtime: {
        description: "Airtime Purchase",
        discountPercentage: this.pricing.airtime.discountPercentage,
        minAmount: this.pricing.airtime.minAmount,
        maxAmount: this.pricing.airtime.maxAmount,
        example: this.calculateAirtimeDiscount(1000)
      },
      data: {
        description: "Data Purchase",
        discountPercentage: this.pricing.data.discountPercentage,
        minAmount: this.pricing.data.minAmount,
        maxAmount: this.pricing.data.maxAmount,
        example: this.calculateDataDiscount(1000)
      },
      bills: {
        description: "Bill Payments",
        flatFee: this.pricing.bills.flatFee,
        percentageFee: this.pricing.bills.percentageFee,
        minAmount: this.pricing.bills.minAmount,
        maxAmount: this.pricing.bills.maxAmount,
        example: this.calculateBillFee(1000)
      }
    };
  }

  // Update pricing (for admin use)
  updatePricing(service, newPricing) {
    if (this.pricing[service]) {
      this.pricing[service] = { ...this.pricing[service], ...newPricing };
      return { success: true, message: `${service} pricing updated` };
    }
    throw new Error(`Invalid service: ${service}`);
  }

  // Get all pricing
  getAllPricing() {
    return this.pricing;
  }

  // Get user's daily purchase count for airtime/data
  async getDailyPurchaseCount(userId, service = 'airtime') {
    try {
      const { Transaction } = require('../models');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const count = await Transaction.countDocuments({
        userId: userId,
        type: 'payment',
        'metadata.service': service,
        createdAt: {
          $gte: today,
          $lt: tomorrow
        }
      });

      return count;
    } catch (error) {
      console.error('Error getting daily purchase count:', error);
      return 0;
    }
  }

  // Calculate combined airtime + data daily purchases
  async getCombinedDailyPurchaseCount(userId) {
    try {
      const airtimeCount = await this.getDailyPurchaseCount(userId, 'airtime');
      const dataCount = await this.getDailyPurchaseCount(userId, 'data');
      return airtimeCount + dataCount;
    } catch (error) {
      console.error('Error getting combined daily purchase count:', error);
      return 0;
    }
  }

  // Process cashback for eligible purchases
  async processCashback(userId, amount, service, transactionId) {
    try {
      const { Transaction, Wallet, PushSubscription } = require('../models');
      const notificationService = require('./notificationService');
      
      // Get daily purchase count
      const dailyCount = await this.getDailyPurchaseCount(userId, service);
      
      // Calculate pricing
      const pricing = service === 'airtime' ? 
        this.calculateAirtimePricing(amount, dailyCount) :
        this.calculateDataPricing(amount, dailyCount);
      
      // If user qualifies for cashback, create a cashback transaction
      if (pricing.isEligibleForCashback && pricing.cashbackAmount > 0) {
        // Create cashback transaction
        const cashbackTransaction = new Transaction({
          userId: userId,
          type: 'deposit',
          amount: pricing.cashbackAmount,
          description: `${service.charAt(0).toUpperCase() + service.slice(1)} cashback - ${pricing.cashbackPercentage}% loyalty reward`,
          status: 'completed',
          reference: `CASHBACK_${service.toUpperCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          metadata: {
            originalTransactionId: transactionId,
            service: service,
            cashbackPercentage: pricing.cashbackPercentage,
            originalAmount: amount,
            cashbackAmount: pricing.cashbackAmount,
            dailyPurchaseCount: dailyCount,
            type: 'cashback'
          }
        });

        await cashbackTransaction.save();

        // Update wallet with cashback
        const wallet = await Wallet.findOne({ userId });
        if (wallet) {
          wallet.balance += pricing.cashbackAmount;
          wallet.totalDeposits += pricing.cashbackAmount;
          wallet.lastTransactionDate = new Date();
          await wallet.save();
        }

        // Send cashback earned notification
        try {
          const subscriptions = await PushSubscription.findActiveByUserId(userId);
          for (const sub of subscriptions) {
            await notificationService.sendCashbackEarnedNotification(
              userId,
              sub.getSubscriptionObject(),
              pricing.cashbackAmount,
              service
            );
          }
        } catch (notifError) {
          console.error('Failed to send cashback notification:', notifError);
        }

        return {
          success: true,
          cashbackAmount: pricing.cashbackAmount,
          message: `₦${pricing.cashbackAmount} cashback credited to your wallet!`
        };
      }

      // Send eligibility notification if user is close to qualifying
      if (pricing.nextPurchaseForCashback <= 2 && pricing.nextPurchaseForCashback > 0) {
        try {
          const subscriptions = await PushSubscription.findActiveByUserId(userId);
          for (const sub of subscriptions) {
            await notificationService.sendCashbackEligibilityNotification(
              userId,
              sub.getSubscriptionObject(),
              dailyCount,
              pricing.nextPurchaseForCashback
            );
          }
        } catch (notifError) {
          console.error('Failed to send eligibility notification:', notifError);
        }
      }

      return {
        success: false,
        cashbackAmount: 0,
        message: pricing.message
      };
    } catch (error) {
      console.error('Error processing cashback:', error);
      return {
        success: false,
        cashbackAmount: 0,
        message: 'Cashback processing failed'
      };
    }
  }
}

module.exports = new PricingService();
