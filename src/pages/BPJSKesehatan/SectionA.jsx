import { useState } from 'react';
import {
  Button,
  Card,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { MoreVert } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { authentication } from '../../store/authentication';
import { NumberFormat } from '../../components/Format';
import { PieChart } from '../../components/chart';
import Loading from '../../components/Loading';
import axios from '../../variable/axios';

export default function SectionA(props) {
  const { data, setData } = { ...props };
  const { user } = useRecoilValue(authentication);

  const [staging, setStaging] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDelete = async (e) => {
    e.preventDefault();
    setLoading(true);
    axios
      .delete(`padanan_data/${staging.id}`)
      .then(() => {
        const newState = data.filter((value) => value.id !== staging.id);
        setData(newState);
      })
      .finally(() => {
        setLoading(false);
        handleDialog('delete');
      });
  };

  const [dialog, setDialog] = useState({
    delete: false,
  });
  const handleDialog = (obj) => {
    setDialog({
      ...dialog,
      [obj]: !dialog[obj],
    });
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const handleClick = (e, value) => {
    setStaging(value);
    setAnchorEl(e.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <Typography variant="h5" mb={2}>
        A. Rekapitulasi
      </Typography>
      {data !== undefined ? (
        <Grid container spacing={2}>
          <Grid item xs={12} md={6} lg={4}>
            <PieChart
              title="Diagram Padanan Data"
              chartData={data
                // eslint-disable-next-line arrow-body-style
                .map((value) => {
                  return {
                    label: value.segment,
                    value: parseInt(value.total, 10),
                  };
                })}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={8}>
            <TableContainer component={Card} sx={{ height: '100%' }}>
              <CardHeader title="Tabel Padanan Data" sx={{ mb: 3 }} />
              <Table>
                <TableHead sx={{ bgcolor: '#F9FAFB' }}>
                  <TableRow>
                    <TableCell align="center" rowSpan={2}>
                      No.
                    </TableCell>
                    <TableCell rowSpan={2}>Segmen</TableCell>
                    <TableCell rowSpan={2}>Kategori</TableCell>
                    <TableCell rowSpan={2}>Sumber Data</TableCell>
                    <TableCell align="center" rowSpan={2}>
                      Jumlah Data
                    </TableCell>
                    <TableCell align="center" colSpan={2}>
                      Hasil Padanan
                    </TableCell>
                    <TableCell align="center" colSpan={2}>
                      Status Keaktifan JKN
                    </TableCell>
                    <TableCell rowSpan={2} />
                  </TableRow>
                  <TableRow>
                    <TableCell align="center">Tidak Padan (Non JKN)</TableCell>
                    <TableCell align="center">Padan (Terdaftar JKN)</TableCell>
                    <TableCell align="center">Peserta Aktif JKN</TableCell>
                    <TableCell align="center">Peserta Non Aktif JKN</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((value, index) => (
                    <TableRow key={index}>
                      <TableCell align="center">{index + 1}.</TableCell>
                      <TableCell>{value.segment}</TableCell>
                      <TableCell>{value.category.param}</TableCell>
                      <TableCell>{value.data_source.param}</TableCell>
                      <TableCell align="center">{NumberFormat(value.total)}</TableCell>
                      <TableCell align="center">{NumberFormat(value.non_jkn)}</TableCell>
                      <TableCell align="center">{NumberFormat(value.jkn)}</TableCell>
                      <TableCell align="center">
                        {value.category.param !== 'Entitas' ? NumberFormat(value.active_jkn) : '-'}
                      </TableCell>
                      <TableCell align="center">
                        {value.category.param !== 'Entitas' ? NumberFormat(value.not_active_jkn) : '-'}
                      </TableCell>
                      <TableCell align="center">
                        {['superadmin', 'bpjs'].includes(user.role) && (
                          <IconButton onClick={(e) => handleClick(e, value)}>
                            <MoreVert fontSize="small" />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {data.length < 1 && (
                <Stack direction="row" justifyContent="center" py={12}>
                  Data tidak ditemukan.
                </Stack>
              )}
            </TableContainer>
          </Grid>
        </Grid>
      ) : (
        <Loading />
      )}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem component={RouterLink} to={`./edit/${staging.id}`}>
          Ubah
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleDialog('delete');
            setAnchorEl(null);
          }}
        >
          Hapus
        </MenuItem>
      </Menu>
      <Dialog open={dialog.delete} onClose={() => handleDialog('delete')} maxWidth="xs" fullWidth>
        <DialogTitle>Hapus Data</DialogTitle>
        <DialogContent>Anda yakin ingin menghapus data?</DialogContent>
        <DialogActions>
          <Button onClick={() => handleDialog('delete')}>Batal</Button>
          <LoadingButton loading={loading} onClick={handleDelete}>
            Hapus
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </div>
  );
}
