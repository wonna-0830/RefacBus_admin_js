import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControlLabel, Checkbox, Box, Button, Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';

const ROLE_STRUCTURE = {
  "회원 관리": [],
  "노선/시간 관리": ["노선 추가 및 삭제", "노선 시간대 설정 및 관리", "노선 정류장 설정 및 관리"],
  "예약 현황/통계": ["날짜별 예약자 목록", "예약 통계", "예약 취소 분석"],
  "운행 기록 확인": ["기사별 운행 이력", "기사 계정 관리"],
  "관리자 계정 관리": ["관리자 역할 구분", "일정 등록 및 관리", "공지사항 등록 및 관리"]
};

const RoleDialog = ({ open, onClose, user, onSave, initialPermissions = {} }) => {
  const [permissions, setPermissions] = useState({});

  useEffect(() => {
    setPermissions(initialPermissions);
  }, [initialPermissions]);

  const handleParentToggle = (parent) => {
    const children = ROLE_STRUCTURE[parent];
    const updated = { ...permissions };

    if (children.length === 0) {
      updated[parent] = !permissions[parent]; 
    } else {
      const allChecked = children.every(child => permissions[child]);
      children.forEach(child => {
        updated[child] = !allChecked;
      });
    }

    setPermissions(updated);
  };


  const handleChildToggle = (child) => {
    setPermissions(prev => ({
      ...prev,
      [child]: !prev[child]
    }));
  };

  const isParentChecked = (parent) => {
    const children = ROLE_STRUCTURE[parent];
    if (children.length === 0) {
      return permissions[parent] || false; 
    }
    return children.every(child => permissions[child]);
  };

  const renderSection = (parent, children) => (
    <Box key={parent} sx={{ mb: 2 }}>
      <FormControlLabel
        control={<Checkbox checked={isParentChecked(parent)} onChange={() => handleParentToggle(parent)} />}
        label={<Typography fontWeight="bold">{parent}</Typography>}
      />
      <Box sx={{ pl: 4 }}>
        {children.map(child => (
          <FormControlLabel
            key={child}
            control={<Checkbox checked={permissions[child] || false} onChange={() => handleChildToggle(child)} />}
            label={child}
          />
        ))}
      </Box>
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>관리자 권한 설정 - {user?.name}</DialogTitle>
      <DialogContent>
        {Object.entries(ROLE_STRUCTURE).map(([parent, children]) =>
          renderSection(parent, children)
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button onClick={() => onSave(permissions)} variant="contained" color="primary">
          저장
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RoleDialog;
