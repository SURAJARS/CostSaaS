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
  CircularProgress
} from '@mui/material';

const DataTable = ({ columns, rows, loading = false, pagination = null, onPageChange, onRowsPerPageChange }) => {
  return (
    <Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  sx={{ fontWeight: 'bold' }}
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
