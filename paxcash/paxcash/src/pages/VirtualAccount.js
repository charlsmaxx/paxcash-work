import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Paper, TextField, Button, CircularProgress, Alert, Grid, Divider } from '@mui/material';
import { useAuth } from '../context/AuthContext';

function VirtualAccount() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [account, setAccount] = useState(null);
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    bvn: '', 
    nin: '' 
  });
  const [formError, setFormError] = useState({});
  const [idType, setIdType] = useState('bvn'); // 'bvn' or 'nin'

  useEffect(() => {
    if (user) fetchStatus();
    // eslint-disable-next-line
  }, [user]);

  const fetchStatus = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`http://localhost:5000/api/virtual-account/status?userId=${user.id}`);
      const data = await res.json();
      if (data.success && data.isActivated) {
        setAccount(data.virtualAccount);
      } else {
        setAccount(null);
      }
    } catch (err) {
      setError('Failed to fetch virtual account status.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errs = {};
    if (!form.name) errs.name = 'Name is required';
    if (!form.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) errs.email = 'Valid email is required';
    if (!form.phone || !/^\d{11}$/.test(form.phone)) errs.phone = 'Phone must be exactly 11 digits';
    
    // BVN/NIN validation - at least one is required
    if (!form.bvn && !form.nin) {
      errs.bvn = 'Either BVN or NIN is required';
      errs.nin = 'Either BVN or NIN is required';
    }
    
    // If BVN is provided, validate it
    if (form.bvn && !/^\d{11}$/.test(form.bvn)) {
      errs.bvn = 'BVN must be exactly 11 digits';
    }
    
    // If NIN is provided, validate it
    if (form.nin && !/^\d{11}$/.test(form.nin)) {
      errs.nin = 'NIN must be exactly 11 digits';
    }
    
    setFormError(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFormError({ ...formError, [e.target.name]: '' });
  };

  const handleCreate = async e => {
    e.preventDefault();
    if (!validateForm()) return;
    setCreating(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('http://localhost:5000/api/virtual-account/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          name: form.name,
          email: form.email,
          phone: form.phone,
          bvn: form.bvn || null,
          nin: form.nin || null
        })
      });
      const result = await res.json();
      if (result.success) {
        setSuccess('Virtual account created successfully!');
        setAccount(result.data);
        setForm({ name: '', email: '', phone: '' });
      } else {
        setError(result.message || 'Failed to create virtual account');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3 }}>
        <Typography variant="h4" color="primary" fontWeight={700} gutterBottom textAlign="center">
          Virtual Account
        </Typography>
        <Divider sx={{ mb: 3 }} />
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>Loading virtual account status...</Typography>
          </Box>
        ) : account ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Alert severity="success" sx={{ mb: 3, fontWeight: 600 }}>
              Virtual account is active and ready for transactions!
            </Alert>
            <Typography variant="h6" sx={{ mb: 2 }}>Account Details</Typography>
            <Grid container spacing={2} justifyContent="center">
              <Grid item xs={12}>
                <Typography variant="body1"><b>Account Number:</b> {account.accountNumber}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1"><b>Bank Name:</b> {account.bankName}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1"><b>Account Name:</b> {account.accountName}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1"><b>Status:</b> {account.status || 'active'}</Typography>
              </Grid>
            </Grid>
            <Alert severity="info" sx={{ mt: 4 }}>
              You can now receive payments and perform transactions with this account.
            </Alert>
          </Box>
        ) : (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
              Create Your Virtual Account
            </Typography>
            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="body2" fontWeight={600}>
                Important: Starting September 16th, 2024, BVN or NIN will be mandatory for virtual account creation as required by CBN regulations.
              </Typography>
            </Alert>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            <Box component="form" onSubmit={handleCreate} noValidate>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Full Name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    error={!!formError.name}
                    helperText={formError.name || 'Enter your full name'}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    error={!!formError.email}
                    helperText={formError.email || 'Enter your email address'}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Phone Number"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    error={!!formError.phone}
                    helperText={formError.phone || 'Enter your 11-digit phone number'}
                    variant="outlined"
                  />
                </Grid>
                
                {/* BVN/NIN Section */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
                    Identity Verification (Required)
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                    Please provide either your BVN or NIN for account verification as required by CBN regulations.
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="BVN (11 digits)"
                    name="bvn"
                    value={form.bvn}
                    onChange={handleChange}
                    error={!!formError.bvn}
                    helperText={formError.bvn || 'Enter your 11-digit BVN'}
                    variant="outlined"
                    placeholder="12345678901"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="NIN (11 digits)"
                    name="nin"
                    value={form.nin}
                    onChange={handleChange}
                    error={!!formError.nin}
                    helperText={formError.nin || 'Enter your 11-digit NIN'}
                    variant="outlined"
                    placeholder="12345678901"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    size="large"
                    disabled={creating}
                    sx={{ py: 1.5, fontWeight: 700, fontSize: '1.1rem', borderRadius: 2 }}
                  >
                    {creating ? <CircularProgress size={24} /> : 'Create Virtual Account'}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
}

export default VirtualAccount; 