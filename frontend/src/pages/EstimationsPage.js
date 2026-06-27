import React, { useState, useEffect, useCallback } from 'react';
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
  Grid
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import ViewIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import estimationService from '../services/estimationService';
import menuService from '../services/menuService';
import recipeService from '../services/recipeService';
import DataTable from '../components/DataTable';
import { formatCurrency, downloadFile, formatQuantity } from '../utils/helpers';

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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedEstimation, setSelectedEstimation] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dishwiseIngredients, setDishwiseIngredients] = useState({});
  const [dishwiseExpenses, setDishwiseExpenses] = useState({});
  const [loadingRecipes, setLoadingRecipes] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [editedIngredients, setEditedIngredients] = useState({});
  const [menuSearchQuery, setMenuSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    chefName: '',
    eventDate: '',
    eventVenue: '',
    guestCount: 1,
    selectedMenus: [],
    labourCost: 0,
    gasCost: 0,
    transportCost: 0,
    miscellaneousCost: 0,
    profitMargin: 0
  });

  const fetchEstimations = useCallback(async () => {
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
  }, [page, limit]);

  const fetchMenus = useCallback(async () => {
    try {
      const response = await menuService.getMenus(1, 100);
      setMenus(response.data.data);
    } catch (err) {
      console.error('Error fetching menus:', err);
    }
  }, []);

  useEffect(() => {
    fetchEstimations();
    fetchMenus();
  }, [fetchEstimations, fetchMenus]);

  const handleAddClick = () => {
    setSelectedEstimation(null);
    setMenuSearchQuery('');
    setFormData({
      chefName: '',
      eventDate: '',
      eventVenue: '',
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

  const handleViewClick = async (estimation) => {
    setSelectedEstimation(estimation);
    setEditMode(false);
    setEditFormData({
      chefName: estimation.chefName,
      eventDate: estimation.eventDate?.split('T')[0],
      eventVenue: estimation.eventVenue,
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
    
    // Fetch dishwise ingredient and expense details
    await fetchDishwiseIngredientsAndExpenses(estimation);
  };

  const fetchDishwiseIngredientsAndExpenses = async (estimation) => {
    if (!estimation.selectedMenus || estimation.selectedMenus.length === 0) {
      setDishwiseIngredients({});
      setDishwiseExpenses({});
      return;
    }

    setLoadingRecipes(true);
    const dishIngredients = {};
    const dishExpenses = {};

    try {
      for (const menu of estimation.selectedMenus) {
        const menuId = menu.menuId?._id || menu.menuId;
        try {
          const response = await recipeService.getRecipeByMenuId(menuId);
          const recipe = response.data.data;
          
          if (recipe) {
            const scaleFactor = estimation.guestCount / recipe.baseMembers;
            
            // Scale ingredients
            if (recipe.ingredients && recipe.ingredients.length > 0) {
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
            
            // Scale expenses
            if (recipe.expenses && recipe.expenses.length > 0) {
              const scaledExpenses = recipe.expenses.map(expense => ({
                ...expense,
                scaledAmount: (expense.amount * scaleFactor).toFixed(2)
              }));
              
              dishExpenses[menuId] = {
                menuName_en: menu.menuName_en || recipe.menuName_en,
                menuName_ta: menu.menuName_ta || recipe.menuName_ta,
                baseMembers: recipe.baseMembers,
                expenses: scaledExpenses
              };
            }
          }
        } catch (err) {
          console.error(`Error fetching recipe for menu ${menuId}:`, err);
        }
      }
      
      setDishwiseIngredients(dishIngredients);
      setDishwiseExpenses(dishExpenses);
    } catch (err) {
      console.error('Error fetching dishwise ingredients and expenses:', err);
    } finally {
      setLoadingRecipes(false);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setDeleteConfirmOpen(true);
  };

  const handleEstimationSearch = (query = null) => {
    const searchTerm = query !== null ? query : searchQuery;

    if (!searchTerm.trim()) {
      fetchEstimations();
      return;
    }

    // Filter estimations based on chef name, venue, or other details
    const filtered = estimations.filter(estimation =>
      estimation.chefName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      estimation.eventVenue?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      estimation._id?.toString().includes(searchTerm)
    );

    setEstimations(filtered);
  };

  const handleEstimationSearchInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    // Trigger search as user types (real-time)
    if (query.trim() || query === '') {
      handleEstimationSearch(query);
    }
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

  const getFilteredMenus = () => {
    if (!menuSearchQuery.trim()) {
      return menus;
    }
    return menus.filter(menu =>
      menu.name_en.toLowerCase().includes(menuSearchQuery.toLowerCase()) ||
      menu.name_ta.toLowerCase().includes(menuSearchQuery.toLowerCase())
    );
  };

  const handleSave = async () => {
    if (!formData.chefName || !formData.eventDate || !formData.eventVenue || formData.selectedMenus.length === 0) {
      setError('Please fill all required fields');
      return;
    }

    try {
      const payload = {
        chefName: formData.chefName,
        eventDate: formData.eventDate,
        eventVenue: formData.eventVenue,
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



  const handleEditClick = () => {
    setEditMode(true);
  };



  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    
    // If guest count is changed, recalculate all ingredient quantities and amounts
    if (name === 'guestCount' && selectedEstimation) {
      const newGuestCount = parseInt(value) || 1;
      const originalGuestCount = selectedEstimation.guestCount;
      const scaleFactor = newGuestCount / originalGuestCount;
      
      // Scale all existing ingredient quantities
      const scaledIngredients = {};
      selectedEstimation.ingredients?.forEach(ing => {
        // Get the original quantity (from stored edit value or current value)
        const originalQty = editedIngredients[ing._id] !== undefined ? editedIngredients[ing._id] : ing.requiredQty;
        const newQty = parseFloat((originalQty * scaleFactor).toFixed(2));
        scaledIngredients[ing._id] = newQty;
      });
      
      setEditedIngredients(scaledIngredients);
    }
    
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSave = async () => {
    if (!editFormData.chefName || !editFormData.eventDate || !editFormData.eventVenue) {
      setError('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      // Keep original ingredients unchanged
      const payload = {
        chefName: editFormData.chefName,
        eventDate: editFormData.eventDate,
        eventVenue: editFormData.eventVenue,
        guestCount: parseInt(editFormData.guestCount),
        labourCost: parseFloat(editFormData.labourCost) || 0,
        gasCost: parseFloat(editFormData.gasCost) || 0,
        transportCost: parseFloat(editFormData.transportCost) || 0,
        miscellaneousCost: parseFloat(editFormData.miscellaneousCost) || 0,
        profitMargin: parseFloat(editFormData.profitMargin) || 0
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
    { id: 'chefName', label: 'Chef Name' },
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

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, gap: 2 }}>
        <TextField
          placeholder={t('common.search')}
          value={searchQuery}
          onChange={handleEstimationSearchInputChange}
          size="small"
          fullWidth
          variant="outlined"
        />
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
      <Dialog open={dialogOpen} onClose={() => {
        setDialogOpen(false);
        setMenuSearchQuery('');
      }} maxWidth="sm" fullWidth>
        <DialogTitle>{t('estimations.addEstimation')}</DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Chef Name"
            name="chefName"
            value={formData.chefName}
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
            label="Event Venue"
            name="eventVenue"
            value={formData.eventVenue}
            onChange={handleFormChange}
            fullWidth
            required
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
          <TextField
            placeholder="Search menus..."
            value={menuSearchQuery}
            onChange={(e) => setMenuSearchQuery(e.target.value)}
            size="small"
            fullWidth
            sx={{ mb: 2 }}
          />
          {getFilteredMenus().map((menu) => (
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
      <Dialog open={viewDialogOpen} onClose={() => {
        setViewDialogOpen(false);
        setEditMode(false);
        setEditedIngredients({});
      }} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editMode ? `${t('estimations.editEstimation')} - ${selectedEstimation?.chefName}` : t('estimations.viewEstimation')}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedEstimation && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {editMode ? (
                <>
                  <TextField
                    label="Chef Name"
                    name="chefName"
                    value={editFormData.chefName}
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
                    label="Event Venue"
                    name="eventVenue"
                    value={editFormData.eventVenue}
                    onChange={handleEditFormChange}
                    fullWidth
                    required
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
                    <Typography variant="subtitle2">Chef Name</Typography>
                    <Typography>{selectedEstimation.chefName}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2">{t('estimations.eventDate')}</Typography>
                    <Typography>{new Date(selectedEstimation.eventDate).toLocaleDateString('en-IN')}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2">Event Venue</Typography>
                    <Typography>{selectedEstimation.eventVenue}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2">{t('estimations.guestCount')}</Typography>
                    <Typography>{selectedEstimation.guestCount}</Typography>
                  </Box>
                </>
              )}

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
                          {formatQuantity(ing.requiredQty, ing.unit)}
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
                                {formatQuantity(ing.scaledQuantity, ing.unit)}
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

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>Expenses by Dish</Typography>
                {loadingRecipes ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                    <CircularProgress size={30} />
                  </Box>
                ) : Object.keys(dishwiseExpenses).length > 0 ? (
                  Object.entries(dishwiseExpenses).map(([menuId, dishData]) => (
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
                            <TableCell sx={{ fontWeight: 'bold' }}>Expense</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Scaled Amount</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {dishData.expenses.map((expense, idx) => (
                            <TableRow key={idx}>
                              <TableCell>
                                {expense.name_en} ({expense.name_ta})
                              </TableCell>
                              <TableCell align="right">
                                {formatCurrency(expense.scaledAmount)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Paper>
                  ))
                ) : (
                  <Typography variant="caption" color="textSecondary">
                    No expenses associated with selected dishes
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
              <Button 
                onClick={handleEditClick} 
                variant="outlined"
              >
                Edit
              </Button>
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
