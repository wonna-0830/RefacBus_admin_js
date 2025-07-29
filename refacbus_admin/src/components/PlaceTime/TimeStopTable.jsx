import React from "react";
import {
  Table, TableHead, TableRow, TableCell, TableBody, IconButton, Typography
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import RouteCard from "./RouteCard"; // 경로 카드 공통 컴포넌트

const TimeStopTable = ({
  filteredRoutes,
  openRouteId,
  setOpenRouteId,
  itemKey,           // 'times' or 'stops'
  itemLabel,         // '시간대' or '정류장'
  onAddClick,
  onItemClick,
  setEditText,
  setOpenEditDialog,
  setSelectedInfo,
  cardColor,
  getCountLabel,     // (count) => string
}) => {
  const handleToggle = (routeId) => {
    setOpenRouteId(openRouteId === routeId ? null : routeId);
  };

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell style={{ width: "40%" }}>노선명</TableCell>
          <TableCell style={{ width: "20%" }}>{itemLabel} 수</TableCell>
          <TableCell style={{ width: "20%" }}>{itemLabel} 추가</TableCell>
          <TableCell style={{ width: "20%" }}>{itemLabel} 목록</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {filteredRoutes.map((route) => {
          const items = route[itemKey];
          const itemCount = items ? Object.keys(items).length : 0;

          return (
            <React.Fragment key={route.uid}>
              <TableRow>
                <TableCell>{route.name}</TableCell>
                <TableCell>{getCountLabel(itemCount)}</TableCell>
                <TableCell>
                  <IconButton onClick={() => onAddClick(route)}>
                    <AccessTimeIcon />
                  </IconButton>
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleToggle(route.uid)}>
                    {openRouteId === route.uid ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </TableCell>
              </TableRow>

              {openRouteId === route.uid && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography sx={{ mb: 1 }}>🚌 {itemLabel} 목록</Typography>
                    <RouteCard
                      items={items}
                      onClickItem={(itemId, value) => {
                        onItemClick(route.uid, itemId, value);
                      }}
                      color={cardColor}
                      emptyMessage={`등록된 ${itemLabel}이 없습니다`}
                    />
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default TimeStopTable;
