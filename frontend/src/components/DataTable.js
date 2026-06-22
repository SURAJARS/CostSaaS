import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Box,
  CircularProgress,
  useTheme
} from '@mui/material';

const DataTable = ({ columns, rows, loading = false, pagination = null, onPageChange, onRowsPerPageChange }) => {
  const theme = useTheme();
  
  const headerBgColor = theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#f5f5f5';
  const headerTextColor = theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.text.primary;

  return (
    <Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: headerBgColor }}>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  sx={{ fontWeight: 'bold', color: headerTextColor }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 3 }}>
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, index) => (
                <TableRow key={index} hover>
                  {columns.map((column) => (
                    <TableCell key={column.id} align={column.align || 'left'}>
                      {column.render ? column.render(row) : row[column.id]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {pagination && (
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={pagination.total}
          rowsPerPage={pagination.limit}
          page={pagination.page - 1}
          onPageChange={(event, newPage) => onPageChange?.(newPage + 1)}
          onRowsPerPageChange={(event) => onRowsPerPageChange?.(parseInt(event.target.value, 10))}
        />
      )}
    </Box>
  );
};

export default DataTable;
