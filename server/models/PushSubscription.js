const mongoose = require('mongoose');

const pushSubscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  endpoint: {
    type: String,
    required: true
  },
  keys: {
    p256dh: {
      type: String,
      required: true
    },
    auth: {
      type: String,
      required: true
    }
  },
  userAgent: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastUsed: {
    type: Date,
    default: Date.now
  },
  preferences: {
    cashbackNotifications: {
      type: Boolean,
      default: true
    },
    dailyResetNotifications: {
      type: Boolean,
      default: true
    },
    generalNotifications: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
pushSubscriptionSchema.index({ userId: 1, isActive: 1 });
pushSubscriptionSchema.index({ endpoint: 1 });

// Method to get subscription object for web-push
pushSubscriptionSchema.methods.getSubscriptionObject = function() {
  return {
    endpoint: this.endpoint,
    keys: this.keys
  };
};

// Static method to find active subscriptions for a user
pushSubscriptionSchema.statics.findActiveByUserId = function(userId) {
  return this.find({ userId, isActive: true });
};

// Static method to find all active subscriptions
pushSubscriptionSchema.statics.findAllActive = function() {
  return this.find({ isActive: true });
};

module.exports = mongoose.model('PushSubscription', pushSubscriptionSchema);




