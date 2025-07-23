import React from 'react';
import {
  Table, TableHead, TableBody, TableRow, TableCell, IconButton
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DriverWeeklySchedule from './DriverWeeklySchedule';

const DriverListTable = ({
  users,
  expandedDriverUid,
  driverSchedules,
  coloredSchedule,
  onTimeClick,
  onScheduleToggle,
  onAddClick,
  onCellClick
}) => {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>uid</TableCell>
          <TableCell>아이디</TableCell>
          <TableCell>이름</TableCell>
          <TableCell>가입 날짜</TableCell>
          <TableCell>운행 시간 관리</TableCell>
          <TableCell>운행 일정 관리</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {users.map((user) => (
          <React.Fragment key={user.uid}>
            <TableRow>
              <TableCell>{user.uid}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.joinDate}</TableCell>
              <TableCell>
                <IconButton onClick={(e) => onTimeClick(e, user)}>
                  <AccessTimeIcon />
                </IconButton>
              </TableCell>
              <TableCell>
                <IconButton onClick={() => onScheduleToggle(user)}>
                  {expandedDriverUid === user.uid ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </TableCell>
            </TableRow>

            {expandedDriverUid === user.uid && (
              <TableRow>
                <TableCell colSpan={6}>
                  <DriverWeeklySchedule
                    user={user}
                    scheduleData={driverSchedules[user.uid]}
                    coloredSchedule={coloredSchedule[user.uid]}
                    onAddClick={onAddClick}
                    onCellClick={onCellClick}
                  />
                </TableCell>
              </TableRow>
            )}
          </React.Fragment>
        ))}
      </TableBody>
    </Table>
  );
};

export default DriverListTable;
