# 💰 PaxCash Pricing Model Explanation

## 🏦 **Transfer Fees (Your Revenue)**

### **Tiered Transfer Fees**
- **Below ₦2,500**: ₦50 fee
- **₦2,500 and above**: ₦100 fee

### **Examples:**
```
Transfer ₦1,000 → User pays ₦1,050 (₦1,000 + ₦50 fee)
Transfer ₦3,000 → User pays ₦3,100 (₦3,000 + ₦100 fee)
```

### **Your Revenue:**
- **₦1,000 transfer**: You earn ₦50
- **₦3,000 transfer**: You earn ₦100

---

## 📱 **Airtime/Data Discounts (Marketing Strategy)**

### **Option 1: You Give Users Discount (RECOMMENDED)**

**How it works:**
1. **User wants ₦1,000 airtime**
2. **You pay Flutterwave**: ₦1,000 (full price)
3. **You charge user**: ₦980 (2% discount)
4. **User gets**: ₦1,000 airtime value
5. **Your cost**: ₦20 (marketing expense)

**Example:**
```
User wants: ₦1,000 airtime
Discount: 2% (₦20 off)
User pays: ₦980
Airtime value: ₦1,000
Your cost: ₦1,000 (to Flutterwave)
Your loss: ₦20 (covered by transfer fees)
```

### **Option 2: Providers Give You Discount (Alternative)**

**How it works:**
1. **User wants ₦1,000 airtime**
2. **You pay Flutterwave**: ₦980 (discounted rate)
3. **You charge user**: ₦1,000 (full price)
4. **User gets**: ₦1,000 airtime value
5. **Your profit**: ₦20

**Example:**
```
User wants: ₦1,000 airtime
Provider discount: 2% (₦20 off)
You pay Flutterwave: ₦980
You charge user: ₦1,000
Your profit: ₦20
```

---

## 🎯 **Recommended Strategy: Option 1**

### **Why Option 1 is Better:**

1. **✅ Easier Implementation**
   - No need to negotiate with Flutterwave
   - Works with current API setup
   - Immediate implementation

2. **✅ Better Marketing**
   - "Get 2% off all airtime/data"
   - Attracts price-sensitive customers
   - Competitive advantage

3. **✅ User Experience**
   - Users see immediate savings
   - Transparent pricing
   - Builds loyalty

4. **✅ Revenue Model**
   - Transfer fees cover the discount costs
   - Higher volume = more transfer fees
   - Sustainable business model

---

## 💡 **Revenue Calculation Example**

### **Monthly Scenario:**
- **100 transfers** (₦1,000 average) = ₦5,000 revenue
- **200 airtime purchases** (₦1,000 average) = ₦4,000 discount cost
- **Net revenue**: ₦1,000

### **Breakdown:**
```
Transfer Revenue:
- 50 transfers below ₦2,500 × ₦50 = ₦2,500
- 50 transfers above ₦2,500 × ₦100 = ₦5,000
- Total Transfer Revenue: ₦7,500

Airtime Discount Cost:
- 200 purchases × ₦20 discount = ₦4,000

Net Revenue: ₦7,500 - ₦4,000 = ₦3,500
```

---

## 🚀 **Implementation Steps**

1. **Update Transfer Endpoints** - Add tiered fees
2. **Update Airtime/Data Endpoints** - Add discount logic
3. **Update Frontend** - Show fees and discounts
4. **Add Fee Preview** - Calculate before transaction
5. **Update Pricing Page** - Reflect actual fees

---

## 📊 **Pricing Summary**

| Service | User Pays | You Earn/Cost | Notes |
|---------|-----------|---------------|-------|
| Transfer <₦2,500 | Amount + ₦50 | +₦50 | Revenue |
| Transfer ≥₦2,500 | Amount + ₦100 | +₦100 | Revenue |
| Airtime | Amount - 2% | -2% | Marketing cost |
| Data | Amount - 2% | -2% | Marketing cost |
| Bills | Amount | ₦0 | Free (loss leader) |

**Result**: Transfer fees fund airtime/data discounts, creating a sustainable business model.




