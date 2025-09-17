import React, { useState, useEffect, useCallback } from 'react';
import { Container, Typography, Box, Paper, TextField, Button, MenuItem, Alert, CircularProgress } from '@mui/material';
import { useAuth } from '../context/AuthContext';

function PayBills() {
  const { user } = useAuth();
  const [form, setForm] = useState({ biller: '', provider: '', customer: '', amount: '' });
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);
  const [customerInfo, setCustomerInfo] = useState(null);
  const [billersList, setBillersList] = useState([]);
  const [loadingBillers, setLoadingBillers] = useState(false);
  const [billerSearch, setBillerSearch] = useState('');
  const [filteredBillers, setFilteredBillers] = useState([]);

  const fetchWalletBalance = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/wallet?userId=${user.id}`);
      const data = await res.json();
      if (data.success) {
        setWalletBalance(data.wallet.balance);
      }
    } catch (err) {
      console.error('Failed to fetch wallet balance:', err);
    }
  }, [user.id]);

  const fetchBillers = useCallback(async () => {
    try {
      setLoadingBillers(true);
      console.log('Fetching billers from Flutterwave API...');
      const res = await fetch('http://localhost:5000/api/bills/billers');
      const data = await res.json();
      console.log('Billers response:', data);
      
      if (data.success) {
        // Group and organize billers by category for better UX
        const organizedBillers = organizeBillersByCategory(data.billers);
        setBillersList(organizedBillers);
        setFilteredBillers(organizedBillers);
        console.log(`✅ Loaded ${data.billers.length} billers from Flutterwave`);
      } else {
        setError('Failed to load billers: ' + data.message);
      }
    } catch (err) {
      console.error('Failed to fetch billers:', err);
      setError('Failed to load billers. Please try again.');
    } finally {
      setLoadingBillers(false);
    }
  }, []);

  // Fetch wallet balance and billers on component mount
  useEffect(() => {
    if (user) {
      fetchWalletBalance();
      fetchBillers();
    }
  }, [user, fetchWalletBalance, fetchBillers]);

  // Organize billers by category for better UX
  const organizeBillersByCategory = (billers) => {
    const categories = {
      'Electricity': billers.filter(b => b.name.includes('DISCO') || b.name.includes('ELECTRIC')),
      'Cable TV': billers.filter(b => ['DSTV', 'GOTV', 'STARTIMES'].some(tv => b.name.includes(tv))),
      'Telecom/Data': billers.filter(b => ['MTN', 'AIRTEL', 'GLO', '9MOBILE', 'DATA BUNDLE'].some(tel => b.name.includes(tel))),
      'Internet': billers.filter(b => ['SMILE', 'IPNX', 'SPECTRANET', 'SWIFT'].some(isp => b.name.includes(isp))),
      'Government/Tax': billers.filter(b => b.name.includes('FIRS') || b.name.includes('Federal')),
      'Others': []
    };

    // Add uncategorized billers to "Others"
    const categorizedCodes = new Set();
    Object.values(categories).forEach(cat => cat.forEach(b => categorizedCodes.add(b.code + b.id)));
    categories.Others = billers.filter(b => !categorizedCodes.has(b.code + b.id));

    // Flatten back to a single array with category headers
    let organized = [];
    Object.entries(categories).forEach(([category, items]) => {
      if (items.length > 0) {
        // Add category header
        organized.push({ 
          code: `category_${category}`, 
          name: `📋 ${category.toUpperCase()} (${items.length})`, 
          isCategory: true,
          disabled: true
        });
        // Add category items
        organized.push(...items);
      }
    });

    return organized;
  };

  // Filter billers based on search
  useEffect(() => {
    if (!billerSearch.trim()) {
      setFilteredBillers(billersList);
    } else {
      const filtered = billersList.filter(biller => 
        !biller.isCategory && 
        (biller.name.toLowerCase().includes(billerSearch.toLowerCase()) ||
         biller.code.toLowerCase().includes(billerSearch.toLowerCase()))
      );
      setFilteredBillers(filtered);
    }
  }, [billerSearch, billersList]);

  const handleBillerSearch = (e) => {
    setBillerSearch(e.target.value);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for biller selection to ensure we only select actual billers
    if (name === 'biller') {
      // Find the selected biller to ensure it's not a category
      const selectedBiller = filteredBillers.find(b => b.code === value);
      if (selectedBiller && selectedBiller.isCategory) {
        console.log('⚠️ Attempted to select category, ignoring:', selectedBiller.name);
        return; // Don't update form if trying to select a category
      }
      console.log('✅ Selected biller:', selectedBiller ? `${selectedBiller.name} (${selectedBiller.code})` : 'Unknown');
    }
    
    setForm({ ...form, [name]: value });
    setError('');
    setSuccess('');
    setCustomerInfo(null);
    if (name === 'biller') {
      setForm(f => ({ ...f, provider: '', customer: '', amount: '' }));
    }
  };

  const validateCustomer = async () => {
    if (!form.biller || !form.customer) {
      setError('Please select biller and enter customer ID');
      return;
    }

    setValidating(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/bills/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          biller: form.biller,
          customerId: form.customer
        })
      });
      const data = await res.json();
      if (data.success) {
        setCustomerInfo(data.customer);
        setSuccess('Customer validated successfully!');
      } else {
        setError(data.message || 'Customer validation failed');
      }
    } catch (err) {
      setError('Failed to validate customer. Please try again.');
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('Please login to continue');
      return;
    }

    if (!form.biller || !form.customer || !form.amount) {
      setError('Please fill in all required fields');
      return;
    }

    if (parseFloat(form.amount) > walletBalance) {
      setError('Insufficient balance');
      return;
    }

    // DEBUG: Log what's being sent
    console.log('🔍 DEBUGGING: Bill Payment Form Data:');
    console.log('- User ID:', user.id);
    console.log('- Biller Code:', form.biller);
    console.log('- Customer ID:', form.customer);
    console.log('- Amount:', form.amount);
    console.log('- Full Form Object:', form);
    
    // Additional debugging: Check if the selected biller is valid
    const selectedBiller = filteredBillers.find(b => b.code === form.biller);
    console.log('🔍 Selected Biller Details:', selectedBiller);
    if (!selectedBiller) {
      console.error('❌ No biller found with code:', form.biller);
      setError('Invalid biller selected. Please try again.');
      return;
    }
    if (selectedBiller.isCategory) {
      console.error('❌ Category selected instead of biller:', selectedBiller.name);
      setError('Please select a specific biller, not a category.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const requestBody = {
        userId: user.id,
        biller: form.biller,
        customerId: form.customer,
        amount: parseFloat(form.amount)
      };
      
      // DEBUG: Log the actual request being sent
      console.log('📤 DEBUGGING: Request Body Being Sent:');
      console.log(JSON.stringify(requestBody, null, 2));
      
      const res = await fetch('http://localhost:5000/api/bills/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      const data = await res.json();
      if (data.success) {
        setSuccess('Bill payment initiated successfully!');
        setForm({ biller: '', provider: '', customer: '', amount: '' });
        setCustomerInfo(null);
        fetchWalletBalance(); // Refresh balance
      } else {
        setError(data.message || 'Bill payment failed');
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
          Pay Bills
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
          Settle your utility, TV, and internet bills in seconds.
        </Typography>
        <Typography variant="body2" color="primary" sx={{ mb: 3, textAlign: 'center', fontStyle: 'italic' }}>
          Powered by Flutterwave • {billersList.filter(b => !b.isCategory).length}+ billers available
          <Button 
            size="small" 
            onClick={fetchBillers}
            disabled={loadingBillers}
            sx={{ ml: 1, minWidth: 'auto' }}
          >
            🔄
          </Button>
        </Typography>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Available Balance:</strong> ₦{walletBalance.toLocaleString()}
          </Typography>
        </Alert>
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} noValidate>
          {/* Biller Search */}
          <TextField
            label="Search Billers"
            value={billerSearch}
            onChange={handleBillerSearch}
            fullWidth
            sx={{ mb: 2 }}
            placeholder="Search by name or code (e.g., DSTV, BIL119, Electricity)"
            disabled={loadingBillers}
          />
          <TextField
            select
            label={loadingBillers ? "Loading billers..." : "Select Biller Type"}
            name="biller"
            value={form.biller}
            onChange={handleChange}
            fullWidth
            required
            disabled={loadingBillers}
            sx={{ mb: 3 }}
            helperText={billersList.length > 0 ? `${billersList.filter(b => !b.isCategory).length} billers available from Flutterwave` : ''}
          >
            {loadingBillers ? (
              <MenuItem disabled>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Loading billers from Flutterwave...
              </MenuItem>
            ) : filteredBillers.length === 0 && billerSearch ? (
              <MenuItem disabled>
                No billers found matching "{billerSearch}"
              </MenuItem>
            ) : (
              filteredBillers.map((biller) => (
                <MenuItem 
                  key={biller.code + (biller.id || '')} 
                  value={biller.code}
                  disabled={biller.isCategory}
                  sx={{
                    fontWeight: biller.isCategory ? 'bold' : 'normal',
                    backgroundColor: biller.isCategory ? '#f5f5f5' : 'inherit',
                    fontSize: biller.isCategory ? '0.9rem' : '1rem',
                    color: biller.isCategory ? '#666' : 'inherit'
                  }}
                >
                  {biller.isCategory ? biller.name : `${biller.name} (${biller.code})`}
                </MenuItem>
              ))
            )}
          </TextField>
          {/* Provider selection removed as it's handled by Monnify API */}
          <TextField
            label="Customer ID / Account Number"
            name="customer"
            value={form.customer}
            onChange={handleChange}
            fullWidth
            required
            sx={{ mb: 2 }}
            placeholder="Enter your customer/account number"
          />
          {form.biller && form.customer && (
            <Button
              variant="outlined"
              onClick={validateCustomer}
              disabled={validating}
              sx={{ mb: 3, width: '100%' }}
            >
              {validating ? <CircularProgress size={20} /> : 'Validate Customer'}
            </Button>
          )}
          {customerInfo && (
            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Customer Name:</strong> {customerInfo.name || 'N/A'}
              </Typography>
              {customerInfo.address && (
                <Typography variant="body2">
                  <strong>Address:</strong> {customerInfo.address}
                </Typography>
              )}
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
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            sx={{ py: 1.5, fontWeight: 700, fontSize: '1.1rem', borderRadius: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Pay'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default PayBills; 