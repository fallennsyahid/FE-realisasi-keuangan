// @mui
import { styled } from '@mui/material/styles';
import { Card, Container, Stack, Typography } from '@mui/material';
// hooks
import useResponsive from '../hooks/useResponsive';
// components
import Page from '../components/Page';
import Logo from '../components/Logo';
// sections
import { LoginForm } from '../sections/auth/login';

// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    display: 'flex',
  },
}));

const SectionStyle = styled(Card)(({ theme }) => ({
  width: '100%',
  maxWidth: 464,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  margin: theme.spacing(2, 0, 2, 12),
}));

const ContentStyle = styled('div')(({ theme }) => ({
  maxWidth: 480,
  margin: 'auto',
  minHeight: '70vh',
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'column',
  padding: theme.spacing(12, 0),
}));

// ----------------------------------------------------------------------

export default function Login() {
  const mdUp = useResponsive('up', 'md');

  return (
    <Page title="Login">
      <RootStyle>
        {mdUp && (
          <>
            <SectionStyle>
              <Logo sx={{ ml: 5, mt: 5 }} />
              <Typography variant="h3" sx={{ px: 5, mt: 5 }} gutterBottom>
                Dashboard
              </Typography>
              <Typography color="text.secondary" sx={{ px: 5, mb: 5 }}>
                Kementerian UMKM Republik Indonesia
              </Typography>
              <img src="/assets/illustrations/illustration_dashboard.png" alt="login" width="90%" />
            </SectionStyle>
          </>
        )}
        <Container maxWidth="sm">
          <Stack direction="row" justifyContent="center">
            <Logo sx={{ display: { sm: 'block', md: 'none' } }} />
          </Stack>
          <ContentStyle>
            <Typography variant="h4">Login</Typography>
            <LoginForm />
          </ContentStyle>
        </Container>
      </RootStyle>
    </Page>
  );
}
