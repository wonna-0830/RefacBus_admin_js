// components/SharedCalendar.jsx
import React from "react";
import Calendar from "react-calendar";
import Paper from "@mui/material/Paper";
import "./SharedCalendar.css";
import dayjs from "dayjs";

const SharedCalendar = ({ value, onChange, markedDates = [], onMonthChange }) => {
  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const formatted = dayjs(date).format("YYYY-MM-DD");
      return markedDates.includes(formatted) ? "highlight" : null;
    }
    return null;
  };

  return (
    <Paper
      elevation={3}
      sx={{
        width: 500,
        height: 400,
        p: 2,
        borderRadius: 2,
        "& .react-calendar": {
          width: "100%",
          height: "100%",
          fontSize: "1.2rem",
        },
      }}
    >
      <Calendar
        onChange={onChange}
        value={value}
        className="custom-calendar"
        tileClassName={tileClassName}
        onActiveStartDateChange={({ activeStartDate }) => {
          const newMonth = activeStartDate.getMonth() + 1;
          const newYear = activeStartDate.getFullYear();
          const newMonthStr = `${newYear}-${String(newMonth).padStart(2, '0')}`;
          onMonthChange?.(newMonthStr); // 부모에서 이걸 받아서 setValue에 반영
        }}
      />
    </Paper>
  );
};

export default SharedCalendar;
