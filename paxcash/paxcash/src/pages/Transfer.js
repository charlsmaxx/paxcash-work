import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, TextField, Button, MenuItem, Alert, CircularProgress } from '@mui/material';
import { useAuth } from '../context/AuthContext';

const banks = []; // Will be populated from Monnify API

function Transfer() {
  const { user } = useAuth();
  const [form, setForm] = useState({ bank: '', account: '', amount: '', narration: '' });
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [accountName, setAccountName] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);
  const [banksList, setBanksList] = useState([]);

  // Fetch wallet balance and banks on component mount
  useEffect(() => {
    if (user) {
      fetchWalletBalance();
      fetchBanks();
    }
  }, [user]);

  const fetchWalletBalance = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/wallet?userId=${user.id}`);
      const data = await res.json();
      if (data.success) {
        setWalletBalance(data.wallet.balance);
      }
    } catch (err) {
      console.error('Failed to fetch wallet balance:', err);
    }
  };

  const fetchBanks = async () => {
    try {
      console.log('🔄 Fetching banks from API...');
      const res = await fetch('http://localhost:5000/api/banks');
      console.log('📡 Response status:', res.status);
      const data = await res.json();
      console.log('📋 Banks API response:', data);
      if (data.success) {
        console.log('✅ Banks fetched:', data.banks.length, 'banks');
        setBanksList(data.banks);
      } else {
        console.error('❌ Banks API failed:', data.message);
        // Show error to user
        setError(`Failed to load banks: ${data.message}`);
      }
    } catch (err) {
      console.error('Failed to fetch banks:', err);
      setError('Failed to load banks. Please check your connection.');
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
    setAccountName('');
  };

  const verifyAccount = async () => {
    if (!form.account || !form.bank) {
      setError('Please enter both account number and bank');
      return;
    }

    setVerifying(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/transfer/verify-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountNumber: form.account,
          bankCode: form.bank
        })
      });
      const data = await res.json();
      if (data.success) {
        setAccountName(data.accountName);
        setSuccess('Account verified successfully!');
      } else {
        setError(data.message || 'Account verification failed');
      }
    } catch (err) {
      setError('Failed to verify account. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('Please login to continue');
      return;
    }

    if (!form.bank || !form.account || !form.amount) {
      setError('Please fill in all required fields');
      return;
    }

    if (parseFloat(form.amount) > walletBalance) {
      setError('Insufficient balance');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const res = await fetch('http://localhost:5000/api/transfer/bank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          bankCode: form.bank,
          accountNumber: form.account,
          amount: parseFloat(form.amount),
          narration: form.narration
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setSuccess('Transfer initiated successfully! Check your transaction history for updates.');
        setForm({ bank: '', account: '', amount: '', narration: '' });
        setAccountName('');
        fetchWalletBalance(); // Refresh balance
      } else {
        setError(data.message || 'Transfer failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper sx={{ p: 5, borderRadius: 3, boxShadow: 4 }}>
        <Typography variant="h4" gutterBottom color="primary" sx={{ fontWeight: 700, textAlign: 'center' }}>
          Send Money
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
          Transfer funds to any Nigerian bank account instantly.
        </Typography>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Available Balance:</strong> ₦{walletBalance.toLocaleString()}
          </Typography>
        </Alert>
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            select
            label="Recipient Bank"
            name="bank"
            value={form.bank}
            onChange={handleChange}
            fullWidth
            required
            sx={{ mb: 3 }}
          >
            {banksList.map((bank) => (
              <MenuItem key={bank.code} value={bank.code}>
                {bank.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Account Number"
            name="account"
            value={form.account}
            onChange={handleChange}
            fullWidth
            required
            sx={{ mb: 2 }}
            inputProps={{ maxLength: 10 }}
            placeholder="Enter 10-digit account number"
          />
          {form.account && form.bank && (
            <Button
              variant="outlined"
              onClick={verifyAccount}
              disabled={verifying}
              sx={{ mb: 3, width: '100%' }}
            >
              {verifying ? <CircularProgress size={20} /> : 'Verify Account'}
            </Button>
          )}
          {accountName && (
            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Account Name:</strong> {accountName}
              </Typography>
            </Alert>
          )}
          <TextField
            label="Amount (₦)"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            fullWidth
            required
            sx={{ mb: 3 }}
            type="number"
            inputProps={{ min: 1 }}
            placeholder="Enter amount"
          />
          <TextField
            label="Narration (optional)"
            name="narration"
            value={form.narration}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 3 }}
            placeholder="e.g. Rent, Gift, Payment"
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            sx={{ py: 1.5, fontWeight: 700, fontSize: '1.1rem', borderRadius: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Send'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default Transfer; 