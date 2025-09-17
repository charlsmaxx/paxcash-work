const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/paxcash')
.then(() => {
  console.log('✅ MongoDB connected successfully');
  
  // Import models
  const { Transaction } = require('./models');
  
  // Check for revenue transactions
  Transaction.find({ type: 'revenue' })
    .then(transactions => {
      console.log('\n📊 Revenue transactions found:', transactions.length);
      
      if (transactions.length > 0) {
        console.log('\n💰 Revenue Details:');
        transactions.forEach((t, index) => {
          console.log(`${index + 1}. Amount: ₦${t.amount}`);
          console.log(`   Service: ${t.metadata?.service || 'unknown'}`);
          console.log(`   Date: ${t.createdAt}`);
          console.log(`   Reference: ${t.reference}`);
          console.log(`   Collected: ${t.metadata?.collected || false}`);
          console.log('---');
        });
      } else {
        console.log('❌ No revenue transactions found');
      }
      
      // Check for all transactions
      return Transaction.find({}).sort({ createdAt: -1 }).limit(10);
    })
    .then(allTransactions => {
      console.log('\n📋 Recent transactions (last 10):');
      allTransactions.forEach((t, index) => {
        console.log(`${index + 1}. Type: ${t.type}, Amount: ₦${t.amount}, User: ${t.userId}, Date: ${t.createdAt}`);
      });
      
      process.exit(0);
    })
    .catch(err => {
      console.error('❌ Error:', err);
      process.exit(1);
    });
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});


