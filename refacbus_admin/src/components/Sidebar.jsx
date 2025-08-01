// components/Sidebar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Drawer from '@mui/material/Drawer';
import {List, Box} from '@mui/material';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import UserIcon from '@mui/icons-material/RouteOutlined';
import PlaceTimeIcon from '@mui/icons-material/People';
import ReservationsIcon from '@mui/icons-material/DirectionsBus';
import DriveNoteIcon from '@mui/icons-material/EventNote';
import ManagerIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import { signOut, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom"; 
import { useEffect, useState } from 'react';
import { ref, get } from "firebase/database";
import { auth, realtimeDb } from "../firebase";
import VerifiedUser from '@mui/icons-material/PersonOutline';

const drawerWidth = 240;

const Sidebar = ({ onMenuSelect }) => {

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/Login"); // 로그인 페이지 경로
    } catch (error) {
      console.error("로그아웃 실패:", error);
      alert("로그아웃에 실패했습니다.");
    }
  };

  const [adminName, setAdminName] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const snapshot = await get(ref(realtimeDb, `admin/${user.uid}`));
        if (snapshot.exists()) {
          const data = snapshot.val();
          setAdminName(data.name);
        }
      }
    });

    return () => unsubscribe(); 
  }, []);


  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#002857', 
          color: 'white',
        },
      }}
      variant="permanent"
      anchor="left"
    >
      <Toolbar
        onClick={() => onMenuSelect('home')}
        sx={{
          cursor: 'pointer',
          '&:hover': { opacity: 0.8 },
        }}
      >
        <Typography variant="h6" noWrap component="div">
          DCU 스쿨버스 관리자
        </Typography>
      </Toolbar>
      <Divider sx={{ backgroundColor: '#ffffff33' }} />
      <List>
        <ListItemButton  onClick={() => onMenuSelect('user')}>
          <ListItemIcon sx={{ color: 'white' }}><PlaceTimeIcon /></ListItemIcon>
          <ListItemText primary="회원 관리" />
        </ListItemButton>
        <ListItemButton onClick={() => onMenuSelect('placetime')}>
          <ListItemIcon sx={{ color: 'white' }}><UserIcon /></ListItemIcon>
          <ListItemText primary="노선/시간 관리" />
        </ListItemButton>
        <ListItemButton onClick={() => onMenuSelect('reservation')}>
          <ListItemIcon sx={{ color: 'white' }}><ReservationsIcon /></ListItemIcon>
          <ListItemText primary="예약 현황/통계" />
        </ListItemButton>
        <ListItemButton onClick={() => onMenuSelect('drivenote')}>
          <ListItemIcon sx={{ color: 'white' }}><DriveNoteIcon /></ListItemIcon>
          <ListItemText primary="운행 기록 확인" />
        </ListItemButton>
        <ListItemButton onClick={() => onMenuSelect('managermanage')}>
          <ListItemIcon sx={{ color: 'white' }}><ManagerIcon /></ListItemIcon>
          <ListItemText primary="관리자 계정 관리" />
        </ListItemButton>
      </List>
      <Divider sx={{ backgroundColor: '#ffffff33' }} />
      <List>
        <ListItemButton onClick={handleLogout}>
          <ListItemIcon sx={{ color: 'white' }}><LogoutIcon /></ListItemIcon>
          <ListItemText primary="로그아웃" />
        </ListItemButton>
        <Box sx={{ display: 'flex', alignItems: 'center', color: 'white', ml: 2, mt: 35 }}>
          <VerifiedUser sx={{ fontSize: 25, mr: 2 }} />
          <Typography variant="body2">
            관리자: {adminName || "불러오는 중..."}
          </Typography>
        </Box>
      </List>
    </Drawer>
  );
};

export default Sidebar;
