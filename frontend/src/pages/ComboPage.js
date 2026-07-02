import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Box,
  Button,
  TextField,
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
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Grid,
  Checkbox,
  FormControlLabel,
  Autocomplete
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import comboService from '../services/comboService';
import menuService from '../services/menuService';
import ingredientService from '../services/ingredientService';
import expenseService from '../services/expenseService';
import DataTable from '../components/DataTable';

const ComboPage = () => {
  const { t } = useTranslation();
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCombo, setSelectedCombo] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  
  const [menus, setMenus] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [expenses, setExpenses] = useState([]);
  
  const [formData, setFormData] = useState({
    name_en: '',
    name_ta: '',
    description_en: '',
    description_ta: '',
    baseMembers: 1,
    selectedMenus: [],
    ingredients: [],
    expenses: [],
    status: 'active'
  });

  const [selectedMenuIds, setSelectedMenuIds] = useState([]);
  const [selectedIngredientId, setSelectedIngredientId] = useState('');
  const [ingredientQuantity, setIngredientQuantity] = useState('');
  const [ingredientUnit, setIngredientUnit] = useState('kg');
  const [ingredientSearchInput, setIngredientSearchInput] = useState('');
  const [selectedExpenseId, setSelectedExpenseId] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseSearchInput, setExpenseSearchInput] = useState('');

  const fetchCombos = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await comboService.getCombos(page, limit);
      setCombos(response.data.data);
      setTotal(response.data.pagination.total);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching combos');
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  const fetchMenus = useCallback(async () => {
    try {
      const response = await menuService.getMenus(1, 500);
      setMenus(response.data.data);
    } catch (err) {
      console.error('Error fetching menus:', err);
    }
  }, []);

  const fetchIngredients = useCallback(async () => {
    try {
      const response = await ingredientService.getIngredients(1, 500);
      setIngredients(response.data.data);
    } catch (err) {
      console.error('Error fetching ingredients:', err);
    }
  }, []);

  const fetchExpenses = useCallback(async () => {
    try {
      const response = await expenseService.getExpenses(1, 500);
      setExpenses(response.data.data);
    } catch (err) {
      console.error('Error fetching expenses:', err);
    }
  }, []);

  useEffect(() => {
    fetchCombos();
    fetchMenus();
    fetchIngredients();
    fetchExpenses();
  }, [fetchCombos, fetchMenus, fetchIngredients, fetchExpenses]);

  const handleAddClick = () => {
    setSelectedCombo(null);
    setFormData({
      name_en: '',
      name_ta: '',
      description_en: '',
      description_ta: '',
      baseMembers: 1,
      selectedMenus: [],
      ingredients: [],
      expenses: [],
      status: 'active'
    });
    setSelectedMenuIds([]);
    setSelectedIngredientId('');
    setIngredientQuantity('');
    setIngredientUnit('kg');
    setIngredientSearchInput('');
    setSelectedExpenseId('');
    setExpenseAmount('');
    setExpenseSearchInput('');
    setDialogOpen(true);
  };

  const handleEditClick = (combo) => {
    setSelectedCombo(combo);
    setFormData({
      name_en: combo.name_en,
      name_ta: combo.name_ta,
      description_en: combo.description_en || '',
      description_ta: combo.description_ta || '',
      baseMembers: combo.baseMembers || 1,
      selectedMenus: combo.selectedMenus || [],
      ingredients: combo.ingredients || [],
      expenses: combo.expenses || [],
      status: combo.status
    });
    setSelectedMenuIds([]);
    setDialogOpen(true);
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
    setSelectedMenuIds(prev => {
      if (prev.includes(menuId)) {
        return prev.filter(id => id !== menuId);
      } else {
        return [...prev, menuId];
      }
    });
  };

  const handleAddMenuItems = () => {
    if (selectedMenuIds.length === 0) {
      setError('Please select at least one menu item');
      return;
    }

    // Helper to extract menuId as string (handles both string IDs and object references)
    const getMenuIdString = (menuId) => {
      if (!menuId) return '';
      if (typeof menuId === 'object' && menuId._id) return String(menuId._id).trim();
      return String(menuId).trim();
    };

    const newMenus = selectedMenuIds
      .filter(id => !formData.selectedMenus.find(m => getMenuIdString(m.menuId) === String(id).trim()))
      .map(id => {
        const menu = menus.find(m => String(m._id).trim() === String(id).trim());
        return {
          menuId: String(id).trim(),
          menuName_en: menu?.name_en || '',
          menuName_ta: menu?.name_ta || ''
        };
      });

    setFormData(prev => ({
      ...prev,
      selectedMenus: [...prev.selectedMenus, ...newMenus]
    }));
    setSelectedMenuIds([]);
    setError('');
  };

  const handleRemoveMenuItem = (menuId) => {
    setFormData(prev => ({
      ...prev,
      selectedMenus: prev.selectedMenus.filter(m => String(m.menuId) !== String(menuId))
    }));
  };

  const handleAddIngredient = () => {
    if (!selectedIngredientId || !ingredientQuantity) {
      setError('Please select ingredient and enter quantity');
      return;
    }

    const ingredient = ingredients.find(i => String(i._id).trim() === String(selectedIngredientId).trim());
    const newIngredient = {
      ingredientId: String(selectedIngredientId).trim(),
      ingredientName_en: ingredient?.name_en || '',
      ingredientName_ta: ingredient?.name_ta || '',
      quantity: parseFloat(ingredientQuantity),
      unit: String(ingredientUnit).trim()
    };

    const existingIndex = formData.ingredients.findIndex(
      i => String(i.ingredientId).trim() === String(selectedIngredientId).trim()
    );

    if (existingIndex >= 0) {
      const updated = [...formData.ingredients];
      updated[existingIndex].quantity += parseFloat(ingredientQuantity);
      setFormData(prev => ({ ...prev, ingredients: updated }));
    } else {
      setFormData(prev => ({
        ...prev,
        ingredients: [...prev.ingredients, newIngredient]
      }));
    }

    setSelectedIngredientId('');
    setIngredientQuantity('');
    setIngredientUnit('kg');
    setIngredientSearchInput('');
    setError('');
  };

  const handleRemoveIngredient = (ingredientId) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter(i => String(i.ingredientId) !== String(ingredientId))
    }));
  };

  const handleAddExpense = () => {
    if (!selectedExpenseId || !expenseAmount) {
      setError('Please select expense and enter amount');
      return;
    }

    const newExpense = {
      expenseId: String(selectedExpenseId).trim(),
      amount: parseFloat(expenseAmount)
    };

    setFormData(prev => ({
      ...prev,
      expenses: [...prev.expenses, newExpense]
    }));

    setSelectedExpenseId('');
    setExpenseAmount('');
    setExpenseSearchInput('');
    setError('');
  };

  const handleRemoveExpense = (index) => {
    setFormData(prev => ({
      ...prev,
      expenses: prev.expenses.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    try {
      if (!formData.name_en || !formData.name_ta) {
        setError('Combo names in both languages are required');
        return;
      }

      if (!formData.baseMembers || formData.baseMembers < 1) {
        setError('Base members is required and must be at least 1');
        return;
      }

      if (formData.selectedMenus.length === 0) {
        setError('Please add at least one menu item');
        return;
      }

      if (formData.ingredients.length === 0) {
        setError('Please add at least one ingredient');
        return;
      }

      // Helper to extract ID strings from mixed types (object with _id or direct string)
      const extractId = (id) => {
        if (!id) return '';
        if (typeof id === 'object' && id._id) return String(id._id).trim();
        return String(id).trim();
      };

      const dataToSend = {
        name_en: formData.name_en.trim(),
        name_ta: formData.name_ta.trim(),
        description_en: formData.description_en || '',
        description_ta: formData.description_ta || '',
        baseMembers: Number(formData.baseMembers),
        selectedMenus: formData.selectedMenus.map(m => ({
          menuId: extractId(m.menuId),
          menuName_en: m.menuName_en || '',
          menuName_ta: m.menuName_ta || ''
        })),
        ingredients: formData.ingredients.map(i => ({
          ingredientId: extractId(i.ingredientId),
          ingredientName_en: i.ingredientName_en || '',
          ingredientName_ta: i.ingredientName_ta || '',
          quantity: Number(i.quantity),
          unit: String(i.unit).trim()
        })),
        expenses: formData.expenses.map(e => ({
          expenseId: extractId(e.expenseId),
          amount: Number(e.amount)
        })),
        status: formData.status || 'active'
      };

      if (selectedCombo) {
        await comboService.updateCombo(selectedCombo._id, dataToSend);
      } else {
        await comboService.createCombo(dataToSend);
      }
      setDialogOpen(false);
      setError('');
      setSuccess('Combo saved successfully!');
      fetchCombos();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving combo');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await comboService.deleteCombo(deleteId);
      setDeleteConfirmOpen(false);
      setError('');
      setSuccess('Combo deleted successfully!');
      fetchCombos();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting combo');
    }
  };

  const [success, setSuccess] = useState('');

  const columns = [
    { id: 'name_en', label: t('combos.nameEnglish') },
    { id: 'name_ta', label: t('combos.nameTamil') },
    {
      id: 'selectedMenus',
      label: t('combos.menuItems'),
      render: (row) => {
        const menuList = Array.isArray(row.selectedMenus) 
          ? row.selectedMenus.map(m => m.menuName_en || m.menuId?.name_en).join(', ')
          : '';
        return menuList || '-';
      }
    },
    {
      id: 'ingredients',
      label: t('combos.ingredients'),
      render: (row) => {
        return Array.isArray(row.ingredients) ? row.ingredients.length : 0;
      }
    },
    { id: 'status', label: t('combos.status') },
    {
      id: 'actions',
      label: 'Actions',
      render: (row) => (
        <Box>
          <IconButton
            size="small"
            onClick={() => handleEditClick(row)}
            color="primary"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDeleteClick(row._id)}
            color="error"
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
          size="small"
          fullWidth
          variant="outlined"
        />
        <Button variant="contained" color="success" onClick={handleAddClick}>
          {t('combos.addCombo')}
        </Button>
      </Box>

      <DataTable
        columns={columns}
        rows={combos}
        loading={loading}
        pagination={{ page, limit, total }}
        onPageChange={setPage}
        onRowsPerPageChange={setLimit}
      />

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedCombo ? t('combos.editCombo') : t('combos.addCombo')}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('combos.nameEnglish')}
                name="name_en"
                value={formData.name_en}
                onChange={handleFormChange}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('combos.nameTamil')}
                name="name_ta"
                value={formData.name_ta}
                onChange={handleFormChange}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('combos.descriptionEnglish')}
                name="description_en"
                value={formData.description_en}
                onChange={handleFormChange}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('combos.descriptionTamil')}
                name="description_ta"
                value={formData.description_ta}
                onChange={handleFormChange}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('combos.status')}</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleFormChange}
                  label={t('combos.status')}
                >
                  <MenuItem value="active">{t('common.active')}</MenuItem>
                  <MenuItem value="inactive">{t('common.inactive')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label={t('combos.baseMembers')}
                name="baseMembers"
                value={formData.baseMembers}
                onChange={handleFormChange}
                size="small"
                inputProps={{ min: 1 }}
                required
              />
            </Grid>

            {/* Selected Menus */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {t('combos.selectedMenuItems')}
              </Typography>
              {formData.selectedMenus.length > 0 && (
                <Paper sx={{ mb: 2, p: 2 }}>
                  {formData.selectedMenus.map(menu => (
                    <Box key={menu.menuId} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography>
                        {menu.menuName_en} ({menu.menuName_ta})
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveMenuItem(menu.menuId)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Paper>
              )}
              
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
                  {t('combos.addMenuItems')}
                </Typography>
                <Box sx={{ maxHeight: 250, overflowY: 'auto', border: '1px solid #ccc', p: 1, borderRadius: 1, mb: 1 }}>
                  {menus.map(menu => (
                    <FormControlLabel
                      key={menu._id}
                      control={
                        <Checkbox
                          checked={selectedMenuIds.includes(menu._id)}
                          onChange={() => handleMenuToggle(menu._id)}
                        />
                      }
                      label={`${menu.name_en} (${menu.name_ta})`}
                    />
                  ))}
                </Box>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleAddMenuItems}
                  fullWidth
                >
                  {t('common.add')}
                </Button>
              </Paper>
            </Grid>

            {/* Ingredients */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {t('combos.ingredients')}
              </Typography>
              {formData.ingredients.length > 0 && (
                <Paper sx={{ mb: 2, overflowX: 'auto' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('combos.ingredientName')}</TableCell>
                        <TableCell align="right">{t('combos.quantity')}</TableCell>
                        <TableCell>{t('combos.unit')}</TableCell>
                        <TableCell align="center">{t('common.actions')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {formData.ingredients.map(ing => (
                        <TableRow key={ing.ingredientId}>
                          <TableCell>
                            {ing.ingredientName_en} ({ing.ingredientName_ta})
                          </TableCell>
                          <TableCell align="right">{ing.quantity}</TableCell>
                          <TableCell>{ing.unit}</TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveIngredient(ing.ingredientId)}
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
              )}

              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
                  {t('combos.addIngredient')}
                </Typography>
                <Grid container spacing={1} sx={{ mb: 1 }}>
                  <Grid item xs={12} sm={5}>
                    <Autocomplete
                      fullWidth
                      size="small"
                      options={ingredients}
                      getOptionLabel={(ing) => `${ing.name_en} (${ing.name_ta})`}
                      value={ingredients.find(i => i._id === selectedIngredientId) || null}
                      onChange={(e, value) => {
                        setSelectedIngredientId(value?._id || '');
                      }}
                      inputValue={ingredientSearchInput}
                      onInputChange={(e, value) => {
                        setIngredientSearchInput(value);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Ingredient"
                          placeholder="Search or select ingredient..."
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Quantity"
                      value={ingredientQuantity}
                      onChange={(e) => setIngredientQuantity(e.target.value)}
                      size="small"
                      inputProps={{ step: '0.01' }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Unit</InputLabel>
                      <Select
                        value={ingredientUnit}
                        onChange={(e) => setIngredientUnit(e.target.value)}
                        label="Unit"
                      >
                        <MenuItem value="kg">kg</MenuItem>
                        <MenuItem value="gm">gm</MenuItem>
                        <MenuItem value="liter">liter</MenuItem>
                        <MenuItem value="ml">ml</MenuItem>
                        <MenuItem value="pcs">pcs</MenuItem>
                        <MenuItem value="dozen">dozen</MenuItem>
                        <MenuItem value="box">box</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleAddIngredient}
                  fullWidth
                >
                  {t('common.add')}
                </Button>
              </Paper>
            </Grid>

            {/* Expenses */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {t('combos.expenses')}
              </Typography>
              {formData.expenses.length > 0 && (
                <Paper sx={{ mb: 2, overflowX: 'auto' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('combos.expenseType')}</TableCell>
                        <TableCell align="right">{t('combos.amount')}</TableCell>
                        <TableCell align="center">{t('common.actions')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {formData.expenses.map((exp, idx) => (
                        <TableRow key={idx}>
                          <TableCell>
                            {expenses.find(e => e._id === exp.expenseId)?.name_en || exp.expenseId}
                          </TableCell>
                          <TableCell align="right">{exp.amount}</TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveExpense(idx)}
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
              )}

              <Paper sx={{ p: 2 }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
                  {t('combos.addExpense')}
                </Typography>
                <Grid container spacing={1} sx={{ mb: 1 }}>
                  <Grid item xs={12} sm={8}>
                    <Autocomplete
                      fullWidth
                      size="small"
                      options={expenses}
                      getOptionLabel={(exp) => exp.name_en}
                      value={expenses.find(e => e._id === selectedExpenseId) || null}
                      onChange={(e, value) => {
                        setSelectedExpenseId(value?._id || '');
                      }}
                      inputValue={expenseSearchInput}
                      onInputChange={(e, value) => {
                        setExpenseSearchInput(value);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Expense Type"
                          placeholder="Search or select expense..."
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Amount"
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(e.target.value)}
                      size="small"
                      inputProps={{ step: '0.01', min: '0' }}
                    />
                  </Grid>
                </Grid>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleAddExpense}
                  fullWidth
                >
                  {t('common.add')}
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" color="success" onClick={handleSave}>
            {t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this combo?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" color="error" onClick={handleConfirmDelete}>
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ComboPage;
