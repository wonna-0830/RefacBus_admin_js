import React from 'react';
import {
  TableContainer, Table, TableHead, TableRow,
  TableCell, TableBody, Paper, IconButton
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';

const RouteListTable = ({
  routeList,
  onClickRoute,
  onTogglePinned
}) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell style={{ width: "50%" }}>노선</TableCell>
            <TableCell style={{ width: "40%" }}>등록 날짜</TableCell>
            <TableCell style={{ width: "10%" }}>고정</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {routeList.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <span
                  style={{ cursor: 'pointer', textDecoration: 'underline' }}
                  onClick={() => onClickRoute(item)}
                >
                  {item.name}
                </span>
              </TableCell>
              <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
              <TableCell>
                <IconButton onClick={() => onTogglePinned(item.id, item.isPinned)}>
                  {item.isPinned ? (
                    <StarIcon color="warning" />
                  ) : (
                    <StarBorderIcon />
                  )}
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default RouteListTable;
