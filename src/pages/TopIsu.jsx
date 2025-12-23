import { useState } from 'react';
import { Container, Divider, FormControl, MenuItem, Stack, TextField, Typography } from '@mui/material';
import ImporPakaianBekas from './ImporPakaianBekas';
import Page from '../components/Page';

export default function TopIsu() {
  const [data, setData] = useState('1');
  const handleChange = (e) => {
    setData(e.target.value);
  };

  return (
    <Page title="Top Isu">
      <Container maxWidth="xl">
        <Stack direction="row" alignItems="flex-end" justifyContent="space-between">
          <Stack>
            <Typography variant="h4" gutterBottom>
              Top Isu
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Kementerian Koperasi dan UKM Republik Indonesia
            </Typography>
          </Stack>
          <FormControl margin="normal">
            <TextField size="small" value={data} defaultValue={data} onChange={handleChange} select>
              <MenuItem value="1">01. Impor Pakaian Bekas</MenuItem>
            </TextField>
          </FormControl>
        </Stack>
        <Divider sx={{ border: '1px dashed #eee', mt: 3 }} />
      </Container>
      {data === '1' && <ImporPakaianBekas />}
      {data === '2' && null}
    </Page>
  );
}
