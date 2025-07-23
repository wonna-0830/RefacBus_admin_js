// components/SharedCalendar.jsx
import React from "react";
import Calendar from "react-calendar";
import Paper from "@mui/material/Paper";
import "./SharedCalendar.css"; 


const SharedCalendar = ({ value, onChange, markedDates = [] }) => {
  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;

      if (markedDates.includes(dateStr)) {
        return "highlight";
      }
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
      />
    </Paper>
  );
};

export default SharedCalendar;
