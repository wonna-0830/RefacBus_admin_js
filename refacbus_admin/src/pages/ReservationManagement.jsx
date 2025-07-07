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

const ReservationManagement = () => {
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
          <Tab label="날짜별 예약자 목록" />
          <Tab label="예약 상세 정보 조회" />
          <Tab label="예약 통계" />
          <Tab label="예약 취소 분석" />
          <Tab label="No-Show 기록" />
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
        <TabPanel value={tabIndex} index={0}>날짜별 예약 목록</TabPanel>
        <TabPanel value={tabIndex} index={1}>예약 상세 정보 조회</TabPanel>
        <TabPanel value={tabIndex} index={2}>예약 통계</TabPanel>
        <TabPanel value={tabIndex} index={3}>예약 취소 분석</TabPanel>
        <TabPanel value={tabIndex} index={4}>No-Show 기록</TabPanel>
      </Box>
    </Box>
  );
};

export default ReservationManagement;
