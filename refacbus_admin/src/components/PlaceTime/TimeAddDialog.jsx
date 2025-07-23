import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button
} from '@mui/material';

const TimeAddDialog = ({
  open,
  value,
  onChange,
  onClose,
  onSubmit
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>시간대 추가</DialogTitle>
      <DialogContent>
        <TextField
          label="시간 입력"
          multiline
          fullWidth
          value={value}
          onChange={onChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onSubmit} color="primary">확인</Button>
        <Button onClick={onClose} color="secondary">취소</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TimeAddDialog;
