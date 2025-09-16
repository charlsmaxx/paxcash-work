const axios = require('axios');

const MONNIFY_API_KEY = process.env.MONNIFY_API_KEY;
const MONNIFY_SECRET_KEY = process.env.MONNIFY_SECRET_KEY;
const MONNIFY_CONTRACT_CODE = process.env.MONNIFY_CONTRACT_CODE;
const MONNIFY_BASE_URL = process.env.MONNIFY_BASE_URL || 'https://sandbox.monnify.com';

async function getMonnifyToken() {
  const response = await axios.post(
    `${MONNIFY_BASE_URL}/api/v1/auth/login`,
    {},
    {
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${MONNIFY_API_KEY}:${MONNIFY_SECRET_KEY}`).toString('base64')
      }
    }
  );
  return response.data.responseBody.accessToken;
}

async function createMonnifyVirtualAccount({ accountReference, accountName, email, customerName, customerEmail, customerPhoneNumber, bvn, nin }) {
  const accessToken = await getMonnifyToken();
  
  // Prepare request body
  const requestBody = {
    accountReference,
    accountName,
    currencyCode: 'NGN',
    contractCode: MONNIFY_CONTRACT_CODE,
    customerEmail,
    customerName,
    getAllAvailableBanks: true,
    customerPhoneNumber
  };

  // Add BVN or NIN if provided
  if (bvn) {
    requestBody.bvn = bvn;
  } else if (nin) {
    requestBody.nin = nin;
  }

  const response = await axios.post(
    `${MONNIFY_BASE_URL}/api/v2/bank-transfer/reserved-accounts`,
    requestBody,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data.responseBody;
}

module.exports = {
  getMonnifyToken,
  createMonnifyVirtualAccount
}; 