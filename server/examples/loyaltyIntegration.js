// Example of how to integrate loyalty cashback system into your existing endpoints

const pricingService = require('../services/pricingService');

// Example: Updated Airtime Endpoint with Loyalty Cashback
app.post('/api/airtime/buy', async (req, res) => {
  try {
    const { userId, phoneNumber, network, amount } = req.body;

    // Get user's daily airtime purchase count
    const dailyCount = await pricingService.getDailyPurchaseCount(userId, 'airtime');
    
    // Calculate pricing with loyalty system
    const pricing = pricingService.calculateAirtimePricing(amount, dailyCount);
    
    // Check if user has sufficient balance
    const wallet = await Wallet.findOne({ userId });
    if (!wallet || wallet.balance < pricing.userPays) {
      return res.status(400).json({ 
        success: false, 
        message: `Insufficient balance. Required: ₦${pricing.userPays}`
      });
    }

    // Buy airtime using Flutterwave (user pays full amount)
    const airtimeResult = await hybridBankingService.buyAirtime(
      phoneNumber, 
      amount, // Full amount to Flutterwave
      network
    );

    if (!airtimeResult.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Airtime purchase failed: ' + airtimeResult.error 
      });
    }

    // Create transaction record
    const transaction = new Transaction({
      userId,
      type: 'payment',
      amount: pricing.userPays, // Amount deducted from wallet
      description: `Airtime purchase for ${phoneNumber} (${network}) - Purchase #${dailyCount + 1} today`,
      status: 'pending',
      reference: airtimeResult.data.reference,
      fee: 0, // No upfront discount
      metadata: {
        phoneNumber,
        network,
        originalAmount: amount,
        airtimeValue: amount, // Actual airtime value received
        userPays: pricing.userPays,
        dailyPurchaseCount: dailyCount + 1,
        isEligibleForCashback: pricing.isEligibleForCashback,
        cashbackAmount: pricing.cashbackAmount,
        transactionId: airtimeResult.data.id,
        service: 'airtime'
      }
    });

    await transaction.save();

    // Update wallet balance (deduct full amount)
    wallet.balance -= pricing.userPays;
    wallet.lastTransactionDate = new Date();
    await wallet.save();

    // Process cashback if eligible
    const cashbackResult = await pricingService.processCashback(
      userId, 
      amount, 
      'airtime', 
      transaction._id
    );

    res.status(201).json({ 
      success: true, 
      message: 'Airtime purchase successful',
      airtime: {
        id: airtimeResult.data.id,
        airtimeValue: amount, // Value of airtime received
        userPays: pricing.userPays, // Amount deducted from wallet
        dailyPurchaseCount: dailyCount + 1,
        isEligibleForCashback: pricing.isEligibleForCashback,
        cashbackAmount: pricing.cashbackAmount,
        cashbackMessage: cashbackResult.message,
        phoneNumber,
        network,
        status: 'pending',
        reference: airtimeResult.data.reference
      }
    });

  } catch (error) {
    console.error('Airtime purchase error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Airtime purchase failed'
    });
  }
});

// Example: Updated Data Endpoint with Loyalty Cashback
app.post('/api/data/buy', async (req, res) => {
  try {
    const { userId, phoneNumber, network, plan, amount } = req.body;

    // Get user's daily data purchase count
    const dailyCount = await pricingService.getDailyPurchaseCount(userId, 'data');
    
    // Calculate pricing with loyalty system
    const pricing = pricingService.calculateDataPricing(amount, dailyCount);
    
    // Check if user has sufficient balance
    const wallet = await Wallet.findOne({ userId });
    if (!wallet || wallet.balance < pricing.userPays) {
      return res.status(400).json({ 
        success: false, 
        message: `Insufficient balance. Required: ₦${pricing.userPays}`
      });
    }

    // Buy data using Flutterwave (user pays full amount)
    const dataResult = await hybridBankingService.buyDataBundle(
      phoneNumber, 
      plan, 
      network
    );

    if (!dataResult.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Data purchase failed: ' + dataResult.error 
      });
    }

    // Create transaction record
    const transaction = new Transaction({
      userId,
      type: 'payment',
      amount: pricing.userPays, // Amount deducted from wallet
      description: `Data purchase for ${phoneNumber} (${network}) - ${plan} - Purchase #${dailyCount + 1} today`,
      status: 'pending',
      reference: dataResult.data.reference,
      fee: 0, // No upfront discount
      metadata: {
        phoneNumber,
        network,
        plan,
        originalAmount: amount,
        dataValue: amount, // Actual data value received
        userPays: pricing.userPays,
        dailyPurchaseCount: dailyCount + 1,
        isEligibleForCashback: pricing.isEligibleForCashback,
        cashbackAmount: pricing.cashbackAmount,
        transactionId: dataResult.data.id,
        service: 'data'
      }
    });

    await transaction.save();

    // Update wallet balance (deduct full amount)
    wallet.balance -= pricing.userPays;
    wallet.lastTransactionDate = new Date();
    await wallet.save();

    // Process cashback if eligible
    const cashbackResult = await pricingService.processCashback(
      userId, 
      amount, 
      'data', 
      transaction._id
    );

    res.status(201).json({ 
      success: true, 
      message: 'Data purchase successful',
      data: {
        id: dataResult.data.id,
        dataValue: amount, // Value of data received
        userPays: pricing.userPays, // Amount deducted from wallet
        dailyPurchaseCount: dailyCount + 1,
        isEligibleForCashback: pricing.isEligibleForCashback,
        cashbackAmount: pricing.cashbackAmount,
        cashbackMessage: cashbackResult.message,
        phoneNumber,
        network,
        plan,
        status: 'pending',
        reference: dataResult.data.reference
      }
    });

  } catch (error) {
    console.error('Data purchase error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Data purchase failed'
    });
  }
});

// Example: Get User's Loyalty Status
app.get('/api/loyalty/status/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get daily purchase counts
    const airtimeCount = await pricingService.getDailyPurchaseCount(userId, 'airtime');
    const dataCount = await pricingService.getDailyPurchaseCount(userId, 'data');
    const combinedCount = airtimeCount + dataCount;
    
    // Calculate loyalty status
    const airtimePricing = pricingService.calculateAirtimePricing(1000, airtimeCount);
    const dataPricing = pricingService.calculateDataPricing(1000, dataCount);
    
    res.json({
      success: true,
      loyalty: {
        airtime: {
          dailyPurchases: airtimeCount,
          nextForCashback: airtimePricing.nextPurchaseForCashback,
          isEligible: airtimePricing.isEligibleForCashback,
          message: airtimePricing.message
        },
        data: {
          dailyPurchases: dataCount,
          nextForCashback: dataPricing.nextPurchaseForCashback,
          isEligible: dataPricing.isEligibleForCashback,
          message: dataPricing.message
        },
        combined: {
          totalDailyPurchases: combinedCount,
          nextForCashback: Math.max(0, 3 - combinedCount),
          isEligible: combinedCount >= 3
        }
      }
    });
  } catch (error) {
    console.error('Loyalty status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get loyalty status'
    });
  }
});

// Example: Calculate Pricing Preview
app.post('/api/pricing/preview', async (req, res) => {
  try {
    const { userId, service, amount } = req.body;
    
    let pricing;
    if (service === 'airtime') {
      const dailyCount = await pricingService.getDailyPurchaseCount(userId, 'airtime');
      pricing = pricingService.calculateAirtimePricing(amount, dailyCount);
    } else if (service === 'data') {
      const dailyCount = await pricingService.getDailyPurchaseCount(userId, 'data');
      pricing = pricingService.calculateDataPricing(amount, dailyCount);
    } else if (service === 'transfer') {
      pricing = pricingService.calculateTransferFee(amount);
    } else if (service === 'bills') {
      pricing = pricingService.calculateBillFee(amount);
    } else {
      throw new Error('Invalid service type');
    }
    
    res.json({
      success: true,
      pricing: pricing
    });
  } catch (error) {
    console.error('Pricing preview error:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message || 'Pricing calculation failed'
    });
  }
});




