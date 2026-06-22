import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import { useTranslation } from 'react-i18next';

const IngredientDialog = ({ open, onClose, onSave, initialData = null, loading = false }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = React.useState({
    name_en: '',
    name_ta: '',
    unit: 'kg',
    currentRate: '',
    category: 'dal',
    status: 'active',
    description: ''
  });

  React.useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name_en: '',
        name_ta: '',
        unit: 'kg',
        currentRate: '',
        category: 'dal',
        status: 'active',
        description: ''
      });
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {initialData ? t('ingredients.editIngredient') : t('ingredients.addIngredient')}
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label={t('ingredients.nameEnglish')}
            name="name_en"
            value={formData.name_en}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            label={t('ingredients.nameTamil')}
            name="name_ta"
            value={formData.name_ta}
            onChange={handleChange}
            fullWidth
            required
          />
          <FormControl fullWidth>
            <InputLabel>{t('ingredients.unit')}</InputLabel>
            <Select
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              label={t('ingredients.unit')}
            >
              {Object.entries(t('ingredients.units', { returnObjects: true })).map(([key, label]) => (
                <MenuItem key={key} value={key}>{label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label={t('ingredients.rate')}
            name="currentRate"
            type="number"
            value={formData.currentRate}
            onChange={handleChange}
            fullWidth
            required
            inputProps={{ step: '0.01', min: '0' }}
          />
          <FormControl fullWidth>
            <InputLabel>{t('ingredients.category')}</InputLabel>
            <Select
              name="category"
              value={formData.category}
              onChange={handleChange}
              label={t('ingredients.category')}
            >
              {Object.entries(t('ingredients.categories', { returnObjects: true })).map(([key, label]) => (
                <MenuItem key={key} value={key}>{label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label={t('common.description')}
            name="description"
            value={formData.description}
            onChange={handleChange}
            fullWidth
            multiline
            rows={3}
          />
          <FormControl fullWidth>
            <InputLabel>{t('ingredients.status')}</InputLabel>
            <Select
              name="status"
              value={formData.status}
              onChange={handleChange}
              label={t('ingredients.status')}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('common.cancel')}</Button>
        <Button onClick={handleSave} variant="contained" disabled={loading}>
          {t('common.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default IngredientDialog;
