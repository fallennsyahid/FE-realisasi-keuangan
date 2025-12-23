import PropTypes from 'prop-types';
import merge from 'lodash/merge';
import ReactApexChart from 'react-apexcharts';
// @mui
import { styled } from '@mui/material/styles';
import { Card, CardHeader } from '@mui/material';
// utils
import { NumberFormat } from '../Format';
// components
import { BaseOptionChart } from '.';

// ----------------------------------------------------------------------

const CHART_HEIGHT = 362;

const ChartWrapperStyle = styled('div')(({ theme }) => ({
  height: CHART_HEIGHT,
  marginTop: theme.spacing(2),
}));

// ----------------------------------------------------------------------

RadialBarChart.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
  total: PropTypes.number,
  chartColors: PropTypes.any.isRequired,
  chartData: PropTypes.array.isRequired,
};

export default function RadialBarChart({ title, subheader, total, chartColors, chartData, ...other }) {
  const chartLabels = chartData.map((i) => i.label);

  const chartSeries = chartData.map((i) => i.value);

  const chartOptions = merge(BaseOptionChart(), {
    labels: chartLabels,
    legend: {
      show: true,
      floating: true,
      fontSize: '13px',
      position: 'left',
      offsetX: 30,
      offsetY: 15,
      labels: {
        useSeriesColors: true,
      },
      markers: {
        size: 0,
      },
      formatter(seriesName, opts) {
        return `${seriesName}:  ${opts.w.globals.series[opts.seriesIndex]}`;
      },
      itemMargin: {
        vertical: 3,
      },
    },
    colors: chartColors.map((colors) => colors),
    plotOptions: {
      radialBar: {
        offsetY: 0,
        startAngle: 0,
        endAngle: 270,
        hollow: { size: '50%' },
        dataLabels: {
          value: { offsetY: 16 },
          total: {
            formatter: () => NumberFormat(total),
          },
        },
      },
    },
  });

  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />

      <ChartWrapperStyle dir="ltr">
        <ReactApexChart type="radialBar" series={chartSeries} options={chartOptions} height={300} />
      </ChartWrapperStyle>
    </Card>
  );
}
