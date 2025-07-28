import React from 'react';
import { TextField } from '@mui/material';

const SearchBar = ({ value, onChange, placeholder = '검색어 입력', width = 500 }) => {
  return (
    <TextField
      label={placeholder}
      variant="outlined"
      size="small"
      value={value}
      onChange={onChange}
      sx={{ width, mb: 2 }}
    />
  );
};

export default SearchBar;
