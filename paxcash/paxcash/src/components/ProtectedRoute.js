import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  
  console.log('ProtectedRoute - isAuthenticated:', isAuthenticated, 'loading:', loading, 'user:', user);
  
  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '100vh' 
        }}
      >
        <CircularProgress size={60} sx={{ mb: 2 }} />
        <Typography variant="h6">Loading...</Typography>
      </Box>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute; 