import { useState } from 'react';
import { Button, Card, CardContent, Divider, FormControl, Grid, TextField, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import axios from 'axios';

export default function SectionD() {
  const [data, setData] = useState();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setData(undefined);
    setError('');
    setLoading(true);
    const formData = new FormData(e.target);
    await axios
      .get('https://dummyjson.com/products/1', formData)
      .then((res) => {
        setData(res);
        document.getElementById('result').scrollIntoView();
      })
      .catch((xhr) => {
        setError(xhr.response);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div>
      <Typography variant="h5" mb={2}>
        D. Cek Data Peserta
      </Typography>
      <Grid container justifyContent="center">
        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent component="form" onSubmit={handleSubmit}>
              <Typography variant="h6" gutterBottom>
                Informasi Peserta
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Silahkan masukkan <b>NIK KTP</b> untuk melihat informasi data peserta.
              </Typography>
              <FormControl margin="normal" fullWidth>
                <TextField
                  name="nik"
                  type="tel"
                  placeholder="NIK KTP"
                  inputProps={{
                    minLength: 16,
                    maxLength: 16,
                  }}
                  error={!!error}
                  helperText={!!error && 'NIK KTP tidak ditemukan.'}
                />
              </FormControl>
              <FormControl margin="normal" fullWidth>
                <LoadingButton type="submit" variant="contained" loading={loading} disabled>
                  Cek Data Peserta
                </LoadingButton>
              </FormControl>
            </CardContent>
          </Card>
          {data !== undefined && (
            <Card sx={{ mt: 2 }} id="result">
              <CardContent>
                <Typography variant="h6" align="center" gutterBottom>
                  Data Peserta
                </Typography>
                <Divider sx={{ my: 2 }} />
                <FormControl margin="dense" fullWidth>
                  <Typography variant="body2" color="text.secondary">
                    NIK KTP
                  </Typography>
                  <Typography variant="body2">1234567890123456</Typography>
                </FormControl>
                <FormControl margin="normal" fullWidth>
                  <Typography variant="body2" color="text.secondary">
                    Nama Lengkap
                  </Typography>
                  <Typography variant="body2">John Doe</Typography>
                </FormControl>
                <FormControl margin="normal" fullWidth>
                  <Typography variant="body2" color="text.secondary">
                    No. HP
                  </Typography>
                  <Typography variant="body2">081234567890</Typography>
                </FormControl>
                <FormControl margin="normal" fullWidth>
                  <Typography variant="body2" color="text.secondary">
                    Status Keaktifan
                  </Typography>
                  <Typography variant="body2">Peserta Aktif JKN</Typography>
                </FormControl>
                <FormControl margin="normal" fullWidth>
                  <Button variant="outlined" onClick={() => setData(undefined)}>
                    Tutup
                  </Button>
                </FormControl>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </div>
  );
}
