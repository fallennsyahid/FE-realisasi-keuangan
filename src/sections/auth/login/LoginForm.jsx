import { useState } from 'react';
// material
import { Box, Stack, TextField, IconButton, InputAdornment, Collapse, Alert } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useRecoilState } from 'recoil';
// component
import Iconify from '../../../components/Iconify';
import axios from '../../../variable/axios';
import { authentication } from '../../../store/authentication';

// ----------------------------------------------------------------------

export default function LoginForm() {
  // eslint-disable-next-line no-unused-vars
  const [auth, setAuth] = useRecoilState(authentication);
  const [data, setData] = useState({
    email: '',
    password: '',
  });

  const [alert, setAlert] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert(false);
    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('password', data.password);
    await axios
      .post(`auth/login`, formData)
      .then((res) => {
        // console.log(res.data.data);
        const value = res.data.data;
        localStorage.setItem('token', value.access_token);
        setAuth({
          auth: true,
          user: value.user,
        });
      })
      .catch((xhr) => {
        // console.log(xhr.response);
        const err = xhr.response.data;
        if (err.message) {
          setAlert(true);
          setLoading(false);
        } else if (err.data.message) {
          setAlert(true);
          setLoading(false);
        }
      });
  };

  const handleChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  const [showPassword, setShowPassword] = useState(false);
  const handleShowPassword = () => {
    setShowPassword((show) => !show);
  };

  return (
    <Box component="form" autoComplete="off" noValidate onSubmit={handleSubmit}>
      <Collapse in={alert}>
        <Alert severity="error">Email atau Password salah.</Alert>
      </Collapse>
      <Stack spacing={3} sx={{ my: 3 }}>
        <TextField
          fullWidth
          autoComplete="username"
          name="email"
          type="email"
          label="Email"
          value={data.email}
          onChange={handleChange}
          autoFocus
        />
        <TextField
          fullWidth
          autoComplete="current-password"
          type={showPassword ? 'text' : 'password'}
          label="Password"
          name="password"
          value={data.password}
          onChange={handleChange}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleShowPassword} edge="end">
                  <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Stack>
      <LoadingButton fullWidth size="large" type="submit" variant="contained" loading={loading}>
        Login
      </LoadingButton>
    </Box>
  );
}
