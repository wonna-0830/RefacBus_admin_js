import React from 'react';
import { TableCell, Typography } from '@mui/material';
import { getColorByRoute } from '../../utils/colorUnits';
import { days, timeSlots, getDayIndex } from './constants';

const DriverTableCell = ({
  day,
  rowIndex,
  colIndex,
  user,
  scheduleData,
  isColored,
  onClick
}) => {
  let routeText = '';
  let isStartCell = false;
  let bgColor = "inherit";

  if (scheduleData) {
    Object.values(scheduleData).forEach(({ days, time, duration, route }) => {
      const startIndex = timeSlots.findIndex((t) => {
        const [h] = time.split(":").map(Number);
        const [slotH] = t.split(":").map(Number);
        return h >= slotH && h < slotH + 1;
      });

      const col = getDayIndex(day);
      if (startIndex === -1 || !days.includes(day)) return;

      if (rowIndex >= startIndex && rowIndex < startIndex + duration) {
        if (rowIndex === startIndex) {
          routeText = `${route}\n(${time})`;
          isStartCell = true;
        }
        bgColor = getColorByRoute(route);
      }
    });
  }

  const handleClick = () => {
    if (!isColored || !scheduleData) return;

    const matched = Object.entries(scheduleData).find(([key, { days, time, duration, route }]) => {
      const startIdx = timeSlots.findIndex((slot) => {
        const [h] = time.split(":").map(Number);
        const [slotH] = slot.split(":").map(Number);
        return h >= slotH && h < slotH + 1;
      });

      const isMatch =
        days.includes(day) &&
        rowIndex >= startIdx &&
        rowIndex < startIdx + duration;

      return isMatch;
    });

    if (matched) {
      const [key, value] = matched;
      onClick({ ...value, key });
    }
  };

  return (
    <TableCell
      align="center"
      sx={{
        border: "1px solid #ddd",
        minWidth: "120px",
        height: 40,
        backgroundColor: isColored ? bgColor : "inherit",
        color: isColored ? "#000" : "inherit",
        whiteSpace: "pre-line",
        cursor: isColored ? "pointer" : "default",
        wordBreak: "break-word",
        textAlign: "center",
        lineHeight: 1.2,
        padding: "4px",
        userSelect: "none"
      }}
      onClick={handleClick}
    >
      {isStartCell && (
        <Typography
          variant="caption"
          sx={{ fontSize: "0.7rem", fontWeight: 600, cursor: "inherit" }}
        >
          {routeText}
        </Typography>
      )}
    </TableCell>
  );
};

export default DriverTableCell;
