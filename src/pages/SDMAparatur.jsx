import React, { useEffect, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Grid,
  Stack,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  FormControl,
  TextField,
  DialogActions,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  PeopleAlt,
  ManRounded,
  ElderlyRounded,
  WomanRounded,
  AddRounded,
  MoreVert,
  EditRounded,
  DeleteRounded,
} from '@mui/icons-material';
import axios from 'axios';
// import moment from 'moment';
import { LoadingButton } from '@mui/lab';
import { Link as RouterLink } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { authentication } from '../store/authentication';
import Page from '../components/Page';
import { BarChart, DonutChart, HorizontalBarChart, LineChart, PieChart } from '../components/chart';
import { DateFormat, NumberFormat } from '../components/Format';
import Loading from '../components/Loading';
import Scrollbar from '../components/Scrollbar';

const CardIcons = (props) => {
  const { bgcolor, icon, total, name, periode } = { ...props };
  //   const now = moment(new Date()).format('yyyy-MM-DD HH:mm:ss');
  //   const from = DateFormat2(now).substring(3);
  //   const to = DateFormat2(now).substring(3);
  return (
    <Card sx={{ background: 'rgba(255,255,255,0.5)', height: '100%' }}>
      <CardContent>
        <Stack spacing={1} alignItems="center">
          <Avatar sx={{ bgcolor }}>{icon}</Avatar>
          <Typography variant="h5">{total}</Typography>
          <Typography variant="body1">{name}</Typography>
          {periode !== undefined && <Typography variant="caption">(Periode: Jan 2023 s.d Jun 2023)</Typography>}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default function SDMAparatur() {
  const { user } = useRecoilValue(authentication);
  const color = {
    purple: '#673ab7',
    blue: '#2979ff',
    green: '#43a047',
    red: '#d50000',
  };

  const getEmployeeRecap = async () => {
    const res = await axios.get(`employee_recap`);
    return res.data.data;
  };
  const getEmployeeRetire = async () => {
    const res = await axios.get(`employee_retire`);
    return res.data.data;
  };
  const getRecapDate = async () => {
    const res = await axios.get(`recap_date`);
    return res.data.data;
  };

  const [data, setData] = useState();
  useEffect(() => {
    window.document.body.style.zoom = 1.3;
    Promise.all([getEmployeeRecap(), getEmployeeRetire(), getRecapDate()]).then((res) => {
      if (res[0].length > 0) {
        const value = res[0];
        let index = 1;
        const employee = [];
        res[1].map((row) =>
          // eslint-disable-next-line array-callback-return
          row.employee.map((val) => {
            employee.push({ ...val, date: row.date, index });
            index += 1;
          })
        );
        const retire = res[1].map((row) => ({ ...row, employee: employee.filter((v) => v.date === row.date) }));
        setData({
          education: value.filter((row) => row.type === 'education'),
          group: value.filter((row) => row.type === 'group'),
          gender: value.filter((row) => row.type === 'gender'),
          employee_status: value.filter((row) => row.type === 'employee_status'),
          placement: value.filter((row) => row.type === 'placement'),
          study: value.filter((row) => row.type === 'study'),
          age: value.filter((row) => row.type === 'age'),
          retire,
          employee,
          date: res[2],
        });
      } else {
        setData({
          education: [],
          group: [],
          gender: [
            {
              name: 'Laki-Laki',
              total: 0,
            },
            {
              name: 'Perempuan',
              total: 0,
            },
          ],
          employee_status: [],
          placement: [],
          study: [],
          age: [],
          retire: [],
          employee: [],
          date: null,
        });
      }
    });
  }, []);

  const [staging, setStaging] = useState({
    id: undefined,
    name: '',
    unit: '',
    date: '',
  });
  const handleStaging = () => {
    setStaging({
      id: undefined,
      name: '',
      unit: '',
      date: '',
    });
  };

  const handleChange = (e) => {
    setStaging({
      ...staging,
      [e.target.name]: e.target.value,
    });
    setError({
      ...error,
      [e.target.name]: undefined,
    });
  };

  const [dialog, setDialog] = useState(false);
  const handleDialog = () => {
    setDialog(!dialog);
    if (dialog === true) handleStaging();
  };

  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const formData = new FormData();
    if (staging.id !== undefined) {
      formData.append('id', staging.id);
      formData.append('_method', 'patch');
    }
    formData.append('name', staging.name);
    formData.append('unit', staging.unit);
    formData.append('date', staging.date);
    //  console.clear();
    //  console.log(...formData);
    axios
      .post(staging.id !== undefined ? `employee_retire/${staging.id}` : `employee_retire`, formData)
      .then(() => {
        handleRetire();
        handleDialog();
      })
      .catch((xhr) => {
        //   console.log(xhr.response);
        const err = xhr.response.data.errors;
        if (err) setError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const menu = Boolean(anchorEl);
  const handleMenu = (event, staging) => {
    if (menu === false) {
      setAnchorEl(event.currentTarget);
      setStaging(staging);
      setError('');
    } else {
      setAnchorEl(null);
    }
  };

  const [dialogDelete, setDialogDelete] = useState(false);
  const handleDialogDelete = () => {
    setDialogDelete(!dialogDelete);
  };

  const handleDelete = async () => {
    axios
      .delete(`employee_retire/${staging.id}`)
      .then(() => {
        handleRetire();
        handleStaging();
        handleDialogDelete();
      })
      .catch((xhr) => {
        //   console.log(xhr.response);
        const err = xhr.response.data.errors;
        if (err) setError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleRetire = async () => {
    Promise.all([getEmployeeRetire()]).then((res) => {
      let index = 1;
      const employee = [];
      res[0].map((row) =>
        // eslint-disable-next-line array-callback-return
        row.employee.map((val) => {
          employee.push({ ...val, date: row.date, index });
          index += 1;
        })
      );
      const retire = res[0].map((row) => ({ ...row, employee: employee.filter((v) => v.date === row.date) }));
      setData({
        ...data,
        employee,
        retire,
      });
    });
  };

  return (
    <Page title="SDM Aparatur" background="building.jpg">
      <Container maxWidth="xl">
        <Typography variant="h4" color="primary.main" gutterBottom>
          SDM Aparatur
        </Typography>
        <Typography variant="body2" fontWeight="bold" gutterBottom>
          Kementerian Koperasi dan UKM Republik Indonesia
        </Typography>
        {data !== undefined ? (
          <>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent={user !== null ? 'space-between' : 'flex-start'}
              spacing={1}
              sx={{ mb: 5 }}
            >
              {data.date !== null ? (
                <Typography variant="body2" fontWeight="bold">
                  Status Data : {DateFormat(data.date.substr(0, 10))} {data.date.substr(11)}
                </Typography>
              ) : (
                <Box />
              )}
              {user !== null && ['superadmin', 'sdm'].includes(user.role) && (
                <Button variant="contained" startIcon={<AddRounded />} component={RouterLink} to="./rekap">
                  Input Rekap Pegawai
                </Button>
              )}
            </Stack>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Grid container spacing={3}>
                  <Grid item xs={6}>
                    <CardIcons
                      bgcolor={color.purple}
                      icon={<PeopleAlt />}
                      total={NumberFormat(data.gender[0].total + data.gender[1].total)}
                      name="Total Pegawai"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <CardIcons
                      bgcolor={color.blue}
                      icon={<ManRounded />}
                      total={NumberFormat(data.gender[0].total)}
                      name={data.gender[0].name}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <CardIcons
                      bgcolor={color.green}
                      icon={<ElderlyRounded />}
                      total={data.employee.length}
                      name="Total Pensiun"
                      periode
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <CardIcons
                      bgcolor={color.red}
                      icon={<WomanRounded />}
                      total={NumberFormat(data.gender[1].total)}
                      name={data.gender[1].name}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} md={6}>
                <BarChart
                  title="Berdasarkan Pendidikan"
                  chartColors={[color.blue]}
                  chartData={data.education.map((value) => ({
                    label: value.name,
                    value: value.total,
                  }))}
                  sx={{ background: 'rgba(255,255,255,0.5)' }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <BarChart
                  title="Berdasarkan Golongan"
                  chartColors={[color.blue]}
                  chartData={data.group.map((value) => ({
                    label: value.name,
                    value: value.total,
                  }))}
                  sx={{ background: 'rgba(255,255,255,0.5)' }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DonutChart
                  title="Berdasarkan Jenis Kelamin"
                  chartColors={[color.blue, color.red]}
                  chartData={data.gender.map((value) => ({
                    label: value.name,
                    value: value.total,
                  }))}
                  sx={{ background: 'rgba(255,255,255,0.5)' }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <PieChart
                  title="Berdasarkan Status Pegawai"
                  chartData={data.employee_status.map((value) => ({
                    label: value.name,
                    value: value.total,
                  }))}
                  sx={{ background: 'rgba(255,255,255,0.5)' }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <PieChart
                  title="Berdasarkan Jumlah Penempatan PNS"
                  chartData={data.placement.map((value) => ({
                    label: value.name,
                    value: value.total,
                  }))}
                  sx={{ background: 'rgba(255,255,255,0.5)' }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <LineChart
                  title="Berdasarkan Tugas Belajar"
                  chartLabels={data.study.map((value) => value.name)}
                  chartColors={[color.blue]}
                  chartData={[
                    {
                      name: 'Total',
                      type: 'area',
                      fill: 'gradient',
                      data: data.study.map((value) => value.total),
                    },
                  ]}
                  sx={{ background: 'rgba(255,255,255,0.5)' }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <HorizontalBarChart
                  title="Berdasarkan Kelompok Umur"
                  chartColors={[color.blue]}
                  chartData={data.age.map((value) => ({
                    label: value.name,
                    value: value.total,
                  }))}
                  sx={{ background: 'rgba(255,255,255,0.5)' }}
                />
              </Grid>
              <Grid item xs={12}>
                <Card sx={{ background: 'rgba(255,255,255,0.5)' }}>
                  <CardHeader
                    title="Rekap Pensiun PNS per Bulan"
                    action={
                      user !== null &&
                      ['superadmin', 'sdm'].includes(user.role) && (
                        <Button variant="contained" startIcon={<AddRounded />} onClick={handleDialog}>
                          Input Rekap Pensiun
                        </Button>
                      )
                    }
                    sx={{ mb: 3 }}
                  />
                  <Scrollbar>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell align="center">No.</TableCell>
                            <TableCell>Nama</TableCell>
                            <TableCell>Unit Kerja</TableCell>
                            <TableCell />
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {data.retire.map((value, index) => (
                            <React.Fragment key={index}>
                              <TableRow>
                                <TableCell align="center" colSpan={4}>
                                  <Typography variant="subtitle2">{DateFormat(value.date)}</Typography>
                                </TableCell>
                              </TableRow>
                              {value.employee.map((row) => (
                                <TableRow key={row.index}>
                                  <TableCell align="center">{row.index}.</TableCell>
                                  <TableCell>{row.name}</TableCell>
                                  <TableCell>{row.unit}</TableCell>
                                  <TableCell align="right">
                                    {user !== null && ['superadmin', 'sdm'].includes(user.role) && (
                                      <IconButton onClick={(e) => handleMenu(e, row)}>
                                        <MoreVert />
                                      </IconButton>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </React.Fragment>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Scrollbar>
                </Card>
              </Grid>
            </Grid>
          </>
        ) : (
          <Loading />
        )}
      </Container>
      <Menu
        anchorEl={anchorEl}
        open={menu}
        onClose={handleMenu}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem
          onClick={() => {
            handleDialog();
            handleMenu();
          }}
        >
          <ListItemIcon>
            <EditRounded fontSize="small" />
          </ListItemIcon>
          <ListItemText>Ubah</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleDialogDelete();
            handleMenu();
          }}
        >
          <ListItemIcon>
            <DeleteRounded fontSize="small" />
          </ListItemIcon>
          <ListItemText>Hapus</ListItemText>
        </MenuItem>
      </Menu>
      <Dialog open={dialog} onClose={handleDialog} fullWidth component="form" onSubmit={handleSubmit}>
        <DialogTitle>{staging.id === undefined ? 'Input' : 'Ubah'} Rekap Pensiun</DialogTitle>
        <DialogContent>
          <FormControl margin="normal" fullWidth>
            <TextField
              label="Nama Lengkap"
              name="name"
              value={staging.name}
              onChange={handleChange}
              error={!!error.name}
              helperText={error.name !== undefined && 'Masukkan nama lengkap.'}
              autoFocus={staging?.id === undefined}
            />
          </FormControl>
          <FormControl margin="normal" fullWidth>
            <TextField
              label="Unit"
              name="unit"
              value={staging.unit}
              onChange={handleChange}
              error={!!error.unit}
              helperText={error.unit !== undefined && 'Masukkan unit.'}
            />
          </FormControl>
          <FormControl margin="normal" fullWidth>
            <TextField
              label="Tanggal"
              name="date"
              type="date"
              value={staging.date}
              onChange={handleChange}
              error={!!error.date}
              InputLabelProps={{
                shrink: true,
              }}
              helperText={error.date !== undefined && 'Pilih tanggal.'}
            />
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button variant="outlined" onClick={handleDialog}>
            Batal
          </Button>
          <LoadingButton variant="contained" type="submit" loading={loading}>
            Submit
          </LoadingButton>
        </DialogActions>
      </Dialog>
      <Dialog open={dialogDelete} onClose={handleDialogDelete} fullWidth>
        <DialogTitle>Hapus Rekap Pensiun</DialogTitle>
        <DialogContent>
          Anda yakin ingin menghapus <b>{staging.name}</b>?
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button variant="outlined" onClick={handleDialogDelete}>
            Batal
          </Button>
          <LoadingButton variant="contained" type="submit" loading={loading} onClick={handleDelete}>
            Hapus
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Page>
  );
}
