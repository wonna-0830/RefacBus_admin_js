import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Paper,
  Typography,
} from "@mui/material";
import "react-calendar/dist/Calendar.css";
import { getDatabase, ref, push, get } from "firebase/database";
import { getAuth } from "firebase/auth";
import SharedCalendar from "../calendar/SharedCalendar";

const Manager_Schedule = () => {
  const [value, setValue] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [schedule, setSchedule] = useState("");
  const [markedDates, setMarkedDates] = useState([]);
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    const fetchMarkedDates = async () => {
      const db = getDatabase();
      const scheduleRef = ref(db, "managerSchedules");
      const snapshot = await get(scheduleRef);

      if (snapshot.exists()) {
        const data = snapshot.val();

        const uniqueDates = new Set();
        const scheduleList = [];

        for (const date of Object.keys(data)) {
          const entries = Object.values(data[date]);
          if (entries.length > 0) {
            uniqueDates.add(date);
          }
          entries.forEach((item) => {
            scheduleList.push({
              date,
              text: item.text || "",
            });
          });
        }

        setMarkedDates(Array.from(uniqueDates));
        setSchedules(scheduleList);
      }
    };

    fetchMarkedDates();
  }, []);

  const handleAddClick = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = () => {
    if (!year || !month || !day || !schedule.trim()) {
      alert("모든 값을 입력해주세요!");
      return;
    }

    const db = getDatabase();
    const auth = getAuth();
    const uid = auth.currentUser?.uid;

    if (!uid) {
      alert("로그인이 필요합니다.");
      return;
    }

    const dateKey = `${year}-${month}-${day}`;

    const scheduleData = {
      date: dateKey,
      text: schedule.trim(),
      createdAt: new Date().toISOString(),
      uid: uid,
    };

    push(ref(db, `managerSchedules/${dateKey}`), scheduleData)
      .then(() => {
        alert("일정이 저장되었습니다!");
        setOpen(false);
        setYear("");
        setMonth("");
        setDay("");
        setSchedule("");
        setMarkedDates((prev) => [...new Set([...prev, dateKey])]);
        setSchedules((prev) => [...prev, { date: dateKey, text: schedule.trim() }]);
      })
      .catch((error) => {
        console.error("일정 저장 오류:", error);
        alert("일정 저장에 실패했습니다.");
      });
  };

  return (
    <Box sx={{ width: "100%" }}>
      {/* 캘린더 + 일정 목록 + 버튼 */}
      <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
        <SharedCalendar
          value={value}
          onChange={setValue}
          markedDates={markedDates}
        />

        {/* 일정 목록 */}
        <Box
          sx={{
            minWidth: "200px",
            p: 2,
            border: "1px solid #ccc",
            borderRadius: 2,
            backgroundColor: "#f9f9f9",
          }}
        >
          <Typography variant="h6" gutterBottom>
            📋 등록된 일정
          </Typography>
          {schedules.map((s, i) => (
            <Box key={i} sx={{ mb: 1 }}>
              <strong>{s.date}</strong>
              <br />
              {s.text}
            </Box>
          ))}
        </Box>

        {/* 일정 추가 버튼 */}
        <Box sx={{ alignSelf: "center" }}>
          <Button variant="contained" onClick={handleAddClick}>
            일정 추가
          </Button>
        </Box>
      </Box>

      {/* 일정 추가 모달 */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>📅 일정 등록</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
        >
          <Box sx={{ display: "flex", gap: 2 }}>
            <FormControl sx={{ width: 100 }}>
              <InputLabel>년도</InputLabel>
              <Select value={year} onChange={(e) => setYear(e.target.value)}>
                <MenuItem value="2025">2025</MenuItem>
                <MenuItem value="2024">2024</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ width: 100 }}>
              <InputLabel>월</InputLabel>
              <Select value={month} onChange={(e) => setMonth(e.target.value)}>
                {Array.from({ length: 12 }, (_, i) => (
                  <MenuItem key={i + 1} value={String(i + 1).padStart(2, "0")}>
                    {i + 1}월
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ width: 100 }}>
              <InputLabel>일</InputLabel>
              <Select value={day} onChange={(e) => setDay(e.target.value)}>
                {Array.from({ length: 31 }, (_, i) => (
                  <MenuItem key={i + 1} value={String(i + 1).padStart(2, "0")}>
                    {i + 1}일
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <TextField
            label="일정 내용"
            variant="outlined"
            fullWidth
            multiline
            rows={3}
            value={schedule}
            onChange={(e) => setSchedule(e.target.value)}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>취소</Button>
          <Button onClick={handleSave} variant="contained">
            저장
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Manager_Schedule;
