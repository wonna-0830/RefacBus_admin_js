import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const DateSelector = ({
  year,
  month,
  day,
  onYearChange,
  onMonthChange,
  onDayChange,
  allowEmpty = false,
}) => {
  const years = ['2023', '2024', '2025'];
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));

  return (
    <>
      <FormControl sx={{ width: 150 }}>
        <InputLabel>년도</InputLabel>
        <Select value={year} onChange={onYearChange}>
          {allowEmpty && <MenuItem value="">전체</MenuItem>}
          {years.map((y) => (
            <MenuItem key={y} value={y}>{y}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl sx={{ width: 150 }}>
        <InputLabel>월</InputLabel>
        <Select value={month} onChange={onMonthChange}>
          {allowEmpty && <MenuItem value="">전체</MenuItem>}
          {months.map((m) => (
            <MenuItem key={m} value={m}>{Number(m)}월</MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl sx={{ width: 150 }}>
        <InputLabel>일</InputLabel>
        <Select value={day} onChange={onDayChange}>
          {allowEmpty && <MenuItem value="">전체</MenuItem>}
          {days.map((d) => (
            <MenuItem key={d} value={d}>{Number(d)}일</MenuItem>
          ))}
        </Select>
      </FormControl>
    </>
  );
};

export default DateSelector;
