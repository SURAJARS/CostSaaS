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
  IconButton
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ingredientService from '../services/ingredientService';
import DataTable from '../components/DataTable';
import IngredientDialog from '../components/IngredientDialog';

const IngredientsPage = () => {
  const { t } = useTranslation();
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchIngredients = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await ingredientService.getIngredients(page, limit);
      setIngredients(response.data.data);
      setTotal(response.data.pagination.total);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching ingredients');
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchIngredients();
  }, [fetchIngredients]);

  const handleSearch = async (query = null) => {
    const queryToUse = query !== null ? query : searchQuery;
    
    if (!queryToUse.trim()) {
      fetchIngredients();
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await ingredientService.searchIngredients(queryToUse, 1, limit);
      setIngredients(response.data.data);
      setTotal(response.data.pagination.total);
      setPage(1);
    } catch (err) {
      setError(err.response?.data?.message || 'Error searching ingredients');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    // Trigger search as user types (real-time)
    if (query.trim() || query === '') {
      handleSearch(query);
    }
  };

  const handleAddClick = () => {
    setSelectedIngredient(null);
    setDialogOpen(true);
  };

  const handleEditClick = (ingredient) => {
    setSelectedIngredient(ingredient);
    setDialogOpen(true);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setDeleteConfirmOpen(true);
  };

  const handleSave = async (formData) => {
    try {
      if (selectedIngredient) {
        await ingredientService.updateIngredient(selectedIngredient._id, formData);
      } else {
        await ingredientService.createIngredient(formData);
      }
      setDialogOpen(false);
      setError('');
      fetchIngredients();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving ingredient');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await ingredientService.deleteIngredient(deleteId);
      setDeleteConfirmOpen(false);
      setError('');
      fetchIngredients();
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting ingredient');
    }
  };

  const columns = [
    { id: 'name_en', label: t('ingredients.nameEnglish') },
    { id: 'name_ta', label: t('ingredients.nameTamil') },
    { id: 'unit', label: t('ingredients.unit') },
    { id: 'currentRate', label: t('ingredients.rate') },
    { id: 'category', label: t('ingredients.category') },
    { id: 'status', label: t('ingredients.status') },
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

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, gap: 2 }}>
        <TextField
          placeholder={t('common.search')}
          value={searchQuery}
          onChange={handleSearchInputChange}
          size="small"
          fullWidth
          variant="outlined"
        />
        <Button variant="contained" color="success" onClick={handleAddClick}>
          {t('ingredients.addIngredient')}
        </Button>
      </Box>

      <DataTable
        columns={columns}
        rows={ingredients}
        loading={loading}
        pagination={{ page, limit, total }}
        onPageChange={setPage}
        onRowsPerPageChange={setLimit}
      />

      <IngredientDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        initialData={selectedIngredient}
        loading={loading}
      />

      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>Are you sure you want to delete this ingredient?</DialogContent>
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

export default IngredientsPage;
