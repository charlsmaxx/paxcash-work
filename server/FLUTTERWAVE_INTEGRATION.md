# Flutterwave Integration for Real Nigerian Banking

## 🏦 **What This System Provides**

This integration creates **real virtual bank accounts** in Nigerian banks through Flutterwave's API. These are **actual bank accounts** that can:

✅ **Receive real money** from any Nigerian bank  
✅ **Make real transfers** to any Nigerian bank account  
✅ **Generate real account numbers** (10-digit NUBAN)  
✅ **Handle real transactions** with actual banks  
✅ **Comply with CBN regulations** through Flutterwave  

## 🔑 **Key Features**

### **1. Virtual Account Creation**
- Creates real bank accounts with actual Nigerian banks
- Generates unique 10-digit account numbers
- Links to user's BVN for KYC compliance
- Supports multiple banks (Access Bank, GTBank, etc.)

### **2. Real Money Transactions**
- **Deposits**: Anyone can send money to the virtual account
- **Withdrawals**: Transfer money to any Nigerian bank account
- **Real-time balance updates** via webhooks
- **Transaction tracking** with unique references

### **3. KYC & Compliance**
- **BVN verification** with Flutterwave
- **NIN integration** (optional)
- **CBN compliance** through Flutterwave's license
- **Transaction monitoring** and limits

## 🚀 **Setup Instructions**

### **1. Get Flutterwave API Keys**

1. Sign up at [Flutterwave Dashboard](https://dashboard.flutterwave.com)
2. Go to Settings → API Keys
3. Copy your **Secret Key** and **Public Key**
4. Add to your `.env` file:

```env
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST_xxxxxxxxxxxxxxxxxxxxx
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST_xxxxxxxxxxxxxxxxxxxxx
FLUTTERWAVE_WEBHOOK_URL=https://your-domain.com/api/webhook/flutterwave
```

### **2. Install Dependencies**

```bash
npm install axios
```

### **3. Configure Webhook URL**

Set up your webhook URL in Flutterwave dashboard:
- Go to Settings → Webhooks
- Add: `https://your-domain.com/api/webhook/flutterwave`

## 📋 **API Endpoints**

### **1. Create Virtual Account**
```http
POST /api/virtual-account/create
```

**Request Body:**
```json
{
  "userId": "user_id",
  "bvn": "12345678901",
  "nin": "12345678901",
  "dateOfBirth": "1990-01-01"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Virtual account created successfully",
  "virtualAccount": {
    "accountNumber": "1234567890",
    "bankName": "Access Bank",
    "accountName": "JOHN DOE",
    "status": "active"
  }
}
```

### **2. Get Virtual Account**
```http
GET /api/virtual-account?userId=user_id
```

### **3. Get Bank List**
```http
GET /api/banks
```

### **4. Transfer to Bank**
```http
POST /api/transfer/bank
```

**Request Body:**
```json
{
  "userId": "user_id",
  "bankCode": "044",
  "accountNumber": "1234567890",
  "amount": 10000,
  "narration": "Transfer to savings"
}
```

## 💰 **How Real Money Works**

### **1. Deposits (Money In)**
1. User gets virtual account number (e.g., 1234567890)
2. Anyone can transfer money to this account from any Nigerian bank
3. Flutterwave webhook notifies your system
4. User's wallet balance is automatically updated
5. Transaction is recorded in database

### **2. Withdrawals (Money Out)**
1. User initiates transfer to any Nigerian bank account
2. System verifies account number with Flutterwave
3. Transfer is initiated through Flutterwave
4. Money is sent to recipient's bank account
5. Transaction status is updated via webhook

## 🔒 **Security & Compliance**

### **1. KYC Requirements**
- **BVN (Bank Verification Number)** - Required
- **NIN (National Identity Number)** - Optional but recommended
- **Date of Birth** - For BVN verification
- **Phone Number** - Must match BVN records

### **2. Transaction Limits**
- **Daily Limit**: ₦1,000,000 (1 million Naira)
- **Monthly Limit**: ₦10,000,000 (10 million Naira)
- **Minimum Transfer**: ₦100
- **Maximum Transfer**: Based on daily/monthly limits

### **3. Security Features**
- **Webhook signature verification** (implemented)
- **Transaction monitoring**
- **Suspicious activity detection**
- **Rate limiting**

## 🏛️ **Regulatory Compliance**

### **1. CBN Requirements**
- ✅ **KYC Compliance** - Through BVN verification
- ✅ **Transaction Monitoring** - All transactions tracked
- ✅ **Reporting** - Flutterwave handles regulatory reporting
- ✅ **AML Compliance** - Anti-money laundering checks

### **2. Bank Partnerships**
Flutterwave partners with major Nigerian banks:
- Access Bank
- GTBank
- First Bank
- UBA
- Zenith Bank
- And many more...

## 📊 **Database Schema**

### **VirtualAccount Model**
```javascript
{
  userId: ObjectId,           // Reference to User
  flutterwaveAccountId: String, // Flutterwave account ID
  accountNumber: String,      // Real 10-digit account number
  bankName: String,          // Actual bank name
  bankCode: String,          // Bank code
  accountName: String,       // Account holder name
  bvn: String,              // 11-digit BVN
  nin: String,              // 11-digit NIN (optional)
  status: String,           // pending/active/suspended/closed
  dailyLimit: Number,       // Daily transaction limit
  monthlyLimit: Number,     // Monthly transaction limit
  dailyUsage: Number,       // Current daily usage
  monthlyUsage: Number,     // Current monthly usage
  createdAt: Date,
  updatedAt: Date
}
```

## 🚨 **Important Notes**

### **1. Testing vs Production**
- **Test Mode**: Use test API keys for development
- **Live Mode**: Use live API keys for production
- **Test Accounts**: Use test BVN numbers for development

### **2. Fees & Charges**
- **Virtual Account Creation**: Free
- **Deposits**: Free (sender pays bank charges)
- **Withdrawals**: ₦50 - ₦200 per transfer
- **Account Maintenance**: Free

### **3. Processing Times**
- **Virtual Account Creation**: Instant
- **Deposits**: 1-5 minutes
- **Withdrawals**: 1-24 hours (depending on bank)

### **4. Support**
- **Flutterwave Support**: Available 24/7
- **Documentation**: [Flutterwave Docs](https://developer.flutterwave.com)
- **API Status**: [Status Page](https://status.flutterwave.com)

## 🔧 **Troubleshooting**

### **Common Issues**

1. **BVN Verification Failed**
   - Ensure BVN matches user details
   - Check if BVN is active
   - Verify date of birth format

2. **Account Creation Failed**
   - Check API keys
   - Verify webhook URL
   - Ensure all required fields

3. **Transfer Failed**
   - Verify account number
   - Check bank code
   - Ensure sufficient balance

### **Error Codes**
- `INVALID_BVN` - BVN verification failed
- `INSUFFICIENT_FUNDS` - Insufficient balance
- `INVALID_ACCOUNT` - Invalid account number
- `TRANSACTION_LIMIT_EXCEEDED` - Daily/monthly limit exceeded

## 📞 **Support & Contact**

- **Flutterwave Support**: support@flutterwave.com
- **Technical Documentation**: [Flutterwave Developer Docs](https://developer.flutterwave.com)
- **API Reference**: [API Documentation](https://developer.flutterwave.com/reference)

---

**⚠️ Disclaimer**: This system creates real bank accounts and handles real money. Ensure proper security measures and regulatory compliance before going live. 