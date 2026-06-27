import React, { useState, useEffect } from 'react';
import {
  Autocomplete,
  TextField,
  Box,
  CircularProgress
} from '@mui/material';

/**
 * Reusable Searchable Select Component
 * Provides real-time filtering and autocomplete functionality
 * 
 * @param {Array} options - Array of options to display
 * @param {string} getOptionLabel - Function to extract label from option
 * @param {string} value - Currently selected value
 * @param {Function} onChange - Callback when selection changes
 * @param {string} label - Label for the field
 * @param {boolean} loading - Show loading indicator
 * @param {string} placeholder - Placeholder text
 * @param {Function} onInputChange - Callback for input changes (for server-side filtering)
 * @param {object} additionalProps - Any additional Autocomplete props
 */
const SearchableSelect = ({
  options = [],
  getOptionLabel,
  value,
  onChange,
  label = 'Select an option',
  loading = false,
  placeholder = 'Search and select...',
  onInputChange = null,
  additionalProps = {}
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (event, newInputValue, reason) => {
    setInputValue(newInputValue);
    // Call custom handler for server-side filtering if provided
    if (onInputChange) {
      onInputChange(newInputValue);
    }
  };

  return (
    <Autocomplete
      options={options}
      getOptionLabel={getOptionLabel}
      value={value}
      onChange={onChange}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      loading={loading}
      fullWidth
      noOptionsText="No options found"
      loadingText="Loading..."
      placeholder={placeholder}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          size="small"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      {...additionalProps}
    />
  );
};

export default SearchableSelect;
