import React, { useState } from 'react';
import {
  Container,
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  useTheme
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import DownloadIcon from '@mui/icons-material/Download';
import estimationService from '../services/estimationService';
import { formatCurrency, downloadFile } from '../utils/helpers';

const ReportsPage = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [reportType, setReportType] = useState('dateRange');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [data, setData] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [customerFilter, setCustomerFilter] = useState('');

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGenerateReport = async () => {
    if (reportType === 'dateRange' && (!dateRange.startDate || !dateRange.endDate)) {
      setError('Please select both start and end dates');
      return;
    }
    if (reportType === 'customer' && !customerFilter.trim()) {
      setError('Please enter customer name');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let response;
      if (reportType === 'dateRange') {
        response = await estimationService.getReportsByDateRange(
          dateRange.startDate,
          dateRange.endDate
        );
      } else if (reportType === 'customer') {
        response = await estimationService.getReportsByCustomer(customerFilter);
      }

      setData(response.data.data);
      setSuccess(`Found ${response.data.data.length} records`);
    } catch (err) {
      setError(err.response?.data?.message || 'Error generating report');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    if (data.length === 0) {
      setError('No data to export');
      return;
    }

    try {
      setLoading(true);
      // Export all filtered records
      const estimationIds = data.map(record => record._id);
      const blob = await estimationService.exportBulkToExcel(estimationIds);
      downloadFile(blob, `report_${reportType}_${new Date().getTime()}.xlsx`);
      setSuccess('Exported successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error exporting report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        {t('reports.title')}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant={reportType === 'dateRange' ? 'contained' : 'outlined'}
              onClick={() => {
                setReportType('dateRange');
                setData([]);
              }}
            >
              By Date Range
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant={reportType === 'customer' ? 'contained' : 'outlined'}
              onClick={() => {
                setReportType('customer');
                setData([]);
              }}
            >
              By Chef Name
            </Button>
          </Grid>
        </Grid>

        {reportType === 'dateRange' && (
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label={t('reports.fromDate')}
                name="startDate"
                type="date"
                value={dateRange.startDate}
                onChange={handleDateChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label={t('reports.toDate')}
                name="endDate"
                type="date"
                value={dateRange.endDate}
                onChange={handleDateChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        )}

        {reportType === 'customer' && (
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12}>
              <TextField
                label="Chef Name"
                value={customerFilter}
                onChange={(e) => setCustomerFilter(e.target.value)}
                fullWidth
              />
            </Grid>
          </Grid>
        )}

        <Button
          variant="contained"
          onClick={handleGenerateReport}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : t('reports.generateReport')}
        </Button>
      </Paper>

      {data.length > 0 && (
        <>
          <Box sx={{ mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleExportExcel}
            >
              {t('reports.exportExcel')}
            </Button>
          </Box>

          <Paper sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#f5f5f5' }}>
                  <TableCell>Chef Name</TableCell>
                  <TableCell>Event Date</TableCell>
                  <TableCell align="right">Guest Count</TableCell>
                  <TableCell align="right">Total Expense</TableCell>
                  <TableCell align="right">Profit</TableCell>
                  <TableCell align="right">Grand Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row) => {
                  const additionalCost = (row.additionalCost?.labourCost || 0) + 
                                        (row.additionalCost?.gasCost || 0) + 
                                        (row.additionalCost?.transportCost || 0) + 
                                        (row.additionalCost?.miscellaneousCost || 0);
                  const totalExpense = (row.rawMaterialCost || 0) + additionalCost;
                  
                  return (
                    <TableRow key={row._id}>
                      <TableCell>{row.chefName}</TableCell>
                      <TableCell>{new Date(row.eventDate).toLocaleDateString('en-IN')}</TableCell>
                      <TableCell align="right">{row.guestCount}</TableCell>
                      <TableCell align="right">{formatCurrency(totalExpense)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.profitAmount || 0)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.grandTotal)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Paper>
        </>
      )}
    </Container>
  );
};

export default ReportsPage;
