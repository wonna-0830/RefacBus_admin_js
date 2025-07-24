import React, { useState } from 'react';
import {
 IconButton, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box
} from '@mui/material';
import { useEffect } from 'react';
import { onValue } from 'firebase/database';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import AddIcon from '@mui/icons-material/Add';
import { push, ref, set, update } from 'firebase/database';
import { realtimeDb } from '../firebase'; 
import Manager_Schedule from "../components/Manager/Manager_Schedule";
import TabbedContainer from '../components/common/TabbedContainer';
import TabPanel from '../components/common/TabPanel';
import NoticeFormDialog from '../components/Notice/NoticeFormDialog';


const ManagerManagement = () => {
  //탭 상태
  const [tabIndex, setTabIndex] = useState(0);
  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  //공지사항 다이얼로그 관련
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [isPinned, setIsPinned] = useState(false);

  //공지사항 목록
  const [notices, setNotices] = useState([]);

  //공지사항 제출 핸들러
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

  //공지사항 목록 실시간 불러오기
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

  //고정여부 토글 핸들러
  const togglePinned = (id, currentState) => {
  const noticeRef = ref(realtimeDb, `notices/${id}`);
  update(noticeRef, { isPinned: !currentState });
  };


  return (
    <Box sx={{ width: '100%' }}>
      
      <TabbedContainer
          tabIndex={tabIndex}
          handleTabChange={handleTabChange}
          labels={["관리자 역할 구분", "일정 등록 및 관리", "공지사항 등록 및 관리"]}
        />

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
        <TabPanel value={tabIndex} index={1}>
          <Manager_Schedule />
        </TabPanel>
        <TabPanel value={tabIndex} index={2}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpen(true)}
            sx={{ mb: 2 }}
          >
            새 공지사항 등록
          </Button>

          <NoticeFormDialog
            open={open}
            title={title}
            setTitle={setTitle}
            url={url}
            setUrl={setUrl}
            isPinned={isPinned}
            setIsPinned={setIsPinned}
            onSubmit={handleSubmit}
            onCancel={() => setOpen(false)}
          />
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
