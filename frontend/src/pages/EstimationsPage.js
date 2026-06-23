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
  useTheme,
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
import recipeService from '../services/recipeService';
import DataTable from '../components/DataTable';
import { formatCurrency, downloadFile } from '../utils/helpers';

const EstimationsPage = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [estimations, setEstimations] = useState([]);
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedEstimation, setSelectedEstimation] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [dishwiseIngredients, setDishwiseIngredients] = useState({});
  const [loadingRecipes, setLoadingRecipes] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [editedIngredients, setEditedIngredients] = useState({});
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
    profitMargin: 0,
    status: 'Draft'
  });

  useEffect(() => {
    fetchEstimations();
    fetchMenus();
  }, [page, limit, statusFilter]);

  const fetchEstimations = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await estimationService.getEstimations(page, limit, statusFilter);
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

  const isEstimationEditable = (status) => {
    return status !== 'Approved' && status !== 'Completed';
  };

  const handleViewClick = async (estimation) => {
    setSelectedEstimation(estimation);
    setSelectedStatus(estimation.status || 'Draft');
    setEditMode(false);
    setEditFormData({
      customerName: estimation.customerName,
      mobileNumber: estimation.mobileNumber,
      eventDate: estimation.eventDate?.split('T')[0],
      guestCount: estimation.guestCount,
      labourCost: estimation.labourCost || 0,
      gasCost: estimation.gasCost || 0,
      transportCost: estimation.transportCost || 0,
      miscellaneousCost: estimation.miscellaneousCost || 0,
      profitMargin: estimation.profitMargin || 0
    });
    const ingredientMap = {};
    estimation.ingredients?.forEach(ing => {
      ingredientMap[ing._id] = ing.requiredQty;
    });
    setEditedIngredients(ingredientMap);
    setViewDialogOpen(true);
    
    // Fetch dishwise ingredient details
    await fetchDishwiseIngredients(estimation);
  };

  const fetchDishwiseIngredients = async (estimation) => {
    if (!estimation.selectedMenus || estimation.selectedMenus.length === 0) {
      setDishwiseIngredients({});
      return;
    }

    setLoadingRecipes(true);
    const dishIngredients = {};

    try {
      for (const menu of estimation.selectedMenus) {
        const menuId = menu.menuId?._id || menu.menuId;
        try {
          const response = await recipeService.getRecipeByMenuId(menuId);
          const recipe = response.data.data;
          
          if (recipe && recipe.ingredients) {
            // Scale ingredients based on guest count
            const scaleFactor = estimation.guestCount / recipe.baseMembers;
            const scaledIngredients = recipe.ingredients.map(ing => ({
              ...ing,
              scaledQuantity: (ing.quantity * scaleFactor).toFixed(2)
            }));
            
            dishIngredients[menuId] = {
              menuName_en: menu.menuName_en || recipe.menuName_en,
              menuName_ta: menu.menuName_ta || recipe.menuName_ta,
              baseMembers: recipe.baseMembers,
              ingredients: scaledIngredients
            };
          }
        } catch (err) {
          console.error(`Error fetching recipe for menu ${menuId}:`, err);
        }
      }
      
      setDishwiseIngredients(dishIngredients);
    } catch (err) {
      console.error('Error fetching dishwise ingredients:', err);
    } finally {
      setLoadingRecipes(false);
    }
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

  const handleStatusUpdate = async () => {
    if (!selectedEstimation) return;
    try {
      setLoading(true);
      await estimationService.updateEstimation(selectedEstimation._id, { status: selectedStatus });
      setError('');
      setSuccess('Status updated successfully');
      setViewDialogOpen(false);
      fetchEstimations();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating status');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    if (isEstimationEditable(selectedEstimation?.status)) {
      setEditMode(true);
    }
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    
    // If guest count is changed, recalculate all ingredient quantities
    if (name === 'guestCount' && selectedEstimation) {
      const newGuestCount = parseInt(value) || 1;
      const originalGuestCount = selectedEstimation.guestCount;
      const scaleFactor = newGuestCount / originalGuestCount;
      
      // Scale all existing ingredient quantities
      const scaledIngredients = {};
      selectedEstimation.ingredients?.forEach(ing => {
        const originalQty = editedIngredients[ing._id] !== undefined ? editedIngredients[ing._id] : ing.requiredQty;
        scaledIngredients[ing._id] = parseFloat((originalQty * scaleFactor).toFixed(2));
      });
      
      setEditedIngredients(scaledIngredients);
    }
    
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleIngredientQtyChange = (ingredientId, newValue) => {
    setEditedIngredients(prev => ({
      ...prev,
      [ingredientId]: parseFloat(newValue) || 0
    }));
  };

  const handleEditSave = async () => {
    if (!editFormData.customerName || !editFormData.mobileNumber || !editFormData.eventDate) {
      setError('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      const updatedIngredients = selectedEstimation.ingredients.map(ing => ({
        ...ing,
        requiredQty: editedIngredients[ing._id] !== undefined ? editedIngredients[ing._id] : ing.requiredQty
      }));

      const payload = {
        customerName: editFormData.customerName,
        mobileNumber: editFormData.mobileNumber,
        eventDate: editFormData.eventDate,
        guestCount: parseInt(editFormData.guestCount),
        labourCost: parseFloat(editFormData.labourCost) || 0,
        gasCost: parseFloat(editFormData.gasCost) || 0,
        transportCost: parseFloat(editFormData.transportCost) || 0,
        miscellaneousCost: parseFloat(editFormData.miscellaneousCost) || 0,
        profitMargin: parseFloat(editFormData.profitMargin) || 0,
        ingredients: updatedIngredients
      };
      await estimationService.updateEstimation(selectedEstimation._id, payload);
      setError('');
      setSuccess('Estimation updated successfully');
      setEditMode(false);
      fetchEstimations();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating estimation');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async (id) => {
    try {
      setError('');
      const blob = await estimationService.exportToExcel(id);
      if (blob && blob.size > 0) {
        downloadFile(blob, `estimation_${id}.xlsx`);
      } else {
        setError('Excel file is empty');
      }
    } catch (err) {
      console.error('Export error:', err);
      setError(err.message || 'Error exporting to Excel');
    }
  };

  const handleExportPdf = async (id) => {
    try {
      setError('');
      const blob = await estimationService.exportToPdf(id);
      if (blob && blob.size > 0) {
        downloadFile(blob, `estimation_${id}.pdf`);
      } else {
        setError('PDF file is empty');
      }
    } catch (err) {
      console.error('Export error:', err);
      setError(err.message || 'Error exporting to PDF');
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
    { id: 'status', label: 'Status' },
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

      <Box sx={{ mb: 3, minWidth: 200 }}>
        <FormControl fullWidth>
          <InputLabel>Filter by Status</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            label="Filter by Status"
          >
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="Draft">Draft</MenuItem>
            <MenuItem value="Sent">Sent to Customer</MenuItem>
            <MenuItem value="Approved">Approved</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
          </Select>
        </FormControl>
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
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={formData.status}
              onChange={handleFormChange}
              label="Status"
            >
              <MenuItem value="Draft">Draft</MenuItem>
              <MenuItem value="Sent">Sent to Customer</MenuItem>
              <MenuItem value="Approved">Approved</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
            </Select>
          </FormControl>
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
        <DialogTitle>
          {editMode ? `${t('estimations.editEstimation')} - ${selectedEstimation?.customerName}` : t('estimations.viewEstimation')}
        </DialogTitle>
        {!isEstimationEditable(selectedEstimation?.status) && !editMode && (
          <Alert severity="info" sx={{ mx: 2, mt: 2 }}>
            This estimation is locked as its status is "{selectedEstimation?.status}". Status changes cannot be made.
          </Alert>
        )}
        <DialogContent sx={{ pt: 2 }}>
          {selectedEstimation && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {editMode ? (
                <>
                  <TextField
                    label={t('estimations.customerName')}
                    name="customerName"
                    value={editFormData.customerName}
                    onChange={handleEditFormChange}
                    fullWidth
                    required
                  />
                  <TextField
                    label={t('estimations.mobileNumber')}
                    name="mobileNumber"
                    value={editFormData.mobileNumber}
                    onChange={handleEditFormChange}
                    fullWidth
                    required
                  />
                  <TextField
                    label={t('estimations.eventDate')}
                    name="eventDate"
                    type="date"
                    value={editFormData.eventDate}
                    onChange={handleEditFormChange}
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    label={t('estimations.guestCount')}
                    name="guestCount"
                    type="number"
                    value={editFormData.guestCount}
                    onChange={handleEditFormChange}
                    fullWidth
                    required
                    inputProps={{ min: 1 }}
                  />
                  <TextField
                    label={t('estimations.labourCost')}
                    name="labourCost"
                    type="number"
                    value={editFormData.labourCost}
                    onChange={handleEditFormChange}
                    fullWidth
                    inputProps={{ step: '0.01', min: '0' }}
                  />
                  <TextField
                    label={t('estimations.gasCost')}
                    name="gasCost"
                    type="number"
                    value={editFormData.gasCost}
                    onChange={handleEditFormChange}
                    fullWidth
                    inputProps={{ step: '0.01', min: '0' }}
                  />
                  <TextField
                    label={t('estimations.transportCost')}
                    name="transportCost"
                    type="number"
                    value={editFormData.transportCost}
                    onChange={handleEditFormChange}
                    fullWidth
                    inputProps={{ step: '0.01', min: '0' }}
                  />
                  <TextField
                    label={t('estimations.miscellaneousCost')}
                    name="miscellaneousCost"
                    type="number"
                    value={editFormData.miscellaneousCost}
                    onChange={handleEditFormChange}
                    fullWidth
                    inputProps={{ step: '0.01', min: '0' }}
                  />
                  <TextField
                    label={t('estimations.profitMargin') + ' (%)'}
                    name="profitMargin"
                    type="number"
                    value={editFormData.profitMargin}
                    onChange={handleEditFormChange}
                    fullWidth
                    inputProps={{ step: '0.01', min: '0' }}
                  />
                </>
              ) : (
                <>
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
                </>
              )}

              <Box>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    label="Status"
                    disabled={!isEstimationEditable(selectedEstimation?.status) || editMode}
                  >
                    <MenuItem value="Draft">Draft</MenuItem>
                    <MenuItem value="Sent">Sent to Customer</MenuItem>
                    <MenuItem value="Approved">Approved</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                  </Select>
                </FormControl>
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
                        <TableCell align="right">
                          {editMode && isEstimationEditable(selectedEstimation?.status) ? (
                            <TextField
                              type="number"
                              size="small"
                              value={editedIngredients[ing._id] !== undefined ? editedIngredients[ing._id] : ing.requiredQty}
                              onChange={(e) => handleIngredientQtyChange(ing._id, e.target.value)}
                              disabled={true}
                              inputProps={{ step: '0.01', min: '0', style: { textAlign: 'right' } }}
                              sx={{ width: '100px' }}
                            />
                          ) : (
                            `${ing.requiredQty.toFixed(2)} ${ing.unit}`
                          )}
                        </TableCell>
                        <TableCell align="right">{formatCurrency(ing.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>{t('estimations.rawMaterialByDish')}</Typography>
                {loadingRecipes ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                    <CircularProgress size={30} />
                  </Box>
                ) : Object.keys(dishwiseIngredients).length > 0 ? (
                  Object.entries(dishwiseIngredients).map(([menuId, dishData]) => (
                    <Paper key={menuId} sx={{ p: 2, mb: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {dishData.menuName_en} ({dishData.menuName_ta})
                      </Typography>
                      <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1 }}>
                        For {selectedEstimation.guestCount} members (base: {dishData.baseMembers} members)
                      </Typography>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#f5f5f5' }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>{t('estimations.ingredient')}</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Required Qty</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {dishData.ingredients.map((ing, idx) => (
                            <TableRow key={idx}>
                              <TableCell>
                                {ing.ingredientName_en} ({ing.ingredientName_ta})
                              </TableCell>
                              <TableCell align="right">
                                {ing.scaledQuantity} {ing.unit}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Paper>
                  ))
                ) : (
                  <Typography variant="caption" color="textSecondary">
                    No recipe details available for selected dishes
                  </Typography>
                )}
              </Box>

              <Box sx={{ backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#f5f5f5', p: 2, borderRadius: 1 }}>
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
          {editMode ? (
            <>
              <Button onClick={() => setEditMode(false)}>{t('common.cancel')}</Button>
              <Button 
                onClick={handleEditSave} 
                variant="contained" 
                color="primary"
                disabled={loading}
              >
                {t('common.save')}
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => setViewDialogOpen(false)}>{t('common.close')}</Button>
              {isEstimationEditable(selectedEstimation?.status) && (
                <Button 
                  onClick={handleEditClick} 
                  variant="outlined"
                >
                  Edit
                </Button>
              )}
              {selectedStatus !== selectedEstimation?.status && isEstimationEditable(selectedEstimation?.status) && (
                <Button 
                  onClick={handleStatusUpdate} 
                  variant="contained" 
                  color="primary"
                  disabled={loading}
                >
                  Update Status
                </Button>
              )}
            </>
          )}
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
