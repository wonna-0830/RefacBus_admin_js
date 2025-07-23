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

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
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
