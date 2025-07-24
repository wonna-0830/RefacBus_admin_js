import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, FormControlLabel, Checkbox
} from '@mui/material';

const RouteAddDialog = ({
  open,
  routeName,
  isPinned,
  onChangeName,
  onChangePinned,
  onClose,
  onSubmit
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>노선 추가</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          label="노선 이름"
          value={routeName}
          onChange={onChangeName}
          sx={{ mt: 1 }}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={isPinned}
              onChange={onChangePinned}
            />
          }
          label="고정 여부"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button onClick={onSubmit} variant="contained">등록</Button>
      </DialogActions>
    </Dialog>
  );
};

export default RouteAddDialog;
