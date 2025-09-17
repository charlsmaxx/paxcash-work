# 🎯 PaxCash Loyalty Cashback System

## 💡 **How the Loyalty System Works**

### **Daily Purchase Tracking**
- **Tracks airtime and data purchases separately**
- **Resets daily at midnight**
- **Combined tracking for both services**

### **Cashback Eligibility**
- **1st & 2nd purchases**: Pay full price, no cashback
- **3rd purchase onwards**: Get 2% cashback as wallet credit
- **Daily reset**: Counter resets to 0 at midnight

---

## 📱 **Airtime Purchase Flow**

### **Purchase #1 (₦1,000 airtime)**
```
User pays: ₦1,000
Airtime value: ₦1,000
Cashback: ₦0
Daily count: 1
Status: "Make 2 more purchases today to unlock 2% cashback"
```

### **Purchase #2 (₦500 airtime)**
```
User pays: ₦500
Airtime value: ₦500
Cashback: ₦0
Daily count: 2
Status: "Make 1 more purchase today to unlock 2% cashback"
```

### **Purchase #3 (₦2,000 airtime)**
```
User pays: ₦2,000
Airtime value: ₦2,000
Cashback: ₦40 (2% of ₦2,000)
Daily count: 3
Status: "You qualify for 2% cashback! ₦40 credited to wallet"
```

### **Purchase #4 (₦1,500 airtime)**
```
User pays: ₦1,500
Airtime value: ₦1,500
Cashback: ₦30 (2% of ₦1,500)
Daily count: 4
Status: "You qualify for 2% cashback! ₦30 credited to wallet"
```

---

## 📊 **Data Purchase Flow**

### **Same logic applies to data purchases**
- **1st & 2nd**: Full price, no cashback
- **3rd onwards**: 2% cashback
- **Separate tracking** from airtime

---

## 🔄 **Daily Reset**

### **At Midnight (00:00)**
- **Airtime counter**: Resets to 0
- **Data counter**: Resets to 0
- **Combined counter**: Resets to 0
- **All users start fresh** for the new day

---

## 💰 **Revenue Model**

### **How You Make Money**
1. **Transfer fees** - Main revenue source
2. **Airtime/Data margins** - Small profit on each purchase
3. **Cashback costs** - Covered by transfer fees

### **Example Daily Revenue**
```
Transfer Revenue:
- 20 transfers × ₦50 average = ₦1,000

Airtime/Data Revenue:
- 100 purchases × ₦1,000 average = ₦100,000
- Small margin per purchase = ₦500

Cashback Cost:
- 30 eligible purchases × ₦20 average = ₦600

Net Revenue: ₦1,000 + ₦500 - ₦600 = ₦900
```

---

## 🎯 **User Experience**

### **Frontend Display**
```
Purchase #1: "Make 2 more purchases today to unlock 2% cashback"
Purchase #2: "Make 1 more purchase today to unlock 2% cashback"
Purchase #3: "🎉 You qualify for 2% cashback! ₦40 will be credited to your wallet"
Purchase #4: "🎉 You qualify for 2% cashback! ₦30 will be credited to your wallet"
```

### **Wallet Updates**
- **Immediate cashback** - Credited instantly
- **Transaction history** - Shows cashback transactions
- **Balance updates** - Real-time wallet balance

---

## 🔧 **Technical Implementation**

### **Database Tracking**
```javascript
// Transaction metadata
{
  service: 'airtime' | 'data',
  dailyPurchaseCount: 3,
  isEligibleForCashback: true,
  cashbackAmount: 40,
  type: 'cashback'
}
```

### **Daily Reset Logic**
```javascript
// Query for today's purchases
const today = new Date();
today.setHours(0, 0, 0, 0);
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

// Count purchases between today and tomorrow
const count = await Transaction.countDocuments({
  userId: userId,
  type: 'payment',
  'metadata.service': 'airtime',
  createdAt: { $gte: today, $lt: tomorrow }
});
```

---

## 🚀 **Benefits**

### **For Users**
- ✅ **Rewards loyalty** - Frequent users get cashback
- ✅ **Daily reset** - Fresh start every day
- ✅ **Transparent** - Clear eligibility requirements
- ✅ **Immediate** - Cashback credited instantly

### **For Business**
- ✅ **Encourages frequent usage** - Users buy more to get cashback
- ✅ **Builds loyalty** - Users prefer your app
- ✅ **Sustainable** - Transfer fees cover cashback costs
- ✅ **Data insights** - Track user behavior patterns

---

## 📈 **Success Metrics**

### **Track These KPIs**
- **Daily active users** - Users making purchases
- **Purchase frequency** - Average purchases per user per day
- **Cashback redemption rate** - % of eligible users getting cashback
- **Revenue per user** - Average revenue per user
- **Retention rate** - Users returning daily

### **Expected Results**
- **20-30% increase** in daily purchases
- **15-25% increase** in user retention
- **10-15% increase** in average order value
- **Higher engagement** during peak hours

---

## 🎯 **Next Steps**

1. **Implement the loyalty system** in your endpoints
2. **Update frontend** to show loyalty status
3. **Add push notifications** for cashback eligibility
4. **Create admin dashboard** for loyalty analytics
5. **A/B test** different cashback percentages

The loyalty system is designed to increase user engagement while maintaining profitability! 🚀




