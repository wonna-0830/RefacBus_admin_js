// components/Driver/DrivingHistoryDialog.jsx
import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableHead, TableBody, TableRow, TableCell,
  Typography, Button
} from '@mui/material';

const DrivingHistoryDialog = ({ open, onClose, driverName, historyList }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{driverName}님의 운행 이력</DialogTitle>
      <DialogContent>
        {historyList.length > 0 ? (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>노선</TableCell>
                <TableCell>날짜</TableCell>
                <TableCell>예정 출발 시간</TableCell>
                <TableCell>운행 종료 시간</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {historyList.map((record, idx) => (
                <TableRow key={idx}>
                  <TableCell>{record.route}</TableCell>
                  <TableCell>{record.date}</TableCell>
                  <TableCell>{record.time}</TableCell>
                  <TableCell>{record.endTime}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Typography>운행 이력이 없습니다.</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>닫기</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DrivingHistoryDialog;
