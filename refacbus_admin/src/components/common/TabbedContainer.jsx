// components/common/TabbedContainer.jsx
import React from "react";
import { Box, Tabs, Tab } from "@mui/material";

const TabbedContainer = ({ tabIndex, handleTabChange, labels }) => {
  return (
    <Box
      sx={{
        backgroundColor: '#fff',
        py: 1,
        px: 5,
        boxShadow: 1,
      }}
    >
      <Tabs
        value={tabIndex}
        onChange={handleTabChange}
        textColor="primary"
        indicatorColor="primary"
        variant="standard"
        centered
        sx={{ minWidth: 'fit-content' }}
      >
        {labels.map((label, index) => (
          <Tab key={index} label={label} />
        ))}
      </Tabs>
    </Box>
  );
};

export default TabbedContainer;
