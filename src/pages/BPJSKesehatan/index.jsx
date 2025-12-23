/* eslint-disable array-callback-return */
import { useEffect, useState } from 'react';
import { Button, Container, Skeleton, Stack, Typography } from '@mui/material';
import { AddRounded } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import moment from 'moment';
import { useRecoilValue } from 'recoil';
import { authentication } from '../../store/authentication';
import axios from '../../variable/axios';
import Page from '../../components/Page';
import SectionA from './SectionA';
import SectionB from './SectionB';
import SectionC from './SectionC';
import SectionD from './SectionD';

export default function BPJSKesehatan() {
  const { user } = useRecoilValue(authentication);

  const [data, setData] = useState();
  const [statusData, setStatusData] = useState();

  const getData = async () => {
    const res = await axios.get(`padanan_data`);
    res.data.data
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map((value) => {
        value.total = (value.non_jkn !== null ? value.non_jkn : 0) + (value.jkn !== null ? value.jkn : 0);
        value.non_jkn = value.non_jkn !== null ? value.non_jkn : 0;
        value.jkn = value.jkn !== null ? value.jkn : 0;
        value.active_jkn = value.active_jkn !== null ? value.active_jkn : 0;
        value.not_active_jkn = value.not_active_jkn !== null ? value.not_active_jkn : 0;
      });
    return res.data.data;
  };

  useEffect(() => {
    Promise.all([getData()]).then((res) => {
      const value = res[0];
      const updatedAt = new Date(Math.max(...value.map((e) => new Date(e.updated_at))));
      const date = addHours(new Date(updatedAt), 7);
      const newDate = `${moment(date).format('LL')} ${date.substr(11, 8)}`;
      setStatusData(newDate);
      setData(value);
    });
  }, []);

  function addHours(date, hours) {
    date.setTime(date.getTime() + hours * 60 * 60 * 1000);
    return moment(date).format('yyyy-MM-DD HH:mm:ss');
  }

  return (
    <Page title="Integrasi KemenkopUKM dan BPJS Kesehatan">
      <Container maxWidth="xl">
        <Typography variant="h4" gutterBottom>
          Integrasi KemenkopUKM dan BPJS Kesehatan
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Kementerian Koperasi dan UKM Republik Indonesia
        </Typography>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} mb={4}>
          <Typography variant="body2" color="text.secondary">
            {data !== undefined ? <>Status Data : {statusData}</> : <Skeleton width={250} />}
          </Typography>
          {['superadmin', 'bpjs'].includes(user.role) && (
            <Button variant="contained" startIcon={<AddRounded />} component={RouterLink} to="./create">
              Tambah Data
            </Button>
          )}
        </Stack>
        <Stack spacing={10}>
          <SectionA data={data} setData={setData} />
          <SectionB data={data} />
          <SectionC />
          <SectionD />
        </Stack>
      </Container>
    </Page>
  );
}
