#!/usr/bin/env node

/**
 * 🧪 Single Flutterwave Endpoint Test
 * 
 * This script tests a single endpoint to see detailed error messages
 */

const axios = require('axios');

async function testEndpoint(endpoint, method = 'GET', data = null) {
  try {
    console.log(`\n🔍 Testing: ${method} ${endpoint}`);
    
    const config = {
      method: method.toLowerCase(),
      url: `http://localhost:5000${endpoint}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (data && method !== 'GET') {
      config.data = data;
    }

    const response = await axios(config);
    
    console.log('✅ Response received:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.log('❌ Error occurred:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Message:', error.message);
    }
    return null;
  }
}

async function runTests() {
  console.log('🧪 Testing Individual Flutterwave Endpoints\n');
  
  // Test bill categories (working)
  await testEndpoint('/api/flutterwave/bill-categories');
  
  // Test bill providers (failing)
  await testEndpoint('/api/flutterwave/bill-providers/1');
  
  // Test data plans (failing)
  await testEndpoint('/api/flutterwave/data-plans/MTN');
  
  // Test wallet balance (failing)
  await testEndpoint('/api/flutterwave/wallet-balance');
  
  console.log('\n✅ Test completed!');
}

runTests().catch(console.error);

