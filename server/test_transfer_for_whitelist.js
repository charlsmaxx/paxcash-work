#!/usr/bin/env node

/**
 * 🔍 Generate Flutterwave Transfer Transaction ID for Whitelisting
 * 
 * This script attempts a transfer to capture the transaction identifier
 * needed for Flutterwave support to resolve IP whitelisting issues
 */

const axios = require('axios');
require('dotenv').config();

// Configuration
const FLUTTERWAVE_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY;
const FLUTTERWAVE_BASE_URL = process.env.FLUTTERWAVE_BASE_URL || 'https://api.flutterwave.com/v3';

console.log('🔧 Flutterwave Transfer Test Configuration:');
console.log('Secret Key:', FLUTTERWAVE_SECRET_KEY ? `${FLUTTERWAVE_SECRET_KEY.substring(0, 10)}...` : 'Not set');
console.log('Base URL:', FLUTTERWAVE_BASE_URL);
console.log('');

async function testSingleTransfer() {
  try {
    console.log('💸 Testing Flutterwave Single Transfer to get Transaction ID...\n');

    // Test transfer data - using minimal amount and test account
    const transferData = {
      account_bank: "044", // Access Bank (safe test bank)
      account_number: "0690000040", // Flutterwave test account
      amount: 100, // Minimal amount (₦100)
      narration: "Test transfer for IP whitelisting - Transaction ID needed",
      currency: "NGN",
      reference: `TEST_WHITELIST_${Date.now()}`, // Unique reference
      callback_url: "https://webhook.site/unique-id",
      debit_currency: "NGN"
    };

    console.log('📤 Transfer Request Data:');
    console.log(JSON.stringify(transferData, null, 2));
    console.log('');

    const response = await axios.post(
      `${FLUTTERWAVE_BASE_URL}/transfers`,
      transferData,
      {
        headers: {
          'Authorization': FLUTTERWAVE_SECRET_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    console.log('✅ Transfer Response:');
    console.log('Status:', response.status);
    console.log('Response Data:', JSON.stringify(response.data, null, 2));

    // Extract important identifiers
    if (response.data.status === 'success' && response.data.data) {
      const transferData = response.data.data;
      console.log('\n🎯 TRANSACTION IDENTIFIERS FOR FLUTTERWAVE SUPPORT:');
      console.log('=====================================');
      console.log('Transfer ID:', transferData.id);
      console.log('Reference:', transferData.reference);
      console.log('Account Number:', transferData.account_number);
      console.log('Bank Code:', transferData.bank_code);
      console.log('Amount:', transferData.amount);
      console.log('Currency:', transferData.currency);
      console.log('Status:', transferData.status);
      console.log('Date Created:', transferData.created_at);
      console.log('=====================================');
      
      console.log('\n📋 COPY THIS INFO TO FLUTTERWAVE SUPPORT:');
      console.log(`Transaction ID: ${transferData.id}`);
      console.log(`Reference: ${transferData.reference}`);
      console.log(`Error: IP Whitelisting required for bulk transfers`);
      console.log(`IP Address to whitelist: 102.90.103.200`);
    }

    return response.data;

  } catch (error) {
    console.log('❌ Transfer Error - This is expected for IP whitelisting:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error Data:', JSON.stringify(error.response.data, null, 2));
      
      // Check if it's the IP whitelisting error
      if (error.response.status === 403 || 
          (error.response.data && error.response.data.message && 
           error.response.data.message.toLowerCase().includes('ip'))) {
        
        console.log('\n🎯 IP WHITELISTING ERROR DETECTED:');
        console.log('=====================================');
        console.log('Error Status:', error.response.status);
        console.log('Error Message:', error.response.data.message);
        console.log('Error Code:', error.response.data.code || 'N/A');
        
        // Try to extract any transaction reference from the request
        console.log('\n📋 PROVIDE THIS INFO TO FLUTTERWAVE SUPPORT:');
        console.log(`Error Type: IP Whitelisting restriction`);
        console.log(`Error Status: ${error.response.status}`);
        console.log(`Error Message: ${error.response.data.message}`);
        console.log(`Your IP Address: 102.90.103.200`);
        console.log(`Request Reference: TEST_WHITELIST_${Date.now()}`);
        console.log(`Endpoint Attempted: ${FLUTTERWAVE_BASE_URL}/transfers`);
        console.log(`Request Timestamp: ${new Date().toISOString()}`);
        console.log('=====================================');
      }
    } else {
      console.log('Network Error:', error.message);
    }
    return null;
  }
}

async function testBulkTransfer() {
  try {
    console.log('\n💸 Testing Flutterwave Bulk Transfer to get Transaction ID...\n');

    // Test bulk transfer data
    const bulkData = {
      title: "Test Bulk Transfer for IP Whitelisting",
      bulk_data: [
        {
          bank_code: "044", // Access Bank
          account_number: "0690000040", // Test account
          amount: 100,
          currency: "NGN",
          narration: "Test bulk transfer for whitelisting",
          reference: `BULK_TEST_${Date.now()}_1`
        }
      ]
    };

    console.log('📤 Bulk Transfer Request Data:');
    console.log(JSON.stringify(bulkData, null, 2));
    console.log('');

    const response = await axios.post(
      `${FLUTTERWAVE_BASE_URL}/bulk-transfers`,
      bulkData,
      {
        headers: {
          'Authorization': FLUTTERWAVE_SECRET_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    console.log('✅ Bulk Transfer Response:');
    console.log('Status:', response.status);
    console.log('Response Data:', JSON.stringify(response.data, null, 2));

    return response.data;

  } catch (error) {
    console.log('❌ Bulk Transfer Error - This should show IP whitelisting:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error Data:', JSON.stringify(error.response.data, null, 2));
      
      console.log('\n🎯 BULK TRANSFER ERROR FOR FLUTTERWAVE SUPPORT:');
      console.log('=====================================');
      console.log('Error Status:', error.response.status);
      console.log('Error Message:', error.response.data.message || 'No message');
      console.log('Error Code:', error.response.data.code || 'No code');
      console.log('Endpoint:', `${FLUTTERWAVE_BASE_URL}/bulk-transfers`);
      console.log('Your IP:', '102.90.103.200');
      console.log('Timestamp:', new Date().toISOString());
      console.log('=====================================');
    }
    return null;
  }
}

async function runTransferTests() {
  console.log('🧪 Generating Transaction IDs for Flutterwave Support\n');
  
  // Test single transfer first
  await testSingleTransfer();
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  // Test bulk transfer
  await testBulkTransfer();
  
  console.log('\n✅ Test completed!');
  console.log('\n📧 Email the above transaction details to Flutterwave support');
  console.log('Include your IP address: 102.90.103.200');
  console.log('Request: Whitelist IP for bulk transfers and single transfers');
}

runTransferTests().catch(console.error);


