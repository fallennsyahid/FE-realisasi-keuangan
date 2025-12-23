/* eslint-disable array-callback-return */
/* eslint-disable no-unused-expressions */
import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormControl,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { Add, ClearRounded } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import axios from 'axios';
import { useRecoilValue } from 'recoil';
import { useNavigate } from 'react-router-dom';
import { authentication } from '../store/authentication';
import recap from '../_mock/recap';
import Page from '../components/Page';
import Loading from '../components/Loading';
import { IntegerFormat, NumberFormat } from '../components/Format';

export default function RecapSDMAparatur() {
  const navigate = useNavigate();
  const { user } = useRecoilValue(authentication);

  const getEmployeeRecap = async () => {
    const res = await axios.get(`employee_recap`);
    return res.data.data;
  };

  const [data, setData] = useState();
  useEffect(() => {
    if (user !== null) {
      if (['superadmin', 'sdm'].includes(user.role)) {
        Promise.all([getEmployeeRecap()]).then((res) => {
          if (res[0].length > 0) {
            const value = res[0].map((row) => ({
              ...row,
              total: NumberFormat(row.total),
            }));
            setData(value);
          } else {
            setData(recap);
          }
        });
      } else {
        navigate('/sdm-aparatur');
      }
    } else {
      navigate('/');
    }
  }, [navigate, user, user?.role]);

  const handleChange = (name, value, index) => {
    const newState = data.map((row, key) =>
      index === key
        ? {
            ...row,
            [name]: name === 'total' ? NumberFormat(value) : value,
          }
        : row
    );
    setData(newState);
    setError({
      ...error,
      [`recap.${index}.${name}`]: undefined,
    });
  };
  const addData = (type) => {
    const newState = data.concat({
      name: '',
      total: '',
      type,
    });
    setData(newState);
  };
  const deleteData = (index) => {
    const newState = data.filter((row, key) => key !== index);
    setData(newState);
    //  setError('');
  };

  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const formData = new FormData();
    data.map((value, index) => {
      value.id !== undefined && formData.append(`recap[${index}][id]`, value.id);
      formData.append(`recap[${index}][name]`, value.name);
      formData.append(`recap[${index}][total]`, IntegerFormat(value.total));
      formData.append(`recap[${index}][type]`, value.type);
    });
    //  console.clear();
    //  console.log(...formData);
    axios
      .post(`employee_recap/upsert`, formData)
      .then(() => {
        navigate('/sdm-aparatur');
      })
      .catch((xhr) => {
        // console.log(xhr.response);
        const err = xhr.response.data.errors;
        err && setError(err);
        setLoading(false);
      });
  };

  return (
    <Page title="Input Rekap Pegawai">
      <Container maxWidth="xl" component="form" noValidate onSubmit={handleSubmit}>
        <Typography variant="h4" gutterBottom mb={3}>
          Input Rekap Pegawai
        </Typography>
        {data !== undefined ? (
          <>
            <Stack spacing={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Pendidikan
                  </Typography>
                  {data.map(
                    (value, index) =>
                      value.type === 'education' && (
                        <FormControl margin="normal" fullWidth key={index}>
                          <Stack direction="row" spacing={3}>
                            <TextField
                              name="name"
                              placeholder="Label"
                              value={value.name}
                              onChange={(e) => handleChange(e.target.name, e.target.value, index)}
                              error={!!error[`recap.${index}.name`]}
                              helperText={error[`recap.${index}.name`] !== undefined && 'Masukkan label.'}
                              fullWidth
                            />
                            <TextField
                              name="total"
                              placeholder="Total"
                              value={value.total}
                              onChange={(e) => handleChange(e.target.name, e.target.value, index)}
                              error={!!error[`recap.${index}.total`]}
                              helperText={error[`recap.${index}.total`] !== undefined && 'Masukkan total.'}
                              autoComplete="off"
                            />
                          </Stack>
                        </FormControl>
                      )
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Golongan
                  </Typography>
                  {data.map(
                    (value, index) =>
                      value.type === 'group' && (
                        <FormControl margin="normal" fullWidth key={index}>
                          <Stack direction="row" spacing={3}>
                            <TextField
                              name="name"
                              placeholder="Label"
                              value={value.name}
                              onChange={(e) => handleChange(e.target.name, e.target.value, index)}
                              error={!!error[`recap.${index}.name`]}
                              helperText={error[`recap.${index}.name`] !== undefined && 'Masukkan label.'}
                              fullWidth
                            />
                            <TextField
                              name="total"
                              placeholder="Total"
                              value={value.total}
                              onChange={(e) => handleChange(e.target.name, e.target.value, index)}
                              error={!!error[`recap.${index}.total`]}
                              helperText={error[`recap.${index}.total`] !== undefined && 'Masukkan total.'}
                              autoComplete="off"
                            />
                          </Stack>
                        </FormControl>
                      )
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Jenis Kelamin
                  </Typography>
                  {data.map(
                    (value, index) =>
                      value.type === 'gender' && (
                        <FormControl margin="normal" fullWidth key={index}>
                          <Stack direction="row" spacing={3}>
                            <TextField
                              name="name"
                              placeholder="Label"
                              value={value.name}
                              onChange={(e) => handleChange(e.target.name, e.target.value, index)}
                              error={!!error[`recap.${index}.name`]}
                              helperText={error[`recap.${index}.name`] !== undefined && 'Masukkan label.'}
                              fullWidth
                            />
                            <TextField
                              name="total"
                              placeholder="Total"
                              value={value.total}
                              onChange={(e) => handleChange(e.target.name, e.target.value, index)}
                              error={!!error[`recap.${index}.total`]}
                              helperText={error[`recap.${index}.total`] !== undefined && 'Masukkan total.'}
                              autoComplete="off"
                            />
                          </Stack>
                        </FormControl>
                      )
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Status Pegawai
                  </Typography>
                  {data.map(
                    (value, index) =>
                      value.type === 'employee_status' && (
                        <FormControl margin="normal" fullWidth key={index}>
                          <Stack direction="row" spacing={3}>
                            <TextField
                              name="name"
                              placeholder="Label"
                              value={value.name}
                              onChange={(e) => handleChange(e.target.name, e.target.value, index)}
                              error={!!error[`recap.${index}.name`]}
                              helperText={error[`recap.${index}.name`] !== undefined && 'Masukkan label.'}
                              fullWidth
                            />
                            <TextField
                              name="total"
                              placeholder="Total"
                              value={value.total}
                              onChange={(e) => handleChange(e.target.name, e.target.value, index)}
                              error={!!error[`recap.${index}.total`]}
                              helperText={error[`recap.${index}.total`] !== undefined && 'Masukkan total.'}
                              autoComplete="off"
                            />
                          </Stack>
                        </FormControl>
                      )
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Penempatan PNS
                  </Typography>
                  {data.map(
                    (value, index) =>
                      value.type === 'placement' && (
                        <FormControl margin="normal" fullWidth key={index}>
                          <Stack direction="row" spacing={3}>
                            <TextField
                              name="name"
                              placeholder="Label"
                              value={value.name}
                              onChange={(e) => handleChange(e.target.name, e.target.value, index)}
                              error={!!error[`recap.${index}.name`]}
                              helperText={error[`recap.${index}.name`] !== undefined && 'Masukkan label.'}
                              fullWidth
                            />
                            <TextField
                              name="total"
                              placeholder="Total"
                              value={value.total}
                              onChange={(e) => handleChange(e.target.name, e.target.value, index)}
                              error={!!error[`recap.${index}.total`]}
                              helperText={error[`recap.${index}.total`] !== undefined && 'Masukkan total.'}
                              autoComplete="off"
                            />
                          </Stack>
                        </FormControl>
                      )
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Tugas Belajar
                  </Typography>
                  {data.map(
                    (value, index) =>
                      value.type === 'study' && (
                        <FormControl margin="normal" fullWidth key={index}>
                          <Stack direction="row" spacing={3} alignItems="center">
                            <TextField
                              name="name"
                              placeholder="Label"
                              value={value.name}
                              onChange={(e) => handleChange(e.target.name, e.target.value, index)}
                              error={!!error[`recap.${index}.name`]}
                              helperText={error[`recap.${index}.name`] !== undefined && 'Masukkan label.'}
                              fullWidth
                            />
                            <TextField
                              name="total"
                              placeholder="Total"
                              value={value.total}
                              onChange={(e) => handleChange(e.target.name, e.target.value, index)}
                              error={!!error[`recap.${index}.total`]}
                              helperText={error[`recap.${index}.total`] !== undefined && 'Masukkan total.'}
                              autoComplete="off"
                            />
                            <Box>
                              <Tooltip title="Hapus">
                                <IconButton onClick={() => deleteData(index)}>
                                  <ClearRounded />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Stack>
                        </FormControl>
                      )
                  )}
                  <FormControl margin="normal" fullWidth>
                    <Button variant="outlined" startIcon={<Add />} onClick={() => addData('study')}>
                      Tambah
                    </Button>
                  </FormControl>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Kelompok Umur
                  </Typography>
                  {data.map(
                    (value, index) =>
                      value.type === 'age' && (
                        <FormControl margin="normal" fullWidth key={index}>
                          <Stack direction="row" spacing={3}>
                            <TextField
                              name="name"
                              placeholder="Label"
                              value={value.name}
                              onChange={(e) => handleChange(e.target.name, e.target.value, index)}
                              error={!!error[`recap.${index}.name`]}
                              helperText={error[`recap.${index}.name`] !== undefined && 'Masukkan label.'}
                              fullWidth
                            />
                            <TextField
                              name="total"
                              placeholder="Total"
                              value={value.total}
                              onChange={(e) => handleChange(e.target.name, e.target.value, index)}
                              error={!!error[`recap.${index}.total`]}
                              helperText={error[`recap.${index}.total`] !== undefined && 'Masukkan total.'}
                              autoComplete="off"
                            />
                          </Stack>
                        </FormControl>
                      )
                  )}
                </CardContent>
              </Card>
            </Stack>
            <FormControl margin="normal">
              <LoadingButton type="submit" variant="contained" loading={loading}>
                Submit
              </LoadingButton>
            </FormControl>
          </>
        ) : (
          <Loading />
        )}
      </Container>
    </Page>
  );
}
