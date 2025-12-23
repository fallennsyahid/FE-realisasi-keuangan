/* eslint-disable no-unreachable-loop */
/* eslint-disable no-plusplus */
import { useEffect, useState } from 'react';
import { palette } from '@mui/system';
import {
  Avatar,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { AddRounded, ManRounded, QuestionMarkRounded, RemoveRounded } from '@mui/icons-material';
import moment from 'moment';
import { Link as RouterLink } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { authentication } from '../../store/authentication';
import { IntegerFormat, NumberFormat } from '../../components/Format';
import { BarChart, DonutChart, DoubleBarChart, HorizontalBarChart, PieChart } from '../../components/chart';
import Loading from '../../components/Loading';
import axios from '../../variable/axios';
import mock from './mock';
import './style.css';

const Section = (props) => {
  const { children } = { ...props };
  return (
    <Stack alignItems="center" justifyContent="center" spacing={3} pt={9} {...props}>
      {children}
    </Stack>
  );
};

const CustomPeople = (props) => {
  const { total, color } = { ...props };
  const array = [];
  for (let index = 0; index < total; index++) {
    if (index < 20) {
      array.push(<ManRounded fontSize="large" color={color} />);
    }
  }
  return (
    <Stack alignItems="center">
      <Stack direction="row" spacing={-2.5}>
        {array}
      </Stack>
      <Typography variant="h5">{NumberFormat(total)}</Typography>
    </Stack>
  );
};

export default function ImporPakaianBekas() {
  const { user } = useRecoilValue(authentication);

  const [data, setData] = useState();
  const [complete, setComplete] = useState(false);
  const [outcome, setOutcome] = useState('dampak');

  const getData = async () => {
    const res = await axios.get(`priority_scale`);
    return res.data.data;
  };

  useEffect(() => {
    Promise.all([getData()]).then((res) => {
      // console.log(res[0]);
      if (res[0] !== null) {
        const value = res[0];
        value.data.updated_at = value.updated_at;
        value.data.complaint.total_report =
          IntegerFormat(value.data.complaint.verified_report) + IntegerFormat(value.data.complaint.not_verified_report);
        //   console.log(value);
        setData(value.data);
      } else {
        setData(mock);
      }
      setComplete(true);
    });
  }, []);

  return complete ? (
    <Container maxWidth="xl">
      <Stack direction="row" alignItems="center" justifyContent="space-between" pt={3}>
        <Typography variant="body2" color="text.secondary">
          Status Data: Maret 2023
          {/* {data.updated_at !== '' ? moment(data.updated_at).format('LL HH:mm:ss') : moment().format('LL HH:mm:ss')} */}
        </Typography>
        {['superadmin'].includes(user.role) && (
          <Button variant="contained" startIcon={<AddRounded />} component={RouterLink} to="./impor-pakaian-bekas">
            Input Data
          </Button>
        )}
      </Stack>
      <Section pt={6}>
        <Typography variant="h3" align="center">
          PERAN UMKM DALAM INDUSTRI PAKAIAN
        </Typography>
        <Card sx={{ maxWidth: '40rem', bgcolor: '#fbde59', textAlign: 'center' }}>
          <CardContent>
            <Typography variant="h2" color="primary">
              {NumberFormat(data.role_umkm.total)} Orang
            </Typography>
            <Typography variant="h5">
              bekerja pada Industri Mikro dan Kecil pada pakaian jadi ({data.role_umkm.year})
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ maxWidth: '40rem', bgcolor: 'primary.main', color: 'white', textAlign: 'center' }}>
          <CardContent>
            <Typography variant="h5">
              UMKM yang bergerak pada Industri Pakaian Jadi ini umumnya menjual produknya pada pasar dalam negeri.
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ maxWidth: '40rem' }}>
          <CardContent>
            <Typography variant="h6">
              Beberapa contoh brand lokal industri pakaian jadi Indonesia yang sudah ekspor:
            </Typography>
            <img src="/assets/brands.png" alt="Brands Logo" width="100%" />
          </CardContent>
        </Card>
        <BarChart
          sx={{ maxWidth: '40rem', background: 'rgba(255,255,255,0.5)' }}
          title="Jumlah Industri Mikro dan Kecil pada Sektor Pakaian Jadi dalam Unit Usaha"
          chartColors={[palette.primary]}
          chartData={data.total_industry.map((value) => ({
            label: value.year,
            value: value.total,
          }))}
        />
      </Section>
      <Section>
        <Stack>
          <Typography variant="h3" align="center">
            BESARNYA UNRECORDED IMPOR PAKAIAN
          </Typography>
          <Typography variant="h5" align="center">
            (TERMASUK IMPOR PAKAIAN BEKAS ILEGAL DI INDONESIA)
          </Typography>
        </Stack>
        <Typography variant="h6" align="center">
          Meluruskan data terkait produk impor dari China menguasai 80% pasar domestik & barang bekas impor ilegal tidak
          berdampak pada produk UMKM lokal
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <DoubleBarChart
              sx={{ height: '100%' }}
              title="Konsumsi Rumah Tangga (TPT, Kulit, Alas Kaki), PDB ADBH menurut Lapangan Usaha, Impor TPT Total dan Impor TPT China dalam Triliun Rupiah"
              chartLabels={data.unrecorded_import_1.map((value) => value.year)}
              chartData={[
                {
                  year: 'Year',
                  data: [
                    {
                      name: 'Konsumsi Rumah Tangga (TPT, Kulit, Alas Kaki)',
                      data: data.unrecorded_import_1.map((value) => value.krt),
                    },
                    {
                      name: 'PDB ADBH menurut Lapangan Usaha',
                      data: data.unrecorded_import_1.map((value) => value.pdb),
                    },
                    {
                      name: 'Impor TPT Total (Triliun Rupiah)',
                      data: data.unrecorded_import_1.map((value) => value.tpt_total),
                    },
                    {
                      name: 'Impor TPT China (Triliun Rupiah)',
                      data: data.unrecorded_import_1.map((value) => value.tpt_china),
                    },
                  ],
                },
              ]}
              body={
                <Stack ml={2.5}>
                  <ul>
                    <li>Pasar produk pakaian dan alas kaki UMKM adalah pasar domestik</li>
                    <li>
                      Sudah lama pasar domestik (UMKM) ditekan oleh impor legal & ilegal. Pangsa pasar produsen domestik
                      +/- <b>27,5%</b> (2019-2022)
                    </li>
                    <li>
                      <b>Impor</b> pakaian dan alas kaki <b>legal</b> mengusai rata-rata sebesar 43% pasar dalam negeri.
                      Sedangkan pangsa pasar impor <b>China</b> rata-rata <b>17,4% bukan 80%</b> seperti yang
                      diberitakan API.
                    </li>
                    <li>
                      <b>Unrecorded impor</b> termasuk <b>impor ilegal</b> pakaian dan alas kaki ilegal (digambarkan
                      dengan <b>gap</b> antara belanja rumah tangga dengan produksi dikurangi ekspor dan impor legal)
                      jumlahnya sangat besar rata-rata <b>31%</b> total pasar domestik tidak terlalu jauh berbeda dengan
                      impor legal.
                    </li>
                  </ul>
                </Stack>
              }
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <DoubleBarChart
              sx={{ height: '100%' }}
              title="Distribusi Net Produksi (PDB ADHB Lapangan Usaha - Ekspor TPT), Nilai Impor TPT (Triliun Rupiah) dan Potensi Unrecorded/barang tidak tercatat pada TPT (Dalam Triliun Rupiah)"
              chartLabels={data.unrecorded_import_2.map((value) => value.year)}
              chartData={[
                {
                  year: 'Year',
                  data: [
                    {
                      name: 'Potensi Unrecorded/barang tidak tercatat pada TPT (Triliun Rupiah)',
                      data: data.unrecorded_import_2.map((value) => value.unrecorded_potential),
                    },
                    {
                      name: 'Nilai Impor TPT (Triliun Rupiah)',
                      data: data.unrecorded_import_2.map((value) => value.import_tpt),
                    },
                    {
                      name: 'Net Produksi (PDB ADHB Lapangan Usaha - Ekspor TPT)',
                      data: data.unrecorded_import_2.map((value) => value.net_production),
                    },
                  ],
                },
              ]}
              body={
                <Stack ml={2.5}>
                  <ul>
                    <li>
                      Pada tahun 2020, <b>unrecorded impor lebih besar</b> yaitu dengan nilai Rp110,2 triliun dibanding
                      impor legal yaitu Rp104,6 triliun.
                    </li>
                    <li>
                      Keberadaan unrecorded impor tidak mempengaruhi impor pakaian legal termasuk China yang terus
                      meningkat sejak 2020 dan justru <b>produksi domestic cenderung menurun</b> sejak 2019.
                    </li>
                    <li>
                      <b>Pengurangan impor</b> ilegal dan legal dapat menciptakan lapangan kerja yang signifikan.
                    </li>
                    <li>
                      Kebijakan :
                      <ul style={{ paddingLeft: 20 }}>
                        <li>Menghilangkan impor ilegal</li>
                        <li>
                          Penggunaan retriksi non tariff terhadap impor barang misalnya pengaturan pelabuhan impor dan
                          penerapan persyaratan
                        </li>
                      </ul>
                    </li>
                  </ul>
                </Stack>
              }
            />
          </Grid>
        </Grid>
      </Section>
      <Section>
        <Stack>
          <Typography variant="h3" align="center">
            IKHTISAR REKAPITULASI
          </Typography>
          <Typography variant="h5" align="center">
            HOTLINE PENGADUAN USAHA TERDAMPAK IMPOR PAKAIAN BEKAS
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          Periode: {data.complaint.period !== '' ? data.complaint.period : moment().format('LL HH:mm:ss')}
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  alignItems={{ xs: 'flex-start', md: 'center' }}
                  justifyContent="center"
                  spacing={3}
                >
                  <Stack direction="row" spacing={-2.5}>
                    <CustomPeople total={data.complaint.verified_report} color="primary" />
                    <CustomPeople total={data.complaint.not_verified_report} color="warning" />
                  </Stack>
                  <Stack>
                    <Typography>{NumberFormat(data.complaint.total_report)} total laporan diterima:</Typography>
                    <Stack pl={3}>
                      <ul>
                        <li>{NumberFormat(data.complaint.verified_report)} laporan terverifikasi</li>
                        <li>
                          {NumberFormat(data.complaint.not_verified_report)} laporan tanpa identitas tidak terverifikasi
                        </li>
                      </ul>
                    </Stack>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Stack spacing={3}>
              <DonutChart
                title="Berdasarkan Jenis Kelamin"
                chartData={[
                  {
                    label: 'Laki-Laki',
                    value: IntegerFormat(data.complaint.male),
                  },
                  {
                    label: 'Perempuan',
                    value: IntegerFormat(data.complaint.female),
                  },
                ]}
              />
              <PieChart
                title="Berdasarkan Pendidikan"
                chartColors={[palette.primary]}
                chartData={[
                  {
                    label: 'SD',
                    value: IntegerFormat(data.complaint.sd),
                  },
                  {
                    label: 'SMP',
                    value: IntegerFormat(data.complaint.smp),
                  },
                  {
                    label: 'SMA',
                    value: IntegerFormat(data.complaint.sma),
                  },
                  {
                    label: 'SMK',
                    value: IntegerFormat(data.complaint.smk),
                  },
                  {
                    label: 'D3',
                    value: IntegerFormat(data.complaint.d3),
                  },
                  {
                    label: 'S1',
                    value: IntegerFormat(data.complaint.s1),
                  },
                ]}
              />
            </Stack>
          </Grid>
          <Grid item xs={12} md={3}>
            <HorizontalBarChart
              title="Berdasarkan Provinsi"
              chartColors={[palette.primary]}
              chartData={data.complaint.province.map((value) => ({
                label: value.name,
                value: value.total,
              }))}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TableContainer component={Card} sx={{ pt: 1 }}>
              <Table>
                <caption>
                  <Stack spacing={1}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Avatar sx={{ width: 20, height: 20, bgcolor: 'primary.main' }}>
                        <AddRounded fontSize="small" />
                      </Avatar>
                      <Typography variant="body2">Dukungan dan siap jadi bagian solusi</Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Avatar sx={{ width: 20, height: 20, bgcolor: 'warning.main' }}>
                        <RemoveRounded fontSize="small" />
                      </Avatar>
                      <Typography variant="body2">Menyayangkan</Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Avatar sx={{ width: 20, height: 20, bgcolor: 'text.secondary' }}>
                        <QuestionMarkRounded fontSize="small" />
                      </Avatar>
                      <Typography variant="body2">Membutuhkan solusi</Typography>
                    </Stack>
                  </Stack>
                </caption>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Typography variant="h6">Beberapa cuplikan isi laporan</Typography>
                    </TableCell>
                    <TableCell align="center">Jumlah</TableCell>
                    <TableCell align="center">Sentimen</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.complaint.snippet.map((value, index) => (
                    <TableRow key={index}>
                      <TableCell component="th" scope="row">
                        {value.title}
                      </TableCell>
                      <TableCell align="center">
                        <Typography color="error" fontWeight="bold" align="center">
                          {value.total}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" justifyContent="center" spacing={0.5}>
                          {value.sentiment.split(',').map((row) => (
                            <>
                              {row === '1' && (
                                <Avatar sx={{ width: 20, height: 20, bgcolor: 'primary.main' }}>
                                  <AddRounded fontSize="small" />
                                </Avatar>
                              )}
                              {row === '2' && (
                                <Avatar sx={{ width: 20, height: 20, bgcolor: 'warning.main' }}>
                                  <RemoveRounded fontSize="small" />
                                </Avatar>
                              )}
                              {row === '3' && (
                                <Avatar sx={{ width: 20, height: 20, bgcolor: 'text.secondary' }}>
                                  <QuestionMarkRounded fontSize="small" />
                                </Avatar>
                              )}
                            </>
                          ))}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </Section>
      <Section>
        <Typography variant="h3" align="center">
          Keberpihakan Pemerintah melalui Pembiayaan KUR pada Pelaku UMKM Sub Sektor Pakaian dan Alas Kaki
        </Typography>
        <Card sx={{ maxWidth: '40rem', bgcolor: '#fbde59' }}>
          <CardContent>
            <Typography fontWeight="bold" align="center">
              Pemerintah melalui BRI telah menyalurkan KUR kepada 30% total UMKM Sub Sektor Industri Pakaian dan Alas
              Kaki yaitu 330.545 pelaku usaha dengan nilai Rp13,361 triliun pada tahun 2022."
            </Typography>
          </CardContent>
        </Card>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <DoubleBarChart
              sx={{ height: '100%' }}
              title="Penyaluran KUR BRI Subsekon Sepatu/Alas Kaki"
              chartLabels={data.kur_bri_shoe.map((value) => value.year)}
              chartData={[
                {
                  year: 'Year',
                  data: [
                    {
                      name: 'Rp. Miliar',
                      data: data.kur_bri_shoe.map((value) => value.total),
                    },
                    {
                      name: 'Deb',
                      data: data.kur_bri_shoe.map((value) => value.deb),
                    },
                  ],
                },
              ]}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <DoubleBarChart
              sx={{ height: '100%' }}
              title="Penyaluran KUR BRI Subsekon Pakaian dan Alas Kaki"
              chartLabels={data.kur_bri_clothes.map((value) => value.year)}
              chartData={[
                {
                  year: 'Year',
                  data: [
                    {
                      name: 'Rp. Miliar',
                      data: data.kur_bri_clothes.map((value) => value.total),
                    },
                    {
                      name: 'Deb',
                      data: data.kur_bri_clothes.map((value) => value.deb),
                    },
                  ],
                },
              ]}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <DoubleBarChart
              sx={{ height: '100%' }}
              title="Penyaluran KUR BRI Subsekon Garmen/Pakaian"
              chartLabels={data.kur_bri_garmen.map((value) => value.year)}
              chartData={[
                {
                  year: 'Year',
                  data: [
                    {
                      name: 'Rp. Miliar',
                      data: data.kur_bri_garmen.map((value) => value.total),
                    },
                    {
                      name: 'Deb',
                      data: data.kur_bri_garmen.map((value) => value.deb),
                    },
                  ],
                },
              ]}
            />
          </Grid>
        </Grid>
      </Section>
      <Section>
        <Typography variant="h3" align="center">
          Outcome
        </Typography>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography>Pilih Tampilan:</Typography>
          <TextField
            size="small"
            value={outcome}
            defaultValue=""
            onChange={(e) => setOutcome(e.target.value)}
            sx={{ width: '10rem' }}
            select
          >
            <MenuItem value="dampak">Dampak</MenuItem>
            <MenuItem value="solusi">Solusi</MenuItem>
            <MenuItem value="rekomendasi">Rekomendasi</MenuItem>
          </TextField>
        </Stack>
        <Divider sx={{ border: '1px dashed #eee', width: '100%' }} />
        {outcome === 'dampak' && (
          <>
            <Typography variant="h5" align="center">
              DAMPAK DESTRUKTIF IMPOR PAKAIAN BEKAS
            </Typography>
            <Stack direction="row" spacing={3}>
              <Card sx={{ maxWidth: '40rem', bgcolor: '#fbde59', p: 2 }}>
                <Typography variant="body2" fontWeight="bold" align="center">
                  MEMBAHAYAKAN KONSUMEN
                </Typography>
              </Card>
              <Card sx={{ maxWidth: '40rem', bgcolor: '#fbde59', p: 2 }}>
                <Typography variant="body2" fontWeight="bold" align="center">
                  MEMBAHAYAKAN KESEHATAN
                </Typography>
              </Card>
            </Stack>
            <Typography align="center" maxWidth="40rem">
              Sudah dilarang sejak tahun 2015 dengan Permendag nomor 51 tahun 2015 yang dulu pertimbangannya adalah
              untuk melindungi konsumen karena pakaian bekas impor berpotensi membahayakan kesehatan.
            </Typography>
            <Grid container spacing={3} pr={3}>
              <Grid item xs={12} md={8}>
                <Grid container alignItems="center" spacing={3}>
                  <Grid item xs={4}>
                    <Card sx={{ bgcolor: '#fbde59', p: 2 }}>
                      <Typography variant="body2" fontWeight="bold" align="center">
                        MEMBUNUH SERAPAN TENAGA KERJA
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography>Menghilangkan peran begitu banyak pekerja di bidang fashion/tekstil.</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Card sx={{ bgcolor: '#fbde59', p: 2 }}>
                      <Typography variant="body2" fontWeight="bold" align="center">
                        UNDERPRICED (UNEQUAL PLAYING FIELD)
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography>
                      Merk internasional dengan harga produksi nol rupiah dan tanpa pajak/cukai sehingga dijual di bawah
                      harga pasar.
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Card sx={{ bgcolor: '#fbde59', p: 2 }}>
                      <Typography variant="body2" fontWeight="bold" align="center">
                        ORIENTASI PRODUK LUAR (KONTRA PRODUK BBI)
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography>
                      Target pasar produk pakaian dan alas kaki bekas adalah anak muda. Tren bertumbuh akibat media
                      sosial.
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Card sx={{ bgcolor: '#fbde59', p: 2 }}>
                      <Typography variant="body2" fontWeight="bold" align="center">
                        DAMPAK EKOLOGIS LIMBAH TEKSTIL
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography>
                      Sebagian besar produk impor pakaian bekas ini tidak terjual, sehingga hanya menjadi limbah
                      tekstil.
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Card sx={{ bgcolor: '#fbde59', p: 2 }}>
                      <Typography variant="body2" fontWeight="bold" align="center">
                        MERUSAK KESEHATAN
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography>
                      Dari hasil Balai Pengujian Mutu Barang ditemukan bakteri E.coli, S.aureus sampai jamur kapang dan
                      khamir.
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} md={4}>
                <Stack spacing={3}>
                  <Card>
                    <CardContent>
                      Industri tekstil Kenya mempekerjakan lebih dari setengah juta orang beberapa dekade yang lalu,
                      namun saat ini jumlahnya kurang dari 20.000.
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent>
                      <Stack pl={3}>
                        <ul>
                          <li>
                            Di Chile dari 59.000 ton impor pakaian bekas, 60% nya tidak terjual dan hanya jadi limbah
                            tekstil.
                          </li>
                          <li>
                            Limbah pakaian ini menggunung di wilayah Atacama, menghasilkan gas metana, gas rumah kaca
                            yang lebih kuat dari karbon dioksida.
                          </li>
                          <li>
                            Diperkirakan bahwa konsumsi air selama proses pencucian dan pengeringan pakaian bekas di
                            Iquique mencapai 50.000 meter kubik per hari, padahal sumber air di daerah tersebut sangat
                            terbatas.
                          </li>
                        </ul>
                      </Stack>
                    </CardContent>
                  </Card>
                </Stack>
              </Grid>
            </Grid>
          </>
        )}
        {outcome === 'solusi' && (
          <>
            <Typography variant="h5" align="center">
              SOLUSI DALAM MELINDUNGI DAN MEMBANGUN EKOSISTEM UMKM FASHION/TEKSTIL
            </Typography>
            <Grid container spacing={3} pr={3}>
              <Grid item xs={12} md={9}>
                <Stack pl={3}>
                  <ol>
                    <li>
                      Membuka hotline pelaporan untuk mendata UMKM terdampak dan menyampaikan opsi solusi substitusi
                      produk impor pakaian bekas.
                    </li>
                    <li>
                      Bersama LLP KUKM/Smesco memfasilitasi pedagang terdampak untuk terhubung dengan produsen/brand
                      lokal/agregator produk fashion untuk substitusi produk impor pakaian bekas.
                    </li>
                    <li>
                      Telah melarang praktik crossborder impor ilegal untuk setidaknya 13 kategori produk (fashion,
                      kriya, & FnB) pada e-commerce untuk melindungi UMKM produsen dalam negeri.
                    </li>
                    <li>Beberapa di antara program berjalan</li>
                  </ol>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Stack pl={3}>
                        <ul>
                          <li>Gerakan BBI</li>
                          <li>Mengembangkan klaster fashion</li>
                          <li>Mengembangkan hulu-hilir industri fashion dengan berbagai program dan kerjasama</li>
                          <li>Mendorong Indonesia sebagai Modest Fashion Hub Dunia</li>
                        </ul>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Stack pl={3}>
                        <ul>
                          <li>Promosi dan Pameran Produk Terkurasi</li>
                          <li>Mendorong terbentuknya Nusantara Fashion House di Malaysia</li>
                          <li>Penyelenggaraan IN2MOTION</li>
                          <li>Rumah Produksi Bersama produk kulit</li>
                          <li>Pusat R&D di Smesco Labo</li>
                          <li>Pembiayaan Melalui Program KUR</li>
                        </ul>
                      </Stack>
                    </Grid>
                  </Grid>
                </Stack>
              </Grid>
              <Grid item xs={12} md={3}>
                <img src="/assets/bantuan.png" alt="Bantuan" width="100%" />
              </Grid>
            </Grid>
          </>
        )}
        {outcome === 'rekomendasi' && (
          <>
            <Typography variant="h5" align="center">
              REKOMENDASI
            </Typography>
            <Stack pl={3}>
              <ol>
                <li>
                  Dikarenakan isu bergulir membesar dan tindakan represif dilakukan persis sebelum Ramadhan, agar
                  didahulukan <b>restorative justice</b> terhadap pedagang yang berdampak.
                  <Stack pl={3}>
                    <ul>
                      <li>
                        Termasuk kebijakan agar stok (dan hanya stock on hand) yang tersisa dapat dijual dengan jangka
                        waktu tertentu.
                      </li>
                      <li>
                        Prioritas penindakan di sisi hulu (cegah penyelundupan), diusulkan hukuman kurungan maksimum
                        sesuai regulasi berlaku (bukan denda)
                      </li>
                    </ul>
                  </Stack>
                </li>
                <li>
                  Diperlukan bantuan dan jaring pengaman bagi pedagang yang terkena dampak pelarangan:
                  <Stack pl={3}>
                    <ul>
                      <li>Kemenkopukm melalui Smesco akan menghubungkan dengan produsen produk lokal,</li>
                      <li>Kemendag diminta untuk membantu dan melakukan hal serupa</li>
                      <li>
                        Kemendag dan Kemenkominfo untuk memonitor dan melarang konten serta penjualan produk pakaian
                        bekas impor ilegal di platform digital (media sosial, socio commerce, dan e-commerce)
                      </li>
                    </ul>
                  </Stack>
                </li>
                <li>
                  Perlu dilakukan pertemuan dengan Menkeu (c.q Bea Cukai) dan Kepolisian untuk menindaklanjuti laporan.
                  Agar aturan dapat diterapkan dengan tepat dan akurat serta koordinasi terkait strategi komunikasi
                  bersama.
                  <Stack pl={3}>
                    <ul>
                      <li>Penguatan dan (jika diperlukan) penyempurnaan fungsi satgas eksisting</li>
                    </ul>
                  </Stack>
                </li>
              </ol>
            </Stack>
            <Divider sx={{ border: '1px dashed #eee', width: '100%' }} />
            <Stack>
              <Typography variant="h6" align="center">
                REKOMENDASI POINTER
              </Typography>
              <Typography variant="h6" align="center">
                STATEMENT BERSAMA MENKOPUKM & MENDAG
              </Typography>
            </Stack>
            <Stack pl={3}>
              <ol>
                <li>
                  Kementerian Koperasi dan UKM, Kementerian Perdagangan, serta Kementerian Keuangan akan berkoordinasi
                  dengan Kepolisian untuk menutup impor pakaian bekas di hulu, sampai ke pelabuhan-pelabuhan kecil yang
                  sering digunakan oleh para penyelundup, termasuk gudang-gudang penampungan dan menuntut hukuman
                  maksimal bagi importir gelap tersebut.
                </li>
                <li>
                  Pelarangan impor pakaian bekas ini bukan hal yang baru, tapi sudah dilarang sejak tahun 2015 lewat
                  Permendag Nomor 51 tahun 2015 tentang Larangan Impor Pakaian Bekas, yang dicabut dengan Permendag
                  Nomor 12 Tahun 2020 tentang Barang Dilarang Impor, yang dicabut dengan Permendag Nomor 18 tahun 2021
                  tentang Barang Dilarang Ekspor dan Barang Dilarang Impor, dan terakhir diubah dengan Permendag Nomor
                  40 tahun 2022.
                </li>
                <li>
                  Definisi pakaian bekas impor yang ilegal ini adalah yang untuk diperjualbelikan dan/atau dalam jumlah
                  besar. Untuk produk pakaian bekas yang akan digunakan pribadi/tidak dijual kembali/barang koleksi
                  tidak termasuk yang dilarang. Pemerintah tidak melarang aktivitas thrifting selama itu produksi dalam
                  negeri dan/atau bukan impor ilegal.
                </li>
                <li>
                  Dampak dari impor pakaian bekas ini sangat merusak:
                  <Stack pl={3}>
                    <ul>
                      <li>
                        Secara ekonomi bisa mencapai Rp94 triliun (tahun 2022) nilai dari unrecorded impor pakaian di
                        Indonesia
                      </li>
                      <li>Membunuh serapan tenaga kerja</li>
                      <li>
                        Unequal playing field karena produk pakaian bekas impor sangat di bawah harga normal pasaran
                      </li>
                      <li>Berorientasi pada produk luar dan kontra Bangga Buatan Indonesia</li>
                      <li>Dampak ekologis dari limbah tekstil</li>
                      <li>
                        Merusak kesehatan karena banyak terkandung bakteri dan jamur (hasil Balai Pengujian Mutu Barang)
                      </li>
                    </ul>
                  </Stack>
                </li>
                <li>
                  Jumlah pakaian bekas impor yang ada di data BPS adalah pakaian yang dibawa oleh WNI kita yang pulang
                  dari luar negeri yang tidak dijualbelikan dan sesuai aturan bea cukai.
                </li>
                <li>
                  Pemerintah akan terus memperkuat UMKM dengan membangun ekosistem dan melanjutkan kampanye BBI untuk
                  meningkatkan kualitas dan kapasitas produksi.
                </li>
                <li>
                  Kemendag bersama Kemenkominfo akan memonitor dan melarang konten serta penjualan produk pakaian bekas
                  impor ilegal di platform digital (media sosial, socio commerce, dan e-commerce).
                </li>
                <li>
                  Kemenkopukm dan Kemendag membuka layanan hotline aduan UMKM terdampak untuk dibantu mencarikan solusi.
                </li>
                <li>
                  Pemerintah mendorong pendekatan restorative justice untuk UMKM penjual dalam bentuk pemberian batas
                  waktu 3 bulan untuk menghabiskan stok. Namun demikian dilarang untuk menjual dalam bentuk event atau
                  pameran di pusat perbelanjaan modern/mall.
                </li>
              </ol>
            </Stack>
          </>
        )}
      </Section>
    </Container>
  ) : (
    <Loading />
  );
}
