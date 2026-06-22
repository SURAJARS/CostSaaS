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
  Paper
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import recipeService from '../services/recipeService';
import menuService from '../services/menuService';
import ingredientService from '../services/ingredientService';
import DataTable from '../components/DataTable';

const RecipesPage = () => {
  const { t } = useTranslation();
  const [recipes, setRecipes] = useState([]);
  const [menus, setMenus] = useState([]);
  const [ingredients, setIngredients] = useState([]);
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
    ingredients: []
  });

  useEffect(() => {
    fetchRecipes();
    fetchMenus();
    fetchIngredients();
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

  const handleAddClick = () => {
    setSelectedRecipe(null);
    setFormData({
      menuId: '',
      baseMembers: 10,
      ingredients: []
    });
    setDialogOpen(true);
  };

  const handleEditClick = (recipe) => {
    setSelectedRecipe(recipe);
    setFormData({
      menuId: recipe.menuId._id,
      baseMembers: recipe.baseMembers,
      ingredients: recipe.ingredients
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

    try {
      if (selectedRecipe) {
        await recipeService.updateRecipe(selectedRecipe._id, formData);
      } else {
        await recipeService.createRecipe(formData);
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
                  {menu.name_en} ({menu.name_ta})
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
              <FormControl sx={{ flex: 1 }}>
                <InputLabel>Ingredient</InputLabel>
                <Select
                  value={ing.ingredientId}
                  onChange={(e) => handleIngredientChange(index, 'ingredientId', e.target.value)}
                  label="Ingredient"
                >
                  {ingredients.map((ingredient) => (
                    <MenuItem key={ingredient._id} value={ingredient._id}>
                      {ingredient.name_en}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                type="number"
                placeholder="Qty"
                value={ing.quantity}
                onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                inputProps={{ step: '0.01', min: '0' }}
                sx={{ width: '80px' }}
              />
              <FormControl sx={{ width: '80px' }}>
                <Select
                  value={ing.unit}
                  onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                >
                  <MenuItem value="kg">kg</MenuItem>
                  <MenuItem value="gm">gm</MenuItem>
                  <MenuItem value="liter">liter</MenuItem>
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
