import React, { useState } from 'react';
import { Container, Typography, Box, Paper, TextField, Button, Grid, MenuItem, Alert, LinearProgress, Divider, InputLabel, Select, FormControl, CircularProgress } from '@mui/material';

const idTypes = [
  { value: 'nin', label: 'NIN (National ID Number)' },
  { value: 'voters_card', label: "Voter's Card" },
  { value: 'drivers_license', label: "Driver's License" },
  { value: 'passport', label: 'International Passport' }
];

function KYC() {
  const [form, setForm] = useState({
    idType: '',
    idNumber: '',
    bvn: '',
    selfie: null,
    idFile: null
  });
  const [formError, setFormError] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(33);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setForm({ ...form, [name]: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
    setFormError({ ...formError, [name]: '' });
  };

  const validateForm = () => {
    const errs = {};
    if (!form.idType) errs.idType = 'Select a valid ID type';
    if (!form.idNumber) errs.idNumber = 'Enter your ID number';
    if (!form.idFile) errs.idFile = 'Upload a clear photo/scan of your ID';
    if (!form.selfie) errs.selfie = 'Upload a selfie holding your ID';
    setFormError(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    setError('');
    setSuccess('');
    setProgress(66);
    // Simulate upload
    setTimeout(() => {
      setProgress(100);
      setSuccess('KYC submitted successfully! We will review your documents and notify you soon.');
      setSubmitting(false);
    }, 2000);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3 }}>
        <Typography variant="h4" color="primary" fontWeight={700} gutterBottom textAlign="center">
          KYC Verification
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
          Please complete your KYC to unlock all features. Upload a valid ID, enter your details, and take a selfie holding your ID.
        </Typography>
        <LinearProgress variant="determinate" value={progress} sx={{ mb: 3, height: 8, borderRadius: 2 }} />
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth required error={!!formError.idType}>
                <InputLabel>ID Type</InputLabel>
                <Select
                  label="ID Type"
                  name="idType"
                  value={form.idType}
                  onChange={handleChange}
                >
                  {idTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                  ))}
                </Select>
                <Typography variant="caption" color="error">{formError.idType}</Typography>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="ID Number"
                name="idNumber"
                value={form.idNumber}
                onChange={handleChange}
                error={!!formError.idNumber}
                helperText={formError.idNumber || 'Enter the number on your selected ID'}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="BVN (optional)"
                name="bvn"
                value={form.bvn}
                onChange={handleChange}
                error={!!formError.bvn}
                helperText={formError.bvn || 'Enter your 11-digit BVN (optional)'}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                color={formError.idFile ? 'error' : 'primary'}
                sx={{ py: 2, fontWeight: 600 }}
              >
                {form.idFile ? `ID Uploaded: ${form.idFile.name}` : 'Upload ID Photo/Scan'}
                <input
                  type="file"
                  name="idFile"
                  accept="image/*,application/pdf"
                  hidden
                  onChange={handleChange}
                />
              </Button>
              {formError.idFile && <Typography variant="caption" color="error">{formError.idFile}</Typography>}
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                color={formError.selfie ? 'error' : 'primary'}
                sx={{ py: 2, fontWeight: 600 }}
              >
                {form.selfie ? `Selfie Uploaded: ${form.selfie.name}` : 'Upload Selfie with ID'}
                <input
                  type="file"
                  name="selfie"
                  accept="image/*"
                  hidden
                  onChange={handleChange}
                />
              </Button>
              {formError.selfie && <Typography variant="caption" color="error">{formError.selfie}</Typography>}
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                disabled={submitting}
                sx={{ py: 1.5, fontWeight: 700, fontSize: '1.1rem', borderRadius: 2 }}
              >
                {submitting ? <CircularProgress size={24} /> : 'Submit KYC'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}

export default KYC; 