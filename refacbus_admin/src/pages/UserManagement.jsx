import React, { useState, useEffect } from 'react';
import {  Box, Typography } from '@mui/material';
import { ref, get, update, push, set } from "firebase/database";
import { realtimeDb, auth } from "../firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import dayjs from "dayjs"; 
import UserTable from '../components/User/UserTable';
import MemoDialog from '../components/User/MemoDialog';
import MemoHistoryDialog from '../components/User/MemoHistoryDialog';
import UserEditDialog from '../components/User/UserEditDialog';
import PasswordResetDialog from '../components/User/PasswordResetDialog';
import SearchBar from '../components/common/SearchBar';
import { useAdmin } from '../context/AdminContext';
import { hasPermission } from '../utils/permissionUtil';



const UserManagement = () => {
  const admin = useAdmin();
    if (!admin) return null;
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
      const snapshot = await get(ref(realtimeDb, "users"));
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

    const userRef = ref(realtimeDb, `users/${selectedUserForMemo.uid}`);
    const memoRef = ref(realtimeDb, `users/${selectedUserForMemo.uid}/memo`);

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
    await update(ref(realtimeDb, `users/${uid}`), { isBanned: false });

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
    const memoRef = ref(realtimeDb, `users/${user.uid}/memo`);
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
    setEditedEmail(user.email ?? "");
    setEditedName(user.name ?? "");
    setIsEditDialogOpen(true);
  };

  //비밀번호 초기화 관련
  const handleOpenReset = (user) => {
    setTargetUser(user);
    setResetEmail(user.email); 
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
    hasPermission(admin, '회원 관리') ? (
    <Box sx={{ width: '100%', backgroundColor: '#fff', padding: 2 }}>
      <SearchBar
        value={searchKeyword}
        onChange={(e) => setSearchKeyword(e.target.value)}
        placeholder="이름으로 검색"
      />
      <UserTable
        users={filteredUsers}
        anchorEl={anchorEl}
        anchorUserId={anchorUserId}
        onMemoClick={handleOpenMemo}
        onMenuClick={handleMenuOpen}
        onMenuClose={handleMenuClose}
        onUnban={handleUnban}
        onReset={handleOpenReset}
        onEdit={handleOpenEditDialog}
        onMemoHistory={handleOpenMemoHistory}
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
          const userRef = ref(realtimeDb, `users/${editingUser.uid}`);
          await update(userRef, {
            email: editedEmail,
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
    </Box>
    ) : (
    <Typography color="error">이 기능에 대한 권한이 없습니다.</Typography>
  )
  );
};

export default UserManagement;
