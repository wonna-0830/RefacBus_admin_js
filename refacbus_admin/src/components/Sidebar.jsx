// components/Sidebar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import UserIcon from '@mui/icons-material/Home';
import PlaceTimeIcon from '@mui/icons-material/People';
import ReservationsIcon from '@mui/icons-material/DirectionsBus';
import DriveNoteIcon from '@mui/icons-material/EventNote';
import ManagerIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';

const drawerWidth = 240;

const Sidebar = ({ onMenuSelect }) => {
  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#002857', // 대구가톨릭대 메인 컬러(임시)
          color: 'white',
        },
      }}
      variant="permanent"
      anchor="left"
    >
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          DCU 스쿨버스 관리자
        </Typography>
      </Toolbar>
      <Divider sx={{ backgroundColor: '#ffffff33' }} />
      <List>
        <ListItemButton  onClick={() => onMenuSelect('user')}>
          <ListItemIcon sx={{ color: 'white' }}><UserIcon /></ListItemIcon>
          <ListItemText primary="회원 관리" />
        </ListItemButton>
        <ListItemButton onClick={() => onMenuSelect('placetime')}>
          <ListItemIcon sx={{ color: 'white' }}><PlaceTimeIcon /></ListItemIcon>
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
        <ListItemButton>
          <ListItemIcon sx={{ color: 'white' }}><LogoutIcon /></ListItemIcon>
          <ListItemText primary="로그아웃" />
        </ListItemButton>
      </List>
    </Drawer>
  );
};

export default Sidebar;
