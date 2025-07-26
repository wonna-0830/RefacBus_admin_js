import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button
} from '@mui/material';

const StopAddDialog = ({
  open,
  value,
  onChange,
  onSubmit,
  onClose
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>정류장 추가</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="정류장 이름"
          value={value}
          onChange={onChange}
          autoFocus
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onSubmit} variant="contained">확인</Button>
        <Button onClick={onClose} color="secondary">취소</Button>
      </DialogActions>
    </Dialog>
  );
};

export default StopAddDialog;
