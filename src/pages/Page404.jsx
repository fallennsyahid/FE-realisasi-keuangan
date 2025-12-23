import { Link as RouterLink } from 'react-router-dom';
// @mui
import { styled } from '@mui/material/styles';
import { Button, Typography, Container, Box } from '@mui/material';
// components
import Page from '../components/Page';

// ----------------------------------------------------------------------

const ContentStyle = styled('div')(() => ({
  maxWidth: 500,
  margin: 'auto',
  minHeight: '70vh',
  display: 'flex',
  justifyContent: 'start',
  flexDirection: 'column',
}));

// ----------------------------------------------------------------------

export default function Page404() {
  return (
    <Page title="Halaman Tidak Ditemukan">
      <Container>
        <ContentStyle sx={{ textAlign: 'center', alignItems: 'center' }}>
          <Typography variant="h3" paragraph>
            Maaf, halaman tidak ditemukan!
          </Typography>

          <Typography sx={{ color: 'text.secondary' }}>
            Halaman yang Anda cari mungkin telah dipindah atau dihapus.
          </Typography>

          <Box
            component="img"
            src="/static/illustrations/illustration_404.jpg"
            sx={{ mx: 'auto', my: { xs: 5, sm: 10 }, borderRadius: 5 }}
          />

          <Button to="/" size="large" variant="contained" component={RouterLink}>
            Kembali
          </Button>
        </ContentStyle>
      </Container>
    </Page>
  );
}
