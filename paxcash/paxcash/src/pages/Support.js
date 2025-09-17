import React from 'react';
import { Container, Typography, Box } from '@mui/material';

function Support() {
  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Box sx={{ p: 4, boxShadow: 3, borderRadius: 2, bgcolor: 'background.paper', textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom color="primary">
          Support
        </Typography>
        <Typography variant="body1" color="text.secondary">
          This is the Support page. You can contact support or get help here.
        </Typography>
      </Box>
    </Container>
  );
}

export default Support; 