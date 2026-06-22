import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Paper,
  Button
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import ingredientService from '../services/ingredientService';
import menuService from '../services/menuService';
import recipeService from '../services/recipeService';
import estimationService from '../services/estimationService';

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalIngredients: 0,
    totalMenus: 0,
    totalRecipes: 0,
    totalEstimations: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [ingredients, menus, recipes, estimations] = await Promise.all([
        ingredientService.getIngredients(1, 1),
        menuService.getMenus(1, 1),
        recipeService.getRecipes(1, 1),
        estimationService.getEstimations(1, 1)
      ]);

      setStats({
        totalIngredients: ingredients.data.pagination.total,
        totalMenus: menus.data.pagination.total,
        totalRecipes: recipes.data.pagination.total,
        totalEstimations: estimations.data.pagination.total
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, color = 'primary' }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="textSecondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h5" sx={{ color: `${color}.main` }}>
              {loading ? <CircularProgress size={24} /> : value}
            </Typography>
          </Box>
          <Box sx={{ fontSize: '2.5rem', color: `${color}.main` }}>
            📊
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        {t('dashboard.title')}
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('dashboard.totalIngredients')}
            value={stats.totalIngredients}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('dashboard.totalMenus')}
            value={stats.totalMenus}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('dashboard.totalRecipes')}
            value={stats.totalRecipes}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('dashboard.totalEstimations')}
            value={stats.totalEstimations}
            color="error"
          />
        </Grid>
      </Grid>

      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            {t('dashboard.recentEstimations')}
          </Typography>
          <Button
            variant="contained"
            color="success"
            startIcon={<AddIcon />}
            onClick={() => navigate('/estimations')}
            size="small"
          >
            {t('estimations.createEstimation')}
          </Button>
        </Box>
        <Typography color="textSecondary">
          Recent estimations data will be displayed here
        </Typography>
      </Paper>
    </Container>
  );
};

export default Dashboard;
