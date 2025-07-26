import React, { useState, useEffect } from 'react';
import { Box, Typography} from '@mui/material';
import { ref, get, update, push, set } from "firebase/database";
import { realtimeDb, auth } from "../firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import dayjs from "dayjs"; 
import { UserTable, MemoDialog, MemoHistoryDialog } from '../components/User';
import { TabbedContainer, TabPanel } from '../components/common';
import { DriverListTable, DriverScheduleDialog, DrivingHistoryDialog, ResetPasswordDialog } from '../components/Driver';
import { timeSlots, days, getDayIndex } from '../components/Driver/constants';
import SearchBar from '../components/common/SearchBar';
import { useAdmin } from '../context/AdminContext';
import { hasPermission } from '../utils/permissionUtil';

const DriverManagement = () => {
  const admin = useAdmin();
  if (!admin) return null;
  // 기본 UI 상태 및 탭 변환
  const [tabIndex, setTabIndex] = useState(0);
  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  //사용자 목록 상태 및 검색
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  
  //MoreVertIcon 메뉴 클릭 시
  const [anchorEl, setAnchorEl] = useState(null);
  const [anchorUserId, setAnchorUserId] = useState(null);
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

  //운행 이력 관련
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [drivingHistory, setDrivingHistory] = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  //스케줄 등록 관련
  const [currentTargetUser, setCurrentTargetUser] = useState(null);
  const [pinnedRoutes, setPinnedRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState('');
  const [selectedRouteId, setSelectedRouteId] = useState('');
  const [availableTimes, setAvailableTimes] = useState([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedDays, setSelectedDays] = useState([]);
  const [duration, setDuration] = useState('');
  const [selectedCellTime, setSelectedCellTime] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingScheduleKey, setEditingScheduleKey] = useState(null);

  //스케줄 시각화 관련
  const [expandedDriverUid, setExpandedDriverUid] = useState(null);
  const [driverSchedule, setDriverSchedule] = useState({});
  const [coloredSchedule, setColoredSchedule] = useState({});
  const [highlightedCells, setHighlightedCells] = useState(new Set()); 
  const [driverSchedules, setDriverSchedules] = useState({});
  const [driverList, setDriverList] = useState([]);

  //메모 관련 및 다이얼로그
  const [isMemoOpen, setIsMemoOpen] = useState(false);
  const [selectedUserForMemo, setSelectedUserForMemo] = useState(null);
  const [memoText, setMemoText] = useState("");
  const [isWarning, setIsWarning] = useState(false);
  const [isBan, setIsBan] = useState(false);
  const [isMemoHistoryOpen, setIsMemoHistoryOpen] = useState(false);
  const [selectedMemoList, setSelectedMemoList] = useState([]);
  const [memoFilter, setMemoFilter] = useState("all");

  //사용자 정보 수정/초기화 다이얼로그
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editedEmail, setEditedEmail] = useState("");
  const [editedName, setEditedName] = useState("");
  const [resetEmail, setResetEmail] = useState('');
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [targetUser, setTargetUser] = useState(null);

  useEffect(() => {
    const highlightSet = new Set();

    Object.values(driverSchedule).forEach((entry) => {
      const { days, time, duration } = entry;
      if (!days || !time || !duration) return;

      days.forEach((day) => {
        const baseHour = parseInt(time.split(":")[0], 10);
        for (let i = 0; i < duration; i++) {
          const hour = baseHour + i;
          highlightSet.add(`${day}_${hour}`);
        }
      });
    });

    setHighlightedCells(highlightSet);
  }, [driverSchedule]);

  useEffect(() => {
      
    if (currentTargetUser?.uid) {
      fetchDriverSchedule(currentTargetUser.uid);
    }
  }, [currentTargetUser]);

  useEffect(() => {
    const fetchDriverList = async () => {
      const snapshot = await get(ref(realtimeDb, "drivers"));
      if (snapshot.exists()) {
        const driversData = snapshot.val();
        const driversArray = Object.entries(driversData).map(([uid, info]) => ({
          uid,
          ...info,
        }));
        setDriverList(driversArray);
      }
    };

    fetchDriverList();
  }, []);


  useEffect(() => {
    if (driverList.length > 0 && !currentTargetUser) {
      setCurrentTargetUser(driverList[0]);
    }
  }, [driverList, currentTargetUser]);

  useEffect(() => {
    if (driverList.length > 0) {
      driverList.forEach((driver) => {
        fetchDriverSchedule(driver.uid);
      });
    }
  }, [driverList]);

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
    
  const handleUnban = async (uid) => {
    await update(ref(realtimeDb, `drivers/${uid}`), { isBanned: false });
  
    setAllUsers((prev) =>
      prev.map((u) => (u.uid === uid ? { ...u, isBanned: false } : u))
    );
    setFilteredUsers((prev) =>
      prev.map((u) => (u.uid === uid ? { ...u, isBanned: false } : u))
    );

    handleMenuClose();
  };
  
      
  const handleTimeOpen = async (e, user) => {
    setSelectedDriver(user);
    setIsHistoryOpen(true);

    try {
      const snapshot = await get(ref(realtimeDb, `drivers/${user.uid}/drived`));
      if (snapshot.exists()) {
        const data = snapshot.val();
        const records = Object.values(data)
          .map((item) => ({
            route: item.route,
            date: item.date,
            time: item.time,
            endTime: item.endTime,
          }))
          .sort((a, b) => {
            const aDate = new Date(`${a.date}T${a.time}`);
            const bDate = new Date(`${b.date}T${b.time}`);
            return bDate - aDate;
          });
        setDrivingHistory(records);
      } else {
        setDrivingHistory([]);
      }
    } catch (error) {
      console.error("운행 이력 불러오기 실패:", error);
    }
  };
    
  const handleOpenSchedule = (user) => {
    setExpandedDriverUid((prevUid) => (prevUid === user.uid ? null : user.uid));
  };

    
  const handleOpenAddDialog = (user) => {
    setCurrentTargetUser(user);
    setIsAddDialogOpen(true);
    fetchPinnedRoutes(user.uid);
  };

  const handleCloseAddDialog = () => {
    setIsAddDialogOpen(false);
    setCurrentTargetUser(null);
    setIsEditing(false);
    setEditingScheduleKey(null);
  };
  

  const [selectedRouteDetails, setSelectedRouteDetails] = useState(null);
  const handleRouteSelect = async (e) => {
    const routeName = e.target.value;
    setSelectedRoute(routeName);

    const selected = pinnedRoutes.find((route) => route.name === routeName);
    if (!selected) return;

    setSelectedRouteId(selected.id);
    setSelectedRouteDetails(selected); 
    try {
      const snapshot = await get(ref(realtimeDb, `routes/${selected.id}/times`));
      if (snapshot.exists()) {
        const timeList = Object.values(snapshot.val());
        setAvailableTimes(timeList);
      } else {
        setAvailableTimes([]);
      }
    } catch (err) {
      console.error("시간 목록 불러오기 실패:", err);
    }
  };

  const handleSaveSchedule = async () => {
    if (!currentTargetUser || !selectedDays || !selectedTime || !selectedRoute) {
      console.log("조건 안 맞아서 return 됨!");
      return;
    }
    const newSchedule = {
      route: selectedRoute,
      time: selectedTime,
      duration: duration, 
      days: selectedDays,
      createdAt: new Date().toISOString()
    };

    try {
      const scheduleRef = ref(
        realtimeDb,
        `drivers/${currentTargetUser.uid}/schedule`
      );

    if (isEditing && editingScheduleKey) {
      const targetRef = ref(
        realtimeDb,
       `drivers/${currentTargetUser.uid}/schedule/${editingScheduleKey}`
      );
      await set(targetRef, newSchedule);
    } else {
      const newRef = push(scheduleRef);
      await set(newRef, newSchedule);
    }

    setIsAddDialogOpen(false);
    setSelectedRoute('');
    setSelectedTime('');
    setSelectedDays([]);
    setSelectedCellTime('');
    setDuration('');
    setIsEditing(false); 
    setEditingScheduleKey(null);
    fetchDriverSchedule(currentTargetUser.uid);
    setExpandedDriverUid(currentTargetUser.uid);

    } catch (err) {
     console.error("스케줄 저장 실패:", err);
    }
  };

  const fetchPinnedRoutes = async (uid) => {
    try {
      const snapshot = await get(ref(realtimeDb, `routes`));
      if (snapshot.exists()) {
        const data = snapshot.val();
        const pinned = Object.entries(data)
          .filter(([_, route]) => route.isPinned)
          .map(([key, route]) => ({
            id: key,
            name: route.name,
          }));
        setPinnedRoutes(pinned);
      } else {
        setPinnedRoutes([]);
      }
    } catch (err) {
      console.error("노선 목록 가져오기 실패:", err);
    }
  };

  const fetchDriverSchedule = async (uid) => {
    const scheduleRef = ref(realtimeDb, `drivers/${uid}/schedule`);
    const snapshot = await get(scheduleRef);
    if (snapshot.exists()) {
      const data = snapshot.val();

      setDriverSchedules((prev) => ({ ...prev, [uid]: data }));

      const newColored = analyzeSchedule(data);
      setColoredSchedule((prev) => ({
        ...prev, [uid]: newColored })); 
    } 
  };

  const analyzeSchedule = (scheduleObj) => {
    const newColoredCells = [];

    Object.values(scheduleObj).forEach((item) => {
      const { days, time, duration } = item;
      if (!days || !time || !duration) return;

      const [hourStr, minuteStr] = time.split(":");
      const hour = parseInt(hourStr, 10);
      const minute = parseInt(minuteStr, 10);
      let startIndex = -1;

      for (let i = 0; i < timeSlots.length; i++) {
        const slotHour = parseInt(timeSlots[i].split(":")[0], 10);
        const nextSlotHour =
          i < timeSlots.length - 1
            ? parseInt(timeSlots[i + 1].split(":")[0], 10)
            : 24;

        if (hour >= slotHour && hour < nextSlotHour) {
          startIndex = i;
          break;
        }
      }

      if (startIndex === -1) return; 
      days.forEach((day) => {
        const col = getDayIndex(day);
        for (let i = 0; i < duration; i++) {
          const row = startIndex + i;
          const cellKey = `${col}-${row}`;
          newColoredCells.push(cellKey);
        }
      });
    });
    return newColoredCells;
  };

  return (
    <Box sx={{ width: '100%' }}>
      <TabbedContainer
        tabIndex={tabIndex}
        handleTabChange={handleTabChange}
        labels={["기사별 운행 이력", "기사 계정 관리"]}
      />

      <Box
        sx={{
          backgroundColor: '#f5f5f5',
          borderRadius: 2,
          width: '100%',
        }}
      >
        <TabPanel value={tabIndex} index={0}>
          {hasPermission(admin, '기사별 운행 이력') ? (
          <Box sx={{ width: '100%', height: '100%', backgroundColor: '#fff',  }}>
            <SearchBar
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="이름으로 검색"
            />
            <DriverListTable
              users={filteredUsers}
              expandedDriverUid={expandedDriverUid}
              driverSchedules={driverSchedules}
              coloredSchedule={coloredSchedule}
              onTimeClick={handleTimeOpen}
              onScheduleToggle={handleOpenSchedule}
              onAddClick={handleOpenAddDialog}
              onCellClick={(matchedSchedule) => {
                fetchPinnedRoutes(matchedSchedule.uid).then(() => {
                  setSelectedDays(matchedSchedule.days);
                  setSelectedTime(matchedSchedule.time);
                  setDuration(matchedSchedule.duration);
                  setSelectedRoute(matchedSchedule.route);
                  setCurrentTargetUser(matchedSchedule.user);
                  setIsEditing(true);
                  setEditingScheduleKey(matchedSchedule.key);
                  handleRouteSelect({ target: { value: matchedSchedule.route } });
                  setIsAddDialogOpen(true);
                });
              }}
            />
                
            <DriverScheduleDialog
              open={isAddDialogOpen}
              onClose={handleCloseAddDialog}
              onSave={handleSaveSchedule}
              pinnedRoutes={pinnedRoutes}
              availableTimes={availableTimes}
              selectedRoute={selectedRoute}
              selectedTime={selectedTime}
              selectedDays={selectedDays}
              duration={duration}
              onChangeRoute={handleRouteSelect}
              onChangeTime={(e) => setSelectedTime(e.target.value)}
              onChangeDays={(e) => setSelectedDays(e.target.value)}
              onChangeDuration={(e) => setDuration(e.target.value)}
            />
            <DrivingHistoryDialog
              open={isHistoryOpen}
              onClose={() => setIsHistoryOpen(false)}
              driverName={selectedDriver?.name}
              historyList={drivingHistory}
            />
          </Box>
          ) : (
          <Typography color="error">이 기능에 대한 권한이 없습니다.</Typography>
        )}
        </TabPanel>
        <TabPanel value={tabIndex} index={1}>
          {hasPermission(admin, '기사 계정 관리') ? (
          <Box sx={{ width: '100%', height: '100%', backgroundColor: '#fff',  }}>
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
            <ResetPasswordDialog
              open={isResetOpen}
              email={resetEmail}
              onChangeEmail={(e) => setResetEmail(e.target.value)}
              onSendResetEmail={handleSendResetEmail}
              onClose={() => setIsResetOpen(false)}
            />
          </Box>
          ) : (
          <Typography color="error">이 기능에 대한 권한이 없습니다.</Typography>
        )}
        </TabPanel>
      </Box>
    </Box>
  );
};

export default DriverManagement;