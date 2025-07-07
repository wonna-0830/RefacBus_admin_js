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

const UserManagement = () => {
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
          <Tab label="회원 정보 조회" />
          <Tab label="계정 정지/해제" />
          <Tab label="경고 이력 관리" />
          <Tab label="관리자 메모" />
          <Tab label="비밀번호 초기화" />
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
        <TabPanel value={tabIndex} index={0}>📋 회원 정보</TabPanel>
        <TabPanel value={tabIndex} index={1}>🔒 계정 정지 / 해제</TabPanel>
        <TabPanel value={tabIndex} index={2}>⚠️ 경고 이력</TabPanel>
        <TabPanel value={tabIndex} index={3}>📝 관리자 메모</TabPanel>
        <TabPanel value={tabIndex} index={4}>📧 비밀번호 초기화</TabPanel>
      </Box>
    </Box>
  );
};

export default UserManagement;
