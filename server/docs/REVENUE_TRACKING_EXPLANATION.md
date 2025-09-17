# Revenue Tracking System

## Overview

The PaxCash app tracks revenue from service fees charged to users. This system automatically creates revenue transactions when users make transfers or bill payments.

## How It Works

### 1. Transfer Fees
- **Fee Structure**: 
  - Transfers below ₦2,500: ₦50 fee
  - Transfers above ₦2,500: ₦100 fee
- **Process**:
  1. User initiates transfer of ₦X
  2. System calculates fee using `pricingService.calculateTransferFee(amount)`
  3. User's wallet is debited for `amount + fee`
  4. Two transactions are created:
     - User transaction: `type: 'withdrawal'`, `amount: X`, `fee: Y`
     - Revenue transaction: `type: 'revenue'`, `amount: Y`, `userId: 'system'`

### 2. Bill Payment Fees
- **Fee Structure**: 
  - Bill payments: ₦50 fee per transaction
- **Process**:
  1. User pays bill of ₦X
  2. System calculates fee using `pricingService.calculateBillFee(amount)`
  3. User's wallet is debited for `amount + fee`
  4. Two transactions are created:
     - User transaction: `type: 'payment'`, `amount: X`, `fee: Y`
     - Revenue transaction: `type: 'revenue'`, `amount: Y`, `userId: 'system'`

## Revenue Transaction Structure

```javascript
{
  userId: 'system', // System revenue
  type: 'revenue',
  amount: feeAmount,
  description: 'Transfer fee for Recipient Name (REF123)',
  status: 'completed',
  reference: 'REVENUE_REF123',
  completedAt: new Date(),
  metadata: {
    sourceTransactionId: userTransactionId,
    sourceUserId: originalUserId,
    service: 'transfer_fee' | 'bill_fee',
    transferAmount: originalAmount,
    feeRate: feePercentage
  }
}
```

## Admin Analytics

### Revenue Overview
- **Endpoint**: `GET /api/admin/revenue/overview`
- **Query Parameters**: `startDate`, `endDate` (optional)
- **Returns**:
  - Total revenue
  - Revenue by service type
  - Daily breakdown
  - Transfer fees summary
  - Bill fees summary

### Revenue by Service
- **Endpoint**: `GET /api/admin/revenue/service/:service`
- **Services**: `transfer_fee`, `bill_fee`
- **Returns**: Revenue data for specific service type

## Database Schema Updates

### Transaction Model
- Added `'revenue'` to type enum
- Changed `userId` to `Mixed` type to support `'system'` for revenue transactions
- Added `fee` field to track fees on user transactions

## Revenue Tracking Benefits

1. **Transparency**: Clear separation between user transactions and system revenue
2. **Analytics**: Detailed revenue reporting and analytics
3. **Audit Trail**: Complete tracking of all fees collected
4. **Business Intelligence**: Understanding of revenue sources and patterns

## Example Revenue Flow

```
User transfers ₦5,000:
├── User Transaction: -₦5,000 (withdrawal)
├── Revenue Transaction: +₦100 (transfer_fee)
└── User Balance: -₦5,100 total

User pays ₦2,000 bill:
├── User Transaction: -₦2,000 (payment)
├── Revenue Transaction: +₦50 (bill_fee)
└── User Balance: -₦2,050 total
```

## Monitoring Revenue

Use the admin dashboard to monitor:
- Daily revenue trends
- Revenue by service type
- Average revenue per transaction
- Top revenue-generating services
- Revenue growth over time


