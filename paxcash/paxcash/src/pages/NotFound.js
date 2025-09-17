import React from 'react';
import { Container, Typography } from '@mui/material';

function NotFound() {
  return (
    <Container sx={{ mt: 8 }}>
      <Typography variant="h3" color="error" gutterBottom>404</Typography>
      <Typography variant="h5">Page Not Found</Typography>
    </Container>
  );
}

export default NotFound; 