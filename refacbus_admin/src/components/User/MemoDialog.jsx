// components/MemoDialog.jsx
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
  FormControlLabel,
  Button
} from "@mui/material";

const MemoDialog = ({
  open,
  memoText,
  setMemoText,
  isWarning,
  setIsWarning,
  isBan,
  setIsBan,
  onConfirm,
  onCancel
}) => {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>관리자 메모</DialogTitle>
      <DialogContent>
        <TextField
          label="메모 내용"
          multiline
          fullWidth
          value={memoText}
          onChange={(e) => setMemoText(e.target.value)}
        />
        <FormControlLabel
          control={<Checkbox checked={isWarning} onChange={(e) => setIsWarning(e.target.checked)} />}
          label="경고 부여"
        />
        <FormControlLabel
          control={<Checkbox checked={isBan} onChange={(e) => setIsBan(e.target.checked)} />}
          label="계정 정지"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onConfirm} color="primary">확인</Button>
        <Button onClick={onCancel} color="secondary">취소</Button>
      </DialogActions>
    </Dialog>
  );
};

export default MemoDialog;
