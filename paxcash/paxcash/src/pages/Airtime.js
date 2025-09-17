import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, TextField, Button, MenuItem, Alert, CircularProgress, ToggleButton, ToggleButtonGroup, Grid } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import LoyaltyStatus from '../components/LoyaltyStatus';

const networks = [
  { code: 'mtn', name: 'MTN' },
  { code: 'glo', name: 'Glo' },
  { code: 'airtel', name: 'Airtel' },
  { code: '9mobile', name: '9mobile' },
];

function Airtime() {
  const { user } = useAuth();
  const [form, setForm] = useState({ phone: '', network: '', amount: '', type: 'airtime' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);
  const [dataPlans, setDataPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [pricingPreview, setPricingPreview] = useState(null);
  const [showPricingPreview, setShowPricingPreview] = useState(false);

  // Fetch wallet balance and data plans on component mount
  useEffect(() => {
    if (user) {
      fetchWalletBalance();
    }
  }, [user]);

  // Fetch data plans when network changes
  useEffect(() => {
    if (form.network && form.type === 'data') {
      fetchDataPlans();
    }
  }, [form.network, form.type]);

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

  const fetchDataPlans = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/data/plans/${form.network}`);
      const data = await res.json();
      if (data.success) {
        setDataPlans(data.plans);
      }
    } catch (err) {
      console.error('Failed to fetch data plans:', err);
    }
  };

  const fetchPricingPreview = async (amount) => {
    if (!amount || !user?.id) return;
    
    try {
      const res = await fetch('http://localhost:5000/api/pricing/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          service: form.type,
          amount: parseFloat(amount)
        })
      });
      const data = await res.json();
      if (data.success) {
        setPricingPreview(data.pricing);
        setShowPricingPreview(true);
      }
    } catch (err) {
      console.error('Failed to fetch pricing preview:', err);
    }
  };

  const handleChange = (e) => {
    const newForm = { ...form, [e.target.name]: e.target.value };
    setForm(newForm);
    setError('');
    setSuccess('');
    setSelectedPlan(null);
    setShowPricingPreview(false);
    
    // Fetch pricing preview when amount changes
    if (e.target.name === 'amount' && e.target.value) {
      fetchPricingPreview(e.target.value);
    }
  };

  const handleTypeChange = (event, newType) => {
    if (newType) setForm({ ...form, type: newType });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('Please login to continue');
      return;
    }

    if (!form.phone || !form.network || !form.amount) {
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
      const endpoint = form.type === 'airtime' ? '/api/airtime/buy' : '/api/data/buy';
      const body = form.type === 'airtime' 
        ? {
            userId: user.id,
            phoneNumber: form.phone,
            network: form.network,
            amount: parseFloat(form.amount)
          }
        : {
            userId: user.id,
            phoneNumber: form.phone,
            network: form.network,
            plan: selectedPlan?.id || form.amount,
            amount: parseFloat(form.amount)
          };

      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await res.json();
      if (data.success) {
        const purchaseData = data.airtime || data.data;
        let successMessage = `${form.type === 'airtime' ? 'Airtime' : 'Data'} purchase successful! Reference: ${purchaseData?.reference}`;
        
        if (purchaseData?.isEligibleForCashback && purchaseData?.cashbackAmount > 0) {
          successMessage += `\n🎉 You earned ₦${purchaseData.cashbackAmount} cashback! ${purchaseData.cashbackMessage}`;
        } else if (purchaseData?.cashbackMessage) {
          successMessage += `\n💡 ${purchaseData.cashbackMessage}`;
        }
        
        setSuccess(successMessage);
        setForm({ phone: '', network: '', amount: '', type: form.type });
        setSelectedPlan(null);
        setShowPricingPreview(false);
        fetchWalletBalance(); // Refresh balance
      } else {
        setError(data.message || `${form.type === 'airtime' ? 'Airtime' : 'Data'} purchase failed`);
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      {/* Loyalty Status */}
      <LoyaltyStatus userId={user?.id} />
      
      <Paper sx={{ p: 5, borderRadius: 3, boxShadow: 4 }}>
        <Typography variant="h4" gutterBottom color="primary" sx={{ fontWeight: 700, textAlign: 'center' }}>
          Buy Airtime & Data
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
          Recharge your phone or buy data for any network instantly.
        </Typography>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Available Balance:</strong> ₦{walletBalance.toLocaleString()}
          </Typography>
        </Alert>
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        {/* Pricing Preview */}
        {showPricingPreview && pricingPreview && (
          <Alert 
            severity={pricingPreview.isEligibleForCashback ? "success" : "info"} 
            sx={{ mb: 3 }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              💰 Pricing Preview
            </Typography>
            <Typography variant="body2">
              <strong>You pay:</strong> ₦{pricingPreview.userPays} | 
              <strong> Value received:</strong> ₦{pricingPreview.originalAmount} | 
              <strong> Daily purchases:</strong> {pricingPreview.dailyPurchaseCount}
            </Typography>
            {pricingPreview.isEligibleForCashback && (
              <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>
                🎉 {pricingPreview.message} (₦{pricingPreview.cashbackAmount} cashback!)
              </Typography>
            )}
            {!pricingPreview.isEligibleForCashback && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                {pricingPreview.message}
              </Typography>
            )}
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <ToggleButtonGroup
            value={form.type}
            exclusive
            onChange={handleTypeChange}
            sx={{ mb: 3, width: '100%' }}
          >
            <ToggleButton value="airtime" sx={{ flex: 1, fontWeight: 700 }}>Airtime</ToggleButton>
            <ToggleButton value="data" sx={{ flex: 1, fontWeight: 700 }}>Data</ToggleButton>
          </ToggleButtonGroup>
          <TextField
            label="Phone Number"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            fullWidth
            required
            sx={{ mb: 3 }}
            inputProps={{ maxLength: 11 }}
            placeholder="e.g. 08012345678"
          />
          <TextField
            select
            label="Network"
            name="network"
            value={form.network}
            onChange={handleChange}
            fullWidth
            required
            sx={{ mb: 3 }}
          >
            {networks.map((network) => (
              <MenuItem key={network.code} value={network.code}>
                {network.name}
              </MenuItem>
            ))}
          </TextField>
          {form.type === 'airtime' ? (
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
          ) : (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Select Data Plan
              </Typography>
              <Grid container spacing={2}>
                {dataPlans.map((plan) => (
                  <Grid item xs={12} sm={6} key={plan.id}>
                    <Paper
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        border: selectedPlan?.id === plan.id ? 2 : 1,
                        borderColor: selectedPlan?.id === plan.id ? 'primary.main' : 'divider',
                        bgcolor: selectedPlan?.id === plan.id ? 'primary.light' : 'background.paper'
                      }}
                      onClick={() => {
                        setSelectedPlan(plan);
                        setForm({ ...form, amount: plan.amount });
                      }}
                    >
                      <Typography variant="h6" fontWeight={600}>
                        {plan.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {plan.size} • {plan.validity}
                      </Typography>
                      <Typography variant="h6" color="primary" fontWeight={700}>
                        ₦{plan.amount}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            sx={{ py: 1.5, fontWeight: 700, fontSize: '1.1rem', borderRadius: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : `Buy ${form.type === 'airtime' ? 'Airtime' : 'Data'}`}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default Airtime; 