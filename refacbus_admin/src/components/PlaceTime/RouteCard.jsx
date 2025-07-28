// components/RouteCard.jsx
import React from "react";
import { Box, Typography } from "@mui/material";

const RouteCard = ({
  label = '',
  items = {},
  onClickItem = () => {},
  emptyMessage = '등록된 항목이 없습니다.',
  color = '#e3f2fd'
}) => {
  return (
    <Box>
      <Typography sx={{ mb: 1 }}>{label}</Typography>
      {Object.keys(items).length > 0 ? (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {Object.entries(items).map(([key, value]) => (
            <Box
              key={key}
              onClick={() => onClickItem(key, value)}
              sx={{
                cursor: 'pointer',
                width: '19%',
                backgroundColor: color,
                padding: '8px',
                borderRadius: '4px',
                textAlign: 'center',
                boxShadow: 1,
              }}
            >
              {value}
            </Box>
          ))}
        </Box>
      ) : (
        <Typography color="text.secondary">{emptyMessage}</Typography>
      )}
    </Box>
  );
};

export default RouteCard;
