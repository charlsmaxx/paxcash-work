# Revenue Collection Setup Guide

## How to Get Fees Into Your Real Bank Account

### Step 1: Configure Your Admin Bank Account

Add these environment variables to your `server/.env` file:

```env
# Admin Bank Account Details
ADMIN_BANK_ACCOUNT=1234567890
ADMIN_BANK_CODE=044
ADMIN_ACCOUNT_NAME=Your Name
```

**How to get your bank code:**
- Use the `/api/banks` endpoint to get the list of banks
- Find your bank and note the `code` field
- Common codes: Access Bank (044), GTBank (058), First Bank (011), etc.

### Step 2: Fund Your Flutterwave Wallet

1. **Log into your Flutterwave dashboard**
2. **Go to Wallet section**
3. **Add funds** to your Flutterwave wallet using:
   - Bank transfer
   - Card payment
   - Other supported methods

### Step 3: Collect Revenue (3 Methods)

#### Method 1: Manual Collection via API
```bash
# Check uncollected revenue
GET /api/admin/revenue/uncollected
Headers: x-admin-key: YOUR_ADMIN_KEY

# Collect all uncollected revenue
POST /api/admin/revenue/collect
Headers: x-admin-key: YOUR_ADMIN_KEY

# Collect specific amount
POST /api/admin/revenue/collect
Headers: x-admin-key: YOUR_ADMIN_KEY
Body: { "amount": 5000 }
```

#### Method 2: Using Postman/API Client
1. **Set up request:**
   - Method: POST
   - URL: `http://localhost:5000/api/admin/revenue/collect`
   - Headers: `x-admin-key: YOUR_ADMIN_KEY`
   - Body: `{ "amount": 5000 }` (optional)

2. **Check response:**
   ```json
   {
     "success": true,
     "message": "Revenue collected successfully",
     "collection": {
       "amount": 5000,
       "transferReference": "FLW_REF_123",
       "collectedTransactions": 25
     }
   }
   ```

#### Method 3: Automated Collection (Recommended)
Set up a cron job or scheduled task to collect revenue daily:

```javascript
// Example: Collect revenue every day at 6 PM
const cron = require('node-cron');
const revenueCollectionService = require('./services/revenueCollectionService');

cron.schedule('0 18 * * *', async () => {
  console.log('Running daily revenue collection...');
  const result = await revenueCollectionService.collectRevenue();
  console.log('Collection result:', result);
});
```

### Step 4: Monitor Revenue Collection

#### Check Revenue Summary
```bash
GET /api/admin/revenue/summary
Headers: x-admin-key: YOUR_ADMIN_KEY
```

**Response:**
```json
{
  "success": true,
  "summary": {
    "totalRevenueGenerated": 15000,
    "totalCollected": 10000,
    "uncollected": 5000,
    "availableForCollection": 5000
  }
}
```

#### View Collection History
```bash
GET /api/admin/revenue/collections
Headers: x-admin-key: YOUR_ADMIN_KEY
```

### Step 5: Verify Bank Transfer

1. **Check your bank account** for the transfer
2. **Verify the amount** matches the collection amount
3. **Check Flutterwave dashboard** for transfer status
4. **Review collection records** in your admin panel

## Revenue Collection Flow

```
1. Users make transfers/bill payments
   ↓
2. System generates fees (₦50-₦100 per transaction)
   ↓
3. Fees accumulate in your system as "uncollected revenue"
   ↓
4. You trigger collection via API
   ↓
5. System transfers accumulated fees to your bank account
   ↓
6. System marks fees as "collected"
   ↓
7. Money appears in your real bank account
```

## Important Notes

### Minimum Collection Amount
- **Recommended minimum**: ₦1,000 before collecting
- **Flutterwave transfer fees**: Usually ₦10-₦50 per transfer
- **Cost-effective**: Collect larger amounts to minimize transfer fees

### Collection Frequency
- **Daily**: For high-volume apps
- **Weekly**: For moderate volume
- **Monthly**: For low volume (not recommended due to Flutterwave fees)

### Error Handling
- **Insufficient Flutterwave balance**: Fund your wallet first
- **Invalid bank details**: Check your bank account configuration
- **Transfer failures**: Check Flutterwave dashboard for details

### Security
- **Keep admin key secure**: Don't expose it in frontend code
- **Use HTTPS**: In production, always use secure connections
- **Monitor collections**: Regularly check collection history

## Troubleshooting

### "Admin bank account details not configured"
- Add `ADMIN_BANK_ACCOUNT`, `ADMIN_BANK_CODE`, `ADMIN_ACCOUNT_NAME` to `.env`

### "Insufficient Flutterwave balance"
- Add funds to your Flutterwave wallet
- Check wallet balance using `/api/flutterwave/wallet-balance`

### "Transfer failed"
- Verify bank account details
- Check if bank account is active
- Contact Flutterwave support if needed

### "No revenue to collect"
- Wait for users to make transactions
- Check if revenue tracking is working properly

## Example Collection Script

Create a simple script to collect revenue:

```javascript
// collect-revenue.js
const axios = require('axios');

async function collectRevenue() {
  try {
    const response = await axios.post('http://localhost:5000/api/admin/revenue/collect', {}, {
      headers: {
        'x-admin-key': process.env.ADMIN_KEY
      }
    });
    
    console.log('Collection successful:', response.data);
  } catch (error) {
    console.error('Collection failed:', error.response?.data || error.message);
  }
}

collectRevenue();
```

Run with: `node collect-revenue.js`

This system will automatically transfer your accumulated fees to your real bank account!


