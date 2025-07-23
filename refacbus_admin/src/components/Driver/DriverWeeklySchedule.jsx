console.log("✅ DriverWeeklySchedule 불러옴!");
import React from 'react';
import { Box, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DriverTableCell from './DriverTableCell';
import DriverScheduleHeader from './DriverScheduleHeader';
import { days, timeSlots, getDayIndex } from './constants';


const DriverWeeklySchedule = ({
  user,
  scheduleData,
  coloredSchedule,
  onAddClick,
  onCellClick
  }) => {
  return (
    <Box sx={{ p: 2, backgroundColor: "#f9f9f9", borderRadius: 2, mb: 2 }}>
      {/* 상단 헤더 */}
      <DriverScheduleHeader name={user.name} onAddClick={() => onAddClick(user)} />

      {/* 시간표 */}
      <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
        <TableHead>
          <TableRow>
            <TableCell>시간</TableCell>
            {days.map((day) => (
              <TableCell key={day} align="center">{day}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {timeSlots.map((time, rowIndex) => (
            <TableRow key={time}>
              <TableCell>{time}</TableCell>
                {days.map((day, colIndex) => {
                  const cellKey = `${colIndex}-${rowIndex}`;
                  return (
                    <DriverTableCell
                      key={day}
                      day={day}
                      rowIndex={rowIndex}
                      colIndex={colIndex}
                      user={user}
                      scheduleData={scheduleData}
                      isColored={coloredSchedule?.includes(cellKey)}
                      onClick={onCellClick}
                    />
                  );
                })}
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default DriverWeeklySchedule;
