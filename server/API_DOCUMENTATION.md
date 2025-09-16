# Paxcash API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication Endpoints

### 1. User Registration
**POST** `/auth/register`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "phoneNumber": "+2348012345678"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account created successfully! Please check your email for the verification code."
}
```

### 2. Email Verification
**POST** `/auth/verify-email`

**Request Body:**
```json
{
  "email": "john@example.com",
  "code": "123456"
}
```

### 3. Resend Verification Code
**POST** `/auth/resend-code`

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

### 4. User Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful!",
  "user": {
    "id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phoneNumber": "+2348012345678"
  }
}
```

## Wallet Endpoints

### 1. Get User Wallet
**GET** `/wallet?userId=user_id`

**Response:**
```json
{
  "success": true,
  "wallet": {
    "userId": "user_id",
    "balance": 1000,
    "currency": "NGN",
    "accountNumber": "PAX1234567890",
    "bankName": "Paxcash Bank",
    "isActive": true,
    "totalDeposits": 1500,
    "totalWithdrawals": 500,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## Transaction Endpoints

### 1. Get User Transactions
**GET** `/transactions?userId=user_id&page=1&limit=10`

**Response:**
```json
{
  "success": true,
  "transactions": [
    {
      "id": "transaction_id",
      "userId": "user_id",
      "type": "deposit",
      "amount": 1000,
      "currency": "NGN",
      "status": "completed",
      "description": "Initial deposit",
      "reference": "PAX1234567890ABC",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalTransactions": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

### 2. Create Transaction
**POST** `/transactions`

**Request Body:**
```json
{
  "userId": "user_id",
  "type": "deposit",
  "amount": 1000,
  "description": "Bank deposit",
  "recipientEmail": "recipient@example.com",
  "recipientName": "Recipient Name"
}
```

**Transaction Types:**
- `deposit` - Add money to wallet
- `withdrawal` - Remove money from wallet
- `transfer` - Send money to another user
- `payment` - Make a payment

## Notification Endpoints

### 1. Get User Notifications
**GET** `/notifications?userId=user_id&page=1&limit=20`

**Response:**
```json
{
  "success": true,
  "notifications": [
    {
      "id": "notification_id",
      "userId": "user_id",
      "type": "transaction",
      "title": "Transaction Successful",
      "message": "Your deposit of ₦1000 has been processed",
      "isRead": false,
      "priority": "medium",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "unreadCount": 5,
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalNotifications": 10,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

### 2. Mark Notification as Read
**PATCH** `/notifications/:id/read`

**Response:**
```json
{
  "success": true,
  "message": "Notification marked as read",
  "notification": {
    "id": "notification_id",
    "isRead": true,
    "readAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## Contact Form

### 1. Send Contact Message
**POST** `/contact`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "General Inquiry",
  "message": "Hello, I have a question about your services."
}
```

## Health Check

### 1. API Health Status
**GET** `/health`

**Response:**
```json
{
  "status": "OK",
  "message": "Paxcash API is running"
}
```

## Error Responses

All endpoints return error responses in this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

## Notes

- All amounts are in Nigerian Naira (NGN) by default
- User IDs are MongoDB ObjectIds
- Pagination is available for transaction and notification lists
- Email verification is required before login
- Wallet is automatically created when user registers 