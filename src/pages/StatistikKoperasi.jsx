import { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Container,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material';
import Page from '../components/Page';
import axios from '../variable/axios';
import Loading from '../components/Loading';
import Scrollbar from '../components/Scrollbar';
import { DateFormat, NumberFormat } from '../components/Format';
import { AppCurrentDownload, LineChart, PieChart } from '../sections/@dashboard/app';
import { DoubleBarChart } from '../components/chart';

export default function StatistikKoperasi() {
  const theme = useTheme();

  const getCoperativeSummary = async () => {
    const res = await axios.get(`depkop/cooperative_summary`);
    return res.data.data;
  };
  const getRekapJenisKoperasi = async () => {
    const res = await axios.get(`depkop/rekap_jenis_koperasi`);
    return res.data.data;
  };
  const getRekapBentukKoperasi = async () => {
    const res = await axios.get(`depkop/rekap_bentuk_koperasi`);
    return res.data.data;
  };
  const getRekapPengesahan = async () => {
    const res = await axios.get(`depkop/rekap_pengesahan`);
    return res.data.data.data;
  };
  const getParameterDate = async () => {
    const res = await axios.get(`depkop/parameter_date`);
    return res.data.data.data;
  };

  const [data, setData] = useState();
  const [rekap, setRekap] = useState();
  useEffect(() => {
    Promise.all([
      getCoperativeSummary(),
      getRekapJenisKoperasi(),
      getRekapBentukKoperasi(),
      getRekapPengesahan(),
      getParameterDate(),
    ]).then((res) => {
      setData(res[0][0]);
      setRekap({
        jenis_koperasi: res[1],
        bentuk_koperasi: res[2],
        pengesahan: res[3],
        date: res[4],
      });
    });
  }, []);

  return (
    <Page title="Statistik Koperasi" background="green.jpg">
      <Container maxWidth="xl">
        <Typography variant="h4" gutterBottom>
          Statistik Koperasi
        </Typography>
        {rekap !== undefined && (
          <Typography variant="body2" color="text.secondary" mb={3}>
            Status Data : {DateFormat(rekap.date.batchDate.substr(0, 10))} {rekap.date.batchDate.substr(11, 8)}
          </Typography>
        )}
        {data !== undefined && rekap !== undefined ? (
          <>
            <Grid container spacing={3} mb={3}>
              <Grid item xs={6} md={4} lg={3}>
                <Card sx={{ bgcolor: '#4C94F6', color: '#fff', textAlign: 'center' }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold">
                      Koperasi Aktif
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {NumberFormat(data.jumlahKoperasiAktif)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} md={4} lg={3}>
                <Card sx={{ bgcolor: '#FE6C35', color: '#fff', textAlign: 'center' }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold">
                      Bersertifikat NIK
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {NumberFormat(data.jumlahSudahBersertifikat)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} md={4} lg={3}>
                <Card sx={{ bgcolor: '#37a514', color: '#fff', textAlign: 'center' }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold">
                      Sertifikat NIK Aktif
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {NumberFormat(data.jumlahSertifikatAktif)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} md={4} lg={3}>
                <Card sx={{ bgcolor: '#ED1C24', color: '#fff', textAlign: 'center' }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold">
                      Sertifikat NIK Expired
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {NumberFormat(data.jumlahSertifikatExpired)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6} lg={3}>
                <AppCurrentDownload
                  title="Anggota"
                  chartColors={['#4f81bc', '#c0504e']}
                  chartData={[
                    { label: 'Pria', value: parseInt(data.jumlahAnggotaPria, 10) },
                    { label: 'Wanita', value: parseInt(data.jumlahAnggotaWanita, 10) },
                  ]}
                />
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <AppCurrentDownload
                  title="Karyawan"
                  chartColors={['#e7823a', '#546bc1']}
                  chartData={[
                    { label: 'Pria', value: parseInt(data.jumlahKaryawanPria, 10) },
                    { label: 'Wanita', value: parseInt(data.jumlahKaryawanWanita, 10) },
                  ]}
                />
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <AppCurrentDownload
                  title="Manajer"
                  chartColors={['#37a514', theme.palette.primary.light]}
                  chartData={[
                    { label: 'Pria', value: parseInt(data.jumlahManajerPria, 10) },
                    { label: 'Wanita', value: parseInt(data.jumlahManajerWanita, 10) },
                  ]}
                />
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <Stack spacing={3}>
                  <Card>
                    <Stack alignItems="center" justifyContent="center" sx={{ height: 145 }}>
                      <Typography variant="h6" fontWeight="bold">
                        Anggota
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        {/* {NumberFormat(data.jumlahAnggota)} */}
                        {NumberFormat(parseInt(data.jumlahAnggotaPria, 10) + parseInt(data.jumlahAnggotaWanita, 10))}
                      </Typography>
                    </Stack>
                  </Card>
                  <Card>
                    <Stack alignItems="center" justifyContent="center" sx={{ height: 145 }}>
                      <Typography variant="h6" fontWeight="bold">
                        Karyawan
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        {/* {NumberFormat(data.jumlahKaryawan)} */}
                        {NumberFormat(parseInt(data.jumlahKaryawanPria, 10) + parseInt(data.jumlahKaryawanWanita, 10))}
                      </Typography>
                    </Stack>
                  </Card>
                  <Card>
                    <Stack alignItems="center" justifyContent="center" sx={{ height: 145 }}>
                      <Typography variant="h6" fontWeight="bold">
                        Manajer
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        {/* {NumberFormat(data.jumlahManajer)} */}
                        {NumberFormat(parseInt(data.jumlahManajerPria, 10) + parseInt(data.jumlahManajerWanita, 10))}
                      </Typography>
                    </Stack>
                  </Card>
                </Stack>
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <AppCurrentDownload
                  title="Grade"
                  chartColors={['#4f81bc', '#c0504e', '#8eb542', '#23bfaa', '#8064a1']}
                  chartData={[
                    { label: 'Grade A', value: parseInt(data.jumlahGradeA, 10) },
                    { label: 'Grade B', value: parseInt(data.jumlahGradeB, 10) },
                    { label: 'Grade C1', value: parseInt(data.jumlahGradeC1, 10) },
                    { label: 'Grade C2', value: parseInt(data.jumlahGradeC2, 10) },
                    { label: 'Non Grade', value: parseInt(data.jumlahGradeLainnya, 10) },
                  ]}
                />
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <AppCurrentDownload
                  title="RAT"
                  chartColors={['#8eb542', '#fad01a']}
                  chartData={[
                    { label: 'Sudah RAT', value: parseInt(data.jumlahSudahRAT, 10) },
                    { label: 'Belum RAT', value: parseInt(data.jumlahBelumRAT, 10) },
                  ]}
                />
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <AppCurrentDownload
                  title="Modal Usaha (Miliar)"
                  chartColors={['#005eb8', '#e4002b']}
                  chartData={[
                    { label: 'Modal Sendiri', value: parseInt(data.jumlahModalSendiri, 10) },
                    { label: 'Modal Luar', value: parseInt(data.jumlahModalLuar, 10) },
                  ]}
                />
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <Stack spacing={3}>
                  <Card>
                    <Stack alignItems="center" justifyContent="center" sx={{ height: 145 }}>
                      <Typography variant="h6" fontWeight="bold">
                        Modal
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        {/* {NumberFormat(parseInt(data.jumlahTotalModal, 10))} Miliar */}
                        {NumberFormat(parseInt(data.jumlahModalSendiri, 10) + parseInt(data.jumlahModalLuar, 10))} Miliar
                      </Typography>
                    </Stack>
                  </Card>
                  <Card>
                    <Stack alignItems="center" justifyContent="center" sx={{ height: 145 }}>
                      <Typography variant="h6" fontWeight="bold">
                        Volume Usaha
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        {NumberFormat(parseInt(data.jumlahVolumeUsaha, 10))} Miliar
                      </Typography>
                    </Stack>
                  </Card>
                  <Card>
                    <Stack alignItems="center" justifyContent="center" sx={{ height: 145 }}>
                      <Typography variant="h6" fontWeight="bold">
                        Sisa Hasil Usaha
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        {NumberFormat(parseInt(data.jumlahSisaHasilUsaha, 10))} Miliar
                      </Typography>
                    </Stack>
                  </Card>
                </Stack>
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <PieChart
                  title="Jenis Koperasi"
                  chartData={rekap.jenis_koperasi
                    // eslint-disable-next-line arrow-body-style
                    .map((value) => {
                      return {
                        label: value.label,
                        value: parseInt(value.y, 10),
                      };
                    })}
                />
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <DoubleBarChart
                  title="Bentuk Koperasi"
                  chartLabels={rekap.bentuk_koperasi.dataPoints1.reverse().map((value) => value.label)}
                  chartData={[
                    {
                      year: 'Year',
                      data: [
                        {
                          name: 'Primer',
                          data: rekap.bentuk_koperasi.dataPoints1.map((value) => value.y),
                        },
                        {
                          name: 'Sekunder',
                          data: rekap.bentuk_koperasi.dataPoints2.reverse().map((value) => value.y),
                        },
                      ],
                    },
                  ]}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <LineChart
                  title="Perubahan dan Pengesahan AHU (Data Bulanan)"
                  chartLabels={rekap.pengesahan.dataPoints1.map(
                    (value) => `${value.label.substr(5, 2)}/02/${value.label.substr(0, 4)}`
                  )}
                  chartData={[
                    {
                      name: 'Pengesahaan',
                      type: 'area',
                      fill: 'gradient',
                      data: rekap.pengesahan.dataPoints1.map((value) => value.y),
                    },
                    {
                      name: 'Perubahan',
                      type: 'area',
                      fill: 'gradient',
                      data: rekap.pengesahan.dataPoints2.map((value) => value.y),
                    },
                  ]}
                />
              </Grid>
              <Grid item xs={12} lg={9}>
                <Card sx={{ height: '100%' }}>
                  <CardHeader title="Klasifikasi Usaha Koperasi" sx={{ mb: 2 }} />
                  <Scrollbar>
                    <TableContainer sx={{ minWidth: 720 }}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell align="center">Klasifikasi (KUK)</TableCell>
                            <TableCell>Kriteria</TableCell>
                            <TableCell align="right">Jumlah</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell align="center">1</TableCell>
                            <TableCell>
                              Jumlah Anggota kurang dari 5.000, Modal Sendiri kurang dari Rp. 250.000.000 atau Jumlah Aset
                              kurang dari Rp. 2.500.000.000
                            </TableCell>
                            <TableCell align="right">{NumberFormat(data.jumlahKUK1)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell align="center">2</TableCell>
                            <TableCell>
                              Jumlah Anggota 5.000 - 9.000, Modal Sendiri Rp. 250.000.000 - Rp. 15.000.000.000 atau Jumlah
                              Aset Rp. 2.500.000.000 - Rp. 100.000.000.000
                            </TableCell>
                            <TableCell align="right">{NumberFormat(data.jumlahKUK2)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell align="center">3</TableCell>
                            <TableCell>
                              Jumlah Anggota 9.000 - 35.000, Modal Sendiri Rp. 15.000.000.000 - Rp. 40.000.000.000 atau
                              Jumlah Aset Rp. 100.000.000.000 - Rp. 500.000.000.000
                            </TableCell>
                            <TableCell align="right">{NumberFormat(data.jumlahKUK3)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell align="center">4</TableCell>
                            <TableCell>
                              Jumlah Anggota lebih dari 35.000, Modal Sendiri lebih dari Rp. 40.000.000.000 atau Jumlah
                              Aset lebih dari Rp. 500.000.000.000
                            </TableCell>
                            <TableCell align="right">{NumberFormat(data.jumlahKUK4)}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Scrollbar>
                </Card>
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <AppCurrentDownload
                  title="KUK"
                  chartColors={['#005eb8', '#e4002b']}
                  chartData={[
                    { label: 'KUK 1', value: parseInt(data.jumlahKUK1, 10) },
                    { label: 'KUK 2', value: parseInt(data.jumlahKUK2, 10) },
                    { label: 'KUK 3', value: parseInt(data.jumlahKUK3, 10) },
                    { label: 'KUK 4', value: parseInt(data.jumlahKUK4, 10) },
                  ]}
                />
              </Grid>
            </Grid>
          </>
        ) : (
          <Loading />
        )}
      </Container>
    </Page>
  );
}
