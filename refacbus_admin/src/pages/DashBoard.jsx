import React, { useEffect, useState } from "react";
import SharedCalendar from "../components/calendar/SharedCalendar";
import { get, ref, getDatabase, onValue } from "firebase/database";
import { realtimeDb } from "../firebase";
import { Box, Typography, List, ListItem, ListItemText, Paper } from "@mui/material";
import dayjs from "dayjs";
import NoticeList from '../components/Notice/NoticeList';

const Dashboard = () => {
  const [value, setValue] = useState(new Date()); 
  const [markedDates, setMarkedDates] = useState([]); 
  const [scheduleList, setScheduleList] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(dayjs().format("YYYY-MM"));
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

  useEffect(() => {
  const fetchSchedulesForMonth = async () => {
    if (!currentMonth) return;

    const db = getDatabase();
    const monthRef = ref(db, `managerSchedules/${currentMonth}`);
    const snapshot = await get(monthRef);

    if (!snapshot.exists()) {
      console.log("❌ 해당 월의 일정 없음");
      setScheduleList([]);
      return;
    }

    const data = snapshot.val();
    console.log("📦 가져온 managerSchedules 데이터:", data);

    const scheduleArray = [];

    for (const dayKey in data) {
      const item = data[dayKey];
      if (item?.text) {
        scheduleArray.push({
          date: dayKey,
          text: item.text,
          createdAt: item.createdAt,
        });
      }
    }

    console.log("✅ 추출한 일정 배열:", scheduleArray);
    setScheduleList(scheduleArray);
    setMarkedDates(scheduleArray.map(s => s.date));
  };

  fetchSchedulesForMonth();
}, [currentMonth]);


  const handleMonthChange = (newMonthStr) => {
    setValue(dayjs(newMonthStr + "-01").toDate());
    setCurrentMonth(newMonthStr); 
  };

  return (
    <Box sx={{ display: "flex", gap: 3 }}>
      
      {/* 왼쪽: 캘린더 + 일정목록 세로 배치 */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <SharedCalendar
          value={value}
          onChange={setValue}
          markedDates={markedDates}
          onMonthChange={handleMonthChange}
        />

        <Paper sx={{ width: 500, height: 400, p: 2, borderRadius: 2, overflowY: "auto" }}>
          <Typography variant="h6" gutterBottom>
            📅 {dayjs(value).format("YYYY년 MM월")} 일정 목록
          </Typography>

          {scheduleList.length === 0 ? (
            <Typography variant="body2" sx={{ mt: 2 }}>
              해당 월의 일정이 없습니다.
            </Typography>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr", // ✅ 2단 구조
                gap: 2,
              }}
            >
              {scheduleList
                .filter((s) => s.date.startsWith(currentMonth))
                .map((s, i) => (
                  <Box key={i}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {s.date}
                    </Typography>
                    <Typography variant="body2">{s.text}</Typography>
                  </Box>
                ))}
            </Box>
          )}
        </Paper>

      </Box>

      {/* 오른쪽: 공지사항 */}
      <NoticeList notices={notices} />
    </Box>
  );


};

export default Dashboard;
