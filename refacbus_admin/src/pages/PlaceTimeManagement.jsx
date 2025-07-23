import React, { useState } from 'react';
import { useEffect } from 'react';
import { onValue } from 'firebase/database';import StarIcon from '@mui/icons-material/Star';
import AddIcon from '@mui/icons-material/Add';
import { TextField, Box, Button, } from '@mui/material';
import { ref, get, update, push, set } from "firebase/database";
import { realtimeDb, auth } from "../firebase";
import TabbedContainer from '../components/common/TabbedContainer';
import TabPanel from '../components/common/TabPanel'; // 공통 컴포넌트로 분리해둔 것
import RouteAddDialog from '../components/PlaceTime/RouteAddDialog';
import TimeAddDialog from '../components/PlaceTime/TimeAddDialog';
import TimeEditDialog from '../components/PlaceTime/TimeEditDialog';
import StopAddDialog from '../components/PlaceTime/StopAddDialog';
import StopEditDialog from '../components/PlaceTime/StopEditDialog';
import RouteListTable from '../components/PlaceTime/RouteListTable';
import TimeStopTable from '../components/PlaceTime/TimeStopTable';
import SearchBar from '../components/common/SearchBar';



const PlaceTimeManagement = () => {
    const [tabIndex, setTabIndex] = useState(0);
    const [open, setOpen] = useState(false);
    const [route, setRoute] = useState('');
    const [routeName, setRouteName] = useState('');
    const [isPinned, setIsPinned] = useState(false);
    const [routeList, setRouteList] = useState([]);
  
    const handleTabChange = (event, newValue) => {
      setTabIndex(newValue);
    };
  
    const handleAddRoute = () => {
      const newRoute = {
        name: routeName,
        isPinned,
        date: new Date().toISOString(),
        writer: '관리자',
      };
  
      const newRef = push(ref(realtimeDb, 'routes'));
      set(newRef, newRoute);
  
      setOpen(false);
      setRoute('');
      setIsPinned(false);
    };
  
    useEffect(() => {
      const routeListRef = ref(realtimeDb, 'routes');
      onValue(routeListRef, snapshot => {
        const data = snapshot.val();
        if (data) {
          const list = Object.entries(data).map(([id, item]) => ({
            id,
            ...item
          }));
          list.sort((a, b) => b.isPinned - a.isPinned);
          setRouteList(list);
        } else {
          setRouteList([]);
        }
      });
    }, []);
  
    const togglePinned = (id, currentState) => {
    const routeRef = ref(realtimeDb, `routes/${id}`);
    update(routeRef, { isPinned: !currentState });
    };

    const [searchKeyword, setSearchKeyword] = useState('');
    const [filteredRoutes, setFilteredRoutes] = useState([]);
    const [allRoutes, setAllRoutes] = useState([]);
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [routeText, setRouteText] = useState("");
    const [openRouteId, setOpenRouteId] = useState(null);
    const [isTimeDialogOpen, setIsTimeDialogOpen] = useState(false);
  const [isStopDialogOpen, setIsStopDialogOpen] = useState(false);


      useEffect(() => {
        const fetchRoutes = async () => {
          const snapshot = await get(ref(realtimeDb, "routes"));
          const routesData = snapshot.val();
          const routesArray = Object.entries(routesData).map(([uid, value]) => ({
            uid,
            ...value,
          }));
          const pinnedRoutes = routesArray.filter(route => route.isPinned);
          setAllRoutes(pinnedRoutes);
          setFilteredRoutes(pinnedRoutes);
        };
        fetchRoutes();
      }, []);
    
      useEffect(() => {
        const filtered = allRoutes.filter((route) =>
          (route.name ?? '').toLowerCase().includes(searchKeyword.toLowerCase())
        );
        setFilteredRoutes(filtered);
      }, [searchKeyword, allRoutes]);
    
      const handleTimeOpen = (route) => {
        setSelectedRoute(route);
        // 상태 설정 후 다음 프레임에서 실행
        setTimeout(() => setIsTimeDialogOpen(true), 0);
      };

      const updateRoutes = (key, value) => {
        setAllRoutes((prev) =>
          prev.map((route) =>
            route.uid === selectedRoute.uid ? { ...route, [key]: value } : route
          )
        );
        setFilteredRoutes((prev) =>
          prev.map((route) =>
            route.uid === selectedRoute.uid ? { ...route, [key]: value } : route
          )
        );
      };
      
      const handleSubmitTime = async () => {
        if (!selectedRoute || !routeText.trim()) return;
        const dataRef = ref(realtimeDb, `routes/${selectedRoute.uid}/times`);
        await push(dataRef, routeText.trim());

        const updatedSnapshot = await get(ref(realtimeDb, `routes/${selectedRoute.uid}`));
        const updatedData = updatedSnapshot.val();
        

        updateRoutes('times', updatedData.times);
        setIsTimeDialogOpen(false);
        setRouteText('');
        setSelectedRoute(null);
      };

      const handleSubmitStop = async () => {
        if (!selectedRoute || !routeText.trim()) return;
        const dataRef = ref(realtimeDb, `routes/${selectedRoute.uid}/stops`);
        await push(dataRef, routeText.trim());

        const updatedSnapshot = await get(ref(realtimeDb, `routes/${selectedRoute.uid}`));
        const updatedData = updatedSnapshot.val();

        updateRoutes('stops', updatedData.stops);
        setIsStopDialogOpen(false);
        setRouteText('');
        setSelectedRoute(null);
      };

      
      const handleUpdateTime = async () => {
        if (!selectedTimeInfo) return;
        const { routeId, timeId } = selectedTimeInfo;
        await set(ref(realtimeDb, `routes/${routeId}/times/${timeId}`), editTimeText); 

        const updatedSnapshot = await get(ref(realtimeDb, `routes/${routeId}`));
        const updatedData = updatedSnapshot.val();

        setAllRoutes((prev) =>
          prev.map((route) =>
            route.uid === routeId ? { ...route, times: updatedData.times } : route
          )
        );
        setFilteredRoutes((prev) =>
          prev.map((route) =>
            route.uid === routeId ? { ...route, times: updatedData.times } : route
          )
        );
        setOpenTimeDialog(false);
      };

      const handleDeleteTime = async () => {
        if (!selectedTimeInfo) return;
        const { routeId, timeId } = selectedTimeInfo;

        await update(ref(realtimeDb, `routes/${routeId}/times`), {
          [timeId]: null
        });

        const snapshot = await get(ref(realtimeDb, `routes/${routeId}`));
        const updatedData = snapshot.val();

        setAllRoutes((prev) =>
          prev.map((route) =>
            route.uid === routeId ? { ...route, times: updatedData.times } : route
          )
        );
        setFilteredRoutes((prev) =>
          prev.map((route) =>
            route.uid === routeId ? { ...route, times: updatedData.times } : route
          )
        );

        setOpenTimeDialog(false);
      };

      const handleUpdateStop = async () => {
        if (!selectedStopInfo) return;
        const { routeId, stopId } = selectedStopInfo;

        await set(ref(realtimeDb, `routes/${routeId}/stops/${stopId}`), editStopText);

        const snapshot = await get(ref(realtimeDb, `routes/${routeId}`));
        const updatedData = snapshot.val();

        setAllRoutes((prev) =>
          prev.map((route) =>
            route.uid === routeId ? { ...route, stops: updatedData.stops } : route
          )
        );
        setFilteredRoutes((prev) =>
          prev.map((route) =>
            route.uid === routeId ? { ...route, stops: updatedData.stops } : route
          )
        );

        setOpenStopEditDialog(false);
      };

      const handleDeleteStop = async () => {
        if (!selectedStopInfo) return;
        const { routeId, stopId } = selectedStopInfo;

        await update(ref(realtimeDb, `routes/${routeId}/stops`), {
          [stopId]: null
        });

        const snapshot = await get(ref(realtimeDb, `routes/${routeId}`));
        const updatedData = snapshot.val();

        setAllRoutes((prev) =>
          prev.map((route) =>
            route.uid === routeId ? { ...route, stops: updatedData.stops } : route
          )
        );
        setFilteredRoutes((prev) =>
          prev.map((route) =>
            route.uid === routeId ? { ...route, stops: updatedData.stops } : route
          )
        );

        setOpenStopEditDialog(false);
      };


      const [selectedTimeInfo, setSelectedTimeInfo] = useState(null); 
      const [openTimeDialog, setOpenTimeDialog] = useState(false);
      const [editTimeText, setEditTimeText] = useState('');

      
      const [openStopEditDialog, setOpenStopEditDialog] = useState(false);
      const [selectedStopInfo, setSelectedStopInfo] = useState(null);
      const [editStopText, setEditStopText] = useState('');


      const handleStopOpen = (route) => {
        console.log("🧪 handleStopOpen에서 받은 route:", route);
        setSelectedRoute(route);
        // 상태 설정 후 다음 프레임에서 실행
        setTimeout(() => setIsStopDialogOpen(true), 0);
      };


      const [selectedRouteInfo, setSelectedRouteInfo] = useState(null); 
      const [editRouteText, setEditRouteText] = useState('');
      const [openRouteDialog, setOpenRouteDialog] = useState(false);

      const handleEditTimeClick = (routeId, timeId, timeValue) => {
        setSelectedTimeInfo({ routeId, itemId: timeId, value: timeValue });
        setEditTimeText(timeValue);
        setOpenTimeDialog(true);
      };

      const handleEditStopClick = (routeId, stopId, stopName) => {
        setSelectedStopInfo({ routeId, itemId: stopId, value: stopName });
        setEditStopText(stopName);
        setOpenStopEditDialog(true);
      };

    

  return (
    <Box sx={{ width: '100%' }}>
      
      <TabbedContainer
          tabIndex={tabIndex}
          handleTabChange={handleTabChange}
          labels={["노선 추가 / 삭제", "노선 시간대 설정 및 관리", "노선 정류장 설정 및 관리"]}
        />

      {/* 회색 박스 본문 */}
      <Box
        sx={{
          backgroundColor: '#f5f5f5',
          borderRadius: 2,
          marginTop: 1,
          width: '100%',
          maxWidth: 'none',
        }}
      >
        <TabPanel value={tabIndex} index={0}>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpen(true)}
            sx={{ mb: 2 }}
              >
            새 노선 등록
          </Button>
          
          
          <RouteAddDialog
            open={open}
            routeName={routeName}
            isPinned={isPinned}
            onChangeName={(e) => setRouteName(e.target.value)}
            onChangePinned={(e) => setIsPinned(e.target.checked)}
            onClose={() => setOpen(false)}
            onSubmit={handleAddRoute}
          />

          <RouteListTable
            routeList={routeList}
            onClickRoute={(item) => {
              setSelectedRouteInfo({ id: item.id, name: item.name });
              setEditRouteText(item.name);
              setOpenRouteDialog(true);
            }}
            onTogglePinned={(id, currentPinned) => togglePinned(id, currentPinned)}
          />       
        </TabPanel>
        <TabPanel value={tabIndex} index={1}>
          <Box sx={{ width: '100%', backgroundColor: '#fff', padding: 2 }}>
            <SearchBar
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="노선으로 검색"
            />

            <TimeStopTable
              filteredRoutes={filteredRoutes}
              openRouteId={openRouteId}
              setOpenRouteId={setOpenRouteId}
              itemKey="times"
              itemLabel="시간대"
              onAddClick={handleTimeOpen}
              onItemClick={handleEditTimeClick}
              setEditText={setEditTimeText}
              setOpenEditDialog={setOpenTimeDialog}
              setSelectedInfo={setSelectedTimeInfo}
              cardColor="#e3f2fd"
              getCountLabel={(count) => `${count}회`}
            />
            

            <TimeAddDialog
              open={isTimeDialogOpen}
              value={routeText}
              onChange={(e) => setRouteText(e.target.value)}
              onClose={() => setIsTimeDialogOpen(false)}
              onSubmit={handleSubmitTime}
            />
            
            <TimeEditDialog
              open={openTimeDialog}
              value={editTimeText}
              onChange={(e) => setEditTimeText(e.target.value)}
              onUpdate={handleUpdateTime}
              onDelete={handleDeleteTime}
              onClose={() => setOpenTimeDialog(false)}
            />

          </Box>
        </TabPanel>
        <TabPanel value={tabIndex} index={2}>
          <Box sx={{ width: '100%', backgroundColor: '#fff', padding: 2 }}>
            <SearchBar
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="노선으로 검색"
            />

            <TimeStopTable
              filteredRoutes={filteredRoutes}
              openRouteId={openRouteId}
              setOpenRouteId={setOpenRouteId}
              itemKey="stops"
              itemLabel="정류장"
              onAddClick={handleStopOpen}
              onItemClick={handleEditStopClick}
              setEditText={setEditStopText}
              setOpenEditDialog={setOpenStopEditDialog}
              setSelectedInfo={setSelectedStopInfo}
              cardColor="#fce4ec"
              getCountLabel={(count) => `${count}개`}
            />

            <StopAddDialog
              open={isStopDialogOpen}
              value={routeText}
              onChange={(e) => setRouteText(e.target.value)}
              onSubmit={handleSubmitStop}
              onClose={() => setIsStopDialogOpen(false)}
            />

            <StopEditDialog
              open={openStopEditDialog}
              value={editStopText}
              onChange={(e) => setEditStopText(e.target.value)}
              onUpdate={handleUpdateStop}
              onDelete={handleDeleteStop}
              onClose={() => setOpenStopEditDialog(false)}
            />

          </Box>
        </TabPanel>
      </Box>
    </Box>
  );
};

export default PlaceTimeManagement;
