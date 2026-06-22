import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Menu,
  MenuItem,
  IconButton,
  Avatar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import MenuIcon from '@mui/icons-material/Menu';

const Navigation = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [languageAnchor, setLanguageAnchor] = React.useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageOpen = (event) => {
    setLanguageAnchor(event.currentTarget);
  };

  const handleLanguageClose = () => {
    setLanguageAnchor(null);
  };

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
    handleLanguageClose();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleMenuClose();
  };

  return (
    <AppBar position="sticky">
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {t('dashboard.title')} - Kasikannu
        </Typography>

        <Button
          color="inherit"
          onClick={handleLanguageOpen}
          sx={{ mr: 2 }}
        >
          {i18n.language === 'en' ? 'EN' : 'TA'}
        </Button>
        <Menu
          anchorEl={languageAnchor}
          open={Boolean(languageAnchor)}
          onClose={handleLanguageClose}
        >
          <MenuItem onClick={() => handleLanguageChange('en')}>English</MenuItem>
          <MenuItem onClick={() => handleLanguageChange('ta')}>தமிழ்</MenuItem>
        </Menu>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ mr: 1 }}>{user?.firstName?.charAt(0)}</Avatar>
          <Button
            color="inherit"
            onClick={handleMenuOpen}
          >
            {user?.firstName}
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
              {t('common.profile')}
            </MenuItem>
            <MenuItem onClick={() => { navigate('/settings'); handleMenuClose(); }}>
              {t('common.settings')}
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              {t('auth.logout')}
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;
