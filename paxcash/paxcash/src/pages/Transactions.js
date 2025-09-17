import React from 'react';
import { Container, Typography, Box } from '@mui/material';

function Transactions() {
  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Box sx={{ p: 4, boxShadow: 3, borderRadius: 2, bgcolor: 'background.paper', textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom color="primary">
          Transactions
        </Typography>
        <Typography variant="body1" color="text.secondary">
          This is the Transactions page. Your transaction history will appear here.
        </Typography>
      </Box>
    </Container>
  );
}

export default Transactions; 