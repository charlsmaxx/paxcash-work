#!/usr/bin/env node

/**
 * 🧪 Flutterwave Direct API Test & Debug
 * 
 * This script tests Flutterwave endpoints directly to identify exact issues
 */

const axios = require('axios');
require('dotenv').config();

// Configuration
const FLUTTERWAVE_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY;
const FLUTTERWAVE_BASE_URL = process.env.FLUTTERWAVE_BASE_URL || 'https://api.flutterwave.com/v3';

console.log('🔧 Flutterwave Configuration:');
console.log('Secret Key:', FLUTTERWAVE_SECRET_KEY ? 'Set' : 'Not set');
console.log('Base URL:', FLUTTERWAVE_BASE_URL);
console.log('');

async function testFlutterwaveDirect(endpoint, method = 'GET', data = null) {
  try {
    console.log(`\n🔍 Testing Flutterwave API directly: ${method} ${endpoint}`);
    
    const config = {
      method: method.toLowerCase(),
      url: `${FLUTTERWAVE_BASE_URL}${endpoint}`,
      headers: {
        'Authorization': FLUTTERWAVE_SECRET_KEY,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    };

    if (data && method !== 'GET') {
      config.data = data;
    }

    console.log('📡 Request config:', {
      method: config.method,
      url: config.url,
      headers: config.headers
    });

    const response = await axios(config);
    
    console.log('✅ Response received:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.log('❌ Error occurred:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Headers:', error.response.headers);
      console.log('Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.log('No response received:', error.request);
    } else {
      console.log('Message:', error.message);
    }
    return null;
  }
}

async function runDirectTests() {
  console.log('🧪 Testing Flutterwave API Directly\n');
  
  // Test bill categories (working)
  await testFlutterwaveDirect('/bill-categories');
  
  // Test bill providers
  await testFlutterwaveDirect('/bill-categories/1');
  
  // Test data plans
  await testFlutterwaveDirect('/data-plans');
  
  // Test wallet balance
  await testFlutterwaveDirect('/balance');
  
  // Test transactions
  await testFlutterwaveDirect('/transactions');
  
  console.log('\n✅ Direct API test completed!');
}

runDirectTests().catch(console.error);

