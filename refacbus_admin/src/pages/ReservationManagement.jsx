import React, { useState, useEffect } from 'react';
import { TextField, Box, Button, } from '@mui/material';
import { getDatabase, ref, get, child } from 'firebase/database';
import TabbedContainer from '../components/common/TabbedContainer';
import TabPanel from '../components/common/TabPanel';
import DateSelector from '../components/Reservation/DateSelector';
import ReservationListTable from '../components/Reservation/ReservationListTable';
import StatFilterBar from '../components/Reservation/StatFilterBar';
import DeleteStatFilterBar from '../components/Reservation/DeleteStatFilterBar';
import StatBarChart from '../components/Reservation/StatBarChart';
import SearchBar from '../components/common/SearchBar';


const ReservationManagement = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const handleTabChange = (event, newValue) => setTabIndex(newValue);

  // -------------------- 🔹 [2] 날짜별 예약자 목록 --------------------
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [reservationList, setReservationList] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const handleYearChange = (e) => setYear(e.target.value);
  const handleMonthChange = (e) => setMonth(e.target.value);
  const handleDayChange = (e) => setDay(e.target.value);

  const handleSearch = async () => {
    if (!year || !month || !day) {
      alert('년, 월, 일을 모두 선택해주세요!');
      return;
    }

    const targetDate = `${year.slice(2)}-${month}-${day}`;
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
                  canceled: false
                });
              }
            });
          }
        });

        if (searchKeyword.trim() !== '') {
          resultList = resultList.filter(item =>
            item.name.includes(searchKeyword.trim())
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

  // -------------------- 🔹 [3] 예약 통계 --------------------
  const [statType, setStatType] = useState('routeTotal');
  const [filterValue, setFilterValue] = useState('');
  const [chartYear, setChartYear] = useState('');
  const [chartMonth, setChartMonth] = useState('');
  const [chartDay, setChartDay] = useState('');
  const [selectedRoute, setSelectedRoute] = useState('');
  const [routeList, setRouteList] = useState([]);
  const [filteredRouteStats, setFilteredRouteStats] = useState([]);

  const handleStatTypeChange = (e) => {
    const selectedType = e.target.value;
    setStatType(selectedType);
    setFilterValue('');
  };
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
    let dynamicFilter = '';

    if (statType === 'route') {
      const shortYear = chartYear ? chartYear.slice(2) : '';
      dynamicFilter = [shortYear, chartMonth, chartDay].filter(Boolean).join('-');
    } else if (statType === 'station' || statType === 'time') {
      dynamicFilter = selectedRoute;
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

  useEffect(() => {
    if (statType === 'routeTotal') {
      handleChartSearch();
    }
  }, [statType]);

  useEffect(() => {
    const fetchRouteNames = async () => {
      const db = getDatabase();
      const routeRef = ref(db, 'routes');
      const snapshot = await get(routeRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const names = Object.values(data).map((r) => r.name).filter(Boolean);
        setRouteList(names);
      }
    };
    fetchRouteNames();
  }, []);

  // -------------------- 🔹 [4] 예약 취소 통계 --------------------
  const [allDeletedReservations, setAllDeletedReservations] = useState([]);
  const [deleteType, setDeleteType] = useState("routeTotal");
  const [filteredRouteDeletes, setFilteredRouteDeletes] = useState([]);
  const [deleteYear, setDeleteYear] = useState('');
  const [deleteMonth, setDeleteMonth] = useState('');
  const [deleteDay, setDeleteDay] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const handleDeleteChange = (e) => setDeleteType(e.target.value);
  const handleDeleteYearChange = (e) => setDeleteYear(e.target.value);
  const handleDeleteMonthChange = (e) => setDeleteMonth(e.target.value);
  const handleDeleteDayChange = (e) => setDeleteDay(e.target.value);

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

  const handleDeleteSearch = () => {
    const formatDate = (dateStr) => {
      const [yy, mm, dd] = dateStr.split("-");
      return `20${yy}-${mm}-${dd}`;
    };

    const filtered = allDeletedReservations.filter((r) => {
      if (!r.date) return false;
      const fullDate = formatDate(r.date);
      const [y, m, d] = fullDate.split("-");
      return (
        (!deleteYear || y === deleteYear) &&
        (!deleteMonth || m === deleteMonth) &&
        (!deleteDay || d === deleteDay)
      );
    });

    let result = [];

    if (deleteType === "route") {
      const grouped = {};
      filtered.forEach((r) => {
        grouped[r.route] = (grouped[r.route] || 0) + 1;
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
      
      <TabbedContainer
        tabIndex={tabIndex}
        handleTabChange={handleTabChange}
        labels={["날짜별 예약자 목록", "예약 통계", "예약 취소 분석"]}
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2,}}>
            <DateSelector
              year={year}
              month={month}
              day={day}
              onYearChange={handleYearChange}
              onMonthChange={handleMonthChange}
              onDayChange={handleDayChange}
              allowEmpty={false} 
            />

            <SearchBar
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="이름으로 검색"
            />
              
            <Button variant="contained" onClick={handleSearch}>조회</Button>
          </Box>
          <ReservationListTable data={filteredData} />

        </TabPanel>
        <TabPanel value={tabIndex} index={1}>
          <StatFilterBar
            statType={statType}
            onTypeChange={handleStatTypeChange}
            chartYear={chartYear}
            chartMonth={chartMonth}
            chartDay={chartDay}
            onYearChange={handleChartYearChange}
            onMonthChange={handleChartMonthChange}
            onDayChange={handleChartDayChange}
            selectedRoute={selectedRoute}
            onRouteChange={setSelectedRoute}
            routeList={routeList}
            onSearchClick={handleChartSearch}
          />
          <StatBarChart data={filteredRouteStats} />
        </TabPanel>
        <TabPanel value={tabIndex} index={2}>
          <DeleteStatFilterBar
            deleteType={deleteType}
            onDeleteTypeChange={handleDeleteChange}
            deleteYear={deleteYear}
            deleteMonth={deleteMonth}
            deleteDay={deleteDay}
            onYearChange={handleDeleteYearChange}
            onMonthChange={handleDeleteMonthChange}
            onDayChange={handleDeleteDayChange}
            selectedRoute={selectedTime}
            onRouteChange={setSelectedTime}
            routeList={routeList}
            onSearchClick={handleDeleteSearch}
          />
          <StatBarChart data={filteredRouteDeletes} color="#f06292" />
        </TabPanel>
      </Box>
    </Box>
  );
};

export default ReservationManagement;
