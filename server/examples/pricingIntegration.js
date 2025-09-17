// Example of how to integrate pricing service into your existing endpoints

const pricingService = require('../services/pricingService');

// Example: Updated Transfer Endpoint with Fees
app.post('/api/transfer', async (req, res) => {
  try {
    const { userId, accountNumber, bankCode, amount, narration } = req.body;

    // Calculate transfer fees
    const feeCalculation = pricingService.calculateTransferFee(amount);
    
    // Check if user has sufficient balance (including fees)
    const wallet = await Wallet.findOne({ userId });
    if (!wallet || wallet.balance < feeCalculation.totalDeduction) {
      return res.status(400).json({ 
        success: false, 
        message: `Insufficient balance. Required: ₦${feeCalculation.totalDeduction} (₦${amount} + ₦${feeCalculation.totalFee} fee)`
      });
    }

    // Proceed with transfer...
    const transferResult = await hybridBankingService.completeTransfer(
      accountNumber, 
      bankCode, 
      amount, 
      narration || 'Transfer from PaxCash',
      'Recipient'
    );

    if (!transferResult.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Transfer failed: ' + transferResult.error 
      });
    }

    // Create transaction record with fees
    const transaction = new Transaction({
      userId,
      type: 'withdrawal',
      amount: feeCalculation.totalDeduction, // Total amount including fees
      description: `Bank transfer to ${transferResult.data.recipientName || 'Recipient'}`,
      status: 'pending',
      reference: transferResult.data.reference,
      fee: feeCalculation.totalFee, // Record the fee
      metadata: {
        transferAmount: amount, // Original transfer amount
        fee: feeCalculation.totalFee,
        flatFee: feeCalculation.flatFee,
        percentageFee: feeCalculation.percentageFee,
        transferId: transferResult.data.transferId,
        bankCode: bankCode,
        accountNumber: accountNumber,
        recipientName: transferResult.data.recipientName,
        narration: narration
      }
    });

    await transaction.save();

    // Update wallet balance (deduct amount + fees)
    wallet.balance -= feeCalculation.totalDeduction;
    wallet.totalWithdrawals += feeCalculation.totalDeduction;
    wallet.lastTransactionDate = new Date();
    await wallet.save();

    res.status(201).json({ 
      success: true, 
      message: 'Transfer initiated successfully',
      transfer: {
        id: transferResult.data.transactionReference,
        amount: amount,
        fee: feeCalculation.totalFee,
        totalDeduction: feeCalculation.totalDeduction,
        recipientName: transferResult.data.recipientName,
        status: 'pending',
        reference: transferResult.data.reference
      }
    });

  } catch (error) {
    console.error('Transfer error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Transfer failed'
    });
  }
});

// Example: Updated Airtime Endpoint with Discounts
app.post('/api/airtime/buy', async (req, res) => {
  try {
    const { userId, phoneNumber, network, amount } = req.body;

    // Calculate airtime discount
    const discountCalculation = pricingService.calculateAirtimeDiscount(amount);
    
    // Check if user has sufficient balance (user pays discounted amount)
    const wallet = await Wallet.findOne({ userId });
    if (!wallet || wallet.balance < discountCalculation.userPays) {
      return res.status(400).json({ 
        success: false, 
        message: `Insufficient balance. Required: ₦${discountCalculation.userPays}`
      });
    }

    // Buy airtime using Flutterwave (with original amount for airtime value)
    const airtimeResult = await hybridBankingService.buyAirtime(
      phoneNumber, 
      amount, // Original amount for airtime value
      network
    );

    if (!airtimeResult.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Airtime purchase failed: ' + airtimeResult.error 
      });
    }

    // Create transaction record with discount info
    const transaction = new Transaction({
      userId,
      type: 'payment',
      amount: discountCalculation.userPays, // Amount user actually pays
      description: `Airtime purchase for ${phoneNumber} (${network}) - ${discountCalculation.discountPercentage}% discount applied`,
      status: 'pending',
      reference: airtimeResult.data.reference,
      fee: -discountCalculation.discountAmount, // Negative fee = discount
      metadata: {
        phoneNumber,
        network,
        originalAmount: amount,
        discountAmount: discountCalculation.discountAmount,
        discountPercentage: discountCalculation.discountPercentage,
        airtimeValue: amount, // Actual airtime value received
        userPays: discountCalculation.userPays,
        transactionId: airtimeResult.data.id,
        service: 'airtime'
      }
    });

    await transaction.save();

    // Update wallet balance (deduct discounted amount)
    wallet.balance -= discountCalculation.userPays;
    wallet.lastTransactionDate = new Date();
    await wallet.save();

    res.status(201).json({ 
      success: true, 
      message: 'Airtime purchase successful',
      airtime: {
        id: airtimeResult.data.id,
        airtimeValue: amount, // Value of airtime received
        userPays: discountCalculation.userPays, // Amount deducted from wallet
        discount: discountCalculation.discountAmount,
        savings: discountCalculation.savings,
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

// Example: Get Pricing Information Endpoint
app.get('/api/pricing', async (req, res) => {
  try {
    const pricingInfo = pricingService.getPricingInfo();
    res.json({ 
      success: true, 
      message: 'Pricing information retrieved successfully',
      pricing: pricingInfo
    });
  } catch (error) {
    console.error('Get pricing error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get pricing information'
    });
  }
});

// Example: Calculate Fees Endpoint (for frontend preview)
app.post('/api/pricing/calculate', async (req, res) => {
  try {
    const { service, amount } = req.body;
    
    let calculation;
    switch (service) {
      case 'transfer':
        calculation = pricingService.calculateTransferFee(amount);
        break;
      case 'airtime':
        calculation = pricingService.calculateAirtimeDiscount(amount);
        break;
      case 'data':
        calculation = pricingService.calculateDataDiscount(amount);
        break;
      case 'bills':
        calculation = pricingService.calculateBillFee(amount);
        break;
      default:
        throw new Error('Invalid service type');
    }
    
    res.json({ 
      success: true, 
      message: 'Fee calculation successful',
      calculation
    });
  } catch (error) {
    console.error('Fee calculation error:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message || 'Fee calculation failed'
    });
  }
});




