import { useRef, useState } from 'react';

// @mui
import { alpha } from '@mui/material/styles';
import {
  Box,
  Divider,
  Typography,
  MenuItem,
  Avatar,
  IconButton,
  Backdrop,
  CircularProgress,
  Button,
} from '@mui/material';
import { useRecoilState, useRecoilValue } from 'recoil';
import { Link as RouterLink, useLocation } from 'react-router-dom';
// components
import axios from '../../variable/axios';
import MenuPopover from '../../components/MenuPopover';
import { authentication } from '../../store/authentication';

export default function AccountPopover() {
  const location = useLocation();
  const anchorRef = useRef(null);

  const [open, setOpen] = useState(null);

  const handleOpen = (event) => {
    setOpen(event.currentTarget);
  };

  const handleClose = () => {
    setOpen(null);
  };

  const { user } = useRecoilValue(authentication);
  // eslint-disable-next-line no-unused-vars
  const [auth, setAuth] = useRecoilState(authentication);
  const [backdrop, setBackdrop] = useState(false);
  const handleLogout = async () => {
    setBackdrop(true);
    await axios.post(`auth/logout`).then(() => {
      setAuth({
        ...auth,
        auth: false,
      });
      setBackdrop(false);
      localStorage.removeItem('token');
    });
  };

  return user !== null ? (
    <>
      <IconButton
        ref={anchorRef}
        onClick={handleOpen}
        sx={{
          p: 0,
          ...(open && {
            '&:before': {
              zIndex: 1,
              content: "''",
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              position: 'absolute',
              bgcolor: (theme) => alpha(theme.palette.grey[900], 0.8),
            },
          }),
        }}
      >
        <Avatar src="/static/umkm.png" alt="photoURL" sx={{ border: '1px solid #eee' }} />
      </IconButton>

      <MenuPopover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleClose}
        sx={{
          p: 0,
          mt: 1.5,
          ml: 0.75,
          '& .MuiMenuItem-root': {
            typography: 'body2',
            borderRadius: 0.75,
          },
        }}
      >
        <Box sx={{ my: 1.5, px: 2.5 }}>
          <Typography variant="subtitle2" noWrap>
            {user.name}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {user.email}
          </Typography>
        </Box>

        {/* <Divider sx={{ borderStyle: 'dashed' }} />

        <Stack sx={{ p: 1 }}>
          {MENU_OPTIONS.map((option) => (
            <MenuItem key={option.label} to={option.linkTo} component={RouterLink} onClick={handleClose}>
              {option.label}
            </MenuItem>
          ))}
        </Stack> */}

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuItem onClick={handleLogout} sx={{ m: 1 }}>
          Logout
        </MenuItem>
        <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={backdrop}>
          <CircularProgress color="inherit" />
        </Backdrop>
      </MenuPopover>
    </>
  ) : (
    <Button component={RouterLink} to={`/login?next=${encodeURIComponent(location.pathname)}`}>
      Login
    </Button>
  );
}
