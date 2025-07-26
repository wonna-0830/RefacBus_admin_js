import React, { useState } from 'react';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Sidebar from '../components/Sidebar';
import UserManagement from './UserManagement';
import PlaceTimeManagement from './PlaceTimeManagement';
import ReservationManagement from './ReservationManagement';
import DriverManagement from './DriverManagement.jsx';
import ManagerManagement from './ManagerManagement.jsx';
import DashBoard from './DashBoard.jsx';
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate("/Login", { replace: true });
      }
    });
    return () => unsubscribe();
  }, []);

  const [selectedMenu, setSelectedMenu] = useState('home');

  const renderContent = () => {
    switch (selectedMenu) {
      case 'home':
        return <DashBoard />;
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
