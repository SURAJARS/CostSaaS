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
  MenuItem
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import menuService from '../services/menuService';
import DataTable from '../components/DataTable';

const MenusPage = () => {
  const { t } = useTranslation();
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({
    name_en: '',
    name_ta: '',
    category: 'breakfast',
    description_en: '',
    description_ta: '',
    status: 'active'
  });

  const fetchMenus = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await menuService.getMenus(page, limit);
      setMenus(response.data.data);
      setTotal(response.data.pagination.total);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching menus');
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchMenus();
      return;
    }

    setLoading(true);
    try {
      const response = await menuService.searchMenus(searchQuery, 1, limit);
      setMenus(response.data.data);
      setTotal(response.data.pagination.total);
      setPage(1);
    } catch (err) {
      setError(err.response?.data?.message || 'Error searching menus');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setSelectedMenu(null);
    setFormData({
      name_en: '',
      name_ta: '',
      category: 'breakfast',
      description_en: '',
      description_ta: '',
      status: 'active'
    });
    setDialogOpen(true);
  };

  const handleEditClick = (menu) => {
    setSelectedMenu(menu);
    setFormData(menu);
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
    try {
      if (selectedMenu) {
        await menuService.updateMenu(selectedMenu._id, formData);
      } else {
        await menuService.createMenu(formData);
      }
      setDialogOpen(false);
      setError('');
      fetchMenus();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving menu');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await menuService.deleteMenu(deleteId);
      setDeleteConfirmOpen(false);
      setError('');
      fetchMenus();
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting menu');
    }
  };

  const columns = [
    { id: 'name_en', label: t('menus.nameEnglish') },
    { id: 'name_ta', label: t('menus.nameTamil') },
    { id: 'category', label: t('menus.category') },
    { id: 'status', label: t('menus.status') },
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
        <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', gap: 1, flex: 1 }}>
          <TextField
            placeholder={t('common.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            fullWidth
          />
          <Button type="submit" variant="contained">
            {t('common.search')}
          </Button>
        </Box>
        <Button variant="contained" color="success" onClick={handleAddClick}>
          {t('menus.addMenu')}
        </Button>
      </Box>

      <DataTable
        columns={columns}
        rows={menus}
        loading={loading}
        pagination={{ page, limit, total }}
        onPageChange={setPage}
        onRowsPerPageChange={setLimit}
      />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedMenu ? t('menus.editMenu') : t('menus.addMenu')}
        </DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label={t('menus.nameEnglish')}
            name="name_en"
            value={formData.name_en}
            onChange={handleFormChange}
            fullWidth
            required
          />
          <TextField
            label={t('menus.nameTamil')}
            name="name_ta"
            value={formData.name_ta}
            onChange={handleFormChange}
            fullWidth
            required
          />
          <FormControl fullWidth>
            <InputLabel>{t('menus.category')}</InputLabel>
            <Select
              name="category"
              value={formData.category}
              onChange={handleFormChange}
              label={t('menus.category')}
            >
              <MenuItem value="breakfast">{t('menus.categories.breakfast')}</MenuItem>
              <MenuItem value="lunch">{t('menus.categories.lunch')}</MenuItem>
              <MenuItem value="dinner">{t('menus.categories.dinner')}</MenuItem>
              <MenuItem value="snacks">{t('menus.categories.snacks')}</MenuItem>
              <MenuItem value="sweets">{t('menus.categories.sweets')}</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label={t('common.description') + ' (English)'}
            name="description_en"
            value={formData.description_en}
            onChange={handleFormChange}
            fullWidth
            multiline
            rows={2}
          />
          <TextField
            label={t('common.description') + ' (Tamil)'}
            name="description_ta"
            value={formData.description_ta}
            onChange={handleFormChange}
            fullWidth
            multiline
            rows={2}
          />
          <FormControl fullWidth>
            <InputLabel>{t('menus.status')}</InputLabel>
            <Select
              name="status"
              value={formData.status}
              onChange={handleFormChange}
              label={t('menus.status')}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
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

      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>Are you sure you want to delete this menu?</DialogContent>
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

export default MenusPage;
