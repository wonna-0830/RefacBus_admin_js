import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Typography, Button
} from '@mui/material';

const PasswordResetDialog = ({
  open,
  email,
  setEmail,
  onConfirm,
  onClose
}) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>비밀번호 초기화</DialogTitle>
    <DialogContent>
      <TextField
        fullWidth
        label="이메일"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
        기본 이메일이 입력되어 있으며, 필요 시 변경 가능합니다.
      </Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onConfirm} color="primary">확인</Button>
      <Button onClick={onClose} color="secondary">취소</Button>
    </DialogActions>
  </Dialog>
);

export default PasswordResetDialog;
