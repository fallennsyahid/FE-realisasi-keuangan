import PropTypes from 'prop-types';
import merge from 'lodash/merge';
import ReactApexChart from 'react-apexcharts';
// @mui
import { useTheme, styled } from '@mui/material/styles';
import { Card, Typography, Box, CircularProgress } from '@mui/material';
// components
import Iconify from '../../../components/Iconify';
import { BaseOptionChart } from '../../../components/chart';
import { NumberFormat } from '../../../components/Format';

// ----------------------------------------------------------------------

const RootStyle = styled(Card)(({ theme }) => ({
  display: 'flex',
  position: 'relative',
  alignItems: 'center',
  padding: theme.spacing(3),
  backgroundColor: theme.palette.primary.darker,
  height: '100%',
}));

const IconStyle = styled(Iconify)(({ theme }) => ({
  width: 120,
  height: 120,
  opacity: 0.12,
  position: 'absolute',
  right: theme.spacing(-3),
  color: theme.palette.common.white,
}));

// Custom circular progress with percentage in center
const CircularProgressWithLabel = ({ value, color }) => {
  const theme = useTheme();
  const safeValue = isNaN(value) || value === null || value === undefined ? 0 : Math.min(100, Math.max(0, value));

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      {/* Background circle (gray track) */}
      <CircularProgress
        variant="determinate"
        value={100}
        size={80}
        thickness={4}
        sx={{
          color: 'rgba(255, 255, 255, 0.2)',
        }}
      />
      {/* Foreground circle (yellow progress) */}
      <CircularProgress
        variant="determinate"
        value={safeValue}
        size={80}
        thickness={4}
        sx={{
          color: theme.palette.warning.main,
          position: 'absolute',
          left: 0,
          '& .MuiCircularProgress-circle': {
            strokeLinecap: 'round',
          },
        }}
      />
      {/* Center label */}
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="subtitle1" component="div" sx={{ color: 'common.white', fontWeight: 'bold' }}>
          {safeValue.toFixed(1)}%
        </Typography>
      </Box>
    </Box>
  );
};

// ----------------------------------------------------------------------

AppWidget.propTypes = {
  chartData: PropTypes.number,
  color: PropTypes.oneOf(['primary', 'secondary', 'info', 'success', 'warning', 'error']),
  icon: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  total: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default function AppWidget({ title, total, icon, color = 'primary', chartData, ...other }) {
  const theme = useTheme();

  // Determine if this is a percentage card (has chartData)
  const isPercentCard = chartData !== undefined;
  const percentValue = isPercentCard ? (isNaN(parseFloat(total)) ? 0 : parseFloat(total)) : 0;

  return (
    <RootStyle
      sx={{
        bgcolor: theme.palette[color].darker,
      }}
      {...other}
    >
      {isPercentCard ? (
        <CircularProgressWithLabel value={percentValue} color={color} />
      ) : (
        <Box
          sx={{
            width: 80,
            height: 80,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Iconify icon={icon} sx={{ width: 48, height: 48, color: 'common.white', opacity: 0.8 }} />
        </Box>
      )}
      <Box sx={{ ml: 3, color: 'common.white' }}>
        <Typography variant="h4">
          {isPercentCard
            ? `${isNaN(parseFloat(total)) ? 0 : parseFloat(total).toFixed(2)}%`
            : NumberFormat(total, 'Rp')}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.72 }}>
          {title}
        </Typography>
      </Box>
      <IconStyle icon={icon} />
    </RootStyle>
  );
}
