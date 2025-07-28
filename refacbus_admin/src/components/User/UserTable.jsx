import React from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Menu,
  MenuItem
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditNoteIcon from "@mui/icons-material/EditNote";

const UserTable = ({
  users,
  type = "user",
  onMemoClick,
  onMenuClick,
  anchorEl,
  anchorUserId,
  onMenuClose,
  onUnban,
  onReset,
  onEdit,
  onMemoHistory,
  onRoleClick 
}) => {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>uid</TableCell>
          <TableCell>아이디</TableCell>
          <TableCell>이름</TableCell>
          <TableCell>가입 날짜</TableCell>
          <TableCell>경고 횟수</TableCell>
          <TableCell>정지</TableCell>
          <TableCell>작업</TableCell>
          <TableCell>메모</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.uid}>
            <TableCell>{user.uid}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.name}</TableCell>
            <TableCell>{user.joinDate ? user.joinDate.split("T")[0] : "-"}</TableCell>
            <TableCell>{user.warningCount ?? 0}</TableCell>
            <TableCell>{user.isBanned ? "정지됨" : "X"}</TableCell>

            <TableCell>
              <IconButton onClick={(e) => onMenuClick(e, user)}>
                <MoreVertIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={anchorUserId === user.uid}
                onClose={onMenuClose}
              >
                <MenuItem onClick={() => onUnban(user.uid)}>정지 해제</MenuItem>
                <MenuItem onClick={() => { onReset(user); onMenuClose(); }}>비밀번호 초기화</MenuItem>
                <MenuItem onClick={() => { onEdit(user); onMenuClose(); }}>회원 수정</MenuItem>
                <MenuItem onClick={() => { onMemoHistory(user); onMenuClose(); }}>메모 보기</MenuItem>
                {type === "admin" && user.name !== "박정원" && (
                  <MenuItem onClick={() => { onRoleClick(user); onMenuClose(); }}>권한 설정</MenuItem>
                )}
              </Menu>
            </TableCell>

            <TableCell>
              <IconButton onClick={() => onMemoClick(user)}>
                <EditNoteIcon />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default UserTable;
