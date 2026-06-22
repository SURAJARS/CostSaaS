import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper,
  Checkbox,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import ViewIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import estimationService from '../services/estimationService';
import menuService from '../services/menuService';
import DataTable from '../components/DataTable';
import { formatCurrency, downloadFile } from '../utils/helpers';

const EstimationsPage = () => {
  const { t } = useTranslation();
  const [estimations, setEstimations] = useState([]);
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedEstimation, setSelectedEstimation] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({
    customerName: '',
    mobileNumber: '',
    eventDate: '',
    guestCount: 1,
    selectedMenus: [],
    labourCost: 0,
    gasCost: 0,
    transportCost: 0,
    miscellaneousCost: 0,
    profitMargin: 15
  });

  useEffect(() => {
    fetchEstimations();
    fetchMenus();
  }, [page, limit]);

  const fetchEstimations = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await estimationService.getEstimations(page, limit);
      setEstimations(response.data.data);
      setTotal(response.data.pagination.total);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching estimations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMenus = async () => {
    try {
      const response = await menuService.getMenus(1, 100);
      setMenus(response.data.data);
    } catch (err) {
      console.error('Error fetching menus:', err);
    }
  };

  const handleAddClick = () => {
    setSelectedEstimation(null);
    setFormData({
      customerName: '',
      mobileNumber: '',
      eventDate: '',
      guestCount: 1,
      selectedMenus: [],
      labourCost: 0,
      gasCost: 0,
      transportCost: 0,
      miscellaneousCost: 0,
      profitMargin: 15
    });
    setDialogOpen(true);
  };

  const handleViewClick = (estimation) => {
    setSelectedEstimation(estimation);
    setViewDialogOpen(true);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setDeleteConfirmOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMenuToggle = (menuId) => {
    setFormData(prev => {
      const isSelected = prev.selectedMenus.find(m => m.menuId === menuId);
      if (isSelected) {
        return {
          ...prev,
          selectedMenus: prev.selectedMenus.filter(m => m.menuId !== menuId)
        };
      } else {
        return {
          ...prev,
          selectedMenus: [...prev.selectedMenus, { menuId }]
        };
      }
    });
  };

  const handleSave = async () => {
    if (!formData.customerName || !formData.mobileNumber || !formData.eventDate || formData.selectedMenus.length === 0) {
      setError('Please fill all required fields');
      return;
    }

    try {
      const payload = {
        customerName: formData.customerName,
        mobileNumber: formData.mobileNumber,
        eventDate: formData.eventDate,
        guestCount: parseInt(formData.guestCount),
        selectedMenus: formData.selectedMenus,
        labourCost: parseFloat(formData.labourCost) || 0,
        gasCost: parseFloat(formData.gasCost) || 0,
        transportCost: parseFloat(formData.transportCost) || 0,
        miscellaneousCost: parseFloat(formData.miscellaneousCost) || 0,
        profitMargin: parseFloat(formData.profitMargin) || 0
      };

      await estimationService.createEstimation(payload);
      setDialogOpen(false);
      setError('');
      setSuccess('Estimation created successfully');
      fetchEstimations();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving estimation');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await estimationService.deleteEstimation(deleteId);
      setDeleteConfirmOpen(false);
      setError('');
      setSuccess('Estimation deleted successfully');
      fetchEstimations();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting estimation');
    }
  };

  const handleExportExcel = async (id) => {
    try {
      const blob = await estimationService.exportToExcel(id);
      downloadFile(blob, `estimation_${id}.xlsx`);
    } catch (err) {
      setError('Error exporting to Excel');
    }
  };

  const handleExportPdf = async (id) => {
    try {
      const blob = await estimationService.exportToPdf(id);
      downloadFile(blob, `estimation_${id}.pdf`);
    } catch (err) {
      setError('Error exporting to PDF');
    }
  };

  const columns = [
    { id: 'customerName', label: t('estimations.customerName') },
    { id: 'mobileNumber', label: t('estimations.mobileNumber') },
    {
      id: 'eventDate',
      label: t('estimations.eventDate'),
      render: (row) => new Date(row.eventDate).toLocaleDateString('en-IN')
    },
    { id: 'guestCount', label: t('estimations.guestCount') },
    {
      id: 'grandTotal',
      label: t('estimations.grandTotal'),
      render: (row) => formatCurrency(row.grandTotal)
    },
    {
      id: 'actions',
      label: 'Actions',
      render: (row) => (
        <Box>
          <IconButton
            size="small"
            onClick={() => handleViewClick(row)}
            color="primary"
            title="View"
          >
            <ViewIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleExportExcel(row._id)}
            color="success"
            title="Export Excel"
          >
            <DownloadIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDeleteClick(row._id)}
            color="error"
            title="Delete"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      )
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Box sx={{ mb: 3 }}>
        <Button variant="contained" color="success" onClick={handleAddClick}>
          {t('estimations.addEstimation')}
        </Button>
      </Box>

      <DataTable
        columns={columns}
        rows={estimations}
        loading={loading}
        pagination={{ page, limit, total }}
        onPageChange={setPage}
        onRowsPerPageChange={setLimit}
      />

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('estimations.addEstimation')}</DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label={t('estimations.customerName')}
            name="customerName"
            value={formData.customerName}
            onChange={handleFormChange}
            fullWidth
            required
          />
          <TextField
            label={t('estimations.mobileNumber')}
            name="mobileNumber"
            value={formData.mobileNumber}
            onChange={handleFormChange}
            fullWidth
            required
          />
          <TextField
            label={t('estimations.eventDate')}
            name="eventDate"
            type="date"
            value={formData.eventDate}
            onChange={handleFormChange}
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label={t('estimations.guestCount')}
            name="guestCount"
            type="number"
            value={formData.guestCount}
            onChange={handleFormChange}
            fullWidth
            required
            inputProps={{ min: 1 }}
          />

          <Typography variant="subtitle2">{t('estimations.menus')}</Typography>
          {menus.map((menu) => (
            <FormControlLabel
              key={menu._id}
              control={
                <Checkbox
                  checked={formData.selectedMenus.some(m => m.menuId === menu._id)}
                  onChange={() => handleMenuToggle(menu._id)}
                />
              }
              label={`${menu.name_en} (${menu.name_ta})`}
            />
          ))}

          <TextField
            label={t('estimations.labourCost')}
            name="labourCost"
            type="number"
            value={formData.labourCost}
            onChange={handleFormChange}
            fullWidth
            inputProps={{ step: '0.01', min: '0' }}
          />
          <TextField
            label={t('estimations.gasCost')}
            name="gasCost"
            type="number"
            value={formData.gasCost}
            onChange={handleFormChange}
            fullWidth
            inputProps={{ step: '0.01', min: '0' }}
          />
          <TextField
            label={t('estimations.transportCost')}
            name="transportCost"
            type="number"
            value={formData.transportCost}
            onChange={handleFormChange}
            fullWidth
            inputProps={{ step: '0.01', min: '0' }}
          />
          <TextField
            label={t('estimations.miscellaneousCost')}
            name="miscellaneousCost"
            type="number"
            value={formData.miscellaneousCost}
            onChange={handleFormChange}
            fullWidth
            inputProps={{ step: '0.01', min: '0' }}
          />
          <TextField
            label={t('estimations.profitMargin') + ' (%)'}
            name="profitMargin"
            type="number"
            value={formData.profitMargin}
            onChange={handleFormChange}
            fullWidth
            inputProps={{ step: '0.01', min: '0' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>{t('common.cancel')}</Button>
          <Button onClick={handleSave} variant="contained" disabled={loading}>
            {t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('estimations.viewEstimation')}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedEstimation && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="subtitle2">{t('estimations.customerName')}</Typography>
                <Typography>{selectedEstimation.customerName}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2">{t('estimations.mobileNumber')}</Typography>
                <Typography>{selectedEstimation.mobileNumber}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2">{t('estimations.eventDate')}</Typography>
                <Typography>{new Date(selectedEstimation.eventDate).toLocaleDateString('en-IN')}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2">{t('estimations.guestCount')}</Typography>
                <Typography>{selectedEstimation.guestCount}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2">{t('estimations.ingredient')}</Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('estimations.ingredient')}</TableCell>
                      <TableCell align="right">{t('estimations.requiredQty')}</TableCell>
                      <TableCell align="right">{t('estimations.amount')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedEstimation.ingredients?.map((ing, index) => (
                      <TableRow key={index}>
                        <TableCell>{ing.ingredientName_en}</TableCell>
                        <TableCell align="right">{ing.requiredQty.toFixed(2)} {ing.unit}</TableCell>
                        <TableCell align="right">{formatCurrency(ing.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>

              <Box>
                <Typography variant="subtitle2">{t('estimations.rawMaterialByDish')}</Typography>
                <Paper sx={{ p: 2 }}>
                  {selectedEstimation.selectedMenus?.map((menu, idx) => {
                    const nameEn = menu.menuName_en || menu.menuId?.name_en || 'Unknown';
                    const nameTa = menu.menuName_ta || menu.menuId?.name_ta || 'Unknown';
                    return (
                      <Box key={idx} sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                          {nameEn} ({nameTa})
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Quantity: {menu.quantity || 1}
                        </Typography>
                      </Box>
                    );
                  })}
                </Paper>
              </Box>

              <Box sx={{ backgroundColor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">{t('estimations.rawMaterialCost')}</Typography>
                    <Typography>{formatCurrency(selectedEstimation.rawMaterialCost)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">{t('estimations.profitAmount')}</Typography>
                    <Typography>{formatCurrency(selectedEstimation.profitAmount)}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {t('estimations.grandTotal')}: {formatCurrency(selectedEstimation.grandTotal)}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={() => handleExportExcel(selectedEstimation._id)}
                  fullWidth
                >
                  {t('reports.exportExcel')}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => handleExportPdf(selectedEstimation._id)}
                  fullWidth
                >
                  {t('reports.exportPdf')}
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>{t('common.close')}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>Are you sure you want to delete this estimation?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EstimationsPage;
