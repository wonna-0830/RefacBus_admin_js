import React, { useState } from 'react';
import {
 IconButton, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, Typography
} from '@mui/material';
import { useEffect } from 'react';
import { onValue } from 'firebase/database';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import AddIcon from '@mui/icons-material/Add';
import { push, ref, set, get, update } from 'firebase/database';
import { realtimeDb } from '../firebase'; 
import Manager_Schedule from "../components/Manager/Manager_Schedule";
import TabbedContainer from '../components/common/TabbedContainer';
import TabPanel from '../components/common/TabPanel';
import NoticeFormDialog from '../components/Notice/NoticeFormDialog';
import UserTable from '../components/User/UserTable';
import SearchBar from '../components/common/SearchBar';
import MemoDialog from '../components/User/MemoDialog';
import MemoHistoryDialog from '../components/User/MemoHistoryDialog';
import UserEditDialog from '../components/User/UserEditDialog';
import PasswordResetDialog from '../components/User/PasswordResetDialog';
import dayjs from 'dayjs'; 
import RoleDialog from '../components/Manager/RoleDialog';
import { ALL_PERMISSIONS } from "../components/Manager/permissions";
import { useAdmin } from '../context/AdminContext';
import { hasPermission } from '../utils/permissionUtil';

const ManagerManagement = () => {
  const admin = useAdmin();
  console.log("🧩 admin 상태:", admin);
  //탭 상태
  const [tabIndex, setTabIndex] = useState(0);
  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };
  if (!admin) return null;

  //공지사항 다이얼로그 관련
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [isPinned, setIsPinned] = useState(false);

  //공지사항 목록
  const [notices, setNotices] = useState([]);

  //공지사항 제출 핸들러
  const handleSubmit = () => {
    const newNotice = {
      title,
      url,
      isPinned,
      date: new Date().toISOString(),
      writer: '관리자',
    };

    const newRef = push(ref(realtimeDb, 'notices'));
    set(newRef, newNotice);

    setOpen(false);
    setTitle('');
    setUrl('');
    setIsPinned(false);
  };

  //공지사항 목록 실시간 불러오기
  useEffect(() => {
    const noticesRef = ref(realtimeDb, 'notices');
    onValue(noticesRef, snapshot => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([id, item]) => ({
          id,
          ...item
        }));
        list.sort((a, b) => b.isPinned - a.isPinned);
        setNotices(list);
      } else {
        setNotices([]);
      }
    });
  }, []);

  //고정여부 토글 핸들러
  const togglePinned = (id, currentState) => {
  const noticeRef = ref(realtimeDb, `notices/${id}`);
  update(noticeRef, { isPinned: !currentState });
  };

  //검색 및 사용자 목록 상태
    const [searchKeyword, setSearchKeyword] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
  
    //context 메뉴 상태
    const [anchorEl, setAnchorEl] = useState(null);
    const [anchorUserId, setAnchorUserId] = useState(null);
  
    //메모 다이얼로그
    const [isMemoOpen, setIsMemoOpen] = useState(false);
    const [selectedUserForMemo, setSelectedUserForMemo] = useState(null);
    const [memoText, setMemoText] = useState("");
    const [isWarning, setIsWarning] = useState(false);
    const [isBan, setIsBan] = useState(false);
  
    //메모 기록 확인
    const [isMemoHistoryOpen, setIsMemoHistoryOpen] = useState(false);
    const [selectedMemoList, setSelectedMemoList] = useState([]);
    const [memoFilter, setMemoFilter] = useState("all");
  
    //사용자 정보 수정
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [editedEmail, setEditedEmail] = useState("");
    const [editedName, setEditedName] = useState("");
  
    //비밀번호 초기화
    const [resetEmail, setResetEmail] = useState('');
    const [isResetOpen, setIsResetOpen] = useState(false);
    const [targetUser, setTargetUser] = useState(null);
  
    //사용자 불러오기
    useEffect(() => {
      const fetchUsers = async () => {
        const snapshot = await get(ref(realtimeDb, "admin"));
        const usersData = snapshot.val();
        const usersArray = Object.entries(usersData).map(([uid, value]) => ({
          uid,
          ...value,
        }));
        
        setAllUsers(usersArray);  // 슈퍼 계정도 포함
        setFilteredUsers(usersArray.filter(user => user.name !== "박정원"));

      };
      fetchUsers();
    }, []);
  
    useEffect(() => {
      const filtered = allUsers.filter((user) => {
        const nameMatch = (user.name ?? '').toLowerCase().includes(searchKeyword.toLowerCase());
        const idWithEmail = user.id?.includes('@') ? user.id : `${user.id}@gmail.com`;
        const idMatch = idWithEmail.toLowerCase().includes(searchKeyword.toLowerCase());
        return nameMatch || idMatch;
      });
      setFilteredUsers(filtered);
    }, [searchKeyword, allUsers]);
  
  
    //context 메뉴 관련
    const handleMenuOpen = (event, user) => {
      setAnchorEl(event.currentTarget);
      setAnchorUserId(user.uid);
    };
  
    const handleMenuClose = () => {
      setAnchorEl(null);
      setAnchorUserId(null);
    };
  
    //메모 다이얼로그
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
  
      const userRef = ref(realtimeDb, `admin/${selectedUserForMemo.uid}`);
      const memoRef = ref(realtimeDb, `admin/${selectedUserForMemo.uid}/memo`);
  
      const newMemo = {
        text: memoText.trim(),
        timestamp: dayjs().format('YYYY-MM-DD'),
        writer: '관리자A',
        type: isBan ? 'ban' : isWarning ? 'warning' : 'note'
      };
  
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
  
      if (Object.keys(updates).length > 0) {
        await update(userRef, updates);
      }
  
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
      await update(ref(realtimeDb, `admin/${uid}`), { isBanned: false });
  
      setAllUsers((prev) =>
        prev.map((u) => (u.uid === uid ? { ...u, isBanned: false } : u))
      );
      setFilteredUsers((prev) =>
        prev.map((u) => (u.uid === uid ? { ...u, isBanned: false } : u))
      );
  
      handleMenuClose();
    };
  
  
    //메모 히스토리 관련
    const handleOpenMemoHistory = async (user) => {
      const memoRef = ref(realtimeDb, `admin/${user.uid}/memo`);
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
  
    //사용자 정보 수정 관련
    const handleOpenEditDialog = (user) => {
      setEditingUser(user);
      setEditedEmail(user.id ?? "");
      setEditedName(user.name ?? "");
      setIsEditDialogOpen(true);
    };
  
    //비밀번호 초기화 관련
    const handleOpenReset = (user) => {
      setTargetUser(user);
      setResetEmail(user.id.includes('@') ? user.id : `${user.id}@gmail.com`);

      setIsResetOpen(true);
    };
  
    const handleSendResetEmail = async () => {
      try {
        const emailToSend = resetEmail.includes('@') ? resetEmail.trim() : `${resetEmail.trim()}@gmail.com`;
        await sendPasswordResetEmail(auth, emailToSend);

        alert("비밀번호 초기화 메일이 전송되었습니다.");
        setIsResetOpen(false);
      } catch (error) {
        alert("이메일 전송 실패: " + error.message);
      }
    };
  
    const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
    const [selectedUserForRole, setSelectedUserForRole] = useState(null);

    const handleOpenRoleDialog = async (user) => {
      if (user.name === "박정원") {
        const userRef = ref(realtimeDb, `admin/${user.uid}/permissions`);
        await set(userRef, ALL_PERMISSIONS);
        alert("슈퍼 계정은 모든 권한이 자동 부여됩니다.");
        return;
      }

      setSelectedUserForRole(user);
      setIsRoleDialogOpen(true);
    };

    const handleSaveRoles = async (updatedPermissions) => {
      if (!selectedUserForRole) return;

      const userRef = ref(realtimeDb, `admin/${selectedUserForRole.uid}/permissions`);
      await set(userRef, updatedPermissions);

      alert("권한이 저장되었습니다.");
      setIsRoleDialogOpen(false);
    };



  return (
    <Box sx={{ width: '100%' }}>
      
      <TabbedContainer
          tabIndex={tabIndex}
          handleTabChange={handleTabChange}
          labels={["관리자 역할 구분", "일정 등록 및 관리", "공지사항 등록 및 관리"]}
        />

      {/* 회색 박스 본문 */}
      <Box
        sx={{
          backgroundColor: '#f5f5f5',
          borderRadius: 2,
          padding: 3,
          marginTop: 2,
          width: '100%',
          maxWidth: 'none',
        }}
      >
        <TabPanel value={tabIndex} index={0}>
          {hasPermission(admin, '관리자 역할 구분') ? (
          <Box sx={{ width: '100%', backgroundColor: '#fff', padding: 2 }}>
            <SearchBar
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="이름으로 검색"
            />
            <UserTable
              users={filteredUsers}
              type="admin"
              anchorEl={anchorEl}
              anchorUserId={anchorUserId}
              onMemoClick={handleOpenMemo}
              onMenuClick={handleMenuOpen}
              onMenuClose={handleMenuClose}
              onUnban={handleUnban}
              onReset={handleOpenReset}
              onEdit={handleOpenEditDialog}
              onMemoHistory={handleOpenMemoHistory}
              onRoleClick={handleOpenRoleDialog}
            />
            <MemoDialog
              open={isMemoOpen}
              memoText={memoText}
              setMemoText={setMemoText}
              isWarning={isWarning}
              setIsWarning={setIsWarning}
              isBan={isBan}
              setIsBan={setIsBan}
              onConfirm={handleSubmitMemo}
              onCancel={handleCloseMemo}
            />
            <MemoHistoryDialog
              open={isMemoHistoryOpen}
              onClose={() => setIsMemoHistoryOpen(false)}
              memoFilter={memoFilter}
              setMemoFilter={setMemoFilter}
              memoList={selectedMemoList}
            />
            <UserEditDialog
              open={isEditDialogOpen}
              onClose={() => setIsEditDialogOpen(false)}
              onConfirm={async () => {
                if (!editingUser) return;
                const userRef = ref(realtimeDb, `admin/${editingUser.uid}`);
                await update(userRef, {
                  id: editedEmail,
                  name: editedName,
                });

                setAllUsers((prev) =>
                  prev.map((u) => u.uid === editingUser.uid ? { ...u, email: editedEmail, name: editedName } : u)
                );
                setFilteredUsers((prev) =>
                  prev.map((u) => u.uid === editingUser.uid ? { ...u, email: editedEmail, name: editedName } : u)
                );

                setIsEditDialogOpen(false);
              }}
              email={editedEmail}
              name={editedName}
              setEmail={setEditedEmail}
              setName={setEditedName}
            />
            <PasswordResetDialog
              open={isResetOpen}
              email={resetEmail}
              setEmail={setResetEmail}
              onConfirm={handleSendResetEmail}
              onClose={() => setIsResetOpen(false)}
            />
            <RoleDialog
              open={isRoleDialogOpen}
              onClose={() => setIsRoleDialogOpen(false)}
              user={selectedUserForRole}
              onSave={handleSaveRoles}
              initialPermissions={selectedUserForRole?.permissions || {}}
            />
          </Box>
          ) : (
            <Typography color="error">이 기능에 대한 권한이 없습니다.</Typography>
          )}
        </TabPanel>
        <TabPanel value={tabIndex} index={1}>
          {hasPermission(admin, '일정 등록 및 관리') ? (
          <Manager_Schedule />
          ) : (
            <Typography color="error">이 기능에 대한 권한이 없습니다.</Typography>
          )}
        </TabPanel>
        <TabPanel value={tabIndex} index={2}>
          {hasPermission(admin, '공지사항 등록 및 관리') ? (
            <>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpen(true)}
            sx={{ mb: 2 }}
          >
            새 공지사항 등록
          </Button>

          <NoticeFormDialog
            open={open}
            title={title}
            setTitle={setTitle}
            url={url}
            setUrl={setUrl}
            isPinned={isPinned}
            setIsPinned={setIsPinned}
            onSubmit={handleSubmit}
            onCancel={() => setOpen(false)}
          />
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>제목</TableCell>
                  <TableCell>등록일</TableCell>
                  <TableCell>고정</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {notices.map((notice) => (
                  <TableRow key={notice.id}>
                    <TableCell>
                      <a href={notice.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: '#1976d2' }}>
                        {notice.title}
                      </a>
                    </TableCell>
                    <TableCell>{new Date(notice.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => togglePinned(notice.id, notice.isPinned)}>
                        {notice.isPinned ? <StarIcon color="warning" /> : <StarBorderIcon />}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          </>
          ) : (
            <Typography color="error">이 기능에 대한 권한이 없습니다.</Typography>
          )}
        </TabPanel>
      </Box>
    </Box>
  );
};

export default ManagerManagement;
