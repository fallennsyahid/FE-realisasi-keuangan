/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import axios from 'axios';
import Loading from '../../components/Loading';

export default function SectionC() {
  const [data, setData] = useState();
  const [params, setParams] = useState({
    status: '0',
    limit: 10,
    skip: 1,
  });

  const getData = async () => {
    const res = await axios.get('https://dummyjson.com/users', { params });
    return res.data;
  };

  useEffect(() => {
    setData(undefined);
    Promise.all([getData()]).then(() => {
      // setData(res[0]);
      setData({ users: [] });
    });
  }, [params]);

  const handleChange = (e) => {
    document.getElementById('sectionc').scrollIntoView();
    setParams({
      ...params,
      [e.target.name]: e.target.value,
      skip: 1,
    });
  };

  const handleChangePage = (e, newPage) => {
    document.getElementById('sectionc').scrollIntoView();
    setParams({
      ...params,
      skip: newPage + 1,
    });
  };

  const handleChangeRowsPerPage = (e) => {
    document.getElementById('sectionc').scrollIntoView();
    setParams({
      ...params,
      limit: +e.target.value,
      skip: 1,
    });
  };

  return (
    <div id="sectionc">
      <Typography variant="h5" mb={2}>
        C. Row Data Status Keaktifan JKN
      </Typography>
      <Card>
        <CardContent sx={{ pb: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography>Filter :</Typography>
            <TextField name="status" size="small" defaultValue="0" value={params.status} onChange={handleChange} select>
              <MenuItem value="0">Semua Status</MenuItem>
              <MenuItem value="1">Tidak Padan (Non JKN)</MenuItem>
              <MenuItem value="2">Peserta Aktif JKN</MenuItem>
              <MenuItem value="3">Peserta Non Aktif JKN</MenuItem>
            </TextField>
          </Stack>
        </CardContent>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#F9FAFB' }}>
              <TableRow>
                <TableCell align="center">No.</TableCell>
                <TableCell>Nama Lengkap</TableCell>
                <TableCell>NIK KTP</TableCell>
                <TableCell>No. HP</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Status Keaktifan</TableCell>
              </TableRow>
            </TableHead>
            {data !== undefined && (
              <TableBody>
                {data.users.map((value, index) => (
                  <TableRow key={index}>
                    <TableCell align="center">{params.skip * 10 + index - 9}.</TableCell>
                    <TableCell>
                      {value.firstName} {value.lastName}
                    </TableCell>
                    <TableCell>{value.bank.cardNumber}</TableCell>
                    <TableCell>{value.phone}</TableCell>
                    <TableCell>{value.email}</TableCell>
                    <TableCell>Peserta Aktif JKN</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            )}
          </Table>
          {data !== undefined && data.users.length < 1 && (
            <Stack direction="row" justifyContent="center" py={12}>
              Data tidak ditemukan.
            </Stack>
          )}
        </TableContainer>
        {data !== undefined && data.users.length > 0 && (
          <TablePagination
            component="div"
            count={data.total}
            page={params.skip - 1}
            rowsPerPage={params.limit}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[10, 25, 50, 100]}
            showFirstButton
            showLastButton
          />
        )}
        {data === undefined && <Loading />}
      </Card>
    </div>
  );
}
