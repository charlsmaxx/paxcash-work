const mongoose = require('mongoose');

const virtualAccountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // Monnify Virtual Account Details
  monnifyAccountReference: {
    type: String,
    required: true,
    unique: true
  },
  monnifyReservationReference: {
    type: String,
    required: true,
    unique: true
  },
  accountNumber: {
    type: String,
    required: true,
    unique: true
  },
  bankName: {
    type: String,
    required: true
  },
  accountName: {
    type: String,
    required: true
  },
  // KYC Information
  bvn: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^\d{11}$/.test(v);
      },
      message: 'BVN must be exactly 11 digits'
    }
  },
  nin: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^\d{11}$/.test(v);
      },
      message: 'NIN must be exactly 11 digits'
    }
  },
  // Account Status
  status: {
    type: String,
    enum: ['pending', 'active', 'suspended', 'closed'],
    default: 'pending'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Monnify Response Data
  monnifyResponse: {
    type: mongoose.Schema.Types.Mixed
  },
  // Account Limits
  dailyLimit: {
    type: Number,
    default: 1000000 // 1 million Naira
  },
  monthlyLimit: {
    type: Number,
    default: 10000000 // 10 million Naira
  },
  // Usage Tracking
  dailyUsage: {
    type: Number,
    default: 0
  },
  monthlyUsage: {
    type: Number,
    default: 0
  },
  lastUsageReset: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  activatedAt: Date,
  closedAt: Date
});

// Update timestamp on save
virtualAccountSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Reset daily usage at midnight
virtualAccountSchema.methods.resetDailyUsage = function() {
  const now = new Date();
  const lastReset = this.lastUsageReset;
  
  if (now.getDate() !== lastReset.getDate() || 
      now.getMonth() !== lastReset.getMonth() || 
      now.getFullYear() !== lastReset.getFullYear()) {
    this.dailyUsage = 0;
    this.lastUsageReset = now;
  }
};

// Reset monthly usage on first day of month
virtualAccountSchema.methods.resetMonthlyUsage = function() {
  const now = new Date();
  const lastReset = this.lastUsageReset;
  
  if (now.getMonth() !== lastReset.getMonth() || 
      now.getFullYear() !== lastReset.getFullYear()) {
    this.monthlyUsage = 0;
  }
};

module.exports = mongoose.model('VirtualAccount', virtualAccountSchema); 