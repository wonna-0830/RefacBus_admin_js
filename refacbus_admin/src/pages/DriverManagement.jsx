
import React, { useState, useEffect } from 'react';
import {
  TextField, Box, Table, TableHead, TableCell, TableRow, TableBody,
  Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, ListItemText,
  Checkbox, FormControlLabel, Button, Typography, Paper, Tab, Tabs, FormControl, InputLabel, Select
} from '@mui/material';
import { ref, get, update, push, set } from "firebase/database";
import { realtimeDb, auth } from "../firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import IconButton from "@mui/material/IconButton";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditNoteIcon from '@mui/icons-material/EditNote';
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AddIcon from "@mui/icons-material/Add";
import dayjs from "dayjs"; 
import { getColorByRoute } from "../utils/colorUnits"; // 경로는 너 프로젝트 구조에 맞게!


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
    const [selectedRouteDetails, setSelectedRouteDetails] = useState(null);
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [drivingHistory, setDrivingHistory] = useState([]);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [currentTargetUser, setCurrentTargetUser] = useState(null);
    const [pinnedRoutes, setPinnedRoutes] = useState([]);
    const [selectedRoute, setSelectedRoute] = useState('');
    const [selectedRouteId, setSelectedRouteId] = useState('');
    const [availableTimes, setAvailableTimes] = useState([]);
    const [selectedTime, setSelectedTime] = useState('');
    const [expandedDriverUid, setExpandedDriverUid] = useState(null);
    const [selectedCellTime, setSelectedCellTime] = useState('');
    const [driverSchedule, setDriverSchedule] = useState({});
    const [selectedDays, setSelectedDays] = useState([]);
    const [duration, setDuration] = useState('');
    const [highlightedCells, setHighlightedCells] = useState(new Set());
    const [coloredCells, setColoredCells] = useState([]); 
    const [driverSchedules, setDriverSchedules] = useState({});
    const [driverList, setDriverList] = useState([]);
    const [coloredSchedule, setColoredSchedule] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [editingScheduleKey, setEditingScheduleKey] = useState(null);



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
              // 최신 날짜 + 시간 기준 정렬
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

    const days = ["월", "화", "수", "목", "금"];
    const timeSlots = [
      "08:00", "09:00", "10:00", "11:00", "12:00",
      "16:00", "17:00", "18:00", "19:00",
    ];

    const handleOpenScheduleDialog = (day, time) => {
      setSelectedDays(day);
      setSelectedCellTime(time);
      setIsAddDialogOpen(true);
      fetchPinnedRoutes();
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


      const handleRouteSelect = async (e) => {
          const routeName = e.target.value;
          setSelectedRoute(routeName);

          const selected = pinnedRoutes.find((route) => route.name === routeName);
          if (!selected) return;

          setSelectedRouteId(selected.id);
          setSelectedRouteDetails(selected); // 🔥 전체 노선 정보 저장

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
        duration: duration, // 🔥 필수
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
          // ✅ 추가 모드일 경우 새로 추가
          const newRef = push(scheduleRef);
          await set(newRef, newSchedule);
        }

        // 저장 후 상태 초기화
        setIsAddDialogOpen(false);
        setSelectedRoute('');
        setSelectedTime('');
        setSelectedDays([]);
        setSelectedCellTime('');
        setDuration('');
        setIsEditing(false); // ✅ 수정 모드 해제
        setEditingScheduleKey(null);

        fetchDriverSchedule(currentTargetUser.uid);
        setExpandedDriverUid(currentTargetUser.uid);

      } catch (err) {
        console.error("스케줄 저장 실패:", err);
      }
    };

    
    const fetchDriverSchedule = async (uid) => {
  const scheduleRef = ref(realtimeDb, `drivers/${uid}/schedule`);
  const snapshot = await get(scheduleRef);

  if (snapshot.exists()) {
    const data = snapshot.val();
    console.log("🔥 가져온 스케줄", data);

    setDriverSchedules((prev) => ({ ...prev, [uid]: data }));

    // 🧩 기사별 색 계산도 따로 저장
    const newColored = analyzeSchedule(data);
    console.log("🎨 색칠할 셀", newColored);
    setColoredSchedule((prev) => ({
       ...prev, [uid]: newColored })); // ✅
  } else {
    console.log("❌ 해당 유저 스케줄 없음:", uid);
  }
};



   
    
   const analyzeSchedule = (scheduleObj) => {
      const newColoredCells = [];

      Object.values(scheduleObj).forEach((item) => {
        const { days, time, duration } = item;
        if (!days || !time || !duration) return;

        // 🕐 시간 파싱 (예: "08:30")
        const [hourStr, minuteStr] = time.split(":");
        const hour = parseInt(hourStr, 10);
        const minute = parseInt(minuteStr, 10);

        // 🎯 timeSlots에서 해당 시간이 포함될 "베이스 index" 찾기
        // 예: 08:30 → 08:00 셀에 포함
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

        if (startIndex === -1) return; // 못 찾은 경우

        // 📌 요일별 셀 색칠
        days.forEach((day) => {
          const col = getDayIndex(day); // 월: 0, 화:1, ...
          for (let i = 0; i < duration; i++) {
            const row = startIndex + i;
            const cellKey = `${col}-${row}`;
            newColoredCells.push(cellKey);
          }
        });
      });

      return newColoredCells;
    };





    const getDayIndex = (day) => {
      const daysKor = ['월', '화', '수', '목', '금'];
      return daysKor.indexOf(day);
    };



  return (
    <Box sx={{ width: '100%' }}>
      
      <Box
        sx={{
          backgroundColor: '#fff',
          py: 1,
          px: 5,
          boxShadow: 1,
        }}
      >
        <Tabs
          sx={{
            minWidth: 'fit-content',  }}
          value={tabIndex}
          onChange={handleTabChange}
          textColor="primary"
          indicatorColor="primary"
          variant="standard" 
          centered       
          
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
        <TabPanel value={tabIndex} index={0}>
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
                      <TableCell>운행 시간 관리</TableCell>
                      <TableCell>운행 일정 관리</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <React.Fragment key={user.uid}>
                        <TableRow>
                          <TableCell>{user.uid}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.joinDate}</TableCell>
                          <TableCell>
                            <IconButton onClick={(e) => handleTimeOpen(e, user)}>
                              <AccessTimeIcon />
                            </IconButton>
                          </TableCell>
                          <TableCell>
                            <IconButton onClick={() => handleOpenSchedule(user)}>
                              <ExpandMoreIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>

                        {/* 아코디언 펼쳐지는 영역 */}
                        {expandedDriverUid === user.uid && (
                          <TableRow>
                            <TableCell colSpan={6}>
                              <Box sx={{ p: 2, backgroundColor: "#f9f9f9", borderRadius: 2,display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    width: "100%",
                                    mb: 2, }}>           
                                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                                    {user.name}님의 주간 스케줄표
                                  </Typography>
                                  <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<AddIcon />}
                                    onClick={() => handleOpenAddDialog(user)}
                                  >
                                    추가
                                  </Button>
                                </Box>
                                

                                {/* 아래쪽 시간표 테이블은 따로 */}
                                <Table sx={{
                                        tableLayout: 'fixed', 
                                        width: '100%',    
                                      }}>
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>시간</TableCell>
                                      {days.map((day) => (
                                        <TableCell key={day} align="center">
                                          {day}
                                        </TableCell>
                                      ))}
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {timeSlots.map((time, rowIndex) => (
                                      <TableRow key={time}>
                                        <TableCell>{time}</TableCell>
                                          {days.map((day, colIndex) => {
                                            const cellKey = `${colIndex}-${rowIndex}`;
                                            const isColored = coloredSchedule[user.uid]?.includes(cellKey);
                                            let routeText = '';
                                            let isStartCell = false;
                                            let bgColor = "inherit"; // 배경색 기본값

                                            const scheduleData = driverSchedules[user.uid];
                                            if (scheduleData) {
                                              Object.values(scheduleData).forEach(({ days, time, duration, route }) => {
                                                const startIndex = timeSlots.findIndex((t) => {
                                                  const [h, m] = time.split(":").map(Number);
                                                  const [slotH] = t.split(":").map(Number);
                                                  return h >= slotH && h < slotH + 1;
                                                });

                                                const col = getDayIndex(day);
                                                if (startIndex === -1 || !days.includes(day)) return;

                                                const row = rowIndex;
                                                if (row >= startIndex && row < startIndex + duration) {
                                                  if (row === startIndex) {
                                                    routeText = `${route}\n(${time})`;
                                                    isStartCell = true;
                                                  }
                                                  // 🌈 여기에 색상 적용!
                                                  bgColor = getColorByRoute(route);
                                                }
                                              });
                                            }

                                          return (
                                            <TableCell
                                              key={day}
                                              align="center"
                                              sx={{
                                                border: "1px solid #ddd",
                                                minWidth: "120px",
                                                height: 40,   
                                                backgroundColor: isColored ? bgColor : "inherit",
                                                color: isColored ? "#000" : "inherit",
                                                whiteSpace: "pre-line",
                                                cursor: isColored ? "pointer" : "default",
                                                wordBreak: "break-word",
                                                textAlign: "center",
                                                lineHeight: 1.2,
                                                padding: "4px",
                                                userSelect: "none"
                                              }}
                                              onClick={() => {
                                                if (!isColored) return; // 색 없는 셀 클릭 방지

                                                // 🔥 셀 클릭 시, 스케줄 전체 찾아서 수정
                                                const matchedSchedule = Object.values(driverSchedules[user.uid]).find(
                                                  ({ days, time, duration }) => {
                                                    const startIdx = timeSlots.findIndex((slot) => {
                                                      const [h, m] = time.split(":").map(Number);
                                                      const [slotH] = slot.split(":").map(Number);
                                                      return h >= slotH && h < slotH + 1;
                                                    });

                                                    return (
                                                      days.includes(day) &&
                                                      rowIndex >= startIdx &&
                                                      rowIndex < startIdx + duration
                                                    );
                                                  }
                                                );

                                                if (matchedSchedule) {
                                                  const scheduleKey = Object.entries(driverSchedules[user.uid]).find(
                                                  ([key, value]) =>
                                                    value.time === matchedSchedule.time &&
                                                    value.duration === matchedSchedule.duration &&
                                                    value.route === matchedSchedule.route &&
                                                    JSON.stringify(value.days) === JSON.stringify(matchedSchedule.days)
                                                )?.[0]; // 🔥 Firebase의 키

                                                fetchPinnedRoutes(user.uid).then(() => {
                                                  setSelectedDays(matchedSchedule.days);
                                                  setSelectedTime(matchedSchedule.time);
                                                  setDuration(matchedSchedule.duration);
                                                  setSelectedRoute(matchedSchedule.route);
                                                  setCurrentTargetUser(user);
                                                  setIsEditing(true); // ✅ 수정 모드 켜기
                                                  setEditingScheduleKey(scheduleKey); // ✅ 수정할 항목의 Firebase 키 저장
                                                  handleRouteSelect({
                                                    target: { value: matchedSchedule.route },
                                                  });
                                                  setIsAddDialogOpen(true);
                                                }); // ✨ 기존 Dialog 재활용 가능!
                                                }
                                              }}
                                            >
                                              {isStartCell && (
                                                <Typography variant="caption" sx={{ fontSize: "0.7rem", fontWeight: 600, cursor: "inherit", }}>
                                                  {routeText}
                                                </Typography>
                                              )}
                                            </TableCell>

                                          );
                                        })}
                                      </TableRow>
                                    ))}
                                  </TableBody>

                                </Table>
                              
                            </TableCell>
                          </TableRow>

                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>

                </Table>
                <Dialog open={isAddDialogOpen} onClose={handleCloseAddDialog} 
                  PaperProps={{
                    sx: {
                      width: "600px", // 원하는 너비(px, %, vw 등)
                    },
                  }}>
                  <DialogTitle>스케줄 추가</DialogTitle>
                  <DialogContent>
                    <Typography>노선 스케줄 등록</Typography>
                  
                      <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel id="route-select-label">노선 선택</InputLabel>
                        <Select
                          labelId="route-select-label"
                           value={pinnedRoutes.some(route => route.name === selectedRoute) ? selectedRoute : ""}
                          label="노선 선택"
                          onChange={handleRouteSelect}
                        >
                          {pinnedRoutes.map((route) => (
                            <MenuItem key={route.id} value={route.name}>
                              {route.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      {/* 시간 선택 */}
                      <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel id="time-select-label">운행 시간 선택</InputLabel>
                        <Select
                          labelId="time-select-label"
                          value={availableTimes.includes(selectedTime) ? selectedTime : ""}
                          label="운행 시간 선택"
                          onChange={(e) => setSelectedTime(e.target.value)}
                          disabled={!availableTimes.length}
                        >
                          {availableTimes.map((time, index) => (
                            <MenuItem key={index} value={time}>
                              {time}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel id="day-select-label">운행 요일</InputLabel>
                        <Select
                          labelId="day-select-label"
                          multiple
                          value={selectedDays}
                          label="운행 요일 선택"
                          onChange={(e) => setSelectedDays(e.target.value)}
                          renderValue={(selected) => selected.join(', ')}
                        >
                          {['월', '화', '수', '목', '금'].map((day) => (
                            <MenuItem key={day} value={day}>
                              <Checkbox checked={selectedDays.indexOf(day) > -1} />
                              <ListItemText primary={day} />
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel id="hour-select-label">예상 소요 시간 (시간)</InputLabel>
                        <Select
                          labelId="hour-select-label"
                          value={duration}
                          label="예상 소요시간 선택"
                          onChange={(e) => setDuration(e.target.value)}
                        >
                          {[1, 2, 3].map((hour) => (
                            <MenuItem key={hour} value={hour}>
                              {hour}시간
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleCloseAddDialog}>취소</Button>

                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSaveSchedule}
                      disabled={!selectedRoute || !selectedTime|| !duration || !selectedDays || selectedDays.length === 0 }
                      >
                      완료
                    </Button>
                  </DialogActions>

                </Dialog>

                <Dialog open={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} maxWidth="md" fullWidth>
                  <DialogTitle>{selectedDriver?.name}님의 운행 이력</DialogTitle>
                  <DialogContent>
                    {drivingHistory.length > 0 ? (
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
                          {drivingHistory.map((record, idx) => (
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
                    <Button onClick={() => setIsHistoryOpen(false)}>닫기</Button>
                  </DialogActions>
                </Dialog>

          
                
            </Box>
        </TabPanel>
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
                      const userRef = ref(realtimeDb, `drivers/${editingUser.uid}`);
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