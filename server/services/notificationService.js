const webpush = require('web-push');

class NotificationService {
  constructor() {
    // Initialize web-push with VAPID keys
    // You'll need to generate these keys for production
    this.vapidKeys = {
      publicKey: process.env.VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa40HIe8y8j4VgVjHvH7dQ7Y4uQ2kLwvBWt2vJ4mF3gL8hK0vP2qL5nM8rT1wU4xY7zA',
      privateKey: process.env.VAPID_PRIVATE_KEY || '3K1Xd8L4vQ7yR2tE5wI8oP1aS6dF9gH2jK5mN8qT1wU4xY7zA'
    };

    webpush.setVapidDetails(
      'mailto:admin@paxcash.com',
      this.vapidKeys.publicKey,
      this.vapidKeys.privateKey
    );
  }

  // Send cashback eligibility notification
  async sendCashbackEligibilityNotification(userId, subscription, purchaseCount, nextForCashback) {
    try {
      const payload = JSON.stringify({
        title: '🎉 You\'re close to earning cashback!',
        body: `Make ${nextForCashback} more purchase(s) today to unlock 2% cashback on all airtime and data purchases!`,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        data: {
          url: '/airtime',
          type: 'cashback_eligibility',
          userId: userId,
          purchaseCount: purchaseCount,
          nextForCashback: nextForCashback
        },
        actions: [
          {
            action: 'buy_now',
            title: 'Buy Airtime/Data',
            icon: '/icons/buy-icon.png'
          },
          {
            action: 'view_status',
            title: 'View Status',
            icon: '/icons/status-icon.png'
          }
        ]
      });

      await webpush.sendNotification(subscription, payload);
      console.log(`✅ Cashback eligibility notification sent to user ${userId}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to send cashback eligibility notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Send cashback earned notification
  async sendCashbackEarnedNotification(userId, subscription, cashbackAmount, service) {
    try {
      const payload = JSON.stringify({
        title: '💰 Cashback Earned!',
        body: `Congratulations! You earned ₦${cashbackAmount} cashback on your ${service} purchase. It's been added to your wallet!`,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        data: {
          url: '/wallet',
          type: 'cashback_earned',
          userId: userId,
          cashbackAmount: cashbackAmount,
          service: service
        },
        actions: [
          {
            action: 'view_wallet',
            title: 'View Wallet',
            icon: '/icons/wallet-icon.png'
          },
          {
            action: 'buy_more',
            title: 'Buy More',
            icon: '/icons/buy-icon.png'
          }
        ]
      });

      await webpush.sendNotification(subscription, payload);
      console.log(`✅ Cashback earned notification sent to user ${userId}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to send cashback earned notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Send daily reset notification
  async sendDailyResetNotification(userId, subscription) {
    try {
      const payload = JSON.stringify({
        title: '🌅 New Day, New Opportunities!',
        body: 'Your loyalty counter has reset. Start making purchases to earn 2% cashback on your 3rd purchase onwards!',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        data: {
          url: '/airtime',
          type: 'daily_reset',
          userId: userId
        },
        actions: [
          {
            action: 'start_buying',
            title: 'Start Buying',
            icon: '/icons/buy-icon.png'
          }
        ]
      });

      await webpush.sendNotification(subscription, payload);
      console.log(`✅ Daily reset notification sent to user ${userId}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to send daily reset notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Send general notification
  async sendNotification(userId, subscription, title, body, data = {}) {
    try {
      const payload = JSON.stringify({
        title,
        body,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        data: {
          url: '/',
          type: 'general',
          userId: userId,
          ...data
        }
      });

      await webpush.sendNotification(subscription, payload);
      console.log(`✅ General notification sent to user ${userId}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to send general notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Broadcast notification to all users
  async broadcastNotification(subscriptions, title, body, data = {}) {
    const results = [];
    
    for (const subscription of subscriptions) {
      try {
        const result = await this.sendNotification(
          subscription.userId, 
          subscription.subscription, 
          title, 
          body, 
          data
        );
        results.push({ userId: subscription.userId, ...result });
      } catch (error) {
        results.push({ 
          userId: subscription.userId, 
          success: false, 
          error: error.message 
        });
      }
    }
    
    return results;
  }

  // Get VAPID public key for frontend
  getVapidPublicKey() {
    return this.vapidKeys.publicKey;
  }
}

module.exports = new NotificationService();




