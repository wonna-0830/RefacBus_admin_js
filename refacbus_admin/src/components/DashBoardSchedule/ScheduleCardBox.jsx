import React, { useEffect, useState } from "react";
import { getDatabase, ref, get } from "firebase/database";
import { Box, Typography, Paper, Grid } from "@mui/material";

const ScheduleCardBox = () => {
  const [scheduleList, setScheduleList] = useState([]);
  

  useEffect(() => {
    const fetchSchedules = async () => {
      const db = getDatabase();
      const scheduleRef = ref(db, "managerSchedules");
      const snapshot = await get(scheduleRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const parsed = Object.entries(data).map(([date, content]) => ({
          date,
          content,
        }));
        setScheduleList(parsed);
      }
    };

    fetchSchedules();
  }, []);

  return (
    <Box sx={{ mt: 3, p: 2 }}>
      <Typography variant="h6" gutterBottom>
        일정 목록
      </Typography>
      <Grid container spacing={2}>
        {scheduleList.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Paper
              elevation={3}
              sx={{
                p: 2,
                borderRadius: 2,
                height: 120,
                backgroundColor: "#f0f4ff",
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold">
                {item.date}
              </Typography>
              {Object.values(item.content).map((schedule, i) => (
                <Typography key={i} variant="body2" mt={1}>
                  {schedule.text}
                </Typography>
              ))}
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ScheduleCardBox;
