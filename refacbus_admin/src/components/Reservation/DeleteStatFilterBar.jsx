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

const DeleteStatFilterBar = ({
  deleteType,
  onDeleteTypeChange,
  deleteYear,
  deleteMonth,
  deleteDay,
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
        <Select value={deleteType} onChange={onDeleteTypeChange}>
          <MenuItem value="route">날짜별 취소 노선 수</MenuItem>
          <MenuItem value="time">노선별 취소 시간대</MenuItem>
          <MenuItem value="routeTotal">전체 취소 노선 수</MenuItem>
          <MenuItem value="reason">전체 취소 사유</MenuItem>
        </Select>
      </FormControl>

      {/* 날짜 필터 (route 유형일 때만) */}
      {deleteType === 'route' && (
        <DateSelector
          year={deleteYear}
          month={deleteMonth}
          day={deleteDay}
          onYearChange={onYearChange}
          onMonthChange={onMonthChange}
          onDayChange={onDayChange}
          allowEmpty={true}
        />
      )}

      {/* 노선 필터 (time 유형일 때만) */}
      {deleteType === 'time' && (
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

export default DeleteStatFilterBar;
