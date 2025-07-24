import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button
} from '@mui/material';

const UserEditDialog = ({
  open,
  onClose,
  onConfirm,
  email,
  name,
  setEmail,
  setName
}) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>회원 정보 수정</DialogTitle>
    <DialogContent>
      <TextField
        margin="dense"
        label="이메일"
        fullWidth
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        margin="dense"
        label="이름"
        fullWidth
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>취소</Button>
      <Button onClick={onConfirm} color="primary">확인</Button>
    </DialogActions>
  </Dialog>
);

export default UserEditDialog;
