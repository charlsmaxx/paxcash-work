const axios = require('axios');
require('dotenv').config();

class BankingService {
  constructor() {
    this.apiKey = process.env.MONNIFY_API_KEY;
    this.secretKey = process.env.MONNIFY_SECRET_KEY;
    this.contractCode = process.env.MONNIFY_CONTRACT_CODE;
    this.baseURL = process.env.MONNIFY_BASE_URL || 'https://sandbox.monnify.com';
    this.accessToken = null;
    this.tokenExpiry = null;
    
    // Debug logging
    console.log('Monnify Configuration:');
    console.log('API Key:', this.apiKey ? 'Set' : 'Not set');
    console.log('Secret Key:', this.secretKey ? 'Set' : 'Not set');
    console.log('Contract Code:', this.contractCode ? 'Set' : 'Not set');
    console.log('Base URL:', this.baseURL);
    
    // Validate required fields
    if (!this.apiKey || !this.secretKey || !this.contractCode) {
      console.error('❌ Missing required Monnify credentials!');
      console.error('Please check your .env file');
    } else {
      console.log('✅ Monnify credentials loaded successfully');
    }
  }

  // Get Monnify access token
  async getAccessToken() {
    try {
      if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
        return this.accessToken;
      }

      // Validate credentials first
      if (!this.apiKey || !this.secretKey) {
        throw new Error('Missing API credentials');
      }

      // For Monnify, we use Basic Authentication with API Key and Secret Key
      const authHeader = `Basic ${Buffer.from(`${this.apiKey}:${this.secretKey}`).toString('base64')}`;
      
      console.log('🔐 Getting Monnify access token...');
      
      // Step 1: Get access token using Basic Auth
      const tokenResponse = await axios.post(
        `${this.baseURL}/api/v1/auth/login`,
        {},
        {
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10 second timeout
        }
      );

      console.log('📡 Token response status:', tokenResponse.status);
      console.log('📡 Token response data:', tokenResponse.data);

      if (tokenResponse.data.requestSuccessful) {
        const accessToken = tokenResponse.data.responseBody.accessToken;
        this.accessToken = `Bearer ${accessToken}`;
        this.tokenExpiry = Date.now() + (3600 * 1000); // 1 hour
        console.log('✅ Monnify authentication successful');
        
        // Step 2: Test the token by getting banks
        console.log('🔍 Testing access token with banks endpoint...');
        const testResponse = await axios.get(
          `${this.baseURL}/api/v1/banks`,
          {
            headers: {
              'Authorization': this.accessToken,
              'Content-Type': 'application/json'
            },
            timeout: 10000
          }
        );
        console.log('📡 Banks test response:', testResponse.status);
        
        return this.accessToken;
      } else {
        throw new Error(`Monnify login failed: ${tokenResponse.data.responseMessage || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Monnify authentication error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        throw new Error('Invalid API credentials. Please check your Monnify API Key and Secret Key.');
      } else if (error.response?.status === 403) {
        throw new Error('Access denied. Please check your Monnify account permissions.');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout. Please check your internet connection.');
      } else {
        throw error;
      }
    }
  }

  // Bank Transfer
  async initiateTransfer(accountNumber, bankCode, amount, narration, recipientName) {
    try {
      const accessToken = await this.getAccessToken();
      
      // IMPORTANT: This is your BUSINESS SETTLEMENT ACCOUNT
      // This account will be debited by Monnify when sending money
      // It's NOT the customer's account - it's your business account
      const sourceAccount = process.env.MONNIFY_SOURCE_ACCOUNT || '1234567890';
      
      if (!process.env.MONNIFY_SOURCE_ACCOUNT) {
        console.warn('⚠️ MONNIFY_SOURCE_ACCOUNT not set. Using default for testing.');
      } else {
        console.log('💰 Using business settlement account:', sourceAccount);
        console.log('📤 This account will be debited to send ₦' + amount + ' to recipient');
      }
      
      const response = await axios.post(
        `${this.baseURL}/api/v2/disbursements/single`,
        {
          amount: amount,
          reference: `PAXCASH_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          recipientName: recipientName,
          recipientAccountNumber: accountNumber,
          recipientBankCode: bankCode,
          narration: narration,
          currency: 'NGN',
          sourceAccountNumber: sourceAccount
        },
        {
          headers: {
            'Authorization': accessToken,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.requestSuccessful) {
        return {
          success: true,
          data: response.data.responseBody,
          message: 'Transfer initiated successfully'
        };
      } else {
        return {
          success: false,
          error: response.data.responseMessage || 'Transfer failed'
        };
      }
    } catch (error) {
      console.error('Monnify transfer error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.responseMessage || 'Transfer failed'
      };
    }
  }

  // Verify Bank Account
  async verifyAccount(accountNumber, bankCode) {
    try {
      const accessToken = await this.getAccessToken();
      
      const response = await axios.get(
        `${this.baseURL}/api/v1/disbursements/account/validate?accountNumber=${accountNumber}&bankCode=${bankCode}`,
        {
          headers: {
            'Authorization': accessToken,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.requestSuccessful) {
        return {
          success: true,
          data: response.data.responseBody,
          message: 'Account verification successful'
        };
      } else {
        return {
          success: false,
          error: response.data.responseMessage || 'Account verification failed'
        };
      }
    } catch (error) {
      console.error('Monnify account verification error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.responseMessage || 'Account verification failed'
      };
    }
  }

  // Buy Airtime (DISABLED - using Flutterwave via hybridBankingService instead)
  async buyAirtime(phoneNumber, network, amount, reference) {
    console.log('⚠️ Monnify airtime disabled - use hybridBankingService.buyAirtime() instead');
        return {
          success: false,
      error: 'Monnify airtime service disabled. Use Flutterwave via hybridBankingService instead.'
    };
  }

  // Buy Data (DISABLED - using Flutterwave via hybridBankingService instead)
  async buyData(phoneNumber, network, plan, reference) {
    console.log('⚠️ Monnify data disabled - use hybridBankingService.buyDataBundle() instead');
        return {
          success: false,
      error: 'Monnify data service disabled. Use Flutterwave via hybridBankingService instead.'
    };
  }

  // Pay Bills (DISABLED - using Flutterwave via hybridBankingService instead)
  async payBill(biller, customerId, amount, reference) {
    console.log('⚠️ Monnify bill payment disabled - use hybridBankingService for bill payments instead');
        return {
          success: false,
      error: 'Monnify bill payment service disabled. Use Flutterwave via hybridBankingService instead.'
    };
  }

  // Get Available Data Plans
  async getDataPlans(network) {
    try {
      const accessToken = await this.getAccessToken();
      
      const response = await axios.get(
        `${this.baseURL}/api/v1/data/plans?provider=${network}`,
        {
          headers: {
            'Authorization': accessToken,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.requestSuccessful) {
        return {
          success: true,
          data: response.data.responseBody,
          message: 'Data plans retrieved successfully'
        };
      } else {
        return {
          success: false,
          error: response.data.responseMessage || 'Failed to get data plans'
        };
      }
    } catch (error) {
      console.error('Monnify data plans error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.responseMessage || 'Failed to get data plans'
      };
    }
  }

  // Get Available Billers (DISABLED - using Flutterwave via hybridBankingService instead)
  async getBillers() {
    console.log('⚠️ Monnify billers disabled - use hybridBankingService.getBillCategories() instead');
        return {
          success: false,
      error: 'Monnify billers service disabled. Use Flutterwave via hybridBankingService instead.'
    };
  }

  // Validate Bill Customer (DISABLED - using Flutterwave via hybridBankingService instead)
  async validateBillCustomer(biller, customerId) {
    console.log('⚠️ Monnify bill validation disabled - use hybridBankingService for bill validation instead');
        return {
          success: false,
      error: 'Monnify bill validation service disabled. Use Flutterwave via hybridBankingService instead.'
    };
  }

  // Get Banks List
  async getBanks() {
    try {
      console.log('Starting getBanks request...');
      console.log('API Key:', this.apiKey);
      console.log('Secret Key:', this.secretKey);
      console.log('Base URL:', this.baseURL);
      
      // First, try to get banks from Monnify API (correct endpoint)
      try {
        const accessToken = await this.getAccessToken();
        console.log('Access token obtained:', accessToken ? 'Yes' : 'No');
        
        const response = await axios.get(
          `${this.baseURL}/api/v1/banks`,
          {
            headers: {
              'Authorization': accessToken,
              'Content-Type': 'application/json'
            }
          }
        );

        console.log('Monnify response:', response.data);

        if (response.data.requestSuccessful) {
          return {
            success: true,
            data: response.data.responseBody,
            message: 'Banks retrieved successfully'
          };
        }
      } catch (monnifyError) {
        console.error('Monnify API failed, using fallback banks list:', monnifyError.message);
      }
      
      // Fallback: Return a static list of major Nigerian banks
      const fallbackBanks = [
        { code: "044", name: "Access Bank" },
        { code: "023", name: "Citibank Nigeria" },
        { code: "063", name: "Diamond Bank" },
        { code: "050", name: "Ecobank Nigeria" },
        { code: "070", name: "Fidelity Bank" },
        { code: "011", name: "First Bank of Nigeria" },
        { code: "214", name: "First City Monument Bank" },
        { code: "058", name: "Guaranty Trust Bank" },
        { code: "030", name: "Heritage Bank" },
        { code: "301", name: "Jaiz Bank" },
        { code: "082", name: "Keystone Bank" },
        { code: "014", name: "MainStreet Bank" },
        { code: "076", name: "Polaris Bank" },
        { code: "221", name: "Stanbic IBTC Bank" },
        { code: "068", name: "Standard Chartered Bank" },
        { code: "232", name: "Sterling Bank" },
        { code: "032", name: "Union Bank of Nigeria" },
        { code: "033", name: "United Bank for Africa" },
        { code: "215", name: "Unity Bank" },
        { code: "035", name: "Wema Bank" },
        { code: "057", name: "Zenith Bank" }
      ];
      
      return {
        success: true,
        data: fallbackBanks,
        message: 'Banks retrieved from fallback list'
      };
      
    } catch (error) {
      console.error('Banks error:', error);
      return {
        success: false,
        error: 'Failed to get banks list'
      };
    }
  }
}

module.exports = new BankingService(); 