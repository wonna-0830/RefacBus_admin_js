import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Typography, List, ListItemButton, ListItemText, Paper } from '@mui/material';
import { getDatabase, ref, onValue, get } from 'firebase/database';
import SharedCalendar from "../components/calendar/SharedCalendar";
import ScheduleCardBox from "../components/DashBoardSchedule/ScheduleCardBox"; 


const Dashboard = () => {
  const [value, setValue] = useState(new Date());
  const [notices, setNotices] = useState([]);
  const [markedDates, setMarkedDates] = useState([]);


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

  useEffect(() => {
    const fetchMarkedDates = async () => {
          const db = getDatabase();
          const scheduleRef = ref(db, "managerSchedules");
          const snapshot = await get(scheduleRef);
    
          if (snapshot.exists()) {
            const data = snapshot.val();
    
            const uniqueDates = new Set();
            for (const date of Object.keys(data)) {
              const entries = Object.values(data[date]);
              if (entries.length > 0) {
                uniqueDates.add(date);
              }
            }
    
            setMarkedDates(Array.from(uniqueDates));
          }
        };
    
        fetchMarkedDates();
      
  }, []);
    

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        관리자 대시보드
      </Typography>

      <Box sx={{ display: 'flex', gap: 2}}>
        {/* 캘린더 */}
        <SharedCalendar
          value={value}
          onChange={setValue}
          markedDates={markedDates}
        />

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
      <ScheduleCardBox />
    </Box>
  );
};


export default Dashboard;
