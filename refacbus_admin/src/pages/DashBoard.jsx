import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Typography, List, ListItemButton, ListItemText, Paper } from '@mui/material';
import { getDatabase, ref, onValue } from 'firebase/database';

const Dashboard = () => {
  const [value, setValue] = useState(new Date());
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    const db = getDatabase();
    const noticeRef = ref(db, 'notices');

    onValue(noticeRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const pinned = Object.values(data).filter(n => n.isPinned === true);
        setNotices(pinned);
      }
    });
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        관리자 대시보드
      </Typography>

      <Box sx={{ display: 'flex', gap: 2}}>
        {/* 캘린더 */}
        <Paper elevation={3}
        sx={{ width: 500, height:400, p: 2,borderRadius: 2, '& .react-calendar': {width: '100%', height:'100%', fontSize: '1.2rem', },}}>
          <Calendar 
            onChange={setValue}
            value={value}
            className="custom-calendar"
          />
        </Paper>

        {/* 공지사항 */}
        <Box sx={{backgroundColor: '#fff', p: 2, borderRadius: 2,  boxShadow: 3 }}>
          <Typography variant="h6" gutterBottom>
            공지사항
          </Typography>
          <List>
            {notices.map((notice, index) => (
              <ListItemButton
                key={index}
                component="a"
                href={notice.url}
                target="_blank"
              >
                <ListItemText
                  primary={`${notice.title} (${new Date(notice.date).toLocaleDateString('ko-KR')})`}
                />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Box>
    </Box>
  );
};


export default Dashboard;
