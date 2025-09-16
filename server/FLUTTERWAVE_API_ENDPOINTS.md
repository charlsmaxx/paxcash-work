# 🚀 Flutterwave API Endpoints Documentation

## 📋 **Overview**

This document outlines all the Flutterwave API endpoints available in your hybrid banking system. These endpoints handle:

- **Bill Payments** (Electricity, Cable TV, Internet)
- **Airtime & Data** (All Nigerian networks)
- **Enhanced Disbursements** (Bank transfers, bulk transfers)
- **Wallet Management** (Balance, transaction history)

## 🔑 **Authentication**

All Flutterwave endpoints require your Flutterwave Secret Key in the `.env` file:

```env
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-xxxxxxxxxxxxxxxxxxxxx
FLUTTERWAVE_BASE_URL=https://api.flutterwave.com/v3
```

## 📱 **Bill Payments**

### 1. Get Bill Categories
```http
GET /api/flutterwave/bill-categories
```

**Description:** Retrieve all available bill payment categories (electricity, cable TV, internet, etc.)

**Response:**
```json
{
  "success": true,
  "message": "Bill categories retrieved successfully",
  "categories": [
    {
      "id": "1",
      "name": "Electricity",
      "description": "Pay electricity bills"
    },
    {
      "id": "2", 
      "name": "Cable TV",
      "description": "Pay cable TV subscriptions"
    }
  ]
}
```

### 2. Get Bill Providers
```http
GET /api/flutterwave/bill-providers/:categoryId
```

**Description:** Get all providers for a specific bill category

**Parameters:**
- `categoryId` (path): The category ID from step 1

**Response:**
```json
{
  "success": true,
  "message": "Bill providers retrieved successfully",
  "providers": [
    {
      "biller_code": "BIL001",
      "name": "Ikeja Electric",
      "category": "Electricity"
    }
  ]
}
```

### 3. Validate Bill Payment
```http
POST /api/flutterwave/validate-bill
```

**Description:** Validate customer details before payment

**Request Body:**
```json
{
  "billerCode": "BIL001",
  "customerId": "1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bill validation successful",
  "billDetails": {
    "customer_name": "JOHN DOE",
    "amount": 5000,
    "due_date": "2024-02-15"
  }
}
```

### 4. Pay Electricity Bill
```http
POST /api/flutterwave/pay-electricity
```

**Description:** Process electricity bill payment

**Request Body:**
```json
{
  "billerCode": "BIL001",
  "customerId": "1234567890",
  "amount": 5000,
  "phone": "08012345678",
  "email": "user@example.com",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Electricity bill payment initiated successfully",
  "paymentData": {
    "tx_ref": "ELEC_1705123456789_abc123",
    "status": "pending",
    "payment_url": "https://checkout.flutterwave.com/..."
  }
}
```

### 5. Pay Cable TV Bill
```http
POST /api/flutterwave/pay-cable-tv
```

**Description:** Process cable TV subscription payment

**Request Body:**
```json
{
  "billerCode": "CABLE001",
  "customerId": "1234567890",
  "amount": 3000,
  "phone": "08012345678",
  "email": "user@example.com",
  "name": "John Doe",
  "plan": "Premium Plan"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cable TV bill payment initiated successfully",
  "paymentData": {
    "tx_ref": "CABLE_1705123456789_def456",
    "status": "pending",
    "payment_url": "https://checkout.flutterwave.com/..."
  }
}
```

## 📱 **Airtime & Data**

### 6. Get Airtime Providers
```http
GET /api/flutterwave/airtime-providers
```

**Description:** Get all available airtime providers (MTN, Airtel, Glo, 9mobile)

**Response:**
```json
{
  "success": true,
  "message": "Airtime providers retrieved successfully",
  "providers": [
    {
      "id": "1",
      "name": "MTN",
      "code": "MTN"
    },
    {
      "id": "2",
      "name": "Airtel",
      "code": "AIRTEL"
    }
  ]
}
```

### 7. Buy Airtime
```http
POST /api/flutterwave/buy-airtime
```

**Description:** Purchase airtime for any phone number

**Request Body:**
```json
{
  "phone": "08012345678",
  "amount": 1000,
  "provider": "MTN"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Airtime purchased successfully",
  "airtimeData": {
    "reference": "AIRTIME_1705123456789_ghi789",
    "status": "success",
    "amount": 1000
  }
}
```

### 8. Get Data Plans
```http
GET /api/flutterwave/data-plans/:provider
```

**Description:** Get available data plans for a specific provider

**Parameters:**
- `provider` (path): Provider code (MTN, AIRTEL, GLO, 9MOBILE)

**Response:**
```json
{
  "success": true,
  "message": "Data plans retrieved successfully",
  "dataPlans": [
    {
      "id": "1",
      "name": "1GB Daily",
      "size": "1GB",
      "validity": "24 hours",
      "price": 200
    }
  ]
}
```

### 9. Buy Data Bundle
```http
POST /api/flutterwave/buy-data
```

**Description:** Purchase data bundle for any phone number

**Request Body:**
```json
{
  "phone": "08012345678",
  "planId": "1",
  "provider": "MTN"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Data bundle purchased successfully",
  "dataBundleData": {
    "reference": "DATA_1705123456789_jkl012",
    "status": "success",
    "plan": "1GB Daily"
  }
}
```

## 💰 **Enhanced Disbursements**

### 10. Bulk Transfer
```http
POST /api/flutterwave/bulk-transfer
```

**Description:** Transfer money to multiple bank accounts simultaneously

**Request Body:**
```json
{
  "transfers": [
    {
      "bankCode": "044",
      "accountNumber": "1234567890",
      "amount": 5000,
      "narration": "Salary payment",
      "recipientName": "John Doe"
    },
    {
      "bankCode": "058",
      "accountNumber": "0987654321", 
      "amount": 3000,
      "narration": "Bonus payment",
      "recipientName": "Jane Smith"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bulk transfer initiated successfully",
  "bulkTransferData": {
    "batch_id": "BULK_1705123456789",
    "status": "pending",
    "total_amount": 8000
  }
}
```

## 💳 **Wallet Management**

### 11. Get Wallet Balance
```http
GET /api/flutterwave/wallet-balance
```

**Description:** Get current Flutterwave wallet balance

**Response:**
```json
{
  "success": true,
  "message": "Wallet balance retrieved successfully",
  "balance": {
    "available_balance": 50000,
    "ledger_balance": 50000,
    "currency": "NGN"
  }
}
```

### 12. Get Transaction History
```http
GET /api/flutterwave/transactions?page=1&limit=50
```

**Description:** Get paginated transaction history

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)

**Response:**
```json
{
  "success": true,
  "message": "Transaction history retrieved successfully",
  "transactions": [
    {
      "id": "123",
      "tx_ref": "TXN_1705123456789",
      "amount": 5000,
      "currency": "NGN",
      "status": "successful",
      "type": "transfer",
      "created_at": "2024-01-13T12:34:56Z"
    }
  ]
}
```

## 🔗 **Webhooks**

### 13. Bill Payment Webhook
```http
POST /api/webhook/flutterwave-bill
```

**Description:** Receives notifications for bill payment status updates

### 14. Airtime Webhook
```http
POST /api/webhook/flutterwave-airtime
```

**Description:** Receives notifications for airtime purchase status updates

### 15. Data Bundle Webhook
```http
POST /api/webhook/flutterwave-data
```

**Description:** Receives notifications for data bundle purchase status updates

### 16. Bulk Transfer Webhook
```http
POST /api/webhook/flutterwave-bulk-transfer
```

**Description:** Receives notifications for bulk transfer status updates

## 🧪 **Testing**

### Test Bill Payment Flow:
1. **Get categories:** `GET /api/flutterwave/bill-categories`
2. **Get providers:** `GET /api/flutterwave/bill-providers/1`
3. **Validate bill:** `POST /api/flutterwave/validate-bill`
4. **Pay bill:** `POST /api/flutterwave/pay-electricity`

### Test Airtime Flow:
1. **Get providers:** `GET /api/flutterwave/airtime-providers`
2. **Buy airtime:** `POST /api/flutterwave/buy-airtime`

### Test Data Flow:
1. **Get data plans:** `GET /api/flutterwave/data-plans/MTN`
2. **Buy data:** `POST /api/flutterwave/buy-data`

## ⚠️ **Important Notes**

1. **Environment Variables:** Ensure all Flutterwave credentials are set in your `.env` file
2. **Webhook URLs:** Update webhook URLs in Flutterwave dashboard to match your endpoints
3. **Error Handling:** All endpoints return consistent error responses with `success: false`
4. **Logging:** All API calls are logged with emojis for easy debugging
5. **Validation:** Input validation is performed on all endpoints

## 🚨 **Error Responses**

All endpoints return errors in this format:

```json
{
  "success": false,
  "message": "Error description here"
}
```

Common HTTP status codes:
- `200`: Success
- `400`: Bad request (missing/invalid parameters)
- `500`: Internal server error

## 📞 **Support**

For Flutterwave API issues:
- **Flutterwave Support:** support@flutterwave.com
- **Documentation:** [Flutterwave Developer Docs](https://developer.flutterwave.com)
- **API Status:** [Status Page](https://status.flutterwave.com)

---

**🎯 Ready to use!** Your hybrid banking system now supports comprehensive Flutterwave integration for all major financial services.
