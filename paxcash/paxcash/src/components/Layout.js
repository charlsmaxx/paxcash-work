import React from 'react';
import { Box } from '@mui/material';
import Navbar from './Navbar';

function Layout({ children }) {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Box component="main">
        {children}
      </Box>
    </Box>
  );
}

export default Layout; 