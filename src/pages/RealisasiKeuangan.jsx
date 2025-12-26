import { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Grid,
  Container,
  Typography,
  Stack,
  Button,
  TextField,
  MenuItem,
  Card,
  CardHeader,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Divider,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TableHead,
} from '@mui/material';
import { FileUploadOutlined } from '@mui/icons-material';
import moment from 'moment';
import { useRecoilValue } from 'recoil';
import { authentication } from '../store/authentication';
import axios from '../variable/axios';
import Page from '../components/Page';
import Image from '../components/Image';
import Loading from '../components/Loading';
import Scrollbar from '../components/Scrollbar';
import CustomSnackbar from '../components/CustomSnackbar';
import { TableHeadCustom } from '../components/table';
import { AppWidget, AppCurrentVisits, AppWebsiteVisits } from '../sections/@dashboard/app';
import { BankingCurrentBalance } from '../sections/@dashboard/banking';
import { EcommerceSalesOverview } from '../sections/@dashboard/e-commerce';
import { DateFormat, NumberFormat } from '../components/Format';
import RealizationForm from '../components/RealizationForm';

export default function RealisasiKeuangan() {
  const theme = useTheme();
  const { user } = useRecoilValue(authentication);

  const getTotalRealization = async () => {
    const res = await axios.get(`realization/total`);
    return res.data.data;
  };
  const getTotalRealizationByPeriode = async () => {
    const res = await axios.get(`realization/total_by_periode`);
    return res.data.data;
  };
  const [ministry, setMinistry] = useState([]);
  const getMinistry = async () => {
    await axios.get(`ministry`).then((res) => {
      // console.log(res.data.data);
      setMinistry(res.data.data);
    });
  };

  // State untuk list asdep dengan parent_code 401744
  const [asdepList, setAsdepList] = useState([]);
  const getAsdepList = async () => {
    try {
      const res = await axios.get(`param/asdep_dropdown?parent_code=401744`);
      setAsdepList(res.data.data || []);
    } catch (error) {
      console.error('Error fetching asdep list:', error);
      setAsdepList([]);
    }
  };

  const [data, setData] = useState();
  const [status, setStatus] = useState(false);
  const [filter, setFilter] = useState('eselon2');
  const [complete, setComplete] = useState(false);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    Promise.all([getTotalRealization(), getTotalRealizationByPeriode(), getMinistry(), getAsdepList()]).then((res) => {
      setStatus(false);
      setComplete(true);
      // eslint-disable-next-line arrow-body-style
      const periode = res[1].map((value) => {
        const date = new Date(moment(value.date, 'DD-MM-YYYY').format('YYYY-MM-DD'));
        // Gunakan timestamp untuk ApexCharts datetime axis
        const newdate = moment(value.date, 'DD-MM-YYYY').add(1, 'd').valueOf();
        return {
          ...value,
          date,
          newdate,
        };
      });
      periode.sort((a, b) => a.date - b.date);
      setData({
        realization: res[0],
        periode,
      });
    });
  }, [status]);

  // Helper function untuk aggregate data berdasarkan code (menjumlahkan semua entry dengan code yang sama)
  const getAggregatedData = (code) => {
    const items = realization?.child?.filter((item) => item.code === code) || [];
    if (items.length === 0) return null;

    return items.reduce(
      (acc, item) => ({
        budget: acc.budget + (item.budget || 0),
        aa: acc.aa + (item.aa || 0),
        budget_aa: acc.budget_aa + (item.budget_aa || 0),
        realization_spp: acc.realization_spp + (item.realization_spp || 0),
        sp2d: acc.sp2d + (item.sp2d || 0),
        // Untuk persentase, hitung ulang berdasarkan total
        budget_percent: 0,
        budget_aa_percent: 0,
      }),
      { budget: 0, aa: 0, budget_aa: 0, realization_spp: 0, sp2d: 0, budget_percent: 0, budget_aa_percent: 0 }
    );
  };

  // Helper function untuk merge asdepList dengan realization data
  const getMergedChartData = (field) => {
    if (asdepList.length === 0) return [];

    return asdepList.map((asdep) => {
      const aggregated = getAggregatedData(asdep.value);
      return {
        label: asdep.label,
        value: aggregated ? aggregated[field] || 0 : 0,
      };
    });
  };

  const getMergedTop5Data = (percentField) => {
    if (asdepList.length === 0) return [];

    return asdepList
      .map((asdep) => {
        const aggregated = getAggregatedData(asdep.value);
        // Hitung persentase berdasarkan field yang diminta
        let percent = 0;
        if (aggregated) {
          if (percentField === 'budget_percent' && aggregated.budget > 0) {
            percent = ((aggregated.realization_spp / aggregated.budget) * 100).toFixed(2);
          } else if (percentField === 'budget_aa_percent' && aggregated.budget_aa > 0) {
            percent = ((aggregated.realization_spp / aggregated.budget_aa) * 100).toFixed(2);
          }
        }
        return {
          label: asdep.label,
          amount: aggregated ? aggregated.realization_spp || 0 : 0,
          value: parseFloat(percent),
        };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  };

  // Helper function untuk merge asdepList dengan realization data untuk tabel detail
  const getMergedTableData = () => {
    if (asdepList.length === 0) return [];

    return asdepList.map((asdep) => {
      const aggregated = getAggregatedData(asdep.value);
      // Hitung persentase
      let budgetPercent = 0;
      let budgetAaPercent = 0;
      if (aggregated) {
        if (aggregated.budget > 0) {
          budgetPercent = ((aggregated.realization_spp / aggregated.budget) * 100).toFixed(2);
        }
        if (aggregated.budget_aa > 0) {
          budgetAaPercent = ((aggregated.realization_spp / aggregated.budget_aa) * 100).toFixed(2);
        }
      }
      return {
        code: asdep.value,
        name: asdep.label,
        budget: aggregated ? aggregated.budget : 0,
        aa: aggregated ? aggregated.aa : 0,
        budget_aa: aggregated ? aggregated.budget_aa : 0,
        realization_spp: aggregated ? aggregated.realization_spp : 0,
        budget_percent: budgetPercent,
        budget_aa_percent: budgetAaPercent,
        sp2d: aggregated ? aggregated.sp2d : 0,
      };
    });
  };

  const [realization, setRealization] = useState();
  const getAllRealization = async (params) => {
    await axios.get(`realization/all?filter=${eselonValue(params)}`).then((res) => {
      // console.log(res.data.data);
      const value = res.data.data;
      // eselon2 and eselon2aa both use filter=eselon2, extract child data
      const arr = [];
      value.map((v) => v.child && v.child.length > 0 && v.child.map((row) => arr.push(row)));
      setRealization({
        data: value,
        child: arr,
      });
    });
  };

  const [honor, setHonor] = useState();
  const getHonor = async () => {
    await axios.get(`honor`).then((res) => {
      // console.log(res.data.data);
      setHonor(res.data.data);
    });
  };

  useEffect(() => {
    if (filter !== 'honor') {
      setRealization(undefined);
      getAllRealization(filter);
    } else {
      setHonor(undefined);
      getHonor();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, filter]);

  const importRealization = async (e) => {
    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    await axios
      .post(`realization/import`, formData)
      .then(() => {
        setStatus(true);
        handleSnackbar('Berhasil Import Realisasi.');
      })
      .catch((xhr) => {
        // console.log(xhr.response);
        const err = xhr.response;
        if (err.statusText === 'Unprocessable Content') {
          handleSnackbar('Format file wajib berupa Excel (xlsx).');
        } else {
          handleSnackbar('Gagal Import Realisasi.');
        }
      })
      .finally(() => {
        e.target.value = '';
      });
  };

  const importMinistry = async (e) => {
    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    await axios
      .post(`ministry/import`, formData)
      .then(() => {
        setStatus(true);
        handleSnackbar('Berhasil Import Realisasi K/L.');
      })
      .catch((xhr) => {
        // console.log(xhr.response);
        const err = xhr.response;
        if (err.statusText === 'Unprocessable Content') {
          handleSnackbar('Format file wajib berupa Excel (xlsx).');
        } else {
          handleSnackbar('Gagal Import Realisasi K/L.');
        }
      })
      .finally(() => {
        e.target.value = '';
      });
  };

  const importHonor = async (e) => {
    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    await axios
      .post(`honor/import`, formData)
      .then(() => {
        getHonor();
        handleSnackbar('Berhasil Import Honor Data SDIT.');
      })
      .catch((xhr) => {
        //   console.log(xhr.response);
        const err = xhr.response;
        if (err.statusText === 'Unprocessable Content') {
          handleSnackbar('Format file wajib berupa Excel (xlsx).');
        } else {
          handleSnackbar('Gagal Import Honor Data SDIT.');
        }
      })
      .finally(() => {
        e.target.value = '';
      });
  };

  const handleChange = (e) => {
    setFilter(e.target.value);
  };

  const [dialog, setDialog] = useState(false);
  const handleDialog = () => {
    setDialog(!dialog);
  };

  const [snackbar, setSnackbar] = useState(false);
  const [message, setMessage] = useState(false);
  const handleSnackbar = (params) => {
    setSnackbar(!snackbar);
    if (params.returnValue === undefined) setMessage(params);
  };

  const eselon = (param) => {
    if (param === 'eselon2') {
      param = 'Eselon II';
    } else if (param === 'eselon2aa') {
      param = 'Eselon II (Setelah AA)';
    } else {
      param = 'Honor Data SIDT';
    }
    return param;
  };

  const eselonValue = (param) => {
    if (param === 'eselon2aa') {
      param = 'eselon2';
    }
    return param;
  };

  return (
    <Page title="Realisasi Keuangan" background="bg-new.webp">
      <Container maxWidth="xl">
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Stack>
            <Typography variant="h4" color="#000" gutterBottom>
              Deputi Bidang Kewirausahaan
            </Typography>
            <Typography variant="body2" color="#000" gutterBottom>
              Kementrian UMKM Republik Indonesia
            </Typography>
          </Stack>
          {user !== null && ['superadmin', 'realisasi'].includes(user.role) && (
            <Button variant="contained" onClick={() => setOpen(true)}>
              Tambah Realisasi
            </Button>
          )}
        </Stack>
      </Container>
      {data !== undefined && complete ? (
        <Container maxWidth="xl">
          {/* <Stack
            direction="row"
            alignItems="center"
            justifyContent={data.periode.length > 0 ? 'space-between' : 'flex-end'}
            spacing={1}
            sx={{ mb: 5 }}
          >
            {data.periode.length > 0 && (
              <Typography variant="body2" color="#fff">
                Status Data :{' '}
                {DateFormat(
                  `${data.realization.date.substr(6, 4)}-${data.realization.date.substr(
                    3,
                    2
                  )}-${data.realization.date.substr(0, 2)}`
                )}
              </Typography>
            )}
            {user !== null && ['superadmin', 'realisasi'].includes(user.role) && (
              <>
                <Button for="realization" variant="contained" startIcon={<FileUploadOutlined />} component="label">
                  Import Realisasi
                  <input
                    id="realization"
                    type="file"
                    accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    onChange={importRealization}
                    hidden
                  />
                </Button>
                <Button variant="contained" onClick={() => setOpen(true)}>
                  Tambah Realisasi
                </Button>
              </>
            )}
          </Stack> */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={4}>
              <BankingCurrentBalance
                data={{
                  title: 'Pagu',
                  total: NumberFormat(data.realization.budget, 'Rp'),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <BankingCurrentBalance
                data={{
                  title: 'Automatic Adjustment',
                  total: NumberFormat(data.realization.aa, 'Rp'),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <BankingCurrentBalance
                data={{
                  title: 'Pagu Setelah AA',
                  total: NumberFormat(data.realization.budget_aa, 'Rp'),
                }}
              />
            </Grid>
          </Grid>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <AppWidget
                title="Realisasi SP2D"
                total={data.realization.sp2d || 0}
                icon={'eva:file-text-fill'}
                color="info"
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <AppWidget
                title="% Realisasi SP2D (AA)"
                total={data.realization.sp2d_percent_aa || 0}
                icon={'eva:percent-fill'}
                color="warning"
                chartData={parseFloat(data.realization.sp2d_percent_aa) || 0}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <AppWidget
                title="% Realisasi SP2D (Pagu Awal)"
                total={data.realization.sp2d_percent || 0}
                icon={'eva:percent-fill'}
                color="warning"
                chartData={parseFloat(data.realization.sp2d_percent) || 0}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <AppWidget
                title="Realisasi SPP"
                total={data.realization.realization_spp || 0}
                color="info"
                icon={'eva:file-text-fill'}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <AppWidget
                title="% Realisasi SPP (AA)"
                total={data.realization.realization_spp_percent || 0}
                icon={'eva:percent-fill'}
                color="warning"
                chartData={parseFloat(data.realization.realization_spp_percent) || 0}
              />
            </Grid>
            <Grid item xs={12} md={6} lg={12}>
              <AppWebsiteVisits
                title="Time Series (Pagu, Pagu AA & Realisasi SPP)"
                chartLabels={data.periode.map((value) => value.newdate)}
                chartData={[
                  {
                    name: 'Pagu',
                    type: 'area',
                    fill: 'gradient',
                    data: data.periode.map((value) => value.total_budget),
                  },
                  {
                    name: 'Pagu AA',
                    type: 'area',
                    fill: 'gradient',
                    data: data.periode.map((value) => value.total_budget_aa),
                  },
                  {
                    name: 'Realisasi SPP',
                    type: 'area',
                    fill: 'gradient',
                    data: data.periode.map((value) => value.total_realization_spp),
                  },
                ]}
              />
            </Grid>
            {/* <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardHeader title="Peringkat Persentase Realisasi Kementerian secara Nasional" sx={{ pb: 2 }} />
                <Divider />
                <Stack sx={{ flexGrow: 1, p: 3, justifyContent: 'center', alignItems: 'center' }} spacing={2}>
                  <Stack direction="row" spacing={1.5}>
                    {user !== null && ['superadmin', 'realisasi'].includes(user.role) && (
                      <Button variant="contained" onClick={() => setOpen(true)}>
                        Tambah Realisasi
                      </Button>
                    )}
                    {ministry.length > 0 && (
                      <Button variant="outlined" onClick={handleDialog}>
                        Lihat Semua
                      </Button>
                    )}
                  </Stack>
                </Stack>

                <RealizationForm
                  open={open}
                  onClose={() => setOpen(false)}
                  onSuccess={() => {
                    setStatus(true);
                    handleSnackbar('Data berhasil disimpan');
                  }}
                />
              </Card>
            </Grid> */}
            <Grid item xs={12}>
              <Divider sx={{ borderStyle: 'dashed', mb: 3, mt: 1 }} />
              <Stack direction="row" alignItems="center" spacing={3}>
                <Typography variant="h6" color="#000">
                  Pilih Tampilan :
                </Typography>
                <TextField
                  name="filter"
                  size="small"
                  defaultValue=""
                  value={filter}
                  onChange={handleChange}
                  select
                  sx={{ background: '#fff', borderRadius: 1 }}
                >
                  <MenuItem value="" disabled selected>
                    Pilih Tampilan
                  </MenuItem>
                  <MenuItem value="eselon2">Eselon II</MenuItem>
                  <MenuItem value="eselon2aa">Eselon II (Setelah AA)</MenuItem>
                  {/* <MenuItem value="honor">Honor Data SIDT</MenuItem> */}
                </TextField>
              </Stack>
            </Grid>
          </Grid>
          {/* Komposisi dan Top 5 */}
          {filter !== 'honor' && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6} lg={5}>
                {filter === 'eselon2' ? (
                  <AppCurrentVisits
                    title={`Komposisi Pagu ${eselon(filter)}`}
                    chartData={getMergedChartData('budget')}
                  />
                ) : (
                  <AppCurrentVisits
                    title={`Komposisi Pagu ${eselon(filter)}`}
                    chartData={getMergedChartData('budget_aa')}
                  />
                )}
              </Grid>
              <Grid item xs>
                {filter === 'eselon2' ? (
                  <EcommerceSalesOverview
                    title={`Top 5 Persentase Realisasi ${eselon(filter)}`}
                    data={getMergedTop5Data('budget_percent')}
                  />
                ) : (
                  <EcommerceSalesOverview
                    title={`Top 5 Persentase Realisasi ${eselon(filter)}`}
                    data={getMergedTop5Data('budget_aa_percent')}
                  />
                )}
              </Grid>
              {/* Detail Eselon II */}
              <Grid item xs={12}>
                <Card>
                  <CardHeader title={`Detail  ${eselon(filter)}`} sx={{ mb: 3 }} />
                  <Scrollbar>
                    <TableContainer sx={{ minWidth: 720, maxHeight: 700 }}>
                      <Table stickyHeader>
                        <TableHeadCustom
                          headLabel={[
                            { label: 'No.', align: 'center' },
                            { label: 'Unit Kerja' },
                            { label: 'Pagu', align: 'right' },
                            { label: 'Automatic Adjustment', align: 'right' },
                            { label: 'Pagu Setelah AA', align: 'right' },
                            { label: 'Realisasi SPP', align: 'right' },
                            { label: '%', align: 'right' },
                            { label: 'SP2D', align: 'right' },
                          ]}
                        />
                        <TableBody>
                          {getMergedTableData()
                            .sort((a, b) => a.code.localeCompare(b.code))
                            .map((value, index) => (
                              <TableRow
                                key={index}
                                sx={{
                                  bgcolor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
                                }}
                              >
                                <TableCell align="center">{index + 1}.</TableCell>
                                <TableCell>{value.name}</TableCell>
                                <TableCell align="right">{NumberFormat(value.budget, 'Rp')}</TableCell>
                                <TableCell align="right">{NumberFormat(value.aa, 'Rp')}</TableCell>
                                <TableCell align="right">{NumberFormat(value.budget_aa, 'Rp')}</TableCell>
                                <TableCell align="right">{NumberFormat(value.realization_spp, 'Rp')}</TableCell>
                                <TableCell align="right">
                                  {filter === 'eselon2' ? value.budget_percent : value.budget_aa_percent}%
                                </TableCell>
                                <TableCell align="right">{NumberFormat(value.sp2d, 'Rp')}</TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Scrollbar>
                </Card>
              </Grid>
            </Grid>
          )}
          {filter === 'honor' && (
            <>
              {honor !== undefined ? (
                <>
                  <Typography variant="h4" align="center" color="primary.main" gutterBottom>
                    Honor Enumerator Data SDIT
                  </Typography>
                  {honor.data.length > 0 && (
                    <Typography variant="body2" align="center" color="primary.main">
                      Status Data :{' '}
                      {DateFormat(
                        `${honor.data[0].date.substr(6, 4)}-${honor.data[0].date.substr(
                          3,
                          2
                        )}-${honor.data[0].date.substr(0, 2)}`
                      )}
                    </Typography>
                  )}
                  <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={1} sx={{ my: 4 }}>
                    {user !== null && ['superadmin', 'realisasi'].includes(user.role) && (
                      <Button for="honor" variant="contained" startIcon={<FileUploadOutlined />} component="label">
                        Import Honor Data SDIT
                        <input
                          id="honor"
                          type="file"
                          accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                          onChange={importHonor}
                          hidden
                        />
                      </Button>
                    )}
                  </Stack>
                  <Card>
                    <Scrollbar>
                      <TableContainer sx={{ minWidth: 720, maxHeight: 700 }}>
                        <Table stickyHeader>
                          <TableHead>
                            <TableRow>
                              <TableCell rowSpan={2}>No.</TableCell>
                              <TableCell rowSpan={2}>Provinsi</TableCell>
                              <TableCell rowSpan={2}>Kode Satker</TableCell>
                              <TableCell colSpan={2} align="center">
                                Pagu
                              </TableCell>
                              <TableCell rowSpan={2} align="center">
                                Data Diinput
                              </TableCell>
                              <TableCell colSpan={3} align="center">
                                Realisasi Insentif/Honor Enumerator
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell align="center" style={{ top: 57 }}>
                                Nilai
                              </TableCell>
                              <TableCell align="center" style={{ top: 57 }}>
                                Target Data
                              </TableCell>
                              <TableCell align="center" style={{ top: 57 }}>
                                Nilai
                              </TableCell>
                              <TableCell align="center" style={{ top: 57 }}>
                                Data Dibayar
                              </TableCell>
                              <TableCell align="center" style={{ top: 57 }}>
                                Realisasi
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {honor.data.map((value, index) => (
                              <TableRow key={index}>
                                <TableCell align="center">{index + 1}.</TableCell>
                                <TableCell>{value.province}</TableCell>
                                <TableCell>{value.satker_code}</TableCell>
                                <TableCell align="right">{NumberFormat(value.value, 'Rp')}</TableCell>
                                <TableCell align="right">{NumberFormat(value.data_target)}</TableCell>
                                <TableCell align="right">{NumberFormat(value.data_input)}</TableCell>
                                <TableCell align="right">{NumberFormat(value.realization_value, 'Rp')}</TableCell>
                                <TableCell align="right">{NumberFormat(value.paid)}</TableCell>
                                <TableCell align="right">{value.realization_percent}%</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                          <TableHead>
                            <TableRow>
                              <TableCell align="center" colSpan={3}>
                                Total
                              </TableCell>
                              <TableCell align="right">{NumberFormat(honor.total.value, 'Rp')}</TableCell>
                              <TableCell align="right">{NumberFormat(honor.total.data_target)}</TableCell>
                              <TableCell align="right">{NumberFormat(honor.total.data_input)}</TableCell>
                              <TableCell align="right">{NumberFormat(honor.total.realization_value, 'Rp')}</TableCell>
                              <TableCell align="right">{NumberFormat(honor.total.paid)}</TableCell>
                              <TableCell align="right">{honor.total.realization_percent}%</TableCell>
                            </TableRow>
                          </TableHead>
                        </Table>
                      </TableContainer>
                    </Scrollbar>
                  </Card>
                </>
              ) : (
                <Loading />
              )}
            </>
          )}
        </Container>
      ) : (
        <Loading />
      )}
      <CustomSnackbar message={message} snackbar={snackbar} handleSnackbar={handleSnackbar} />
      <Dialog open={dialog} onClose={handleDialog} transitionDuration={0} maxWidth="md" fullWidth>
        <DialogTitle>Peringkat Persentase Realisasi Kementerian secara Nasional</DialogTitle>
        <DialogContent dividers sx={{ px: 0 }}>
          {ministry.length > 0 && (
            <Scrollbar>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>No.</TableCell>
                      <TableCell colSpan={2}>Nama Kementerian</TableCell>
                      <TableCell align="right">Pagu</TableCell>
                      <TableCell align="right">Realisasi</TableCell>
                      <TableCell align="right">%</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ministry
                      .sort((a, b) => (a.percent < b.percent ? 1 : -1))
                      .map((data, index) => (
                        <TableRow
                          key={index}
                          sx={{
                            bgcolor:
                              data.name === 'KEMENTERIAN KOPERASI DAN PENGUSAHA KECIL DAN MENENGAH'
                                ? '#96AE3F'
                                : //   ? alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity)
                                  '',
                          }}
                        >
                          <TableCell align="center">{index + 1}.</TableCell>
                          <TableCell>
                            {data.name === 'KEMENTERIAN KOPERASI DAN PENGUSAHA KECIL DAN MENENGAH' ? (
                              <Image
                                disabledEffect
                                alt={data.name}
                                src={data.photo_url}
                                sx={{ width: 31, background: '#fff', borderRadius: 10, p: 0.5 }}
                              />
                            ) : (
                              <Image disabledEffect alt={data.name} src={data.photo_url} sx={{ width: 30 }} />
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="subtitle2">{data.name}</Typography>
                          </TableCell>
                          <TableCell align="right">{NumberFormat(data.budget, 'Rp')}</TableCell>
                          <TableCell align="right">{NumberFormat(data.realization, 'Rp')}</TableCell>
                          <TableCell align="right">{data.percent}%</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Scrollbar>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialog}>Tutup</Button>
          {user !== null && ['superadmin', 'realisasi'].includes(user.role) && (
            <Button
              for="ministry"
              variant="contained"
              startIcon={<FileUploadOutlined />}
              component="label"
              sx={{ ml: 1 }}
            >
              Import
              <input
                id="ministry"
                type="file"
                accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={importMinistry}
                hidden
              />
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <RealizationForm
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={() => {
          setStatus(true);
          handleSnackbar('Data berhasil disimpan');
        }}
      />
    </Page>
  );
}
