import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Box,
  Divider,
  Typography
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import CalculateIcon from '@mui/icons-material/Calculate';
import DescriptionIcon from '@mui/icons-material/Description';
import PeopleIcon from '@mui/icons-material/People';
import LocalOffer from '@mui/icons-material/LocalOffer';

const Sidebar = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();

  const menuItems = [
    { label: t('navigation.dashboard'), icon: <DashboardIcon />, path: '/dashboard' },
    { label: t('navigation.ingredients'), icon: <ShoppingCartIcon />, path: '/ingredients' },
    { label: 'Expenses', icon: <LocalOffer />, path: '/expenses' },
    { label: t('navigation.menus'), icon: <RestaurantIcon />, path: '/menus' },
    { label: t('navigation.recipes'), icon: <MenuBookIcon />, path: '/recipes' },
    { label: 'Combos', icon: <RestaurantMenuIcon />, path: '/combos' },
    { label: t('navigation.estimations'), icon: <CalculateIcon />, path: '/estimations' },
    { label: t('navigation.reports'), icon: <DescriptionIcon />, path: '/reports' }
  ];

  const adminItems = [
    { label: t('navigation.users'), icon: <PeopleIcon />, path: '/users' }
  ];

  const handleNavigate = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <Drawer anchor="left" open={open} onClose={onClose}>
      <Box sx={{ width: 280, p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          Catering System
        </Typography>
        <Divider />
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              sx={{
                mb: 1,
                borderRadius: 1,
                '&:hover': { backgroundColor: 'action.hover' }
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItem>
          ))}
        </List>

        {user?.role === 'admin' && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', pl: 2, mb: 1 }}>
              Admin
            </Typography>
            <List>
              {adminItems.map((item) => (
                <ListItem
                  button
                  key={item.path}
                  onClick={() => handleNavigate(item.path)}
                  sx={{
                    mb: 1,
                    borderRadius: 1,
                    '&:hover': { backgroundColor: 'action.hover' }
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItem>
              ))}
            </List>
          </>
        )}
      </Box>
    </Drawer>
  );
};

export default Sidebar;
