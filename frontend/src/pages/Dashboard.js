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
  const [analytics, setAnalytics] = useState(null);
  const [recentEstimations, setRecentEstimations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [ingredients, menus, recipes, estimations, recentEsts, analyticsData] = await Promise.all([
        ingredientService.getIngredients(1, 1),
        menuService.getMenus(1, 1),
        recipeService.getRecipes(1, 1),
        estimationService.getEstimations(1, 1),
        estimationService.getEstimations(1, 5),
        estimationService.getAnalytics()
      ]);

      setStats({
        totalIngredients: ingredients.data.pagination.total,
        totalMenus: menus.data.pagination.total,
        totalRecipes: recipes.data.pagination.total,
        totalEstimations: estimations.data.pagination.total
      });
      
      setRecentEstimations(recentEsts.data.data || []);
      setAnalytics(analyticsData.data.data);
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
        
        {recentEstimations && recentEstimations.length > 0 ? (
          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ddd', backgroundColor: '#f5f5f5' }}>
                  <th style={{ textAlign: 'left', padding: '12px' }}>Customer Name</th>
                  <th style={{ textAlign: 'left', padding: '12px' }}>Event Date</th>
                  <th style={{ textAlign: 'center', padding: '12px' }}>Guest Count</th>
                  <th style={{ textAlign: 'center', padding: '12px' }}>Status</th>
                  <th style={{ textAlign: 'right', padding: '12px' }}>Grand Total</th>
                </tr>
              </thead>
              <tbody>
                {recentEstimations.map((est) => (
                  <tr key={est._id} style={{ borderBottom: '1px solid #eee', '&:hover': { backgroundColor: '#f9f9f9' } }}>
                    <td style={{ padding: '12px' }}>{est.customerName}</td>
                    <td style={{ padding: '12px' }}>{new Date(est.eventDate).toLocaleDateString('en-IN')}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>{est.guestCount}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        backgroundColor: 
                          est.status === 'Draft' ? '#fff3cd' :
                          est.status === 'Sent' ? '#d1ecf1' :
                          est.status === 'Approved' ? '#d4edda' :
                          '#d6d8db',
                        color:
                          est.status === 'Draft' ? '#856404' :
                          est.status === 'Sent' ? '#0c5460' :
                          est.status === 'Approved' ? '#155724' :
                          '#383d41'
                      }}>
                        {est.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>
                      Rs. {est.grandTotal?.toFixed(2) || '0.00'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        ) : (
          <Typography color="textSecondary">
            No estimations yet. {' '}
            <Button
              color="primary"
              onClick={() => navigate('/estimations')}
              sx={{ textTransform: 'none', p: 0 }}
            >
              Create one now
            </Button>
          </Typography>
        )}
      </Paper>

      {/* Quick Statistics */}
      {analytics && (
        <>
          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
            Quick Statistics
          </Typography>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Estimations
                  </Typography>
                  <Typography variant="h5">
                    {analytics.statistics.totalEstimations}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Revenue
                  </Typography>
                  <Typography variant="h5" sx={{ color: 'success.main' }}>
                    Rs. {analytics.statistics.totalRevenue}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Avg Profit Margin
                  </Typography>
                  <Typography variant="h5" sx={{ color: 'info.main' }}>
                    {analytics.statistics.avgProfitMargin}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Draft Estimations
                  </Typography>
                  <Typography variant="h5" sx={{ color: 'warning.main' }}>
                    {analytics.statusDistribution?.Draft || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Status Distribution */}
          <Typography variant="h6" sx={{ mb: 2 }}>
            Estimation Status Distribution
          </Typography>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="textSecondary">
                    Draft
                  </Typography>
                  <Typography variant="h6">
                    {analytics.statusDistribution?.Draft || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="textSecondary">
                    Sent
                  </Typography>
                  <Typography variant="h6">
                    {analytics.statusDistribution?.Sent || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="textSecondary">
                    Approved
                  </Typography>
                  <Typography variant="h6">
                    {analytics.statusDistribution?.Approved || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="textSecondary">
                    Completed
                  </Typography>
                  <Typography variant="h6">
                    {analytics.statusDistribution?.Completed || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Cost Comparison by Menu */}
          <Typography variant="h6" sx={{ mb: 2 }}>
            Cost Analysis by Menu
          </Typography>
          <Paper sx={{ p: 2, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ddd' }}>
                  <th style={{ textAlign: 'left', padding: '10px' }}>Menu Name</th>
                  <th style={{ textAlign: 'left', padding: '10px' }}>Estimates</th>
                  <th style={{ textAlign: 'left', padding: '10px' }}>Avg Cost/Guest</th>
                  <th style={{ textAlign: 'left', padding: '10px' }}>Avg Profit Margin</th>
                  <th style={{ textAlign: 'left', padding: '10px' }}>Total Profit</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(analytics.menuAnalytics || {}).map(([menu, data]) => (
                  <tr key={menu} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px' }}>{menu}</td>
                    <td style={{ padding: '10px' }}>{data.totalEstimates}</td>
                    <td style={{ padding: '10px' }}>Rs. {data.avgCostPerGuest}</td>
                    <td style={{ padding: '10px' }}>{data.avgProfitMargin}%</td>
                    <td style={{ padding: '10px', color: 'green' }}>Rs. {data.totalProfit.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Paper>
        </>
      )}
    </Container>
  );
};

export default Dashboard;
