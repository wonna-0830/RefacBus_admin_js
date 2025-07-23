import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button
} from '@mui/material';

const TimeEditDialog = ({
  open,
  value,
  onChange,
  onUpdate,
  onDelete,
  onClose
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>시간 수정</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="시간"
          value={value}
          onChange={onChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onUpdate} color="primary">수정</Button>
        <Button onClick={onDelete} color="error">삭제</Button>
        <Button onClick={onClose} color="secondary">취소</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TimeEditDialog;
