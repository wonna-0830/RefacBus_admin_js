// components/NoticeFormDialog.jsx
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  IconButton,
  Button,
  Typography,
  Box
} from "@mui/material";
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';

const NoticeFormDialog = ({
  open,
  title,
  setTitle,
  url,
  setUrl,
  isPinned,
  setIsPinned,
  onSubmit,
  onCancel
}) => {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>공지사항 등록</DialogTitle>
      <DialogContent>
        <TextField
          label="제목"
          fullWidth
          margin="normal"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <TextField
          label="URL"
          fullWidth
          margin="normal"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
          <IconButton onClick={() => setIsPinned(prev => !prev)}>
            {isPinned ? <StarIcon color="primary" /> : <StarBorderIcon />}
          </IconButton>
          <Typography>{isPinned ? '대시보드에 노출됨' : '공지사항에 등록'}</Typography>
        </Box>
        <Box sx={{ mt: 2 }}>
          <Button variant="contained" onClick={onSubmit}>등록</Button>
          <Button onClick={onCancel} sx={{ ml: 1 }}>취소</Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default NoticeFormDialog;
