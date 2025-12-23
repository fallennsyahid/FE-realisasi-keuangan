import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import { Box, Typography, Stack } from '@mui/material';

const CardItemStyle = styled('div')(({ theme }) => ({
  position: 'relative',
  backgroundSize: 'cover',
  padding: theme.spacing(3),
  backgroundRepeat: 'no-repeat',
  color: theme.palette.common.white,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  borderRadius: 15,
}));

BankingCurrentBalance.propTypes = {
  data: PropTypes.object,
};

export default function BankingCurrentBalance({ data }) {
  return (
    <Box sx={{ position: 'relative', zIndex: 9 }}>
      <CardItemStyle
        sx={{
          background: data.background !== undefined ? data.background : 'url("/assets/bg_card.png")',
        }}
      >
        <Typography sx={{ mb: 2, typography: 'subtitle2' }}>{data.title}</Typography>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
          {data.icon !== undefined && data.icon}
          <Typography sx={{ typography: 'h4' }}>{data.total}</Typography>
        </Stack>
      </CardItemStyle>
    </Box>
  );
}
