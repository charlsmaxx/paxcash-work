const axios = require('axios');

async function quickTest() {
  const baseUrl = 'http://localhost:5000';
  const endpoints = [
    { method: 'GET', path: '/api/flutterwave/bill-categories', name: 'Bill Categories' },
    { method: 'GET', path: '/api/flutterwave/airtime-providers', name: 'Airtime Providers' },
    { method: 'GET', path: '/api/flutterwave/wallet-balance', name: 'Wallet Balance' },
    { method: 'GET', path: '/api/flutterwave/transactions', name: 'Transactions' },
    { method: 'POST', path: '/api/flutterwave/transfer', name: 'Single Transfer', 
      body: { account_bank: '044', account_number: '1234567890', amount: 100, narration: 'Test' } }
  ];

  console.log('🧪 Quick Flutterwave Endpoint Test\n');

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing: ${endpoint.name}...`);
      
      if (endpoint.method === 'GET') {
        const response = await axios.get(`${baseUrl}${endpoint.path}`);
        console.log(`✅ ${endpoint.name}: ${response.status} - ${response.data.success ? 'SUCCESS' : 'FAILED'}`);
      } else {
        const response = await axios.post(`${baseUrl}${endpoint.path}`, endpoint.body);
        console.log(`✅ ${endpoint.name}: ${response.status} - ${response.data.success ? 'SUCCESS' : 'FAILED'}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name}: ${error.response?.status || 'ERROR'} - ${error.response?.data?.message || error.message}`);
    }
  }
  
  console.log('\n🎯 Test Complete! Check results above.');
}

quickTest();



