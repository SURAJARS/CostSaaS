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
  MenuItem
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import expenseService from '../services/expenseService';
import DataTable from '../components/DataTable';

const ExpensesPage = () => {
  const { t } = useTranslation();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({
    name_en: '',
    description: ''
  });

  useEffect(() => {
    fetchExpenses();
  }, [page, limit]);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const response = await expenseService.getExpenses(page, limit);
      setExpenses(response.data.data);
      setTotal(response.data.pagination.total);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setSelectedExpense(null);
    setFormData({
      name_en: '',
      description: ''
    });
    setDialogOpen(true);
  };

  const handleEditClick = (expense) => {
    setSelectedExpense(expense);
    setFormData({
      name_en: expense.name_en,
      description: expense.description || ''
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

  const handleSave = async () => {
    if (!formData.name_en) {
      setError('Please fill in the expense name');
      return;
    }

    try {
      if (selectedExpense) {
        await expenseService.updateExpense(selectedExpense._id, formData);
      } else {
        await expenseService.createExpense(formData);
      }
      setDialogOpen(false);
      setError('');
      setSuccess(selectedExpense ? 'Expense updated successfully' : 'Expense created successfully');
      fetchExpenses();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving expense');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await expenseService.deleteExpense(deleteId);
      setDeleteConfirmOpen(false);
      setError('');
      setSuccess('Expense deleted successfully');
      fetchExpenses();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting expense');
    }
  };

  const columns = [
    {
      id: 'name_en',
      label: 'Expense Name (English)'
    },
    {
      id: 'description',
      label: 'Description'
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
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Box sx={{ mb: 3 }}>
        <Button variant="contained" color="success" onClick={handleAddClick}>
          + Add Expense
        </Button>
      </Box>

      <DataTable
        columns={columns}
        rows={expenses}
        loading={loading}
        pagination={{ page, limit, total }}
        onPageChange={setPage}
        onRowsPerPageChange={setLimit}
      />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedExpense ? 'Edit Expense' : 'Add Expense'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Expense Name (English)"
            name="name_en"
            value={formData.name_en}
            onChange={handleFormChange}
            fullWidth
            required
          />
          <TextField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleFormChange}
            fullWidth
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={loading}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>Are you sure you want to delete this expense?</DialogContent>
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

export default ExpensesPage;
