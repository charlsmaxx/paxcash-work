const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  currency: {
    type: String,
    default: 'NGN',
    enum: ['NGN', 'USD', 'EUR', 'GBP']
  },
  accountNumber: {
    type: String,
    unique: true,
    sparse: true // Allows multiple null values
  },
  bankName: {
    type: String,
    default: 'Paxcash Bank'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastTransactionDate: Date,
  totalDeposits: {
    type: Number,
    default: 0
  },
  totalWithdrawals: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp
walletSchema.pre('save', async function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Wallet', walletSchema); 