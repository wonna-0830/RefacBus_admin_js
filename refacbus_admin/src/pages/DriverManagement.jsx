
import React, { useState, useEffect } from 'react';
import {
  TextField, Box, Table, TableHead, TableCell, TableRow, TableBody,
  Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions,
  Checkbox, FormControlLabel, Button, Typography, Paper, Tab, Tabs, 
} from '@mui/material';
import { ref, get, update, push, set } from "firebase/database";
import { realtimeDb, auth } from "../firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import IconButton from "@mui/material/IconButton";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditNoteIcon from '@mui/icons-material/EditNote';
import dayjs from "dayjs"; 

const TabPanel = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const DriverManagement = () => {
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const [searchKeyword, setSearchKeyword] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
  
    const [anchorEl, setAnchorEl] = useState(null);
    const [anchorUserId, setAnchorUserId] = useState(null);
  
    const [isMemoOpen, setIsMemoOpen] = useState(false);
    const [selectedUserForMemo, setSelectedUserForMemo] = useState(null);
    const [memoText, setMemoText] = useState("");
    const [isWarning, setIsWarning] = useState(false);
    const [isBan, setIsBan] = useState(false);
    const [isMemoHistoryOpen, setIsMemoHistoryOpen] = useState(false);
    const [selectedMemoList, setSelectedMemoList] = useState([]);
    const [memoFilter, setMemoFilter] = useState("all");
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [editedEmail, setEditedEmail] = useState("");
    const [editedName, setEditedName] = useState("");
    const [resetEmail, setResetEmail] = useState('');
    const [isResetOpen, setIsResetOpen] = useState(false);
    const [targetUser, setTargetUser] = useState(null);
  
    useEffect(() => {
      const fetchUsers = async () => {
        const snapshot = await get(ref(realtimeDb, "drivers"));
        const usersData = snapshot.val();
        const usersArray = Object.entries(usersData).map(([uid, value]) => ({
          uid,
          ...value,
        }));
        setAllUsers(usersArray);
        setFilteredUsers(usersArray);
      };
      fetchUsers();
    }, []);
  
    useEffect(() => {
      const filtered = allUsers.filter((user) =>
        (user.name ?? '').toLowerCase().includes(searchKeyword.toLowerCase())
      );
      setFilteredUsers(filtered);
    }, [searchKeyword, allUsers]);
  
    const handleMenuOpen = (event, user) => {
      setAnchorEl(event.currentTarget);
      setAnchorUserId(user.uid);
    };
  
    const handleMenuClose = () => {
      setAnchorEl(null);
      setAnchorUserId(null);
    };
  
    const handleOpenMemo = (user) => {
      setSelectedUserForMemo(user);
      setIsMemoOpen(true);
    };
  
    const handleCloseMemo = () => {
      setSelectedUserForMemo(null);
      setIsMemoOpen(false);
      setMemoText("");
      setIsWarning(false);
      setIsBan(false);
    };
  
  
    
    const handleSubmitMemo = async () => {
      if (!selectedUserForMemo) return;
  
      const userRef = ref(realtimeDb, `drivers/${selectedUserForMemo.uid}`);
      const memoRef = ref(realtimeDb, `drivers/${selectedUserForMemo.uid}/memo`);
  
      const newMemo = {
        text: memoText.trim(),
        timestamp: dayjs().format('YYYY-MM-DD'),
        writer: '관리자A',
        type: isBan ? 'ban' : isWarning ? 'warning' : 'note'
      };
  
      // 📌 memo는 배열 대신 push로 저장
      await push(memoRef, newMemo);
  
      const snapshot = await get(userRef);
      const existingData = snapshot.val();
  
      const updates = {};
  
      if (isWarning) {
        updates.warningCount = (existingData?.warningCount ?? 0) + 1;
      }
      if (isBan) {
        updates.isBanned = true;
      }
  
      // 상태 관련 업데이트 (memo 제외)
      if (Object.keys(updates).length > 0) {
        await update(userRef, updates);
      }
  
      // 로컬 상태 반영
      setAllUsers((prev) =>
        prev.map((u) =>
          u.uid === selectedUserForMemo.uid ? { ...u, ...updates } : u
        )
      );
      setFilteredUsers((prev) =>
        prev.map((u) =>
          u.uid === selectedUserForMemo.uid ? { ...u, ...updates } : u
        )
      );
  
      handleCloseMemo();
    };
  
  
      const handleUnban = async (uid) => {
      await update(ref(realtimeDb, `drivers/${uid}`), { isBanned: false });
  
      // 👉 상태 업데이트
      setAllUsers((prev) =>
        prev.map((u) => (u.uid === uid ? { ...u, isBanned: false } : u))
      );
      setFilteredUsers((prev) =>
        prev.map((u) => (u.uid === uid ? { ...u, isBanned: false } : u))
      );
  
      handleMenuClose();
    };
  
    const handleOpenMemoHistory = async (user) => {
      const memoRef = ref(realtimeDb, `drivers/${user.uid}/memo`);
      const snapshot = await get(memoRef);
  
      if (snapshot.exists()) {
        const memoObject = snapshot.val();
        const memoArray = Object.values(memoObject);
  
        const sorted = memoArray.sort(
          (a, b) => dayjs(b.timestamp).valueOf() - dayjs(a.timestamp).valueOf()
        );
        setSelectedMemoList(sorted);
      } else {
        setSelectedMemoList([]);
      }
  
      setIsMemoHistoryOpen(true);
    };
  
  
    const filteredMemoList = selectedMemoList.filter(memo => 
    memoFilter === "all" ? true : memo.type === memoFilter
    );
  
    const handleOpenEditDialog = (user) => {
      setEditingUser(user);
      setEditedEmail(user.email ?? "");
      setEditedName(user.name ?? "");
      setIsEditDialogOpen(true);
    };
  
    const handleOpenReset = (user) => {
      setTargetUser(user);
      setResetEmail(user.email); // 👉 디폴트 이메일
      setIsResetOpen(true);
    };
  
    const handleSendResetEmail = async () => {
      try {
        await sendPasswordResetEmail(auth, resetEmail.trim());
        alert("비밀번호 초기화 메일이 전송되었습니다.");
        setIsResetOpen(false);
      } catch (error) {
        alert("이메일 전송 실패: " + error.message);
      }
    };

  return (
    <Box sx={{ width: '100%' }}>
      
      {/* 탭 메뉴 */}
      <Box
        sx={{
          backgroundColor: '#fff',
          py: 1,
          px: 5,
          boxShadow: 1,
        }}
      >
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          textColor="primary"
          indicatorColor="primary"
          variant="standard" // ← 요거!
          centered             // ← 요거!
          sx={{
            minWidth: 'fit-content',  // ← 너무 좁게 붙는 거 방지
          }}
        >
          <Tab label="기사별 운행 이력" />
          <Tab label="탑승자 수 통계" />
          <Tab label="기사 계정 관리" />
        </Tabs>
      </Box>

      {/* 회색 박스 본문 */}
      <Box
        sx={{
          backgroundColor: '#f5f5f5',
          borderRadius: 2,
          width: '100%',
        }}
      >
        <TabPanel value={tabIndex} index={0}>기사별 운행 이력</TabPanel>
        <TabPanel value={tabIndex} index={1}>탑승자 수 통계</TabPanel>
        <TabPanel value={tabIndex} index={2}>
          <Box sx={{ width: '100%', height: '100%', backgroundColor: '#fff',  }}>
                <TextField
                  label="이름으로 검색"
                  variant="outlined"
                  size="small"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  sx={{ width: '500px', mb: 2,  }}
                />
          
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
                    {filteredUsers.map((user) => (
                      <TableRow key={user.uid}>
                        <TableCell>{user.uid}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.joinDate}</TableCell>
                        <TableCell>{user.warningCount ?? 0}</TableCell>
                        <TableCell>{user.isBanned ? "정지됨" : "X"}</TableCell>
          
                        <TableCell>
                          <IconButton onClick={(e) => handleMenuOpen(e, user)}>
                            <MoreVertIcon />
                          </IconButton>
                          <Menu
                            anchorEl={anchorEl}
                            open={anchorUserId === user.uid}
                            onClose={handleMenuClose}
                          >
                            <MenuItem onClick={() => handleUnban(user.uid)}>정지 해제</MenuItem>
                            <MenuItem onClick={() => { handleOpenReset(user); handleMenuClose(); }}>비밀번호 초기화</MenuItem>
                            <MenuItem onClick={() => { handleOpenEditDialog(user); handleMenuClose(); }}>회원 수정</MenuItem>
                            <MenuItem onClick={() => {handleOpenMemoHistory(user);handleMenuClose();}}>메모 보기</MenuItem>
                          </Menu>
                        </TableCell>
          
                        <TableCell>
                          <IconButton onClick={() => handleOpenMemo(user)}>
                            <EditNoteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
          
                <Dialog open={isMemoOpen} onClose={handleCloseMemo}>
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
                    <Button onClick={handleSubmitMemo} color="primary">확인</Button>
                    <Button onClick={handleCloseMemo} color="secondary">취소</Button>
                  </DialogActions>
                </Dialog>
          
                <Dialog open={isMemoHistoryOpen} onClose={() => setIsMemoHistoryOpen(false)} maxWidth="sm" fullWidth>
                  <DialogTitle>📋 메모 이력</DialogTitle>
                      <Box sx={{ display: 'flex', gap: 1, mb: 2, px: 3 }}>
                        <Button variant={memoFilter === "all" ? "contained" : "outlined"} onClick={() => setMemoFilter("all")}>전체</Button>
                        <Button variant={memoFilter === "warning" ? "contained" : "outlined"} onClick={() => setMemoFilter("warning")}>경고</Button>
                        <Button variant={memoFilter === "ban" ? "contained" : "outlined"} onClick={() => setMemoFilter("ban")}>정지</Button>
                      </Box>
                  <DialogContent>
                    {selectedMemoList.length === 0 ? (
                      <Typography>메모 이력이 없습니다.</Typography>
                    ) : (
                      <Box>
                        {filteredMemoList.map((memo, index) => (
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
                    <Button onClick={() => setIsMemoHistoryOpen(false)}>닫기</Button>
                  </DialogActions>
                </Dialog>
                <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)}>
                  <DialogTitle>회원 정보 수정</DialogTitle>
                  <DialogContent>
                    <TextField
                      margin="dense"
                      label="이메일"
                      fullWidth
                      value={editedEmail}
                      onChange={(e) => setEditedEmail(e.target.value)}
                    />
                    <TextField
                      margin="dense"
                      label="이름"
                      fullWidth
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                    />
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => setIsEditDialogOpen(false)}>취소</Button>
                    <Button onClick={async () => {
                      if (!editingUser) return;
                      const userRef = ref(realtimeDb, `users/${editingUser.uid}`);
                      await update(userRef, {
                        email: editedEmail,
                        name: editedName,
                      });
          
                      // 🔄 로컬 상태도 갱신
                      setAllUsers((prev) =>
                        prev.map((u) => u.uid === editingUser.uid ? { ...u, email: editedEmail, name: editedName } : u)
                      );
                      setFilteredUsers((prev) =>
                        prev.map((u) => u.uid === editingUser.uid ? { ...u, email: editedEmail, name: editedName } : u)
                      );
          
                      setIsEditDialogOpen(false);
                    }} color="primary">확인</Button>
                  </DialogActions>
                </Dialog>
                <Dialog open={isResetOpen} onClose={() => setIsResetOpen(false)}>
                  <DialogTitle>비밀번호 초기화</DialogTitle>
                  <DialogContent>
                    <TextField
                      fullWidth
                      label="이메일"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                    />
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                      기본 이메일이 입력되어 있으며, 필요 시 변경 가능합니다.
                    </Typography>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleSendResetEmail} color="primary">확인</Button>
                    <Button onClick={() => setIsResetOpen(false)} color="secondary">취소</Button>
                  </DialogActions>
                </Dialog>
              </Box>
        </TabPanel>
      </Box>
    </Box>
  );
};

export default DriverManagement;
