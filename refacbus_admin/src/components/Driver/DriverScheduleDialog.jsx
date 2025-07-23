// components/Driver/DriverScheduleDialog.jsx
import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Typography, FormControl, InputLabel, Select, MenuItem,
  Checkbox, ListItemText, Button
} from '@mui/material';

const DriverScheduleDialog = ({
  open,
  onClose,
  onSave,
  pinnedRoutes,
  availableTimes,
  selectedRoute,
  selectedTime,
  selectedDays,
  duration,
  onChangeRoute,
  onChangeTime,
  onChangeDays,
  onChangeDuration
}) => {
  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { width: "600px" } }}>
      <DialogTitle>스케줄 추가</DialogTitle>
      <DialogContent>
        <Typography>노선 스케줄 등록</Typography>

        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel id="route-select-label">노선 선택</InputLabel>
          <Select
            labelId="route-select-label"
            value={pinnedRoutes.some(route => route.name === selectedRoute) ? selectedRoute : ""}
            label="노선 선택"
            onChange={onChangeRoute}
          >
            {pinnedRoutes.map((route) => (
              <MenuItem key={route.id} value={route.name}>
                {route.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel id="time-select-label">운행 시간 선택</InputLabel>
          <Select
            labelId="time-select-label"
            value={availableTimes.includes(selectedTime) ? selectedTime : ""}
            label="운행 시간 선택"
            onChange={onChangeTime}
            disabled={!availableTimes.length}
          >
            {availableTimes.map((time, index) => (
              <MenuItem key={index} value={time}>{time}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel id="day-select-label">운행 요일</InputLabel>
          <Select
            labelId="day-select-label"
            multiple
            value={selectedDays}
            label="운행 요일 선택"
            onChange={onChangeDays}
            renderValue={(selected) => selected.join(', ')}
          >
            {['월', '화', '수', '목', '금'].map((day) => (
              <MenuItem key={day} value={day}>
                <Checkbox checked={selectedDays.includes(day)} />
                <ListItemText primary={day} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel id="duration-select-label">예상 소요 시간</InputLabel>
          <Select
            labelId="duration-select-label"
            value={duration}
            label="예상 소요시간 선택"
            onChange={onChangeDuration}
          >
            {[1, 2, 3].map((hour) => (
              <MenuItem key={hour} value={hour}>{hour}시간</MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button
          variant="contained"
          color="primary"
          onClick={onSave}
          disabled={!selectedRoute || !selectedTime || !duration || !selectedDays.length}
        >
          완료
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DriverScheduleDialog;
