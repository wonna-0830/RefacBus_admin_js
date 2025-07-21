import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, TextField, IconButton, Button, Typography
} from '@mui/material';
import { useEffect } from 'react';
import { onValue } from 'firebase/database';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import AddIcon from '@mui/icons-material/Add';
import { push, ref, set, update } from 'firebase/database';
import { realtimeDb } from '../firebase'; 
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

const ManagerManagement = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [notices, setNotices] = useState([]);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const handleSubmit = () => {
    const newNotice = {
      title,
      url,
      isPinned,
      date: new Date().toISOString(),
      writer: '관리자',
    };

    const newRef = push(ref(realtimeDb, 'notices'));
    set(newRef, newNotice);

    setOpen(false);
    setTitle('');
    setUrl('');
    setIsPinned(false);
  };

  useEffect(() => {
    const noticesRef = ref(realtimeDb, 'notices');
    onValue(noticesRef, snapshot => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([id, item]) => ({
          id,
          ...item
        }));
        list.sort((a, b) => b.isPinned - a.isPinned);
        setNotices(list);
      } else {
        setNotices([]);
      }
    });
  }, []);

  const togglePinned = (id, currentState) => {
  const noticeRef = ref(realtimeDb, `notices/${id}`);
  update(noticeRef, { isPinned: !currentState });
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
          variant="standard" 
          centered             
          sx={{
            minWidth: 'fit-content',  
          }}
        >
          <Tab label="관리자 역할 구분" />
          <Tab label="주요 기능 접근 제한" />
          <Tab label="일정 등록 및 관리" />
          <Tab label="공지사항 등록 및 관리" />
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
        <TabPanel value={tabIndex} index={0}>관리자 역할 구분</TabPanel>
        <TabPanel value={tabIndex} index={1}>주요 기능 접근 제한</TabPanel>
        <TabPanel value={tabIndex} index={2}>일정 등록 및 관리</TabPanel>
        <TabPanel value={tabIndex} index={3}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpen(true)}
            sx={{ mb: 2 }}
          >
            새 공지사항 등록
          </Button>

          {/* 팝업 다이얼로그 */}
          <Dialog open={open} onClose={() => setOpen(false)}>
            <DialogTitle>공지사항 등록</DialogTitle>
            <DialogContent>
              <TextField
                label="제목"
                fullWidth
                margin="normal"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
              <TextField
                label="URL"
                fullWidth
                margin="normal"
                value={url}
                onChange={e => setUrl(e.target.value)}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <IconButton onClick={() => setIsPinned(prev => !prev)}>
                  {isPinned ? <StarIcon color="primary" /> : <StarBorderIcon />}
                </IconButton>
                <Typography>{isPinned ? '대시보드에 노출됨' : '공지사항에 등록'}</Typography>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Button variant="contained" onClick={handleSubmit}>등록</Button>
                <Button onClick={() => setOpen(false)} sx={{ ml: 1 }}>취소</Button>
              </Box>
            </DialogContent>
          </Dialog>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>제목</TableCell>
                  <TableCell>등록일</TableCell>
                  <TableCell>고정</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {notices.map((notice) => (
                  <TableRow key={notice.id}>
                    <TableCell>
                      <a href={notice.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: '#1976d2' }}>
                        {notice.title}
                      </a>
                    </TableCell>
                    <TableCell>{new Date(notice.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => togglePinned(notice.id, notice.isPinned)}>
                        {notice.isPinned ? <StarIcon color="warning" /> : <StarBorderIcon />}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Box>
    </Box>
  );
};

export default ManagerManagement;
