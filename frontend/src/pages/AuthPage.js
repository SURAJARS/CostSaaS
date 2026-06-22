import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';

const AuthPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { login, register, loading, error } = useAuth();
  const [tab, setTab] = useState(0);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: ''
  });

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(loginData.email, loginData.password);
      navigate('/dashboard');
    } catch (err) {
      // Error handled in context
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await register(registerData);
      setTab(0);
      setLoginData({ email: registerData.email, password: registerData.password });
    } catch (err) {
      // Error handled in context
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" align="center" sx={{ mb: 3 }}>
            Catering Cost Estimation System
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)}>
            <Tab label={t('auth.login')} />
            <Tab label={t('auth.register')} />
          </Tabs>

          {/* Login Tab */}
          {tab === 0 && (
            <Box component="form" onSubmit={handleLogin} sx={{ mt: 3 }}>
              <TextField
                label={t('auth.email')}
                name="email"
                type="email"
                value={loginData.email}
                onChange={handleLoginChange}
                fullWidth
                margin="normal"
                required
              />
              <TextField
                label={t('auth.password')}
                name="password"
                type="password"
                value={loginData.password}
                onChange={handleLoginChange}
                fullWidth
                margin="normal"
                required
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{ mt: 3 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : t('auth.login')}
              </Button>

              <Typography align="center" sx={{ mt: 2, fontSize: '0.875rem' }}>
                Demo Credentials:<br/>
                Admin: admin@example.com / admin123<br/>
                Staff: staff@example.com / staff123
              </Typography>
            </Box>
          )}

          {/* Register Tab */}
          {tab === 1 && (
            <Box component="form" onSubmit={handleRegister} sx={{ mt: 3 }}>
              <TextField
                label={t('auth.username')}
                name="username"
                value={registerData.username}
                onChange={handleRegisterChange}
                fullWidth
                margin="normal"
                required
              />
              <TextField
                label={t('auth.email')}
                name="email"
                type="email"
                value={registerData.email}
                onChange={handleRegisterChange}
                fullWidth
                margin="normal"
                required
              />
              <TextField
                label={t('auth.firstName')}
                name="firstName"
                value={registerData.firstName}
                onChange={handleRegisterChange}
                fullWidth
                margin="normal"
                required
              />
              <TextField
                label={t('auth.lastName')}
                name="lastName"
                value={registerData.lastName}
                onChange={handleRegisterChange}
                fullWidth
                margin="normal"
                required
              />
              <TextField
                label={t('auth.phone')}
                name="phone"
                value={registerData.phone}
                onChange={handleRegisterChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label={t('auth.password')}
                name="password"
                type="password"
                value={registerData.password}
                onChange={handleRegisterChange}
                fullWidth
                margin="normal"
                required
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{ mt: 3 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : t('auth.register')}
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default AuthPage;
