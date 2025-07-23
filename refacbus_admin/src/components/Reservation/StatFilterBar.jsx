import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button
} from '@mui/material';
import DateSelector from './DateSelector';

const StatFilterBar = ({
  statType,
  onTypeChange,
  chartYear,
  chartMonth,
  chartDay,
  onYearChange,
  onMonthChange,
  onDayChange,
  selectedRoute,
  onRouteChange,
  routeList,
  onSearchClick
}) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 5 }}>
      {/* 통계 유형 선택 */}
      <FormControl sx={{ width: 200 }}>
        <InputLabel>통계 유형</InputLabel>
        <Select value={statType} onChange={onTypeChange}>
          <MenuItem value="route">날짜별 노선별 예약 수</MenuItem>
          <MenuItem value="station">노선별 정류장 예약 수</MenuItem>
          <MenuItem value="time">노선별 시간대 예약 수</MenuItem>
          <MenuItem value="routeTotal">전체 노선 누적 예약 수</MenuItem>
        </Select>
      </FormControl>

      {/* 날짜 필터 (route 유형일 때만 표시) */}
      {statType === 'route' && (
        <DateSelector
          year={chartYear}
          month={chartMonth}
          day={chartDay}
          onYearChange={onYearChange}
          onMonthChange={onMonthChange}
          onDayChange={onDayChange}
          allowEmpty={true}
        />
      )}

      {/* 노선 필터 (station / time 유형일 때만 표시) */}
      {(statType === 'station' || statType === 'time') && (
        <FormControl sx={{ width: 200 }}>
          <InputLabel>노선 선택</InputLabel>
          <Select value={selectedRoute} onChange={(e) => onRouteChange(e.target.value)}>
            {routeList.map((route) => (
              <MenuItem key={route} value={route}>{route}</MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {/* 조회 버튼 */}
      <Button variant="contained" onClick={onSearchClick}>조회</Button>
    </Box>
  );
};

export default StatFilterBar;
