import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

const TabPanel = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const DriverManagement = () => {
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      
      {/* 탭 메뉴 */}
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
          variant="standard" // ← 요거!
          centered             // ← 요거!
          sx={{
            minWidth: 'fit-content',  // ← 너무 좁게 붙는 거 방지
          }}
        >
          <Tab label="기사별 운행 이력" />
          <Tab label="탑승자 수 통계" />
          <Tab label="기사 계정 관리" />
          <Tab label="기사 계정 경고 이력" />
          <Tab label="계정 메모" />
        </Tabs>
      </Box>

      {/* 회색 박스 본문 */}
      <Box
        sx={{
          backgroundColor: '#f5f5f5',
          borderRadius: 2,
          padding: 3,
          marginTop: 2,
          width: '100%',
          maxWidth: 'none',
        }}
      >
        <TabPanel value={tabIndex} index={0}>기사별 운행 이력</TabPanel>
        <TabPanel value={tabIndex} index={1}>탑승자 수 통계</TabPanel>
        <TabPanel value={tabIndex} index={2}>기사 계정 관리</TabPanel>
        <TabPanel value={tabIndex} index={3}>기사 계정 경고 이력</TabPanel>
        <TabPanel value={tabIndex} index={4}>계정 메모</TabPanel>
      </Box>
    </Box>
  );
};

export default DriverManagement;
