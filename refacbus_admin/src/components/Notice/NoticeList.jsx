// components/NoticeList.jsx
import React from "react";
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemText
} from "@mui/material";

const NoticeList = ({ notices = [] }) => {
  return (
    <Box sx={{ backgroundColor: '#fff', p: 2, borderRadius: 2, boxShadow: 3 }}>
      <Typography variant="h6" gutterBottom>
        공지사항
      </Typography>
      <List>
        {notices.map((notice, index) => (
          <ListItemButton
            key={index}
            component="a"
            href={notice.url}
            target="_blank"
          >
            <ListItemText
              primary={`${notice.title} (${new Date(notice.date).toLocaleDateString('ko-KR')})`}
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
};

export default NoticeList;
