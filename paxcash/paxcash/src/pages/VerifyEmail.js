import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Button, 
  Box, 
  Paper,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment
} from '@mui/material';
import { 
  CheckCircle, 
  Error, 
  ArrowForward,
  Email,
  Lock
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { verifyEmail } = useAuth();
  const [formData, setFormData] = useState({
    email: searchParams.get('email') || '',
    code: ''
  });
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    setError('');

    try {
      const result = await verifyEmail(formData.email, formData.code);
      setVerificationResult(result);
      
      if (result.success) {
        // Redirect to login after successful verification
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/resend-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();
      
      if (data.success) {
        setError('');
        setVerificationResult({
          success: true,
          message: 'A new verification code has been sent to your email.'
        });
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to resend code. Please try again.');
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      py: 4
    }}>
      <Container maxWidth="sm">
        <Paper elevation={8} sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
            <img src={logo} alt="Paxcash Logo" style={{ height: 50, marginRight: 16 }} />
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Paxcash
            </Typography>
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Verify Your Email
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            We've sent a 6-digit verification code to your email address. 
            Please enter it below to verify your account.
          </Typography>

          {/* Success Message */}
          {verificationResult?.success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {verificationResult.message}
            </Alert>
          )}

          {/* Error Message */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Verification Form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              label="Verification Code"
              name="code"
              type="text"
              value={formData.code}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
              placeholder="Enter 6-digit code"
              inputProps={{ maxLength: 6 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
              }}
            />
            
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={isVerifying || !formData.email || !formData.code}
              sx={{ 
                mt: 3, 
                mb: 2,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8, #6a4190)'
                }
              }}
            >
              {isVerifying ? <CircularProgress size={24} /> : 'Verify Email'}
            </Button>
          </Box>

          {/* Resend Code */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Didn't receive the code?
            </Typography>
            <Button
              variant="text"
              onClick={handleResendCode}
              disabled={!formData.email}
              sx={{ 
                color: '#667eea',
                fontWeight: 600,
                '&:hover': {
                  bgcolor: 'rgba(102, 126, 234, 0.04)'
                }
              }}
            >
              Resend Code
            </Button>
          </Box>

          {/* Navigation */}
          <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #eee' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Already verified?{' '}
              <Button
                variant="text"
                onClick={() => navigate('/login')}
                sx={{ 
                  color: '#667eea',
                  fontWeight: 600,
                  p: 0,
                  minWidth: 'auto',
                  '&:hover': {
                    bgcolor: 'transparent'
                  }
                }}
              >
                Sign in here
              </Button>
            </Typography>
            
            <Button
              variant="outlined"
              onClick={() => navigate('/')}
              sx={{ 
                borderColor: '#667eea',
                color: '#667eea',
                '&:hover': {
                  borderColor: '#5a6fd8',
                  bgcolor: 'rgba(102, 126, 234, 0.04)'
                }
              }}
            >
              Back to Home
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default VerifyEmail; 