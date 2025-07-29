import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const ReservationListTable = ({ data = [] }) => {
  return (
    <Paper
      elevation={2}
      sx={{
        backgroundColor: '#fff',
        padding: 2,
        mt: 2,
        borderRadius: 2,
      }}
    >
      <Box sx={{ display: 'flex', mb: 1 }}>
        <Typography sx={{ width: 200, fontWeight: 'bold' }}>이메일</Typography>
        <Typography sx={{ width: 200, fontWeight: 'bold' }}>이름</Typography>
        <Typography sx={{ width: 200, fontWeight: 'bold' }}>노선</Typography>
        <Typography sx={{ width: 150, fontWeight: 'bold' }}>예약 날짜</Typography>
        <Typography sx={{ width: 150, fontWeight: 'bold' }}>출발 시간</Typography>
        <Typography sx={{ width: 100, fontWeight: 'bold' }}>취소 여부</Typography>
      </Box>

      {data.length > 0 ? (
        data.map((item, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              py: 1,
              borderBottom: '1px solid #eee',
            }}
          >
            <Typography sx={{ width: 200 }}>{item.email}</Typography>
            <Typography sx={{ width: 200 }}>{item.name}</Typography>
            <Typography sx={{ width: 200 }}>{item.route}</Typography>
            <Typography sx={{ width: 150 }}>{item.date}</Typography>
            <Typography sx={{ width: 150 }}>{item.time}</Typography>
            <Typography sx={{ width: 100 }}>
              {item.canceled ? '취소됨' : '예약 중'}
            </Typography>
          </Box>
        ))
      ) : (
        <Typography sx={{ py: 2, textAlign: 'center' }}>
          조회된 예약이 없습니다.
        </Typography>
      )}
    </Paper>
  );
};

export default ReservationListTable;
