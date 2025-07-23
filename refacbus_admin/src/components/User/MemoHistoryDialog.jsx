// components/MemoHistoryDialog.jsx
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Paper
} from "@mui/material";

const MemoHistoryDialog = ({
  open,
  onClose,
  memoFilter,
  setMemoFilter,
  memoList
}) => {
  const filtered = memoList.filter(memo =>
    memoFilter === "all" ? true : memo.type === memoFilter
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>📋 메모 이력</DialogTitle>
      <Box sx={{ display: 'flex', gap: 1, mb: 2, px: 3 }}>
        <Button variant={memoFilter === "all" ? "contained" : "outlined"} onClick={() => setMemoFilter("all")}>전체</Button>
        <Button variant={memoFilter === "warning" ? "contained" : "outlined"} onClick={() => setMemoFilter("warning")}>경고</Button>
        <Button variant={memoFilter === "ban" ? "contained" : "outlined"} onClick={() => setMemoFilter("ban")}>정지</Button>
      </Box>
      <DialogContent>
        {filtered.length === 0 ? (
          <Typography>메모 이력이 없습니다.</Typography>
        ) : (
          <Box>
            {filtered.map((memo, index) => (
              <Box key={index}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {memo.timestamp} / {memo.writer}
                </Typography>
                <Paper sx={{ p: 1, mb: 2 }}>
                  <Typography>{memo.text}</Typography>
                </Paper>
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>닫기</Button>
      </DialogActions>
    </Dialog>
  );
};

export default MemoHistoryDialog;
