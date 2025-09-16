const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/paxcash')
.then(() => console.log('✅ MongoDB connected successfully'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// Import models
const { User, Transaction, Wallet, Notification, VirtualAccount } = require('./models');


// Middleware
app.use(cors());
app.use(express.json());

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'paxcashteam@gmail.com',
    pass: process.env.EMAIL_PASS || 'amqjhycijfddiyaz'// This should be an app password from Gmail
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Generate 6-digit verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// User registration endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, phoneNumber } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !phoneNumber) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email already exists' 
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const codeExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Create user object
    const newUser = new User({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      phoneNumber,
      isVerified: false,
      verificationCode,
      codeExpiry
    });

    // Save user to database
    await newUser.save();

    // Create wallet for the user (without account number initially)
    const newWallet = new Wallet({
      userId: newUser._id
    });
    await newWallet.save();

    // Send verification email with code
    const mailOptions = {
      from: process.env.EMAIL_USER || 'paxcashteam@gmail.com',
      to: email,
      subject: 'Your Paxcash Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h1 style="color: #1976d2; margin: 0;">Welcome to Paxcash!</h1>
            <p style="color: #333; font-size: 18px;">Hi ${firstName},</p>
            <p style="color: #333;">Your verification code is:</p>
            <div style="font-size: 2.5rem; font-weight: bold; color: #764ba2; letter-spacing: 8px; margin: 24px 0;">${verificationCode}</div>
            <p style="color: #666;">Enter this code in the app to verify your email address. This code will expire in 15 minutes.</p>
          </div>
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              © 2024 Paxcash. All rights reserved.<br>
              Lagos, Nigeria
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ 
      success: true, 
      message: 'Account created successfully! Please check your email for the verification code.' 
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create account. Please try again later.' 
    });
  }
});

// Email verification with code endpoint
app.post('/api/auth/verify-email', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and verification code are required' 
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    if (user.isVerified) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is already verified' 
      });
    }

    if (!user.verificationCode || !user.codeExpiry) {
      return res.status(400).json({ 
        success: false, 
        message: 'No verification code found. Please request a new one.' 
      });
    }

    if (new Date() > user.codeExpiry) {
      return res.status(400).json({ 
        success: false, 
        message: 'Verification code has expired. Please request a new one.' 
      });
    }

    if (code !== user.verificationCode) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid verification code. Please try again.' 
      });
    }

    // Mark user as verified
    user.isVerified = true;
    user.verifiedAt = new Date();
    user.verificationCode = null;
    user.codeExpiry = null;
    await user.save();

    res.status(200).json({ 
      success: true, 
      message: 'Email verified successfully! You can now sign in to your account.' 
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to verify email. Please try again later.' 
    });
  }
});

// Resend verification code endpoint
app.post('/api/auth/resend-code', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found.' });
    }
    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'User already verified.' });
    }
    // Generate new code
    const newCode = generateVerificationCode();
    user.verificationCode = newCode;
    user.codeExpiry = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();
    
    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER || 'paxcashteam@gmail.com',
      to: email,
      subject: 'Your New Paxcash Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h1 style="color: #1976d2; margin: 0;">Paxcash Verification Code</h1>
            <p style="color: #333; font-size: 18px;">Hi ${user.firstName},</p>
            <p style="color: #333;">Your new verification code is:</p>
            <div style="font-size: 2.5rem; font-weight: bold; color: #764ba2; letter-spacing: 8px; margin: 24px 0;">${newCode}</div>
            <p style="color: #666;">Enter this code in the app to verify your email address. This code will expire in 15 minutes.</p>
          </div>
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              © 2024 Paxcash. All rights reserved.<br>
              Lagos, Nigeria
            </p>
          </div>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'A new verification code has been sent to your email.' });
  } catch (error) {
    console.error('Resend code error:', error);
    res.status(500).json({ success: false, message: 'Failed to send new code. Please try again.' });
  }
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER || 'paxcashteam@gmail.com',
      to: 'paxcashteam@gmail.com',
      subject: `Contact Form: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1976d2;">New Contact Form Submission</h2>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Contact Details:</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <div style="background-color: white; padding: 15px; border-radius: 5px; border-left: 4px solid #1976d2;">
              ${message.replace(/\n/g, '<br>')}
            </div>
          </div>
          <p style="color: #666; font-size: 12px;">
            This message was sent from the Paxcash Contact Form on ${new Date().toLocaleString()}
          </p>
        </div>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ 
      success: true, 
      message: 'Message sent successfully! We\'ll get back to you soon.' 
    });

  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send message. Please try again later.' 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Paxcash API is running' });
});

// Development endpoints to clear specific data (ONLY FOR DEVELOPMENT)
app.delete('/api/dev/clear-users', async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ success: false, message: 'Not available in production' });
    }
    await User.deleteMany({});
    res.status(200).json({ success: true, message: 'All users cleared successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to clear users' });
  }
});

app.delete('/api/dev/clear-wallets', async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ success: false, message: 'Not available in production' });
    }
    await Wallet.deleteMany({});
    res.status(200).json({ success: true, message: 'All wallets cleared successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to clear wallets' });
  }
});

app.delete('/api/dev/clear-transactions', async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ success: false, message: 'Not available in production' });
    }
    await Transaction.deleteMany({});
    res.status(200).json({ success: true, message: 'All transactions cleared successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to clear transactions' });
  }
});

app.delete('/api/dev/clear-virtual-accounts', async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ success: false, message: 'Not available in production' });
    }
    await VirtualAccount.deleteMany({});
    res.status(200).json({ success: true, message: 'All virtual accounts cleared successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to clear virtual accounts' });
  }
});

// Development endpoint to check user status (ONLY FOR DEVELOPMENT)
app.get('/api/dev/check-user/:email', async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ success: false, message: 'Not available in production' });
    }

    const { email } = req.params;
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ 
      success: true, 
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        isVerified: user.isVerified,
        verifiedAt: user.verifiedAt
      }
    });

  } catch (error) {
    console.error('Check user error:', error);
    res.status(500).json({ success: false, message: 'Failed to check user' });
  }
});

// Development endpoint to auto-verify user (ONLY FOR DEVELOPMENT)
app.patch('/api/dev/verify-user/:email', async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ success: false, message: 'Not available in production' });
    }

    const { email } = req.params;
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isVerified = true;
    user.verifiedAt = new Date();
    user.verificationCode = null;
    user.codeExpiry = null;
    await user.save();

    res.status(200).json({ 
      success: true, 
      message: 'User verified successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber
      }
    });

  } catch (error) {
    console.error('Auto-verify error:', error);
    res.status(500).json({ success: false, message: 'Failed to verify user' });
  }
});

// Development endpoint to test wallet update (ONLY FOR DEVELOPMENT)
app.post('/api/dev/test-wallet-update', async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ success: false, message: 'Not available in production' });
    }

    const { userId, amount } = req.body;
    if (!userId || !amount) {
      return res.status(400).json({ success: false, message: 'userId and amount are required' });
    }

    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({ success: false, message: 'Wallet not found' });
    }

    const oldBalance = wallet.balance || 0;
    wallet.balance = oldBalance + parseFloat(amount);
    wallet.totalDeposits = (wallet.totalDeposits || 0) + parseFloat(amount);
    wallet.lastTransactionDate = new Date();
    await wallet.save();

    // Create test transaction
    const transaction = new Transaction({
      userId,
      type: 'deposit',
      amount: parseFloat(amount),
      description: 'Test deposit',
      status: 'completed',
      completedAt: new Date()
    });
    await transaction.save();

    res.status(200).json({ 
      success: true, 
      message: 'Test wallet update successful',
      oldBalance,
      newBalance: wallet.balance,
      transactionId: transaction._id
    });

  } catch (error) {
    console.error('Test wallet update error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update wallet. Please try again later.' 
    });
  }
});

// Development endpoint to clear all data (ONLY FOR DEVELOPMENT)
app.delete('/api/dev/clear-all', async (req, res) => {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ 
        success: false, 
        message: 'This endpoint is not available in production' 
      });
    }

    // Clear all collections
    await User.deleteMany({});
    await Wallet.deleteMany({});
    await Transaction.deleteMany({});
    await Notification.deleteMany({});
    await VirtualAccount.deleteMany({});

    res.status(200).json({ 
      success: true, 
      message: 'All data cleared successfully',
      clearedCollections: ['users', 'wallets', 'transactions', 'notifications', 'virtualaccounts']
    });

  } catch (error) {
    console.error('Clear data error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to clear data. Please try again later.' 
    });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please verify your email before logging in' 
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Login successful
    res.status(200).json({ 
      success: true, 
      message: 'Login successful!',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to login. Please try again later.' 
    });
  }
});

// Get user wallet
app.get('/api/wallet', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }

    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({ 
        success: false, 
        message: 'Wallet not found' 
      });
    }

    res.status(200).json({ 
      success: true, 
      wallet 
    });

  } catch (error) {
    console.error('Get wallet error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get wallet. Please try again later.' 
    });
  }
});

// Get user transactions
app.get('/api/transactions', async (req, res) => {
  try {
    const { userId, page = 1, limit = 10 } = req.query;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }

    const skip = (page - 1) * limit;
    
    const transactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments({ userId });

    res.status(200).json({ 
      success: true, 
      transactions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalTransactions: total,
        hasNextPage: skip + transactions.length < total,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get transactions. Please try again later.' 
    });
  }
});

// Create a new transaction
app.post('/api/transactions', async (req, res) => {
  try {
    const { userId, type, amount, description, recipientEmail, recipientName } = req.body;

    if (!userId || !type || !amount || !description) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID, type, amount, and description are required' 
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Check if wallet exists
    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res.status(400).json({ 
        success: false, 
        message: 'Wallet not found' 
      });
    }

    // For withdrawals and transfers, check if user has sufficient balance
    if ((type === 'withdrawal' || type === 'transfer') && wallet.balance < amount) {
      return res.status(400).json({ 
        success: false, 
        message: 'Insufficient balance' 
      });
    }

    // Create transaction
    const transaction = new Transaction({
      userId,
      type,
      amount,
      description,
      recipientEmail,
      recipientName
    });

    await transaction.save();

    // Update wallet balance
    if (type === 'deposit') {
      wallet.balance += amount;
      wallet.totalDeposits += amount;
    } else if (type === 'withdrawal') {
      wallet.balance -= amount;
      wallet.totalWithdrawals += amount;
    } else if (type === 'transfer') {
      wallet.balance -= amount;
      wallet.totalWithdrawals += amount;
    }

    wallet.lastTransactionDate = new Date();
    await wallet.save();

    res.status(201).json({ 
      success: true, 
      message: 'Transaction created successfully',
      transaction 
    });

  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create transaction. Please try again later.' 
    });
  }
});

// Get user notifications
app.get('/api/notifications', async (req, res) => {
  try {
    const { userId, page = 1, limit = 20 } = req.query;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }

    const skip = (page - 1) * limit;
    
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments({ userId });
    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    res.status(200).json({ 
      success: true, 
      notifications,
      unreadCount,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalNotifications: total,
        hasNextPage: skip + notifications.length < total,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get notifications. Please try again later.' 
    });
  }
});

// Mark notification as read
app.patch('/api/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await Notification.findByIdAndUpdate(
      id,
      { 
        isRead: true, 
        readAt: new Date() 
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ 
        success: false, 
        message: 'Notification not found' 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Notification marked as read',
      notification 
    });

  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to mark notification as read. Please try again later.' 
    });
  }
});

// Virtual Account Endpoints

// Activate virtual account with Monnify
app.post('/api/virtual-account/activate', async (req, res) => {
  try {
    const { userId, name, email, phone, bvn, nin } = req.body;

    if (!userId || !name || !email) {
      return res.status(400).json({
        success: false,
        message: 'userId, name, and email are required'
      });
    }

    // Validate that at least one of BVN or NIN is provided
    if (!bvn && !nin) {
      return res.status(400).json({
        success: false,
        message: 'Either BVN or NIN is required for virtual account creation'
      });
    }

    // Validate BVN if provided
    if (bvn && !/^\d{11}$/.test(bvn)) {
      return res.status(400).json({
        success: false,
        message: 'BVN must be exactly 11 digits'
      });
    }

    // Validate NIN if provided
    if (nin && !/^\d{11}$/.test(nin)) {
      return res.status(400).json({
        success: false,
        message: 'NIN must be exactly 11 digits'
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if virtual account already exists
    let virtualAccount = await VirtualAccount.findOne({ userId });
    if (virtualAccount) {
      return res.status(400).json({
        success: false,
        message: 'Virtual account already exists',
        data: virtualAccount
      });
    }

    // Create virtual account with Monnify
    const accountReference = `paxcash-${userId}`;
    const monnifyService = require('./services/monnifyService');
    const monnifyData = await monnifyService.createMonnifyVirtualAccount({
      accountReference,
      accountName: name,
      email,
      customerName: name,
      customerEmail: email,
      customerPhoneNumber: phone || user.phoneNumber,
      bvn: bvn || null,
      nin: nin || null
    });

    // Save virtual account details
    virtualAccount = new VirtualAccount({
      userId,
      monnifyAccountReference: monnifyData.accountReference,
      monnifyReservationReference: monnifyData.reservationReference,
      accountNumber: monnifyData.accounts[0].accountNumber,
      bankName: monnifyData.accounts[0].bankName,
      accountName: monnifyData.accountName,
      status: 'active',
      isActive: true,
      monnifyResponse: monnifyData,
      bvn: bvn || null,
      nin: nin || null
    });
    await virtualAccount.save();

    // Optionally, link to wallet
    const wallet = await Wallet.findOne({ userId });
    if (wallet) {
      wallet.virtualAccount = virtualAccount._id;
      await wallet.save();
    }

    res.json({
      success: true,
      message: 'Virtual account created successfully',
      data: {
        accountNumber: monnifyData.accounts[0].accountNumber,
        accountName: monnifyData.accountName,
        bankName: monnifyData.accounts[0].bankName
      }
    });
  } catch (error) {
    console.error('Monnify virtual account activation error:', error?.response?.data || error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error?.response?.data || error.message
    });
  }
});

// Check virtual account status
app.get('/api/virtual-account/status', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }

    const virtualAccount = await VirtualAccount.findOne({ userId });
    const isActivated = !!virtualAccount;
    res.status(200).json({ 
      success: true, 
      isActivated: isActivated,
      virtualAccount: isActivated ? {
        accountNumber: virtualAccount.accountNumber,
        bankName: virtualAccount.bankName,
        accountName: virtualAccount.accountName,
        status: virtualAccount.isActive
      } : null
    });
  } catch (error) {
    console.error('Get virtual account error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get virtual account. Please try again later.' 
    });
  }
});

// Get bank list from Monnify API
app.get('/api/banks', async (req, res) => {
  try {
    console.log('📋 Getting banks list for frontend...');
    console.log('🔑 Environment check:');
    console.log('MONNIFY_API_KEY:', process.env.MONNIFY_API_KEY ? 'Set' : 'Not set');
    console.log('MONNIFY_SECRET_KEY:', process.env.MONNIFY_SECRET_KEY ? 'Set' : 'Not set');
    console.log('MONNIFY_BASE_URL:', process.env.MONNIFY_BASE_URL || 'Not set');
    
    const hybridBankingService = require('./services/hybridBankingService');
    const banksResult = await hybridBankingService.getBanks();

    if (!banksResult.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Failed to get banks: ' + banksResult.error 
      });
    }

    res.json({ 
      success: true, 
      message: banksResult.message,
      banks: banksResult.data
    });
  } catch (error) {
    console.error('Get banks error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get banks. Please try again later.' 
    });
  }
});

// Test Monnify API connection
app.get('/api/test-monnify', async (req, res) => {
  try {
    console.log('🧪 Starting Monnify API test...');
    
    const bankingService = require('./services/bankingService');
    
    // Test 1: Check environment variables
    console.log('📋 Checking environment variables...');
    const envCheck = {
      apiKey: process.env.MONNIFY_API_KEY ? '✅ Set' : '❌ Missing',
      secretKey: process.env.MONNIFY_SECRET_KEY ? '✅ Set' : '❌ Missing',
      contractCode: process.env.MONNIFY_CONTRACT_CODE ? '✅ Set' : '❌ Missing',
      baseUrl: process.env.MONNIFY_BASE_URL ? '✅ Set' : '✅ Using default',
      sourceAccount: process.env.MONNIFY_SOURCE_ACCOUNT ? '✅ Set' : '❌ Missing'
    };
    
    // Test 2: Authentication
    console.log('🔐 Testing authentication...');
    let authResult = null;
    try {
      authResult = await bankingService.getAccessToken();
      console.log('✅ Authentication successful');
    } catch (authError) {
      console.log('❌ Authentication failed:', authError.message);
    }
    
    // Test 3: Account verification (only if auth works)
    let verificationResult = null;
    if (authResult) {
      console.log('🔍 Testing account verification...');
      try {
        verificationResult = await bankingService.verifyAccount('1234567890', '044');
        console.log('✅ Account verification test completed');
      } catch (verifyError) {
        console.log('❌ Account verification failed:', verifyError.message);
      }
    }
    
    res.json({
      success: true,
      message: 'Monnify API test completed',
      environment: envCheck,
      authentication: authResult ? '✅ Working' : '❌ Failed',
      verification: verificationResult?.success ? '✅ Working' : '❌ Failed',
      details: {
        auth: authResult ? 'Success' : 'Failed',
        verification: verificationResult || 'Not tested (auth failed)'
      }
    });
  } catch (error) {
    console.error('❌ Monnify test error:', error);
    res.status(500).json({
        success: false, 
      message: 'Monnify API test failed',
      error: error.message
    });
  }
});

// Test Flutterwave API connection (no database required)
app.get('/api/test-flutterwave', async (req, res) => {
  try {
    console.log('🧪 Starting Flutterwave API test...');
    
    const hybridBankingService = require('./services/hybridBankingService');
    
    // Test Flutterwave configuration
    console.log('📋 Checking Flutterwave environment variables...');
    const envCheck = {
      secretKey: process.env.FLUTTERWAVE_SECRET_KEY ? '✅ Set' : '❌ Missing',
      publicKey: process.env.FLUTTERWAVE_PUBLIC_KEY ? '✅ Set' : '❌ Missing',
      encryptionKey: process.env.FLUTTERWAVE_ENCRYPTION_KEY ? '✅ Set' : '❌ Missing',
      baseUrl: process.env.FLUTTERWAVE_BASE_URL ? '✅ Set' : '✅ Using default'
    };
    
    // Test banks list from Monnify API
    console.log('📋 Testing banks list from Monnify...');
    const banksResult = await hybridBankingService.getBanks();
    
    // Test account verification with Monnify API
    console.log('🔍 Testing account verification with Monnify...');
    const verificationResult = await hybridBankingService.verifyAccount('1234567890', '044');

    res.json({ 
      success: true, 
      message: 'Flutterwave API test completed',
      environment: envCheck,
      banks: banksResult.success ? '✅ Working' : '❌ Failed',
      verification: verificationResult.success ? '✅ Working' : '❌ Failed',
      details: {
        banks: banksResult,
        verification: verificationResult
      }
    });
  } catch (error) {
    console.error('❌ Flutterwave test error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Flutterwave API test failed',
      error: error.message
    });
  }
});

// Verify bank account
app.post('/api/transfer/verify-account', async (req, res) => {
  try {
    const { accountNumber, bankCode } = req.body;

    if (!accountNumber || !bankCode) {
      return res.status(400).json({ 
        success: false, 
        message: 'Account number and bank code are required' 
      });
    }

    // Import hybrid banking service
    const hybridBankingService = require('./services/hybridBankingService');

    // Verify account using Monnify
    const verificationResult = await hybridBankingService.verifyAccount(accountNumber, bankCode);

    if (!verificationResult.success) {
      return res.status(400).json({ 
        success: false, 
        message: verificationResult.error 
      });
    }

    res.json({ 
      success: true, 
      message: 'Account verification successful',
      accountName: verificationResult.data.accountName || verificationResult.data.account_name
    });

  } catch (error) {
    console.error('Account verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to verify account. Please try again later.' 
    });
  }
});

// Transfer to bank account
app.post('/api/transfer/bank', async (req, res) => {
  try {
    const { userId, bankCode, accountNumber, amount, narration } = req.body;

    if (!userId || !bankCode || !accountNumber || !amount) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID, bank code, account number, and amount are required' 
      });
    }

    // Import pricing service to calculate transfer fee
    const pricingService = require('./services/pricingService');
    const transferFeeData = pricingService.calculateTransferFee(amount);
    const transferFee = transferFeeData.fee; // Extract just the fee number
    const totalAmount = amount + transferFee;

    // Check if user has sufficient balance (amount + fee)
    const wallet = await Wallet.findOne({ userId });
    if (!wallet || wallet.balance < totalAmount) {
      return res.status(400).json({ 
        success: false, 
        message: `Insufficient balance. Required: ₦${totalAmount} (₦${amount} + ₦${transferFee} fee)` 
      });
    }

    // Import hybrid banking service
    const hybridBankingService = require('./services/hybridBankingService');

    // Complete transfer flow (verify with Monnify, transfer with Flutterwave)
    const transferResult = await hybridBankingService.completeTransfer(
      accountNumber, 
      bankCode, 
      amount, 
      narration || 'Transfer from PaxCash',
      'Recipient'
    );

    if (!transferResult.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Transfer failed: ' + transferResult.error 
      });
    }

    // Generate reference
    const reference = transferResult.data.reference || `PAXCASH_TRANSFER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create user transaction record (amount only, not including fee)
    const userTransaction = new Transaction({
      userId,
      type: 'withdrawal',
      amount: amount, // Only the transfer amount, not including fee
      description: `Bank transfer to ${transferResult.data.recipientName || 'Recipient'}`,
      status: 'pending',
      reference: reference,
      fee: transferFee, // Track the fee separately
      metadata: {
        transferId: transferResult.data.transferId || transferResult.data.id,
        bankCode: bankCode,
        accountNumber: accountNumber,
        recipientName: transferResult.data.recipientName || 'Recipient',
        narration: narration,
        service: 'transfer'
      }
    });

    await userTransaction.save();

    // Create revenue transaction for the fee (system revenue)
    const revenueTransaction = new Transaction({
      userId: 'system', // System revenue
      type: 'revenue',
      amount: transferFee,
      description: `Transfer fee for ${transferResult.data.recipientName || 'Recipient'} (${reference})`,
      status: 'completed',
      reference: `REVENUE_${reference}`,
      completedAt: new Date(),
      metadata: {
        sourceTransactionId: userTransaction._id,
        sourceUserId: userId,
        service: 'transfer_fee',
        transferAmount: amount,
        feeRate: transferFee / amount * 100 // Fee percentage
      }
    });

    await revenueTransaction.save();

    // Update user wallet balance (deduct amount + fee)
    wallet.balance -= totalAmount;
    wallet.totalWithdrawals += amount; // Only track the actual transfer amount
    wallet.lastTransactionDate = new Date();
    await wallet.save();

    res.status(201).json({ 
      success: true, 
      message: 'Transfer initiated successfully',
      transfer: {
        id: transferResult.data.transactionReference || transferResult.data.id,
        amount: amount,
        fee: transferFee,
        totalDeducted: totalAmount,
        recipientName: transferResult.data.recipientName || 'Recipient',
        status: 'pending',
        reference: reference
      }
    });

  } catch (error) {
    console.error('Bank transfer error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to initiate transfer. Please try again later.' 
    });
  }
});

// Airtime purchase endpoint with loyalty system
app.post('/api/airtime/buy', async (req, res) => {
  try {
    const { userId, phoneNumber, network, amount } = req.body;

    if (!userId || !phoneNumber || !network || !amount) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID, phone number, network, and amount are required' 
      });
    }

    // Import pricing service for loyalty system
    const pricingService = require('./services/pricingService');
    
    // Get user's daily airtime purchase count
    const dailyCount = await pricingService.getDailyPurchaseCount(userId, 'airtime');
    
    // Calculate pricing with loyalty system
    const pricing = pricingService.calculateAirtimePricing(amount, dailyCount);

    // Check if user has sufficient balance
    const wallet = await Wallet.findOne({ userId });
    if (!wallet || wallet.balance < pricing.userPays) {
      return res.status(400).json({ 
        success: false, 
        message: `Insufficient balance. Required: ₦${pricing.userPays}`
      });
    }

    // Import hybrid banking service (uses Flutterwave for airtime)
    const hybridBankingService = require('./services/hybridBankingService');

    // Generate reference
    const reference = `PAXCASH_AIRTIME_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Buy airtime using Flutterwave (phone, amount, provider)
    const airtimeResult = await hybridBankingService.buyAirtime(phoneNumber, amount, network);

    if (!airtimeResult.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Airtime purchase failed: ' + airtimeResult.error 
      });
    }

    // Create transaction record
    const transaction = new Transaction({
      userId,
      type: 'payment',
      amount: pricing.userPays, // Amount deducted from wallet
      description: `Airtime purchase for ${phoneNumber} (${network}) - Purchase #${dailyCount + 1} today`,
      status: 'pending',
      reference: airtimeResult.data.reference || reference,
      fee: 0, // No upfront discount
      metadata: {
        phoneNumber,
        network,
        originalAmount: amount,
        airtimeValue: amount, // Actual airtime value received
        userPays: pricing.userPays,
        dailyPurchaseCount: dailyCount + 1,
        isEligibleForCashback: pricing.isEligibleForCashback,
        cashbackAmount: pricing.cashbackAmount,
        reference,
        transactionId: airtimeResult.data.id || airtimeResult.data.flw_ref,
        service: 'airtime'
      }
    });

    await transaction.save();

    // Update wallet balance (deduct full amount)
    wallet.balance -= pricing.userPays;
    wallet.lastTransactionDate = new Date();
    await wallet.save();

    // Process cashback if eligible
    const cashbackResult = await pricingService.processCashback(
      userId, 
      amount, 
      'airtime', 
      transaction._id
    );

    res.status(201).json({ 
      success: true, 
      message: 'Airtime purchase successful',
      airtime: {
        id: airtimeResult.data.id,
        airtimeValue: amount, // Value of airtime received
        userPays: pricing.userPays, // Amount deducted from wallet
        dailyPurchaseCount: dailyCount + 1,
        isEligibleForCashback: pricing.isEligibleForCashback,
        cashbackAmount: pricing.cashbackAmount,
        cashbackMessage: cashbackResult.message,
        phoneNumber,
        network,
        status: 'pending',
        reference
      }
    });

  } catch (error) {
    console.error('Airtime purchase error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Airtime purchase failed'
    });
  }
});

// Data purchase endpoint with loyalty system
app.post('/api/data/buy', async (req, res) => {
  try {
    const { userId, phoneNumber, network, plan, amount } = req.body;

    if (!userId || !phoneNumber || !network || !plan || !amount) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID, phone number, network, plan, and amount are required' 
      });
    }

    // Import pricing service for loyalty system
    const pricingService = require('./services/pricingService');
    
    // Get user's daily data purchase count
    const dailyCount = await pricingService.getDailyPurchaseCount(userId, 'data');
    
    // Calculate pricing with loyalty system
    const pricing = pricingService.calculateDataPricing(amount, dailyCount);

    // Check if user has sufficient balance
    const wallet = await Wallet.findOne({ userId });
    if (!wallet || wallet.balance < pricing.userPays) {
      return res.status(400).json({ 
        success: false, 
        message: `Insufficient balance. Required: ₦${pricing.userPays}`
      });
    }

    // Import hybrid banking service (uses Flutterwave for data)
    const hybridBankingService = require('./services/hybridBankingService');

    // Generate reference
    const reference = `PAXCASH_DATA_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Buy data using Flutterwave (phone, planId, provider)
    const dataResult = await hybridBankingService.buyDataBundle(phoneNumber, plan, network);

    if (!dataResult.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Data purchase failed: ' + dataResult.error 
      });
    }

    // Create transaction record
    const transaction = new Transaction({
      userId,
      type: 'payment',
      amount: pricing.userPays, // Amount deducted from wallet
      description: `Data purchase for ${phoneNumber} (${network}) - ${plan} - Purchase #${dailyCount + 1} today`,
      status: 'pending',
      reference: dataResult.data.reference || reference,
      fee: 0, // No upfront discount
      metadata: {
        phoneNumber,
        network,
        plan,
        originalAmount: amount,
        dataValue: amount, // Actual data value received
        userPays: pricing.userPays,
        dailyPurchaseCount: dailyCount + 1,
        isEligibleForCashback: pricing.isEligibleForCashback,
        cashbackAmount: pricing.cashbackAmount,
        reference,
        transactionId: dataResult.data.id || dataResult.data.flw_ref,
        service: 'data'
      }
    });

    await transaction.save();

    // Update wallet balance (deduct full amount)
    wallet.balance -= pricing.userPays;
    wallet.lastTransactionDate = new Date();
    await wallet.save();

    // Process cashback if eligible
    const cashbackResult = await pricingService.processCashback(
      userId, 
      amount, 
      'data', 
      transaction._id
    );

    res.status(201).json({ 
      success: true, 
      message: 'Data purchase successful',
      data: {
        id: dataResult.data.id,
        dataValue: amount, // Value of data received
        userPays: pricing.userPays, // Amount deducted from wallet
        dailyPurchaseCount: dailyCount + 1,
        isEligibleForCashback: pricing.isEligibleForCashback,
        cashbackAmount: pricing.cashbackAmount,
        cashbackMessage: cashbackResult.message,
        phoneNumber,
        network,
        plan,
        status: 'pending',
        reference
      }
    });

  } catch (error) {
    console.error('Data purchase error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Data purchase failed'
    });
  }
});

// Get data plans endpoint
app.get('/api/data/plans/:network', async (req, res) => {
  try {
    const { network } = req.params;
    const bankingService = require('./services/bankingService');

    const plansResult = await bankingService.getDataPlans(network);

    if (!plansResult.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Failed to get data plans: ' + plansResult.error 
      });
    }

    res.json({ 
      success: true, 
      message: 'Data plans retrieved successfully',
      plans: plansResult.data
    });

  } catch (error) {
    console.error('Get data plans error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get data plans. Please try again later.' 
    });
  }
});

// Bill payment endpoint
app.post('/api/bills/pay', async (req, res) => {
  try {
    const { userId, biller, customerId, amount } = req.body;

    // DEBUG: Log the exact request body received
    console.log('🔍 DEBUGGING: Bill Payment Request Received:');
    console.log('- User ID:', userId);
    console.log('- Biller Code:', biller);
    console.log('- Customer ID:', customerId);
    console.log('- Amount:', amount);
    console.log('- Full Request Body:', JSON.stringify(req.body, null, 2));

    if (!userId || !biller || !customerId || !amount) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID, biller, customer ID, and amount are required' 
      });
    }

    // Import pricing service to calculate bill fee
    const pricingService = require('./services/pricingService');
    const billFeeData = pricingService.calculateBillFee(amount);
    const billFee = billFeeData.fee; // Extract just the fee number
    const totalAmount = amount + billFee;

    // Check if user has sufficient balance (amount + fee)
    const wallet = await Wallet.findOne({ userId });
    if (!wallet || wallet.balance < totalAmount) {
      return res.status(400).json({ 
        success: false, 
        message: `Insufficient balance. Required: ₦${totalAmount} (₦${amount} + ₦${billFee} fee)` 
      });
    }

    // Import hybrid banking service (uses Flutterwave for bill payments)
    const hybridBankingService = require('./services/hybridBankingService');

    // Generate reference
    const reference = `PAXCASH_BILL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Pay bill using Flutterwave
    const billResult = await hybridBankingService.payBill(biller, customerId, amount, reference);

    if (!billResult.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Bill payment failed: ' + billResult.error 
      });
    }

    // Create user transaction record (amount only, not including fee)
    const userTransaction = new Transaction({
      userId,
      type: 'payment',
      amount: amount, // Only the bill amount, not including fee
      description: `Bill payment for ${biller} - ${customerId}`,
      status: 'pending',
      reference: billResult.data.reference || reference,
      fee: billFee, // Track the fee separately
      metadata: {
        biller,
        customerId,
        reference,
        transactionId: billResult.data.id || billResult.data.flw_ref,
        service: 'bill'
      }
    });

    await userTransaction.save();

    // Create revenue transaction for the fee (system revenue)
    const revenueTransaction = new Transaction({
      userId: 'system', // System revenue
      type: 'revenue',
      amount: billFee,
      description: `Bill payment fee for ${biller} - ${customerId} (${reference})`,
      status: 'completed',
      reference: `REVENUE_${reference}`,
      completedAt: new Date(),
      metadata: {
        sourceTransactionId: userTransaction._id,
        sourceUserId: userId,
        service: 'bill_fee',
        billAmount: amount,
        biller,
        customerId,
        feeRate: billFee / amount * 100 // Fee percentage
      }
    });

    await revenueTransaction.save();

    // Update wallet balance (deduct amount + fee)
    wallet.balance -= totalAmount;
    wallet.lastTransactionDate = new Date();
    await wallet.save();

    res.status(201).json({ 
      success: true, 
      message: 'Bill payment initiated successfully',
      bill: {
        id: billResult.data.id,
        amount: amount,
        fee: billFee,
        totalDeducted: totalAmount,
        biller,
        customerId,
        status: 'pending',
        reference
      }
    });

  } catch (error) {
    console.error('Bill payment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to pay bill. Please try again later.' 
    });
  }
});

// Get billers endpoint (using Flutterwave)
app.get('/api/bills/billers', async (req, res) => {
  try {
    const hybridBankingService = require('./services/hybridBankingService');

    const billersResult = await hybridBankingService.getBillCategories();

    if (!billersResult.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Failed to get billers: ' + billersResult.error 
      });
    }

    // Transform Flutterwave data structure to match frontend expectations
    const transformedBillers = billersResult.data.map(biller => ({
      code: biller.biller_code,
      name: biller.name,
      id: biller.id
    }));

    res.json({ 
      success: true, 
      message: 'Billers retrieved successfully',
      billers: transformedBillers
    });

  } catch (error) {
    console.error('Get billers error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get billers. Please try again later.' 
    });
  }
});

// Validate bill customer endpoint
app.post('/api/bills/validate', async (req, res) => {
  try {
    const { biller, customerId } = req.body;

    if (!biller || !customerId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Biller and customer ID are required' 
      });
    }

    const hybridBankingService = require('./services/hybridBankingService');

    const validationResult = await hybridBankingService.validateBillCustomer(biller, customerId);

    if (!validationResult.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Customer validation failed: ' + validationResult.error 
      });
    }

    res.json({ 
      success: true, 
      message: 'Customer validation successful',
      customer: validationResult.data
    });

  } catch (error) {
    console.error('Customer validation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to validate customer. Please try again later.' 
    });
  }
});

// Webhook for Flutterwave callbacks
app.post('/api/webhook/flutterwave', async (req, res) => {
  try {
    const { event, data } = req.body;

    // Verify webhook signature (you should implement this)
    // const signature = req.headers['verif-hash'];
    // if (!verifyWebhookSignature(signature, req.body)) {
    //   return res.status(400).json({ message: 'Invalid signature' });
    // }

    if (event === 'charge.completed') {
      // Handle successful payment to virtual account
      const { tx_ref, amount, customer } = data;
      
      // Find user by email
      const user = await User.findOne({ email: customer.email });
      if (user) {
        // Update wallet balance
        const wallet = await Wallet.findOne({ userId: user._id });
        if (wallet) {
          wallet.balance += amount;
          wallet.totalDeposits += amount;
          wallet.lastTransactionDate = new Date();
          await wallet.save();

          // Create transaction record
          const transaction = new Transaction({
            userId: user._id,
            type: 'deposit',
            amount: amount,
            description: 'Virtual account deposit',
            status: 'completed',
            reference: tx_ref,
            completedAt: new Date()
          });
          await transaction.save();
        }
      }
    } else if (event === 'transfer.completed') {
      // Handle successful bank transfer
      const { id, amount, account_number } = data;
      
      // Update transaction status
      const transaction = await Transaction.findOne({
        'metadata.transferId': id
      });
      
      if (transaction) {
        transaction.status = 'completed';
        transaction.completedAt = new Date();
        await transaction.save();
      }
    }

    res.status(200).json({ status: 'success' });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ status: 'error' });
  }
});


// Forgot Password Endpoint
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ success: false, message: 'No user found with this email' });
    }
    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    user.resetPasswordToken = token;
    user.resetPasswordExpires = expires;
    await user.save();
    // Send email
    const resetUrl = `http://localhost:3000/reset-password?token=${token}`;
    const mailOptions = {
      from: process.env.EMAIL_USER || 'paxcashteam@gmail.com',
      to: user.email,
      subject: 'Paxcash Password Reset',
      html: `<p>You requested a password reset. Click the link below to set a new password:</p>
             <a href="${resetUrl}">${resetUrl}</a>
             <p>This link will expire in 1 hour.</p>`
    };
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Password reset link sent to your email.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Failed to send reset email. Please try again.' });
  }
});

// Reset Password Endpoint
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ success: false, message: 'Token and new password are required' });
    }
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }
    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.json({ success: true, message: 'Password has been reset. You can now log in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Failed to reset password. Please try again.' });
  }
});

// Monnify webhook endpoint
app.post('/api/monnify/webhook', async (req, res) => {
  const startTime = Date.now();
  console.log('=== WEBHOOK RECEIVED ===');
  console.log('Timestamp:', new Date().toISOString());
  
  try {
    // 1. Verify Monnify signature (temporarily disabled for debugging)
    // const monnifySignature = req.headers['monnify-signature'];
    // const rawBody = JSON.stringify(req.body);
    // const secretKey = process.env.MONNIFY_SECRET_KEY;
    // const computedSignature = crypto.createHmac('sha512', secretKey).update(rawBody).digest('hex');
    // if (monnifySignature !== computedSignature) {
    //   return res.status(401).json({ success: false, message: 'Invalid signature' });
    // }

    // 2. Process only successful transactions
    const event = req.body.eventType;
    console.log('Event type:', event);
    
    if (event === 'SUCCESSFUL_TRANSACTION') {
      const eventData = req.body.eventData;
      // Try different possible account reference fields
      const accountReference = eventData.accountReference || eventData.product?.reference || eventData.destinationAccountInformation?.accountNumber;
      const amountPaid = parseFloat(eventData.amountPaid);
      
      console.log('Account reference:', accountReference);
      console.log('Amount paid:', amountPaid);
      console.log('Full eventData:', JSON.stringify(eventData, null, 2));

      // 3. Find the user by accountReference
      const virtualAccount = await VirtualAccount.findOne({ monnifyAccountReference: accountReference });
      console.log('Virtual account found:', virtualAccount);
      
      // Debug: List all virtual accounts to see what's in the database
      const allVirtualAccounts = await VirtualAccount.find({});
      console.log('All virtual accounts in database:', allVirtualAccounts.map(va => ({
        userId: va.userId,
        monnifyAccountReference: va.monnifyAccountReference,
        accountNumber: va.accountNumber
      })));
      
      if (!virtualAccount) {
        console.log('Virtual account not found for reference:', accountReference);
        return res.status(404).json({ success: false, message: 'Virtual account not found' });
      }

      // 4. Credit the user's wallet
      const wallet = await Wallet.findOne({ userId: virtualAccount.userId });
      console.log('Wallet found:', wallet);
      
      if (wallet) {
        const oldBalance = wallet.balance || 0;
        wallet.balance = oldBalance + amountPaid;
        wallet.totalDeposits = (wallet.totalDeposits || 0) + amountPaid;
        wallet.lastTransactionDate = new Date();
        await wallet.save();
        
        console.log('Wallet updated - Old balance:', oldBalance, 'New balance:', wallet.balance);

        // Create a transaction record
        try {
          const transaction = new Transaction({
            userId: virtualAccount.userId,
            type: 'deposit',
            amount: amountPaid,
            description: `Deposit via Monnify (${eventData.paymentReference || 'N/A'})`,
            status: 'completed',
            reference: eventData.paymentReference || `MONNIFY_${Date.now()}`,
            completedAt: new Date(),
            metadata: eventData
          });
          await transaction.save();
          
          console.log('Transaction created:', transaction._id);
        } catch (transactionError) {
          console.error('Transaction creation failed:', transactionError.message);
          // Don't fail the webhook if transaction creation fails
        }
      } else {
        console.log('Wallet not found for user:', virtualAccount.userId);
      }
    } else {
      console.log('Event type not SUCCESSFUL_TRANSACTION:', event);
    }

    // 5. Always respond with 200 OK
    const processingTime = Date.now() - startTime;
    console.log(`Webhook processed in ${processingTime}ms`);
    res.status(200).json({ success: true, processingTime });
  } catch (error) {
    console.error('Monnify webhook error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ===== FLUTTERWAVE API ROUTES =====

// Get bill payment categories
app.get('/api/flutterwave/bill-categories', async (req, res) => {
  try {
    console.log('📋 Getting bill payment categories...');
    
    const hybridBankingService = require('./services/hybridBankingService');
    const result = await hybridBankingService.getBillCategories();

    if (!result.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Failed to get bill categories: ' + result.error 
      });
    }

    res.json({ 
      success: true, 
      message: result.message,
      categories: result.data
    });
  } catch (error) {
    console.error('Get bill categories error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get bill categories. Please try again later.' 
    });
  }
});

// Get bill providers for a category
app.get('/api/flutterwave/bill-providers/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;
    console.log(`🏢 Getting bill providers for category: ${categoryId}`);
    
    const hybridBankingService = require('./services/hybridBankingService');
    const result = await hybridBankingService.getBillProviders(categoryId);

    if (!result.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Failed to get bill providers: ' + result.error 
      });
    }

    res.json({ 
      success: true, 
      message: result.message,
      providers: result.data
    });
  } catch (error) {
    console.error('Get bill providers error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get bill providers. Please try again later.' 
    });
  }
});

// Validate bill payment
app.post('/api/flutterwave/validate-bill', async (req, res) => {
  try {
    const { billerCode, customerId } = req.body;
    console.log(`🔍 Validating bill payment...`);
    console.log(`🏢 Biller: ${billerCode}`);
    console.log(`👤 Customer ID: ${customerId}`);
    
    if (!billerCode || !customerId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Biller code and customer ID are required' 
      });
    }

    const hybridBankingService = require('./services/hybridBankingService');
    const result = await hybridBankingService.validateBillPayment(billerCode, customerId);

    if (!result.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Bill validation failed: ' + result.error 
      });
    }

    res.json({ 
      success: true, 
      message: result.message,
      billDetails: result.data
    });
  } catch (error) {
    console.error('Bill validation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Bill validation failed. Please try again later.' 
    });
  }
});

// Pay electricity bill
app.post('/api/flutterwave/pay-electricity', async (req, res) => {
  try {
    const { billerCode, customerId, amount, phone, email, name } = req.body;
    console.log('⚡ Processing electricity bill payment...');
    
    if (!billerCode || !customerId || !amount || !phone || !email || !name) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required: billerCode, customerId, amount, phone, email, name' 
      });
    }

    const hybridBankingService = require('./services/hybridBankingService');
    const result = await hybridBankingService.payElectricityBill(billerCode, customerId, amount, phone, email, name);

    if (!result.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Electricity bill payment failed: ' + result.error 
      });
    }

    res.json({ 
      success: true, 
      message: result.message,
      paymentData: result.data
    });
  } catch (error) {
    console.error('Electricity bill payment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Electricity bill payment failed. Please try again later.' 
    });
  }
});

// Pay cable TV bill
app.post('/api/flutterwave/pay-cable-tv', async (req, res) => {
  try {
    const { billerCode, customerId, amount, phone, email, name, plan } = req.body;
    console.log('📺 Processing cable TV bill payment...');
    
    if (!billerCode || !customerId || !amount || !phone || !email || !name || !plan) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required: billerCode, customerId, amount, phone, email, name, plan' 
      });
    }

    const hybridBankingService = require('./services/hybridBankingService');
    const result = await hybridBankingService.payCableTVBill(billerCode, customerId, amount, phone, email, name, plan);

    if (!result.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cable TV bill payment failed: ' + result.error 
      });
    }

    res.json({ 
      success: true, 
      message: result.message,
      paymentData: result.data
    });
  } catch (error) {
    console.error('Cable TV bill payment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Cable TV bill payment failed. Please try again later.' 
    });
  }
});

// Get airtime providers
app.get('/api/flutterwave/airtime-providers', async (req, res) => {
  try {
    console.log('📱 Getting airtime providers...');
    
    const hybridBankingService = require('./services/hybridBankingService');
    const result = await hybridBankingService.getAirtimeProviders();

    if (!result.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Failed to get airtime providers: ' + result.error 
      });
    }

    res.json({ 
      success: true, 
      message: result.message,
      providers: result.data
    });
  } catch (error) {
    console.error('Get airtime providers error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get airtime providers. Please try again later.' 
    });
  }
});

// Buy airtime
app.post('/api/flutterwave/buy-airtime', async (req, res) => {
  try {
    const { phone, amount, provider } = req.body;
    console.log('📱 Processing airtime purchase...');
    
    if (!phone || !amount || !provider) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone, amount, and provider are required' 
      });
    }

    const hybridBankingService = require('./services/hybridBankingService');
    const result = await hybridBankingService.buyAirtime(phone, amount, provider);

    if (!result.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Airtime purchase failed: ' + result.error 
      });
    }

    res.json({ 
      success: true, 
      message: result.message,
      airtimeData: result.data
    });
  } catch (error) {
    console.error('Airtime purchase error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Airtime purchase failed. Please try again later.' 
    });
  }
});

// Get data plans
app.get('/api/flutterwave/data-plans/:provider', async (req, res) => {
  try {
    const { provider } = req.params;
    console.log(`📊 Getting data plans for ${provider}...`);
    
    const hybridBankingService = require('./services/hybridBankingService');
    const result = await hybridBankingService.getDataPlans(provider);

    if (!result.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Failed to get data plans: ' + result.error 
      });
    }

    res.json({ 
      success: true, 
      message: result.message,
      dataPlans: result.data
    });
  } catch (error) {
    console.error('Get data plans error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get data plans. Please try again later.' 
    });
  }
});

// Buy data bundle
app.post('/api/flutterwave/buy-data', async (req, res) => {
  try {
    const { phone, planId, provider } = req.body;
    console.log('📊 Processing data bundle purchase...');
    
    if (!phone || !planId || !provider) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone, planId, and provider are required' 
      });
    }

    const hybridBankingService = require('./services/hybridBankingService');
    const result = await hybridBankingService.buyDataBundle(phone, planId, provider);

    if (!result.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Data bundle purchase failed: ' + result.error 
      });
    }

    res.json({ 
      success: true, 
      message: result.message,
      dataBundleData: result.data
    });
  } catch (error) {
    console.error('Data bundle purchase error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Data bundle purchase failed. Please try again later.' 
    });
  }
});

// Single transfer
app.post('/api/flutterwave/transfer', async (req, res) => {
  try {
    const { account_bank, account_number, amount, narration, currency = 'NGN', reference } = req.body;
    console.log('💸 Processing single transfer...');
    
    if (!account_bank || !account_number || !amount || !narration) {
      return res.status(400).json({ 
        success: false, 
        message: 'account_bank, account_number, amount, and narration are required' 
      });
    }

    const hybridBankingService = require('./services/hybridBankingService');
    const result = await hybridBankingService.singleTransfer(account_bank, account_number, amount, narration, currency, reference);

    if (!result.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Transfer failed: ' + result.error 
      });
    }

    res.json({ 
      success: true, 
      message: result.message,
      transferData: result.data
    });
  } catch (error) {
    console.error('Single transfer error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Transfer failed. Please try again later.' 
    });
  }
});

// Bulk transfer
app.post('/api/flutterwave/bulk-transfer', async (req, res) => {
  try {
    const { transfers } = req.body;
    console.log('🚀 Processing bulk transfer...');
    
    if (!transfers || !Array.isArray(transfers) || transfers.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Transfers array is required and must not be empty' 
      });
    }

    const hybridBankingService = require('./services/hybridBankingService');
    const result = await hybridBankingService.bulkTransfer(transfers);

    if (!result.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Bulk transfer failed: ' + result.error 
      });
    }

    res.json({ 
      success: true, 
      message: result.message,
      bulkTransferData: result.data
    });
  } catch (error) {
    console.error('Bulk transfer error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Bulk transfer failed. Please try again later.' 
    });
  }
});

// Get wallet balance
app.get('/api/flutterwave/wallet-balance', async (req, res) => {
  try {
    console.log('💰 Getting wallet balance...');
    
    const hybridBankingService = require('./services/hybridBankingService');
    const result = await hybridBankingService.getWalletBalance();

    if (!result.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Failed to get wallet balance: ' + result.error 
      });
    }

    res.json({ 
      success: true, 
      message: result.message,
      balance: result.data
    });
  } catch (error) {
    console.error('Get wallet balance error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get wallet balance. Please try again later.' 
    });
  }
});

// Get transaction history
app.get('/api/flutterwave/transactions', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    console.log(`📊 Getting transaction history (Page: ${page}, Limit: ${limit})...`);
    
    const hybridBankingService = require('./services/hybridBankingService');
    const result = await hybridBankingService.getTransactionHistory(parseInt(page), parseInt(limit));

    if (!result.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Failed to get transaction history: ' + result.error 
      });
    }

    res.json({ 
      success: true, 
      message: result.message,
      transactions: result.data
    });
  } catch (error) {
    console.error('Get transaction history error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get transaction history. Please try again later.' 
    });
  }
});

// ===== FLUTTERWAVE WEBHOOKS =====

// Bill payment webhook
app.post('/api/webhook/flutterwave-bill', async (req, res) => {
  try {
    console.log('📋 Flutterwave bill payment webhook received');
    console.log('Webhook data:', JSON.stringify(req.body, null, 2));
    
    // Process the webhook data here
    // You can add your business logic for successful bill payments
    
    res.status(200).json({ success: true, message: 'Webhook received' });
  } catch (error) {
    console.error('Flutterwave bill webhook error:', error);
    res.status(500).json({ success: false, message: 'Webhook processing failed' });
  }
});

// Airtime webhook
app.post('/api/webhook/flutterwave-airtime', async (req, res) => {
  try {
    console.log('📱 Flutterwave airtime webhook received');
    console.log('Webhook data:', JSON.stringify(req.body, null, 2));
    
    // Process the webhook data here
    // You can add your business logic for successful airtime purchases
    
    res.status(200).json({ success: true, message: 'Webhook received' });
  } catch (error) {
    console.error('Flutterwave airtime webhook error:', error);
    res.status(500).json({ success: false, message: 'Webhook processing failed' });
  }
});

// Data bundle webhook
app.post('/api/webhook/flutterwave-data', async (req, res) => {
  try {
    console.log('📊 Flutterwave data bundle webhook received');
    console.log('Webhook data:', JSON.stringify(req.body, null, 2));
    
    // Process the webhook data here
    // You can add your business logic for successful data bundle purchases
    
    res.status(200).json({ success: true, message: 'Webhook received' });
  } catch (error) {
    console.error('Flutterwave data webhook error:', error);
    res.status(500).json({ success: false, message: 'Webhook processing failed' });
  }
});

// Bulk transfer webhook
app.post('/api/webhook/flutterwave-bulk-transfer', async (req, res) => {
  try {
    console.log('🚀 Flutterwave bulk transfer webhook received');
    console.log('Webhook data:', JSON.stringify(req.body, null, 2));
    
    // Process the webhook data here
    // You can add your business logic for successful bulk transfers
    
    res.status(200).json({ success: true, message: 'Webhook received' });
  } catch (error) {
    console.error('Flutterwave bulk transfer webhook error:', error);
    res.status(500).json({ success: false, message: 'Webhook processing failed' });
  }
});


// ===== ADMIN ROUTES =====
const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

// ===== NOTIFICATION ENDPOINTS =====

// Subscribe to push notifications
app.post('/api/notifications/subscribe', async (req, res) => {
  try {
    const { userId, subscription } = req.body;
    const { PushSubscription } = require('./models');

    if (!userId || !subscription || !subscription.endpoint) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID and subscription data are required' 
      });
    }

    // Check if subscription already exists
    const existingSubscription = await PushSubscription.findOne({
      userId,
      endpoint: subscription.endpoint
    });

    if (existingSubscription) {
      // Update existing subscription
      existingSubscription.keys = subscription.keys;
      existingSubscription.isActive = true;
      existingSubscription.lastUsed = new Date();
      existingSubscription.userAgent = req.headers['user-agent'] || '';
      await existingSubscription.save();
    } else {
      // Create new subscription
      const newSubscription = new PushSubscription({
        userId,
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        userAgent: req.headers['user-agent'] || '',
        isActive: true
      });
      await newSubscription.save();
    }

    res.json({ 
      success: true, 
      message: 'Successfully subscribed to notifications' 
    });
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to subscribe to notifications' 
    });
  }
});

// Unsubscribe from push notifications
app.post('/api/notifications/unsubscribe', async (req, res) => {
  try {
    const { userId, endpoint } = req.body;
    const { PushSubscription } = require('./models');

    if (!userId || !endpoint) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID and endpoint are required' 
      });
    }

    await PushSubscription.updateOne(
      { userId, endpoint },
      { isActive: false }
    );

    res.json({ 
      success: true, 
      message: 'Successfully unsubscribed from notifications' 
    });
  } catch (error) {
    console.error('Unsubscription error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to unsubscribe from notifications' 
    });
  }
});

// Get VAPID public key
app.get('/api/notifications/vapid-key', (req, res) => {
  try {
    const notificationService = require('./services/notificationService');
    const publicKey = notificationService.getVapidPublicKey();
    
    res.json({ 
      success: true, 
      publicKey 
    });
  } catch (error) {
    console.error('VAPID key error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get VAPID key' 
    });
  }
});

// ===== LOYALTY SYSTEM ENDPOINTS =====

// Get user's loyalty status
app.get('/api/loyalty/status/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const pricingService = require('./services/pricingService');
    
    // Get daily purchase counts
    const airtimeCount = await pricingService.getDailyPurchaseCount(userId, 'airtime');
    const dataCount = await pricingService.getDailyPurchaseCount(userId, 'data');
    const combinedCount = airtimeCount + dataCount;
    
    // Calculate loyalty status
    const airtimePricing = pricingService.calculateAirtimePricing(1000, airtimeCount);
    const dataPricing = pricingService.calculateDataPricing(1000, dataCount);
    
    res.json({
      success: true,
      loyalty: {
        airtime: {
          dailyPurchases: airtimeCount,
          nextForCashback: airtimePricing.nextPurchaseForCashback,
          isEligible: airtimePricing.isEligibleForCashback,
          message: airtimePricing.message
        },
        data: {
          dailyPurchases: dataCount,
          nextForCashback: dataPricing.nextPurchaseForCashback,
          isEligible: dataPricing.isEligibleForCashback,
          message: dataPricing.message
        },
        combined: {
          totalDailyPurchases: combinedCount,
          nextForCashback: Math.max(0, 3 - combinedCount),
          isEligible: combinedCount >= 3
        }
      }
    });
  } catch (error) {
    console.error('Loyalty status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get loyalty status'
    });
  }
});

// Calculate pricing preview
app.post('/api/pricing/preview', async (req, res) => {
  try {
    const { userId, service, amount } = req.body;
    const pricingService = require('./services/pricingService');
    
    let pricing;
    if (service === 'airtime') {
      const dailyCount = await pricingService.getDailyPurchaseCount(userId, 'airtime');
      pricing = pricingService.calculateAirtimePricing(amount, dailyCount);
    } else if (service === 'data') {
      const dailyCount = await pricingService.getDailyPurchaseCount(userId, 'data');
      pricing = pricingService.calculateDataPricing(amount, dailyCount);
    } else if (service === 'transfer') {
      pricing = pricingService.calculateTransferFee(amount);
    } else if (service === 'bills') {
      pricing = pricingService.calculateBillFee(amount);
    } else {
      throw new Error('Invalid service type');
    }
    
    res.json({
      success: true,
      pricing: pricing
    });
  } catch (error) {
    console.error('Pricing preview error:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message || 'Pricing calculation failed'
    });
  }
});

// Get pricing information
app.get('/api/pricing', async (req, res) => {
  try {
    const pricingService = require('./services/pricingService');
    const pricingInfo = pricingService.getPricingInfo();
    res.json({ 
      success: true, 
      message: 'Pricing information retrieved successfully',
      pricing: pricingInfo
    });
  } catch (error) {
    console.error('Get pricing error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get pricing information'
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📅 Server started at: ${new Date().toISOString()}`);
  console.log(`🔄 Server instance ID: ${Math.random().toString(36).substr(2, 9)}`);
});
