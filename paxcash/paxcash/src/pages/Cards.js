import React from 'react';
import { Container, Paper, Typography, Box, Alert } from '@mui/material';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import ConstructionIcon from '@mui/icons-material/Construction';

function Cards() {
  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <CreditCardIcon sx={{ fontSize: 40, mr: 1, color: '#764ba2' }} />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Virtual Cards</Typography>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ConstructionIcon sx={{ mr: 1 }} />
            <Typography variant="body1">
              Virtual card services are currently under development. We're working on integrating 
              with a reliable virtual card provider to bring you secure and convenient virtual 
              payment solutions.
            </Typography>
          </Box>
        </Alert>

        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            Coming Soon
          </Typography>
          <Typography variant="body1" color="text.secondary">
            We'll notify you as soon as virtual card services become available.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}

export default Cards;