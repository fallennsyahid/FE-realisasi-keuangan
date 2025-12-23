import { Container, Typography } from '@mui/material';
import Page from '../components/Page';

export default function StatistikUMKM() {
  return (
    <Page title="Statistik UMKM">
      <Container maxWidth="xl">
        <Typography variant="h4" gutterBottom>
          Statistik UMKM
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Kementerian Koperasi dan UKM Republik Indonesia
        </Typography>
      </Container>
    </Page>
  );
}
