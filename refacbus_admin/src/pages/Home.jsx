import React, { useState } from 'react';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Sidebar from '../components/Sidebar';
import UserManagement from './UserManagement';
import PlaceTimeManagement from './PlaceTimeManagement';
import ReservationManagement from './ReservationManagement';
import DriverManagement from './DriverManagement.jsx';
import ManagerManagement from './ManagerManagement.jsx';

function Home() {
  const [selectedMenu, setSelectedMenu] = useState('user');

  const renderContent = () => {
    switch (selectedMenu) {
      case 'user':
        return <UserManagement />;
      case 'placetime':
        return <PlaceTimeManagement/> ;
      case 'reservation':
        return <ReservationManagement/> ;
      case 'drivenote':
        return <DriverManagement/> ;
      case 'managermanage':
        return <ManagerManagement/> ;
      // 필요한 경우 driver 등 다른 것도 추가
      default:
        return <div>기능을 선택해주세요</div>;
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', minWidth: '180vh' }}>
      <CssBaseline />

      {/* ✅ 사이드바 (고정된 폭) */}
      <Box sx={{ width: 200 }}>
        <Sidebar onMenuSelect={setSelectedMenu} />
      </Box>

      {/* ✅ 메인 컨텐츠 영역 (나머지 전부 차지) */}
      <Box
        sx={{
          flexGrow: 2,
          backgroundColor: '#f5f5f5',
          p: 0,
          width: '100%'
        }}
      >
        {renderContent()}
      </Box>
    </Box>
  );
}

export default Home;
