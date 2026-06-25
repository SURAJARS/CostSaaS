import React from 'react';
import { Container, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Profile Page
      </Typography>
      <Typography>
        Profile page coming soon...
      </Typography>
      <Button onClick={() => navigate('/dashboard')} sx={{ mt: 2 }}>
        Back to Dashboard
      </Button>
    </Container>
  );
};

export default ProfilePage;
