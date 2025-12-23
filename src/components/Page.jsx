import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet-async';
import { forwardRef } from 'react';
import { styled } from '@mui/material/styles';

// ----------------------------------------------------------------------

const APP_BAR_MOBILE = 64;
const APP_BAR_DESKTOP = 92;

const MainStyle = styled('div')(({ theme }) => ({
  minHeight: '100vh',
  paddingTop: APP_BAR_MOBILE + 24,
  paddingBottom: theme.spacing(10),
  [theme.breakpoints.up('lg')]: {
    paddingTop: APP_BAR_DESKTOP + 10,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
}));

// ----------------------------------------------------------------------

const Page = forwardRef(({ children, title = '', meta, background, ...other }, ref) => (
  <>
    <Helmet>
      <title>{`${title} - Dashboard`}</title>
      {meta}
    </Helmet>

    <MainStyle
      ref={ref}
      {...other}
      sx={{
        background: background !== undefined ? `url('/static/backgrounds/${background}')` : null,
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
      }}
    >
      {children}
    </MainStyle>
  </>
));

Page.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  meta: PropTypes.node,
  background: PropTypes.string,
};

export default Page;
