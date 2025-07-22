import React, { useState, useEffect } from 'react';
import {
  TextField, Box, Table, TableContainer, TableHead, TableCell, TableRow, TableBody,
  Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Select,
  Checkbox, FormControlLabel, Button, Typography, Paper, Tab, Tabs, FormControl, InputLabel
} from '@mui/material';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip} from 'recharts';
import dayjs from 'dayjs';
import { getDatabase, ref, get, child } from 'firebase/database';

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

const ReservationManagement = () => {
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [searchName, setSearchName] = useState('');
  const [reservationList, setReservationList] = useState([]); // 조회된 전체 예약 목록
  const [filteredData, setFilteredData] = useState([]); // 검색어 포함 필터링된 목록

  const handleYearChange = (event) => {
    setYear(event.target.value);
  };

  const handleMonthChange = (event) => {
    setMonth(event.target.value);
  };

  const handleDayChange = (event) => {
    setDay(event.target.value);
  };


  const handleSearch = async () => {
    if (!year || !month || !day) {
      alert('년, 월, 일을 모두 선택해주세요!');
      return;
    }

    const targetDate = `${year.slice(2)}-${month}-${day}`; // 예: "2025-07-15"
    const db = getDatabase();
    const usersRef = ref(db, 'users');


    try {
      const snapshot = await get(usersRef);
      if (snapshot.exists()) {
        const usersData = snapshot.val();
        let resultList = [];

        Object.entries(usersData).forEach(([uid, userInfo]) => {
          const { name, email, reservations } = userInfo;

          if (reservations) {
            Object.values(reservations).forEach((res) => {
              if (res.date === targetDate) {
                resultList.push({
                  name,
                  email,
                  route: res.route || '',
                  time: res.time || '',
                  canceled: false // 현재 구조엔 취소 여부가 없으므로 기본 false 처리
                });
              }
            });
          }
        });

        // 이름 검색어 필터
        if (searchName.trim() !== '') {
          resultList = resultList.filter(item =>
            item.name.includes(searchName.trim())
          );
        }

        setReservationList(resultList);
        setFilteredData(resultList);
      } else {
        setReservationList([]);
        setFilteredData([]);
        alert('예약 데이터가 없습니다.');
      }
    } catch (error) {
      alert('예약 데이터를 불러오는 중 오류가 발생했습니다.');
    }
  };

  const [filteredRouteStats, setFilteredRouteStats] = useState([]);
  const [chartYear, setChartYear] = useState('');
  const [chartMonth, setChartMonth] = useState('');
  const [chartDay, setChartDay] = useState('');

  const handleChartYearChange = (e) => setChartYear(e.target.value);
  const handleChartMonthChange = (e) => setChartMonth(e.target.value);
  const handleChartDayChange = (e) => setChartDay(e.target.value);


  const handleChartSearch = async () => {
    const db = getDatabase();
    const usersRef = ref(db, 'users');
    const snapshot = await get(usersRef);
    if (!snapshot.exists()) return;

    const usersData = snapshot.val();
    const counts = {};

    // 필터 값 직접 계산
    let dynamicFilter = '';
    if (statType === 'route') {
      const shortYear = chartYear ? chartYear.slice(2) : '';
      dynamicFilter = [shortYear, chartMonth, chartDay].filter(Boolean).join('-');
    } else if (statType === 'station' || statType === 'time') {
      dynamicFilter = selectedRoute; // 노선 이름 기반
    }

    Object.values(usersData).forEach(user => {
      const reservations = user.reservations || {};
      Object.values(reservations).forEach(res => {
        if (statType === 'route' && res.date === dynamicFilter) {
          const route = res.route || '기타';
          counts[route] = (counts[route] || 0) + 1;
        }
        if (statType === 'station' && res.route === dynamicFilter) {
          const station = res.station || '미지정';
          counts[station] = (counts[station] || 0) + 1;
        }
        if (statType === 'time' && res.route === dynamicFilter) {
          const time = res.time || '00:00';
          counts[time] = (counts[time] || 0) + 1;
        }
        if (statType === 'routeTotal') {
          const route = res.route || '기타';
          counts[route] = (counts[route] || 0) + 1;
        }
      });
    });

    const data = Object.entries(counts).map(([name, count]) => ({ name, count }));
    setFilteredRouteStats(data);
  };

 
  const [statType, setStatType] = useState('routeTotal');

   useEffect(() => {
  // 탭이 열릴 때 최초 한 번만 실행
    if (statType === 'routeTotal') {
      handleChartSearch();
    }
  }, [statType]);

  const [filterValue, setFilterValue] = useState(''); // 날짜 or 노선명 등
  const [chartData, setChartData] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState('');
  const [routeList, setRouteList] = useState([]);

  useEffect(() => {
    const fetchRouteNames = async () => {
      const db = getDatabase();
      const routeRef = ref(db, 'routes');
      const snapshot = await get(routeRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const routeNames = Object.values(data)
          .map((route) => route.name)
          .filter(Boolean); // name이 undefined/null인 경우 제외
        setRouteList(routeNames);
      }
    };

    fetchRouteNames();
  }, []);

  const handleStatTypeChange = (e) => {
    const selectedType = e.target.value;
    setStatType(selectedType);
    setFilterValue(''); // 유형이 바뀌면 필터 초기화
  };

  const [allDeletedReservations, setAllDeletedReservations] = useState([]);
  const [deleteType, setDeleteType] = useState("routeTotal"); // 기본값은 "route"
  const [filteredRouteDeletes, setFilteredRouteDeletes] = useState([]);


  useEffect(() => {
    const db = getDatabase();
    const usersRef = ref(db, "users");

    get(usersRef).then((snapshot) => {
      const all = [];
      snapshot.forEach((userSnap) => {
        const reservations = userSnap.child("reservations");
        reservations.forEach((resSnap) => {
          const data = resSnap.val();
          if (data.deleted === true) {
            all.push({
              route: data.route,
              time: data.time,
              date: data.date,
              reason: data.reason,
            });
          }
        });
      });
      setAllDeletedReservations(all);
    });
  }, []);
  


  const [deleteYear, setDeleteYear] = useState('');
  const [deleteMonth, setDeleteMonth] = useState('');
  const [deleteDay, setDeleteDay] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const handleDeleteYearChange = (e) => setDeleteYear(e.target.value);
  const handleDeleteMonthChange = (e) => setDeleteMonth(e.target.value);
  const handleDeleteDayChange = (e) => setDeleteDay(e.target.value);

  const handleDeleteChange = (event) => {
    setDeleteType(event.target.value);
    
  };

  const handleDeleteSearch = () => {
    let result = [];

    const formatDate = (dateStr) => {
      // 예: 25-07-21 → 2025-07-21
      const [yy, mm, dd] = dateStr.split("-");
      return `20${yy}-${mm}-${dd}`;
    };

    const filtered = allDeletedReservations.filter((r) => {
      if (!r.date) return false;

      const fullDate = formatDate(r.date); // "2025-07-21"
      const [year, month, day] = fullDate.split("-");

      const match =
        (!deleteYear || year === deleteYear) &&
        (!deleteMonth || month === deleteMonth) &&
        (!deleteDay || day === deleteDay);

      return match;
    });


    if (deleteType === "route") {
      // 날짜별 취소 노선 수 (필터 반영된 데이터 사용)
      const grouped = {};
      filtered.forEach((r) => {
        const key = `${r.route}`;
        grouped[key] = (grouped[key] || 0) + 1;
      });
      result = Object.entries(grouped).map(([name, count]) => ({ name, count }));
    }

    if (deleteType === "time") {
      const grouped = {};

      allDeletedReservations
        .filter((r) => selectedTime === "" || r.route === selectedTime)
        .forEach((r) => {
          const key = r.time;
          grouped[key] = (grouped[key] || 0) + 1;
        });

        result = Object.entries(grouped).map(([name, count]) => ({ name, count }));
      }


    if (deleteType === "routeTotal") {
      const grouped = {};
      allDeletedReservations.forEach((r) => {
        grouped[r.route] = (grouped[r.route] || 0) + 1;
      });
      result = Object.entries(grouped).map(([name, count]) => ({ name, count }));
    }

    if (deleteType === "reason") {
      const grouped = {};
      allDeletedReservations.forEach((r) => {
        const reasons = r.reason?.split(",") ?? [];
        reasons.forEach((re) => {
          const trimmed = re.trim();
          grouped[trimmed] = (grouped[trimmed] || 0) + 1;
        });
      });
      result = Object.entries(grouped).map(([name, count]) => ({ name, count }));
    }

    setFilteredRouteDeletes(result);
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
          variant="standard" 
          centered            
          sx={{
            minWidth: 'fit-content', }}
        >
          <Tab label="날짜별 예약자 목록" />
          <Tab label="예약 통계" />
          <Tab label="예약 취소 분석" />
        </Tabs>
      </Box>

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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2,}}>
            <FormControl sx={{ width: 150 }}>
              <InputLabel>년도</InputLabel>
              <Select value={year} onChange={handleYearChange}>
                <MenuItem value="2023">2023</MenuItem>
                <MenuItem value="2024">2024</MenuItem>
                <MenuItem value="2025">2025</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ width: 150 }}>
              <InputLabel>월</InputLabel>
              <Select value={month} onChange={handleMonthChange}>
                {Array.from({ length: 12 }, (_, i) => (
                  <MenuItem key={i + 1} value={String(i + 1).padStart(2, '0')}>
                    {i + 1}월
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ width: 150 }}>
              <InputLabel>일</InputLabel>
              <Select value={day} onChange={handleDayChange}>
                {Array.from({ length: 31 }, (_, i) => (
                  <MenuItem key={i + 1} value={String(i + 1).padStart(2, '0')}>
                    {i + 1}일
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="이름 검색"
              variant="outlined"
              value={searchName}
              sx={{ width: 300 }}
              onChange={e => setSearchName(e.target.value)}
            />
            
            <Button variant="contained" onClick={handleSearch}>조회</Button>
          </Box>
          <Paper
            elevation={2}
            sx={{
              backgroundColor: '#fff',
              padding: 2,
              mt: 2,
              borderRadius: 2,
            }}
          >
            {/* 라벨 헤더 줄 */}
            <Box sx={{ display: 'flex', mb: 1 }}>
              <Typography sx={{ width: 200, fontWeight: 'bold' }}>이메일</Typography>
              <Typography sx={{ width: 200, fontWeight: 'bold' }}>이름</Typography>
              <Typography sx={{ width: 200, fontWeight: 'bold' }}>노선</Typography>
              <Typography sx={{ width: 200, fontWeight: 'bold' }}>출발 시간</Typography>
              <Typography sx={{ width: 200, fontWeight: 'bold' }}>취소 여부</Typography>
            </Box>

            {/* 데이터 줄들 */}
            {filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    py: 1,
                    borderBottom: '1px solid #eee'
                  }}
                >
                  <Typography sx={{ width: 200 }}>{item.email}</Typography>
                  <Typography sx={{ width: 200 }}>{item.name}</Typography>
                  <Typography sx={{ width: 200 }}>{item.route}</Typography>
                  <Typography sx={{ width: 200 }}>{item.time}</Typography>
                  <Typography sx={{ width: 200 }}>
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

          </TabPanel>
          <TabPanel value={tabIndex} index={1}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 5}}>
              <FormControl sx={{ width: 200 }}>
                <InputLabel>통계 유형</InputLabel>
                <Select value={statType} onChange={handleStatTypeChange}>
                  <MenuItem value="route">날짜별 노선별 예약 수</MenuItem>
                  <MenuItem value="station">노선별 정류장 예약 수</MenuItem>
                  <MenuItem value="time">노선별 시간대 예약 수</MenuItem>
                  <MenuItem value="routeTotal">전체 노선 누적 예약 수</MenuItem>
                </Select>
              </FormControl>
              {statType === 'route' && (
              <>
                {/* chartYear, chartMonth, chartDay 드롭다운 그대로 사용! */}
                <FormControl sx={{ width: 150 }}>
                  <InputLabel>년도</InputLabel>
                  <Select value={chartYear} onChange={handleChartYearChange}>
                    <MenuItem value="">전체</MenuItem>
                    <MenuItem value="2023">2023</MenuItem>
                    <MenuItem value="2024">2024</MenuItem>
                    <MenuItem value="2025">2025</MenuItem>
                  </Select>
                </FormControl>

                <FormControl sx={{ width: 150 }}>
                  <InputLabel>월</InputLabel>
                  <Select value={chartMonth} onChange={handleChartMonthChange}>
                    <MenuItem value="">전체</MenuItem>
                    {Array.from({ length: 12 }, (_, i) => (
                      <MenuItem key={i + 1} value={String(i + 1).padStart(2, '0')}>
                        {i + 1}월
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl sx={{ width: 150 }}>
                  <InputLabel>일</InputLabel>
                  <Select value={chartDay} onChange={handleChartDayChange}>
                    <MenuItem value="">전체</MenuItem>
                    {Array.from({ length: 31 }, (_, i) => (
                      <MenuItem key={i + 1} value={String(i + 1).padStart(2, '0')}>
                        {i + 1}일
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}

            {/* 2. 노선 기준 정류장 통계 or 시간대 통계일 경우 */}
            {(statType === 'station' || statType === 'time') && (
              <FormControl sx={{ width: 200 }}>
                <InputLabel>노선 선택</InputLabel>
                <Select value={selectedRoute} onChange={(e) => setSelectedRoute(e.target.value)}>
                  {routeList.map((route) => (
                    <MenuItem key={route} value={route}>{route}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
              
              
              <Button variant="contained" onClick={handleChartSearch}>조회</Button>
            </Box>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={filteredRouteStats}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#FABE00" barSize={50} />
              </BarChart>
            </ResponsiveContainer>

          </TabPanel>
        <TabPanel value={tabIndex} index={2}><Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 5}}>
              <FormControl sx={{ width: 200 }}>
                <InputLabel>통계 유형</InputLabel>
                <Select value={deleteType} onChange={handleDeleteChange}>
                  <MenuItem value="route">날짜별 취소 노선 수</MenuItem>
                  <MenuItem value="time">노선별 취소 시간대</MenuItem>
                  <MenuItem value="routeTotal">전체 취소 노선 수</MenuItem>
                  <MenuItem value="reason">전체 취소 사유</MenuItem>
                </Select>
              </FormControl>
              {deleteType === 'route' && (
              <>
                {/* chartYear, chartMonth, chartDay 드롭다운 그대로 사용! */}
                <FormControl sx={{ width: 150 }}>
                  <InputLabel>년도</InputLabel>
                  <Select value={deleteYear} onChange={handleDeleteYearChange}>
                    <MenuItem value="">전체</MenuItem>
                    <MenuItem value="2023">2023</MenuItem>
                    <MenuItem value="2024">2024</MenuItem>
                    <MenuItem value="2025">2025</MenuItem>
                  </Select>
                </FormControl>

                <FormControl sx={{ width: 150 }}>
                  <InputLabel>월</InputLabel>
                  <Select value={deleteMonth} onChange={handleDeleteMonthChange}>
                    <MenuItem value="">전체</MenuItem>
                    {Array.from({ length: 12 }, (_, i) => (
                      <MenuItem key={i + 1} value={String(i + 1).padStart(2, '0')}>
                        {i + 1}월
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl sx={{ width: 150 }}>
                  <InputLabel>일</InputLabel>
                  <Select value={deleteDay} onChange={handleDeleteDayChange}>
                    <MenuItem value="">전체</MenuItem>
                    {Array.from({ length: 31 }, (_, i) => (
                      <MenuItem key={i + 1} value={String(i + 1).padStart(2, '0')}>
                        {i + 1}일
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}
            {(deleteType === 'time') && (
              <FormControl sx={{ width: 200 }}>
                <InputLabel>노선 선택</InputLabel>
                <Select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)}>
                  {routeList.map((route) => (
                    <MenuItem key={route} value={route}>{route}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

              <Button variant="contained" onClick={handleDeleteSearch}>조회</Button>
            </Box>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={filteredRouteDeletes}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#FABE00" barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </TabPanel>
                  
                </Box>
              </Box>
  );
};

export default ReservationManagement;
