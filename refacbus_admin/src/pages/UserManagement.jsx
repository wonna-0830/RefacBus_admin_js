import React, { useState, useEffect } from 'react';
import {
  TextField, Box, Table, TableHead, TableCell, TableRow, TableBody,
  Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions,
  Checkbox, FormControlLabel, Button, Typography, Paper
} from '@mui/material';
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



const UserManagement = () => {
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


  const handleOpenEditDialog = (user) => {
    setEditingUser(user);
    setEditedEmail(user.email ?? "");
    setEditedName(user.name ?? "");
    setIsEditDialogOpen(true);
  };

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
  );
};

export default UserManagement;
