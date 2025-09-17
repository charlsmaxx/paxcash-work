import React from 'react';
import { 
  Container, 
  Typography, 
  Button, 
  Box, 
  Grid,
  TextField,
  Paper,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
  Link,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff,
  Email,
  Lock,
  Person,
  Phone,
  CheckCircle,
  ArrowBack,
  ArrowForward,
  Refresh
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: ''
  });

  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitMessage, setSubmitMessage] = React.useState('');
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const [showVerifyModal, setShowVerifyModal] = React.useState(false);
  const [verifyCode, setVerifyCode] = React.useState('');
  const [verifyError, setVerifyError] = React.useState('');
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [registeredEmail, setRegisteredEmail] = React.useState('');
  const [timer, setTimer] = React.useState(15 * 60); // 15 minutes in seconds
  const [resendCooldown, setResendCooldown] = React.useState(0);
  const [resendMsg, setResendMsg] = React.useState('');

  // Timer effect
  React.useEffect(() => {
    let interval = null;
    if (showVerifyModal && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => interval && clearInterval(interval);
  }, [showVerifyModal, timer]);

  // Resend cooldown effect
  React.useEffect(() => {
    let interval = null;
    if (resendCooldown > 0) {
      interval = setInterval(() => setResendCooldown(c => c - 1), 1000);
    }
    return () => interval && clearInterval(interval);
  }, [resendCooldown]);

  // Reset timer when modal opens
  React.useEffect(() => {
    if (showVerifyModal) {
      setTimer(15 * 60);
      setResendMsg('');
      setVerifyCode('');
      setVerifyError('');
    }
  }, [showVerifyModal]);

  // Format timer mm:ss
  const timerDisplay = `${String(Math.floor(timer / 60)).padStart(2, '0')}:${String(timer % 60).padStart(2, '0')}`;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // First Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    // Last Name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone number validation
    const phoneRegex = /^(\+234|0)[789][01]\d{8}$/;
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid Nigerian phone number';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          phoneNumber: formData.phoneNumber
        }),
      });

      const result = await response.json();

      if (result.success) {
        setIsSuccess(true);
        setSubmitMessage(result.message);
        
        // Clear form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          confirmPassword: '',
          phoneNumber: ''
        });
        
        // Redirect to verification page with email
        setTimeout(() => {
          navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);
        }, 2000);
      } else {
        setSubmitMessage(result.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setSubmitMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle code verification
  const handleVerifyCode = async () => {
    setIsVerifying(true);
    setVerifyError('');
    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: registeredEmail, code: verifyCode })
      });
      const result = await response.json();
      if (result.success) {
        setShowVerifyModal(false);
        navigate('/dashboard');
      } else {
        setVerifyError(result.message || 'Invalid or expired code.');
      }
    } catch (err) {
      setVerifyError('Network error. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle resend code
  const handleResendCode = async () => {
    setResendMsg('');
    setResendCooldown(30); // 30s cooldown
    try {
      const response = await fetch('http://localhost:5000/api/auth/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: registeredEmail })
      });
      const result = await response.json();
      if (result.success) {
        setTimer(15 * 60);
        setResendMsg('A new code has been sent to your email.');
      } else {
        setResendMsg(result.message || 'Failed to resend code.');
      }
    } catch (err) {
      setResendMsg('Network error. Please try again.');
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      position: 'relative',
      overflow: 'hidden',
      '&:before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        opacity: 0.3,
        zIndex: 1,
      }
    }}>
      {/* Return Arrow Button */}
      <Fab
        color="primary"
        aria-label="back"
        onClick={() => navigate('/')}
        sx={{
          position: 'fixed',
          top: 20,
          left: 20,
          zIndex: 1000,
          bgcolor: 'rgba(255,255,255,0.9)',
          color: '#667eea',
          '&:hover': {
            bgcolor: 'rgba(255,255,255,1)',
            transform: 'scale(1.1)'
          },
          transition: 'all 0.3s ease'
        }}
      >
        <ArrowBack />
      </Fab>

      <Container maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 2 }}>
        <Grid container spacing={4} alignItems="center" justifyContent="center" sx={{ minHeight: '100vh' }}>
          {/* Left Side - Welcome Content */}
          <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Box sx={{ color: 'white', textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4 }}>
                <img src={logo} alt="Paxcash Logo" style={{ height: 70, marginRight: 20 }} />
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  Paxcash
                </Typography>
              </Box>
              <Typography variant="h2" sx={{ fontWeight: 800, mb: 4, textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                Join the Future of Banking
              </Typography>
              <Typography variant="h5" sx={{ mb: 6, opacity: 0.9, lineHeight: 1.6, textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>
                Experience seamless, secure, and lightning-fast financial transactions. 
                Built on enterprise-grade technology with bank-level security.
              </Typography>
              
              {/* Benefits List */}
              <Box sx={{ textAlign: 'left', maxWidth: 450, mx: 'auto' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2, backdropFilter: 'blur(10px)' }}>
                  <CheckCircle sx={{ color: '#4CAF50', mr: 2, fontSize: 28 }} />
                  <Typography variant="h6">Free account creation</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2, backdropFilter: 'blur(10px)' }}>
                  <CheckCircle sx={{ color: '#4CAF50', mr: 2, fontSize: 28 }} />
                  <Typography variant="h6">Instant money transfers</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2, backdropFilter: 'blur(10px)' }}>
                  <CheckCircle sx={{ color: '#4CAF50', mr: 2, fontSize: 28 }} />
                  <Typography variant="h6">24/7 customer support</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2, backdropFilter: 'blur(10px)' }}>
                  <CheckCircle sx={{ color: '#4CAF50', mr: 2, fontSize: 28 }} />
                  <Typography variant="h6">Bank-level security</Typography>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Right Side - Sign Up Form */}
          <Grid item xs={12} md={6}>
            <Paper elevation={12} sx={{ 
              p: 5, 
              borderRadius: 4, 
              maxWidth: 550, 
              mx: 'auto',
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.3)',
              boxShadow: '0 25px 50px rgba(0,0,0,0.15)'
            }}>
              {/* Mobile Logo */}
              <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', justifyContent: 'center', mb: 4 }}>
                <img src={logo} alt="Paxcash Logo" style={{ height: 50, marginRight: 16 }} />
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  Paxcash
                </Typography>
              </Box>

              <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, textAlign: 'center', background: 'linear-gradient(135deg, #667eea, #764ba2)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Create Account
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 4, textAlign: 'center', fontWeight: 400 }}>
                Join millions of users who trust Paxcash for their financial needs
              </Typography>

              {/* Success Message */}
              {isSuccess && (
                <Alert severity="success" sx={{ mb: 4, borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {submitMessage}
                  </Typography>
                  <Typography variant="body2">
                    Redirecting to your dashboard...
                  </Typography>
                </Alert>
              )}

              {/* Error Message */}
              {submitMessage && !isSuccess && (
                <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
                  {submitMessage}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Grid container spacing={3}>
                  {/* First Name */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      error={!!errors.firstName}
                      helperText={errors.firstName}
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': {
                            borderColor: '#667eea',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#667eea',
                          },
                        },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person sx={{ color: 'text.secondary' }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  {/* Last Name */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      error={!!errors.lastName}
                      helperText={errors.lastName}
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': {
                            borderColor: '#667eea',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#667eea',
                          },
                        },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person sx={{ color: 'text.secondary' }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  {/* Email */}
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      error={!!errors.email}
                      helperText={errors.email}
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': {
                            borderColor: '#667eea',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#667eea',
                          },
                        },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email sx={{ color: 'text.secondary' }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  {/* Phone Number */}
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      label="Phone Number"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      error={!!errors.phoneNumber}
                      helperText={errors.phoneNumber || 'Enter Nigerian phone number (e.g., 08012345678)'}
                      variant="outlined"
                      placeholder="08012345678"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': {
                            borderColor: '#667eea',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#667eea',
                          },
                        },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Phone sx={{ color: 'text.secondary' }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  {/* Password */}
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      label="Password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      error={!!errors.password}
                      helperText={errors.password || 'Must be at least 8 characters with uppercase, lowercase, and number'}
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': {
                            borderColor: '#667eea',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#667eea',
                          },
                        },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock sx={{ color: 'text.secondary' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  {/* Confirm Password */}
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      label="Confirm Password"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      error={!!errors.confirmPassword}
                      helperText={errors.confirmPassword}
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': {
                            borderColor: '#667eea',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#667eea',
                          },
                        },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock sx={{ color: 'text.secondary' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              edge="end"
                            >
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  {/* Submit Button */}
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      size="large"
                      disabled={isSubmitting}
                      endIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <ArrowForward />}
                      sx={{ 
                        py: 2, 
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #5a6fd8, #6a4190)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 12px 30px rgba(102, 126, 234, 0.4)'
                        },
                        '&:disabled': {
                          background: 'linear-gradient(135deg, #667eea, #764ba2)',
                          opacity: 0.7
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {isSubmitting ? 'Creating Account...' : 'Create Account'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 4 }}>
                <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Already have an account?
                </Typography>
              </Divider>

              <Box sx={{ textAlign: 'center' }}>
                <Button
                  variant="outlined"
                  fullWidth
                  size="large"
                  onClick={() => navigate('/login')}
                  sx={{ 
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderRadius: 2,
                    borderColor: '#667eea',
                    color: '#667eea',
                    borderWidth: 2,
                    '&:hover': {
                      borderColor: '#5a6fd8',
                      bgcolor: 'rgba(102, 126, 234, 0.04)',
                      transform: 'translateY(-1px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Sign In Instead
                </Button>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 4, textAlign: 'center', lineHeight: 1.6 }}>
                By creating an account, you agree to our{' '}
                <Link href="#" sx={{ color: '#667eea', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link href="#" sx={{ color: '#667eea', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                  Privacy Policy
                </Link>
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Verification Code Modal */}
      <Dialog open={showVerifyModal} disableEscapeKeyDown fullWidth maxWidth="xs">
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 700, color: '#764ba2' }}>
          Email Verification
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2, textAlign: 'center' }}>
            Please enter the 6-digit verification code sent to your email.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Verification Code"
            type="text"
            fullWidth
            value={verifyCode}
            onChange={e => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            inputProps={{ maxLength: 6, style: { letterSpacing: 8, fontSize: 24, textAlign: 'center' } }}
            error={!!verifyError}
            helperText={verifyError}
            disabled={isVerifying || timer === 0}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
            <Typography variant="body2" sx={{ color: timer > 60 ? '#1976d2' : '#c62828', fontWeight: 600 }}>
              Code expires in {timerDisplay}
            </Typography>
            <IconButton
              onClick={handleResendCode}
              disabled={resendCooldown > 0}
              color="primary"
              sx={{ ml: 1 }}
            >
              <Refresh />
            </IconButton>
          </Box>
          {resendCooldown > 0 && (
            <Typography variant="caption" sx={{ color: '#888', mt: 1, display: 'block', textAlign: 'right' }}>
              You can resend in {resendCooldown}s
            </Typography>
          )}
          {resendMsg && (
            <Typography variant="caption" sx={{ color: resendMsg.includes('new code') ? '#4CAF50' : '#c62828', mt: 1, display: 'block', textAlign: 'center' }}>
              {resendMsg}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button
            variant="contained"
            onClick={handleVerifyCode}
            disabled={isVerifying || verifyCode.length !== 6 || timer === 0}
            sx={{ fontWeight: 700, px: 4, background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
          >
            {isVerifying ? 'Verifying...' : 'Verify'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SignUp; 