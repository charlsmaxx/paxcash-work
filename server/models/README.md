# Database Models

This directory contains all the MongoDB schemas for the Paxcash application.

## Models Overview

### 1. User Model (`User.js`)
Handles user authentication and profile information.

**Fields:**
- `firstName` (String, required) - User's first name
- `lastName` (String, required) - User's last name
- `email` (String, required, unique) - User's email address
- `password` (String, required) - Hashed password
- `phoneNumber` (String, required) - User's phone number
- `isVerified` (Boolean, default: false) - Email verification status
- `createdAt` (Date, default: now) - Account creation date
- `verifiedAt` (Date) - Email verification date
- `verificationCode` (String) - Email verification code
- `codeExpiry` (Date) - Verification code expiry time

### 2. Wallet Model (`Wallet.js`)
Manages user account balances and wallet information.

**Fields:**
- `userId` (ObjectId, required, unique) - Reference to User
- `balance` (Number, default: 0) - Current wallet balance
- `currency` (String, default: 'NGN') - Wallet currency
- `accountNumber` (String, unique, required) - Auto-generated account number
- `bankName` (String, default: 'Paxcash Bank') - Bank name
- `isActive` (Boolean, default: true) - Wallet status
- `lastTransactionDate` (Date) - Last transaction timestamp
- `totalDeposits` (Number, default: 0) - Total deposits made
- `totalWithdrawals` (Number, default: 0) - Total withdrawals made
- `createdAt` (Date, default: now) - Wallet creation date
- `updatedAt` (Date, default: now) - Last update timestamp

### 3. Transaction Model (`Transaction.js`)
Tracks all financial transactions.

**Fields:**
- `userId` (ObjectId, required) - Reference to User
- `type` (String, required) - Transaction type: 'deposit', 'withdrawal', 'transfer', 'payment'
- `amount` (Number, required, min: 0) - Transaction amount
- `currency` (String, default: 'NGN') - Transaction currency
- `status` (String, default: 'pending') - Transaction status: 'pending', 'completed', 'failed', 'cancelled'
- `description` (String, required) - Transaction description
- `reference` (String, unique, required) - Auto-generated transaction reference
- `recipientEmail` (String) - Recipient's email for transfers
- `recipientName` (String) - Recipient's name for transfers
- `fee` (Number, default: 0) - Transaction fee
- `metadata` (Map) - Additional transaction data
- `createdAt` (Date, default: now) - Transaction creation date
- `completedAt` (Date) - Transaction completion date
- `failureReason` (String) - Reason for failed transactions

### 4. Notification Model (`Notification.js`)
Handles user notifications and alerts.

**Fields:**
- `userId` (ObjectId, required) - Reference to User
- `type` (String, required) - Notification type: 'transaction', 'security', 'promotion', 'system', 'verification'
- `title` (String, required) - Notification title
- `message` (String, required) - Notification message
- `isRead` (Boolean, default: false) - Read status
- `priority` (String, default: 'medium') - Priority level: 'low', 'medium', 'high', 'urgent'
- `actionUrl` (String) - URL for notification action
- `metadata` (Map) - Additional notification data
- `expiresAt` (Date) - Notification expiry date
- `createdAt` (Date, default: now) - Notification creation date
- `readAt` (Date) - When notification was read

## Usage

Import models in your files:

```javascript
const { User, Transaction, Wallet, Notification } = require('./models');
```

Or import individual models:

```javascript
const User = require('./User');
const Transaction = require('./Transaction');
```

## Database Indexes

- **User**: Email field is indexed for unique constraint
- **Wallet**: UserId field is indexed for unique constraint
- **Transaction**: Reference field is indexed for unique constraint
- **Notification**: Compound index on (userId, isRead, createdAt) for efficient querying

## Auto-generated Fields

- **Account Numbers**: Generated as `PAX{timestamp}{random}` format
- **Transaction References**: Generated as `PAX{timestamp}{random}` format
- **Timestamps**: Automatically managed for creation and update times 