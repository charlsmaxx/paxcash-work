import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Alert, 
  CircularProgress,
  Link as MuiLink 
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Attempting login with:', formData.email);
      const result = await login(formData.email, formData.password);
      console.log('Login result:', result);
      
      if (result.success) {
        console.log('Login successful, redirecting to dashboard...');
        // Redirect to dashboard on successful login
        navigate('/dashboard');
      } else {
        console.log('Login failed:', result.message);
        setError(result.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box 
        sx={{ 
          mt: 8, 
          p: 4, 
          boxShadow: 3, 
          borderRadius: 2, 
          bgcolor: 'background.paper',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom color="primary">
          Welcome Back
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Sign in to your Paxcash account
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}

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
            autoComplete="email"
            autoFocus
          />
          
          <TextField
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            autoComplete="current-password"
          />
          
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Sign In'}
          </Button>
        </Box>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Don't have an account?{' '}
            <MuiLink component={Link} to="/signup" variant="body2">
              Sign up here
            </MuiLink>
          </Typography>
        </Box>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            <MuiLink component={Link} to="/" variant="body2">
              Back to Home
            </MuiLink>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}

export default Login; 