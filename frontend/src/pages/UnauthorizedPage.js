import React from 'react';
import { Container, Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 10, textAlign: 'center' }}>
        <Typography variant="h3" sx={{ mb: 2 }}>
          403 - Unauthorized
        </Typography>
        <Typography variant="h6" sx={{ mb: 4 }}>
          You do not have permission to access this resource.
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/dashboard')}
        >
          Back to Home
        </Button>
      </Box>
    </Container>
  );
};

export default UnauthorizedPage;
