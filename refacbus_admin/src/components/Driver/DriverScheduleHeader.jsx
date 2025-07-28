import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const DriverScheduleHeader = ({ name, onAddClick }) => {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
        {name}님의 주간 스케줄표
      </Typography>
      <Button
        variant="contained"
        size="small"
        startIcon={<AddIcon />}
        onClick={onAddClick}
      >
        추가
      </Button>
    </Box>
  );
};

export default DriverScheduleHeader;
