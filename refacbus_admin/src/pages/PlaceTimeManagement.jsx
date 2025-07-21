import React, { useState } from 'react';
import { useEffect } from 'react';
import { onValue } from 'firebase/database';import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import AddIcon from '@mui/icons-material/Add';
import {
  TextField, Box, Table, TableHead, TableCell, TableRow, TableBody,
  Tab, Tabs, Dialog, DialogTitle, DialogContent, DialogActions,
  TableContainer, Button, Typography, Paper
} from '@mui/material';
import { ref, get, update, push, set } from "firebase/database";
import { realtimeDb, auth } from "../firebase";
import IconButton from "@mui/material/IconButton";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
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

const PlaceTimeManagement = () => {
    const [tabIndex, setTabIndex] = useState(0);
    const [open, setOpen] = useState(false);
    const [route, setRoute] = useState('');
    const [isPinned, setIsPinned] = useState(false);
    const [routeList, setRouteList] = useState([]);
  
    const handleTabChange = (event, newValue) => {
      setTabIndex(newValue);
    };
  
    const handleSubmit = () => {
      const newRoute = {
        name: route,
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
    const [isRouteOpen, setIsRouteOpen] = useState(false);
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [routeText, setRouteText] = useState("");
    const [openRouteId, setOpenRouteId] = useState(null);

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
    
      const handleMenuOpen = (event, route) => {
        setSelectedRoute(route); 
        setIsRouteOpen(true);
      };
    
      const handleCloseMemo = () => {
        setSelectedRoute(null);
        setIsRouteOpen(false);
        setRouteText("");
      };
    
      const handleSubmitMemo = async () => {
        if (!selectedRoute || !routeText.trim()) return;

        const targetKey = tabIndex === 1 ? "times" : "stops";
        const dataRef = ref(realtimeDb, `routes/${selectedRoute.uid}/${targetKey}`);
        await push(dataRef, routeText.trim());

        const updatedSnapshot = await get(ref(realtimeDb, `routes/${selectedRoute.uid}`));
        const updatedData = updatedSnapshot.val();

        setAllRoutes((prev) =>
          prev.map((route) =>
            route.uid === selectedRoute.uid ? { ...route, [targetKey]: updatedData[targetKey] } : route
          )
        );
        setFilteredRoutes((prev) =>
          prev.map((route) =>
            route.uid === selectedRoute.uid ? { ...route, [targetKey]: updatedData[targetKey] } : route
          )
        );

        setIsRouteOpen(false);
        setRouteText('');
        setSelectedRoute(null);
      };

      const handleToggleTimes = (uid) => {
      setOpenRouteId(prev => (prev === uid ? null : uid));
      };

      const [selectedTimeInfo, setSelectedTimeInfo] = useState(null); 
      const [openTimeDialog, setOpenTimeDialog] = useState(false);
      const [editTimeText, setEditTimeText] = useState('');

      
      const [isStopDialogOpen, setIsStopDialogOpen] = useState(false);
      const [selectedRouteForStop, setSelectedRouteForStop] = useState(null);
      const [openStopEditDialog, setOpenStopEditDialog] = useState(false);
      const [selectedStopInfo, setSelectedStopInfo] = useState(null);
      const [editStopText, setEditStopText] = useState('');


      const handleStopOpen = (event, route) => {
        setSelectedRouteForStop(route);  
        setIsStopDialogOpen(true); 
      };

      const [selectedRouteInfo, setSelectedRouteInfo] = useState(null); 
      const [editRouteText, setEditRouteText] = useState('');
      const [openRouteDialog, setOpenRouteDialog] = useState(false);


    

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
            minWidth: 'fit-content',  
          }}
        >
          <Tab label="노선 추가 / 삭제" />
          <Tab label="노선 시간대 설정 및 관리" />
          <Tab label="노선 정류장 설정 및 관리" />
        </Tabs>
      </Box>

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
          
          
          {/* 팝업 다이얼로그 */}
          <Dialog open={open} onClose={() => setOpen(false)}>
            <DialogTitle>노선 등록</DialogTitle>
              <DialogContent>
                <TextField
                  label="노선"
                  fullWidth
                  margin="normal"
                  value={route}
                  onChange={e => setRoute(e.target.value)}
                  />
                
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  
                  <IconButton onClick={() => setIsPinned(prev => !prev)}>
                    {isPinned ? <StarIcon color="primary" /> : <StarBorderIcon />}
                  </IconButton>
                  <Typography>{isPinned ? '' : '현사용 노선에 등록'}</Typography>
                    </Box>
                      <Box sx={{ mt: 2 }}>
                        <Button variant="contained" onClick={handleSubmit}>등록</Button>
                        <Button onClick={() => setOpen(false)} sx={{ ml: 1 }}>취소</Button>
                      </Box>
                    </DialogContent>
                    </Dialog>
                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell style={{ width: "50%" }}>노선</TableCell>
                            <TableCell style={{ width: "40%" }}>등록 날짜</TableCell>
                            <TableCell style={{ width: "10%" }}>고정</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {routeList.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>
                                <a style={{ cursor: 'pointer' }}
                                  onClick={() => {
                                    setSelectedRouteInfo({ id: item.id, name: item.name });
                                    setEditRouteText(item.name);
                                    setOpenRouteDialog(true);
                                  }}>
                                  {item.name}
                                </a>
                              </TableCell>
                              <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <IconButton onClick={() => togglePinned(item.id, item.isPinned)}>
                                  {item.isPinned ? <StarIcon color="warning" /> : <StarBorderIcon />}
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      <Dialog open={openRouteDialog} onClose={() => setOpenRouteDialog(false)}>
                        <DialogTitle>노선명 수정 / 삭제</DialogTitle>
                        <DialogContent>
                          <TextField
                            label="노선명"
                            fullWidth
                            value={editRouteText}
                            onChange={(e) => setEditRouteText(e.target.value)}
                          />
                        </DialogContent>
                        <DialogActions>
                          <Button
                            color="error"
                            onClick={async () => {
                              if (!selectedRouteInfo) return;
                              await remove(ref(realtimeDb, `routes/${selectedRouteInfo.id}`));
                              setRouteList((prev) => prev.filter((r) => r.id !== selectedRouteInfo.id));
                              setOpenRouteDialog(false);
                            }}
                          >
                            삭제
                          </Button>
                          <Button
                            color="primary"
                            onClick={async () => {
                              if (!selectedRouteInfo) return;
                              await set(ref(realtimeDb, `routes/${selectedRouteInfo.id}/name`), editRouteText);
                              const updatedSnapshot = await get(ref(realtimeDb, `routes/${selectedRouteInfo.id}`));
                              const updatedData = updatedSnapshot.val();
                              setRouteList((prev) =>
                                prev.map((r) => r.id === selectedRouteInfo.id ? { ...r, name: updatedData.name } : r)
                              );
                              setOpenRouteDialog(false);
                            }}
                          >
                            수정
                          </Button>
                        </DialogActions>
                      </Dialog>

                    </TableContainer>
        </TabPanel>
        <TabPanel value={tabIndex} index={1}>
          <Box sx={{ width: '100%', backgroundColor: '#fff', padding: 2 }}>
            <TextField
              label="노선으로 검색"
              variant="outlined"
              size="small"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              sx={{ width: '500px', mb: 2 }}
            />

            <Table>
              <TableHead>
                <TableRow>
                  <TableCell style={{ width: "40%" }}>노선명</TableCell>
                  <TableCell style={{ width: "20%" }}>일일 운행 회수</TableCell>
                  <TableCell style={{ width: "20%" }}>시간대 추가</TableCell>
                  <TableCell style={{ width: "20%" }}>시간대 목록</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRoutes.map((route) => (
                  <React.Fragment key={route.uid}>
                    <TableRow key={route.uid}>
                      <TableCell>{route.name}</TableCell>
                      <TableCell>{route.times ? Object.keys(route.times).length + '회' : '0회'}</TableCell>
                      <TableCell>
                        <IconButton onClick={(e) => handleMenuOpen(e, route)}>
                          <AccessTimeIcon />
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleToggleTimes(route.uid)}>
                          {openRouteId === route.uid ? (
                            <ExpandLessIcon />
                          ) : (
                            <ExpandMoreIcon />
                          )}
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  {openRouteId === route.uid && (
                    <TableRow>
                      <TableCell colSpan={4}>
                        <Typography sx={{ mb: 1 }}>🚌 시간대 목록</Typography>
                        {route.times
                          ? (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {Object.entries(route.times).map(([timeId, timeValue]) => (
                              <Box
                                key={timeId}
                                onClick={() => {
                                  setSelectedTimeInfo({ routeId: route.uid, timeId, value: timeValue });
                                  setEditTimeText(timeValue);
                                  setOpenTimeDialog(true);
                                }}
                                sx={{
                                  cursor: 'pointer',
                                  width: '19%',
                                  backgroundColor: '#e3f2fd',
                                  padding: '8px',
                                  borderRadius: '4px',
                                  textAlign: 'center',
                                  boxShadow: 1,
                                }}
                              >
                                {timeValue}
                              </Box>
                            ))}

                          </Box>
                        ) : (
                          <Typography color="text.secondary">등록된 시간대가 없습니다</Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
                ))}
              </TableBody>
            </Table>

            <Dialog open={isRouteOpen} onClose={handleCloseMemo}>
              <DialogTitle>시간대 추가</DialogTitle>
              <DialogContent>
                <TextField
                  label="시간 입력"
                  multiline
                  fullWidth
                  value={routeText}
                  onChange={(e) => setRouteText(e.target.value)}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={handleSubmitMemo} color="primary">확인</Button>
                <Button onClick={handleCloseMemo} color="secondary">취소</Button>
              </DialogActions>
            </Dialog>
            
            <Dialog open={openTimeDialog} onClose={() => setOpenTimeDialog(false)}>
              <DialogTitle>시간 수정 / 삭제</DialogTitle>
              <DialogContent>
                <TextField
                  label="시간"
                  value={editTimeText}
                  onChange={(e) => setEditTimeText(e.target.value)}
                  fullWidth
                />
              </DialogContent>
              <DialogActions>
                <Button
                  color="error"
                  onClick={async () => {
                    if (!selectedTimeInfo) return;
                    const { routeId, timeId } = selectedTimeInfo;
                    await update(ref(realtimeDb, `routes/${routeId}/times`), {[timeId]: null,});
                   
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
                  
                  }}
                >
                  삭제
                </Button>
                <Button
                  color="primary"
                  onClick={async () => {
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
                  }}
                >
                  수정
                </Button>
              </DialogActions>
            </Dialog>

          </Box>
        </TabPanel>
        <TabPanel value={tabIndex} index={2}>
          <Box sx={{ width: '100%', backgroundColor: '#fff', padding: 2 }}>
            <TextField
              label="노선으로 검색"
              variant="outlined"
              size="small"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              sx={{ width: '500px', mb: 2 }}
            />

            <Table>
              <TableHead>
                <TableRow>
                  <TableCell style={{ width: "40%" }}>노선명</TableCell>
                  <TableCell style={{ width: "20%" }}>정류장 수</TableCell>
                  <TableCell style={{ width: "20%" }}>정류장 추가</TableCell>
                  <TableCell style={{ width: "20%" }}>정류장 목록</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRoutes.map((route) => (
                  <React.Fragment key={route.uid}>
                    <TableRow key={route.uid}>
                      <TableCell>{route.name}</TableCell>
                      <TableCell>
                        {route.stops ? Object.keys(route.stops).length + '개' : '0개'}
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={(e) => handleStopOpen(e, route)}>
                          <AccessTimeIcon />
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleToggleTimes(route.uid)}>
                          {openRouteId === route.uid ? (
                            <ExpandLessIcon />
                          ) : (
                            <ExpandMoreIcon />
                          )}
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  {openRouteId === route.uid && (
                    <TableRow>
                      <TableCell colSpan={4}>
                        <Typography sx={{ mb: 1 }}>🚌 정류장 목록</Typography>
                        {route.stops ? (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {Object.entries(route.stops).map(([stopId, stopName]) => (
                              <Box
                                key={stopId}
                                onClick={() => {
                                  setSelectedStopInfo({ routeId: route.uid, stopId, value: stopName });
                                  setEditStopText(stopName);
                                  setOpenStopEditDialog(true);
                                }}
                                sx={{
                                  cursor: 'pointer',
                                  width: '19%',
                                  backgroundColor: '#fce4ec',
                                  padding: '8px',
                                  borderRadius: '4px',
                                  textAlign: 'center',
                                  boxShadow: 1,
                                }}
                              >
                                {stopName}
                              </Box>
                            ))}
                          </Box>
                        ) : (
                          <Typography color="text.secondary">등록된 정류장이 없습니다</Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
                ))}
              </TableBody>
            </Table>

            <Dialog open={isRouteOpen} onClose={handleCloseMemo}>
              <DialogTitle>정류장 추가</DialogTitle>
              <DialogContent>
                <TextField
                  label="정류장 입력"
                  multiline
                  fullWidth
                  value={routeText}
                  onChange={(e) => setRouteText(e.target.value)}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={handleSubmitMemo} color="primary">확인</Button>
                <Button onClick={handleCloseMemo} color="secondary">취소</Button>
              </DialogActions>
            </Dialog>
            
            <Dialog open={openStopEditDialog} onClose={() => setOpenStopEditDialog(false)}>
              <DialogTitle>정류장 수정 / 삭제</DialogTitle>
              <DialogContent>
                <TextField
                  label="정류장명"
                  value={editStopText}
                  onChange={(e) => setEditStopText(e.target.value)}
                  fullWidth
                />
              </DialogContent>
              <DialogActions>
                <Button
                  color="error"
                  onClick={async () => {
                    if (!selectedStopInfo) return;
                    const { routeId, stopId } = selectedStopInfo;
                    await update(ref(realtimeDb, `routes/${routeId}/stops`), { [stopId]: null });

                    const updatedSnapshot = await get(ref(realtimeDb, `routes/${routeId}`));
                    const updatedData = updatedSnapshot.val();

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
                  }}
                >
                  삭제
                </Button>
                <Button
                  color="primary"
                  onClick={async () => {
                    if (!selectedStopInfo) return;
                    const { routeId, stopId } = selectedStopInfo;
                    await set(ref(realtimeDb, `routes/${routeId}/stops/${stopId}`), editStopText);

                    const updatedSnapshot = await get(ref(realtimeDb, `routes/${routeId}`));
                    const updatedData = updatedSnapshot.val();

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
                  }}
                >
                  수정
                </Button>
              </DialogActions>
            </Dialog>


          </Box>
        </TabPanel>
      </Box>
    </Box>
  );
};

export default PlaceTimeManagement;
