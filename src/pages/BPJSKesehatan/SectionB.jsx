import {
  Card,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { PieChart } from '../../components/chart';
import { NumberFormat } from '../../components/Format';
import Loading from '../../components/Loading';

export default function SectionB(props) {
  const { data } = { ...props };
  console.log(data);
  return (
    <div>
      <Typography variant="h5" mb={2}>
        B. Berdasarkan Segmen
      </Typography>
      {data !== undefined ? (
        <Grid container spacing={2}>
          {data.length > 0 ? (
            data.map((value, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <PieChart
                  title={`Data ${value.segment} - ${value.category.param}`}
                  chartData={
                    value.category.param === 'Entitas'
                      ? [
                          {
                            label: 'Tidak Padan (Non JKN)',
                            value: parseInt(value.non_jkn, 10),
                          },
                          {
                            label: 'Padan (Terdaftar JKN)',
                            value: parseInt(value.jkn, 10),
                          },
                        ]
                      : [
                          {
                            label: 'Tidak Padan (Non JKN)',
                            value: parseInt(value.non_jkn, 10),
                          },
                          {
                            label: 'Peserta Aktif JKN',
                            value: parseInt(value.active_jkn, 10),
                          },
                          {
                            label: 'Peserta Non Aktif JKN',
                            value: parseInt(value.not_active_jkn, 10),
                          },
                        ]
                  }
                  table={
                    <TableContainer>
                      <Table>
                        <TableHead sx={{ bgcolor: '#F9FAFB' }}>
                          <TableRow>
                            <TableCell align="center" rowSpan={2}>
                              Segmen
                            </TableCell>
                            <TableCell align="center" colSpan={3}>
                              Status Keaktifan JKN
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell align="center">Tidak Padan (Non JKN)</TableCell>
                            {value.category.param === 'Entitas' ? (
                              <TableCell align="center">Padan (Terdaftar JKN)</TableCell>
                            ) : (
                              <>
                                <TableCell align="center">Peserta Aktif JKN</TableCell>
                                <TableCell align="center">Peserta Non Aktif JKN</TableCell>
                              </>
                            )}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                            <TableCell>{value.segment}</TableCell>
                            <TableCell align="center">{NumberFormat(value.non_jkn)}</TableCell>
                            {value.category.param === 'Entitas' ? (
                              <TableCell align="center">{NumberFormat(value.jkn)}</TableCell>
                            ) : (
                              <>
                                <TableCell align="center">{NumberFormat(value.active_jkn)}</TableCell>
                                <TableCell align="center">{NumberFormat(value.not_active_jkn)}</TableCell>
                              </>
                            )}
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  }
                />
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Card>
                <Stack direction="row" alignItems="center" justifyContent="center" py={12}>
                  Data tidak ditemukan.
                </Stack>
              </Card>
            </Grid>
          )}
        </Grid>
      ) : (
        <Loading />
      )}
    </div>
  );
}
