const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/paxcash')
.then(async () => {
  console.log('✅ MongoDB connected successfully');
  
  // Import models and services
  const { Transaction, Wallet } = require('./models');
  const pricingService = require('./services/pricingService');
  
  // Test user ID
  const userId = '687a928f869af29d884a655a';
  const amount = 1000;
  
  console.log('\n🧪 Testing revenue tracking directly...');
  
  // Calculate transfer fee
  const transferFee = pricingService.calculateTransferFee(amount);
  console.log(`💰 Transfer amount: ₦${amount}`);
  console.log(`💰 Transfer fee: ₦${transferFee.fee}`);
  console.log(`💰 Total deduction: ₦${transferFee.totalDeduction}`);
  
  // Check user wallet
  const wallet = await Wallet.findOne({ userId });
  if (!wallet) {
    console.log('❌ User wallet not found');
    process.exit(1);
  }
  
  console.log(`💳 Current wallet balance: ₦${wallet.balance}`);
  
  if (wallet.balance < transferFee.totalDeduction) {
    console.log('❌ Insufficient balance for test');
    process.exit(1);
  }
  
  // Create test revenue transaction
  const reference = `TEST_REVENUE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const revenueTransaction = new Transaction({
    userId: 'system',
    type: 'revenue',
    amount: transferFee.fee,
    description: `Test transfer fee for ${reference}`,
    status: 'completed',
    reference: `REVENUE_${reference}`,
    completedAt: new Date(),
    metadata: {
      sourceTransactionId: 'test_transaction_id',
      sourceUserId: userId,
      service: 'transfer_fee',
      transferAmount: amount,
      feeRate: transferFee.fee / amount * 100
    }
  });
  
  await revenueTransaction.save();
  console.log('✅ Test revenue transaction created successfully');
  
  // Check if it was saved
  const savedRevenue = await Transaction.findOne({ type: 'revenue' });
  if (savedRevenue) {
    console.log('✅ Revenue transaction found in database:');
    console.log(`   Amount: ₦${savedRevenue.amount}`);
    console.log(`   Service: ${savedRevenue.metadata?.service}`);
    console.log(`   Reference: ${savedRevenue.reference}`);
  } else {
    console.log('❌ Revenue transaction not found in database');
  }
  
  // Test admin revenue endpoint
  console.log('\n🔍 Testing admin revenue endpoint...');
  const revenueCollectionService = require('./services/revenueCollectionService');
  const uncollectedRevenue = await revenueCollectionService.getUncollectedRevenue();
  console.log(`💰 Uncollected revenue: ₦${uncollectedRevenue}`);
  
  process.exit(0);
})
.catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});

