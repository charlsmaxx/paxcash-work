const axios = require('axios');

async function testTransferWithRevenue() {
  try {
    console.log('🧪 Testing transfer with revenue tracking...');
    
    // Test transfer data
    const transferData = {
      userId: '687a928f869af29d884a655a', // Use a real user ID from your database
      bankCode: '044', // Access Bank
      accountNumber: '0690000032', // Flutterwave test account
      amount: 1000, // ₦1,000 transfer (should generate ₦50 fee)
      narration: 'Test transfer for revenue tracking'
    };
    
    console.log('📤 Sending transfer request...');
    console.log('Transfer data:', transferData);
    
    const response = await axios.post('http://localhost:5000/api/transfer/bank', transferData);
    
    console.log('✅ Transfer response:', response.data);
    
    if (response.data.success) {
      console.log('💰 Transfer successful!');
      console.log('Amount transferred:', response.data.transfer.amount);
      console.log('Fee charged:', response.data.transfer.fee);
      console.log('Total deducted:', response.data.transfer.totalDeducted);
      
      // Wait a moment for database operations to complete
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check for revenue transactions
      console.log('\n🔍 Checking for revenue transactions...');
      const revenueResponse = await axios.get('http://localhost:5000/api/admin/revenue/uncollected', {
        headers: { 'x-admin-key': 'test-admin-key' }
      });
      
      console.log('📊 Revenue check response:', revenueResponse.data);
      
    } else {
      console.log('❌ Transfer failed:', response.data.message);
    }
    
  } catch (error) {
    console.error('❌ Test error:');
    console.error('Error message:', error.message);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    console.error('Full error:', error);
  }
}

testTransferWithRevenue();
