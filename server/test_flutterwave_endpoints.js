#!/usr/bin/env node

/**
 * 🧪 Flutterwave API Endpoints Test Script
 * 
 * This script tests all the new Flutterwave endpoints to ensure they're working correctly.
 * Run with: node test_flutterwave_endpoints.js
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:5000';
const TEST_DATA = {
  // Bill payment test data
  billValidation: {
    billerCode: 'BIL001',
    customerId: '1234567890'
  },
  
  electricityBill: {
    billerCode: 'BIL001',
    customerId: '1234567890',
    amount: 5000,
    phone: '08012345678',
    email: 'test@example.com',
    name: 'Test User'
  },
  
  cableTVBill: {
    billerCode: 'CABLE001',
    customerId: '1234567890',
    amount: 3000,
    phone: '08012345678',
    email: 'test@example.com',
    name: 'Test User',
    plan: 'Premium Plan'
  },
  
  // Airtime test data
  airtime: {
    phone: '08012345678',
    amount: 1000,
    provider: 'MTN'
  },
  
  // Data bundle test data
  dataBundle: {
    phone: '08012345678',
    planId: '1',
    provider: 'MTN'
  },
  
  // Bulk transfer test data
  bulkTransfer: {
    transfers: [
      {
        bankCode: '044',
        accountNumber: '1234567890',
        amount: 5000,
        narration: 'Test salary payment',
        recipientName: 'John Doe'
      },
      {
        bankCode: '058',
        accountNumber: '0987654321',
        amount: 3000,
        narration: 'Test bonus payment',
        recipientName: 'Jane Smith'
      }
    ]
  }
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Test results
let passedTests = 0;
let totalTests = 0;

// Helper function to log test results
function logTest(testName, success, message = '') {
  totalTests++;
  if (success) {
    passedTests++;
    console.log(`${colors.green}✅ PASS${colors.reset} ${testName}`);
  } else {
    console.log(`${colors.red}❌ FAIL${colors.reset} ${testName}`);
    if (message) console.log(`   ${colors.yellow}${message}${colors.reset}`);
  }
}

// Helper function to make API calls
async function testEndpoint(method, endpoint, data = null, description = '') {
  try {
    const config = {
      method: method.toLowerCase(),
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (data && method !== 'GET') {
      config.data = data;
    }

    const response = await axios(config);
    
    if (response.data.success) {
      logTest(description || `${method} ${endpoint}`, true);
      return response.data;
    } else {
      logTest(description || `${method} ${endpoint}`, false, response.data.message);
      return null;
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message;
    logTest(description || `${method} ${endpoint}`, false, errorMessage);
    return null;
  }
}

// Main test function
async function runTests() {
  console.log(`${colors.cyan}${colors.bright}🧪 FLUTTERWAVE API ENDPOINTS TEST${colors.reset}`);
  console.log(`${colors.blue}Base URL: ${BASE_URL}${colors.reset}\n`);
  
  console.log(`${colors.yellow}📋 Testing Bill Payment Endpoints...${colors.reset}`);
  
  // Test bill categories
  await testEndpoint('GET', '/api/flutterwave/bill-categories', null, 'Get Bill Categories');
  
  // Test bill providers (using category ID 1)
  await testEndpoint('GET', '/api/flutterwave/bill-providers/1', null, 'Get Bill Providers');
  
  // Test bill validation
  await testEndpoint('POST', '/api/flutterwave/validate-bill', TEST_DATA.billValidation, 'Validate Bill Payment');
  
  // Test electricity bill payment
  await testEndpoint('POST', '/api/flutterwave/pay-electricity', TEST_DATA.electricityBill, 'Pay Electricity Bill');
  
  // Test cable TV bill payment
  await testEndpoint('POST', '/api/flutterwave/pay-cable-tv', TEST_DATA.cableTVBill, 'Pay Cable TV Bill');
  
  console.log(`\n${colors.yellow}📱 Testing Airtime & Data Endpoints...${colors.reset}`);
  
  // Test airtime providers
  await testEndpoint('GET', '/api/flutterwave/airtime-providers', null, 'Get Airtime Providers');
  
  // Test airtime purchase
  await testEndpoint('POST', '/api/flutterwave/buy-airtime', TEST_DATA.airtime, 'Buy Airtime');
  
  // Test data plans
  await testEndpoint('GET', '/api/flutterwave/data-plans/MTN', null, 'Get Data Plans');
  
  // Test data bundle purchase
  await testEndpoint('POST', '/api/flutterwave/buy-data', TEST_DATA.dataBundle, 'Buy Data Bundle');
  
  console.log(`\n${colors.yellow}💰 Testing Enhanced Disbursement Endpoints...${colors.reset}`);
  
  // Test bulk transfer
  await testEndpoint('POST', '/api/flutterwave/bulk-transfer', TEST_DATA.bulkTransfer, 'Bulk Transfer');
  
  console.log(`\n${colors.yellow}💳 Testing Wallet Management Endpoints...${colors.reset}`);
  
  // Test wallet balance
  await testEndpoint('GET', '/api/flutterwave/wallet-balance', null, 'Get Wallet Balance');
  
  // Test transaction history
  await testEndpoint('GET', '/api/flutterwave/transactions?page=1&limit=10', null, 'Get Transaction History');
  
  console.log(`\n${colors.yellow}🔗 Testing Webhook Endpoints...${colors.reset}`);
  
  // Test webhook endpoints (these will return success but may not have real data)
  await testEndpoint('POST', '/api/webhook/flutterwave-bill', { test: 'data' }, 'Bill Payment Webhook');
  await testEndpoint('POST', '/api/webhook/flutterwave-airtime', { test: 'data' }, 'Airtime Webhook');
  await testEndpoint('POST', '/api/webhook/flutterwave-data', { test: 'data' }, 'Data Bundle Webhook');
  await testEndpoint('POST', '/api/webhook/flutterwave-bulk-transfer', { test: 'data' }, 'Bulk Transfer Webhook');
  
  // Summary
  console.log(`\n${colors.cyan}${colors.bright}📊 TEST SUMMARY${colors.reset}`);
  console.log(`${colors.green}Passed: ${passedTests}/${totalTests}${colors.reset}`);
  console.log(`${colors.red}Failed: ${totalTests - passedTests}/${totalTests}${colors.reset}`);
  
  if (passedTests === totalTests) {
    console.log(`\n${colors.green}${colors.bright}🎉 All tests passed! Your Flutterwave integration is working perfectly!${colors.reset}`);
  } else {
    console.log(`\n${colors.yellow}${colors.bright}⚠️  Some tests failed. Check the error messages above and ensure your server is running.${colors.reset}`);
  }
}

// Error handling
process.on('unhandledRejection', (error) => {
  console.error(`${colors.red}Unhandled promise rejection:${colors.reset}`, error);
  process.exit(1);
});

// Check if server is running before starting tests
async function checkServer() {
  try {
    await axios.get(`${BASE_URL}/api/banks`);
    console.log(`${colors.green}✅ Server is running and accessible${colors.reset}\n`);
    await runTests();
  } catch (error) {
    console.error(`${colors.red}❌ Server is not running or not accessible at ${BASE_URL}${colors.reset}`);
    console.error(`${colors.yellow}Please start your server with: npm start${colors.reset}`);
    process.exit(1);
  }
}

// Start the test
checkServer();
