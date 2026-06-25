import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Button,
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
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Autocomplete
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import recipeService from '../services/recipeService';
import menuService from '../services/menuService';
import ingredientService from '../services/ingredientService';
import expenseService from '../services/expenseService';
import DataTable from '../components/DataTable';

const RecipesPage = () => {
  const { t } = useTranslation();
  const [recipes, setRecipes] = useState([]);
  const [menus, setMenus] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({
    menuId: '',
    baseMembers: 10,
    ingredients: [],
    expenses: []
  });

  useEffect(() => {
    fetchRecipes();
    fetchMenus();
    fetchIngredients();
    fetchExpenses();
  }, [page, limit]);

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const response = await recipeService.getRecipes(page, limit);
      setRecipes(response.data.data);
      setTotal(response.data.pagination.total);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching recipes');
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

  const fetchIngredients = async () => {
    try {
      const response = await ingredientService.getIngredients(1, 100);
      setIngredients(response.data.data);
    } catch (err) {
      console.error('Error fetching ingredients:', err);
    }
  };

  const fetchExpenses = async () => {
    try {
      const response = await expenseService.getExpenses(1, 100);
      setExpenses(response.data.data);
    } catch (err) {
      console.error('Error fetching expenses:', err);
    }
  };

  const handleAddClick = () => {
    setSelectedRecipe(null);
    setFormData({
      menuId: '',
      baseMembers: 10,
      ingredients: [],
      expenses: []
    });
    setDialogOpen(true);
  };

  const handleEditClick = (recipe) => {
    setSelectedRecipe(recipe);
    
    // Normalize expenses - handle both string IDs and populated objects
    const normalizedExpenses = (recipe.expenses || []).map(exp => ({
      expenseId: typeof exp.expenseId === 'string' ? exp.expenseId : exp.expenseId?._id,
      amount: exp.amount
    }));
    
    setFormData({
      menuId: recipe.menuId._id,
      baseMembers: recipe.baseMembers,
      ingredients: recipe.ingredients,
      expenses: normalizedExpenses
    });
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

  const handleAddIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { ingredientId: '', quantity: 0, unit: 'kg' }]
    }));
  };

  const handleRemoveIngredient = (index) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index][field] = value;
    setFormData(prev => ({
      ...prev,
      ingredients: newIngredients
    }));
  };

  const handleAddExpense = () => {
    setFormData(prev => ({
      ...prev,
      expenses: [...prev.expenses, { expenseId: '', amount: '' }]
    }));
  };

  const handleRemoveExpense = (index) => {
    setFormData(prev => ({
      ...prev,
      expenses: prev.expenses.filter((_, i) => i !== index)
    }));
  };

  const handleExpenseChange = (index, field, value) => {
    const newExpenses = [...formData.expenses];
    if (field === 'expenseId') {
      newExpenses[index]['expenseId'] = value?._id || '';
    } else {
      newExpenses[index][field] = value;
    }
    setFormData(prev => ({
      ...prev,
      expenses: newExpenses
    }));
  };

  const handleSave = async () => {
    // Validate required fields
    if (!formData.menuId) {
      setError('Please select a menu');
      return;
    }
    if (!formData.baseMembers || formData.baseMembers < 1) {
      setError('Base members must be at least 1');
      return;
    }
    if (formData.ingredients.length === 0) {
      setError('Please add at least one ingredient');
      return;
    }
    
    // Validate each ingredient
    for (let ing of formData.ingredients) {
      if (!ing.ingredientId) {
        setError('All ingredients must be selected');
        return;
      }
      if (!ing.quantity || ing.quantity < 0) {
        setError('All ingredients must have valid quantity');
        return;
      }
      if (!ing.unit) {
        setError('All ingredients must have a unit');
        return;
      }
    }

    // Validate expenses - all selected expenses must have amounts > 0
    for (let exp of formData.expenses) {
      if (exp.expenseId && (!exp.amount || exp.amount <= 0)) {
        setError('All selected expenses must have a valid amount greater than 0');
        return;
      }
    }
    const validExpenses = formData.expenses.filter(exp => exp.expenseId && exp.amount > 0);

    const finalFormData = { ...formData, expenses: validExpenses };

    try {
      if (selectedRecipe) {
        await recipeService.updateRecipe(selectedRecipe._id, finalFormData);
      } else {
        await recipeService.createRecipe(finalFormData);
      }
      setDialogOpen(false);
      setError('');
      fetchRecipes();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving recipe');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await recipeService.deleteRecipe(deleteId);
      setDeleteConfirmOpen(false);
      setError('');
      fetchRecipes();
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting recipe');
    }
  };

  const columns = [
    {
      id: 'menuId',
      label: t('recipes.menuName'),
      render: (row) => row.menuId?.name_en
    },
    {
      id: 'baseMembers',
      label: t('recipes.baseMembers')
    },
    {
      id: 'ingredientCount',
      label: 'Ingredient Count',
      render: (row) => row.ingredients?.length
    },
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

      <Box sx={{ mb: 3 }}>
        <Button variant="contained" color="success" onClick={handleAddClick}>
          {t('recipes.addRecipe')}
        </Button>
      </Box>

      <DataTable
        columns={columns}
        rows={recipes}
        loading={loading}
        pagination={{ page, limit, total }}
        onPageChange={setPage}
        onRowsPerPageChange={setLimit}
      />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedRecipe ? t('recipes.editRecipe') : t('recipes.addRecipe')}
        </DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth>
            <InputLabel>{t('recipes.menuName')}</InputLabel>
            <Select
              name="menuId"
              value={formData.menuId}
              onChange={handleFormChange}
              label={t('recipes.menuName')}
            >
              {menus.map((menu) => (
                <MenuItem key={menu._id} value={menu._id}>
                  {menu.name_en}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label={t('recipes.baseMembers')}
            name="baseMembers"
            type="number"
            value={formData.baseMembers}
            onChange={handleFormChange}
            fullWidth
            inputProps={{ min: 1 }}
          />

          <Typography variant="subtitle2">{t('recipes.ingredients')}</Typography>
          {formData.ingredients.map((ing, index) => (
            <Paper key={index} sx={{ p: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
              <Autocomplete
                sx={{ flex: 1 }}
                options={ingredients}
                getOptionLabel={(option) => option.name_en}
                value={ingredients.find(ing2 => ing2._id === ing.ingredientId) || null}
                onChange={(e, newValue) => handleIngredientChange(index, 'ingredientId', newValue?._id || '')}
                renderInput={(params) => <TextField {...params} label="Ingredient" size="small" />}
                isOptionEqualToValue={(option, value) => option._id === value._id}
              />
              <TextField
                type="number"
                placeholder="Qty"
                value={ing.quantity}
                onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                inputProps={{ step: '0.01', min: '0' }}
                sx={{ width: '80px' }}
                size="small"
              />
              <FormControl sx={{ width: '80px' }}>
                <Select
                  value={ing.unit}
                  onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                  size="small"
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
              <IconButton size="small" onClick={() => handleRemoveIngredient(index)} color="error">
                <DeleteIcon />
              </IconButton>
            </Paper>
          ))}

          <Button onClick={handleAddIngredient} variant="outlined">
            {t('recipes.addIngredient')}
          </Button>

          <Typography variant="subtitle2">Expenses</Typography>
          {formData.expenses.map((expense, index) => (
            <Paper key={index} sx={{ p: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
              <Autocomplete
                sx={{ flex: 1 }}
                options={expenses}
                getOptionLabel={(option) => option.name_en || 'Unknown'}
                value={
                  expenses.find(exp => 
                    exp._id === expense.expenseId || 
                    exp._id === (typeof expense.expenseId === 'object' ? expense.expenseId?._id : expense.expenseId)
                  ) || null
                }
                onChange={(e, newValue) => handleExpenseChange(index, 'expenseId', newValue)}
                renderInput={(params) => <TextField {...params} label="Expense" size="small" />}
                isOptionEqualToValue={(option, value) => option._id === value._id}
              />
              <TextField
                type="number"
                placeholder="Amount (₹)"
                value={expense.amount || ''}
                onChange={(e) => handleExpenseChange(index, 'amount', e.target.value ? parseFloat(e.target.value) : '')}
                inputProps={{ step: '0.01', min: '0' }}
                sx={{ width: '120px' }}
                size="small"
              />
              <IconButton size="small" onClick={() => handleRemoveExpense(index)} color="error">
                <DeleteIcon />
              </IconButton>
            </Paper>
          ))}

          <Button onClick={handleAddExpense} variant="outlined">
            + Add Expense
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>{t('common.cancel')}</Button>
          <Button onClick={handleSave} variant="contained" disabled={loading}>
            {t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>Are you sure you want to delete this recipe?</DialogContent>
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

export default RecipesPage;
