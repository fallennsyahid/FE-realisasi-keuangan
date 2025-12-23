import PropTypes from 'prop-types';
// import merge from 'lodash/merge';
import ReactApexChart from 'react-apexcharts';
// @mui
import { Card, CardHeader, Box } from '@mui/material';
// components
// import { BaseOptionChart } from '../../../components/chart';
// import { NumberFormat } from '../../../utils/format';

// ----------------------------------------------------------------------

LineChart.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
  chartData: PropTypes.object.isRequired,
  //   chartLabels: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default function LineChart({ title, subheader, chartData, ...other }) {
  // export default function LineChart({ title, subheader, chartLabels, chartData, ...other }) {
  //   const chartOptions = merge(BaseOptionChart(), {
  //     plotOptions: { bar: { columnWidth: '16%' } },
  //     fill: { type: chartData.map((i) => i.fill) },
  //     labels: chartLabels,
  //     xaxis: { type: 'datetime' },
  //     tooltip: {
  //       shared: true,
  //       intersect: false,
  //       y: {
  //         formatter: (y) => {
  //           if (typeof y !== 'undefined') {
  //             return NumberFormat(y.toFixed(0));
  //           }
  //           return y;
  //         },
  //       },
  //     },
  //   });

  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />

      <Box sx={{ p: 3, pb: 1 }} dir="ltr">
        <ReactApexChart
          type="bar"
          series={[
            {
              data: chartData.dataPoints1
                .slice(0)
                .reverse()
                .map((value) => value.y),
            },
            {
              data: chartData.dataPoints2
                .slice(0)
                .reverse()
                .map((value) => value.y),
            },
          ]}
          options={{
            chart: {
              type: 'bar',
              height: 430,
            },
            plotOptions: {
              bar: {
                horizontal: true,
                dataLabels: {
                  position: 'top',
                },
              },
            },
            dataLabels: {
              enabled: true,
              offsetX: -6,
              style: {
                fontSize: '12px',
                colors: ['#fff'],
              },
            },
            stroke: {
              show: true,
              width: 1,
              colors: ['#fff'],
            },
            tooltip: {
              shared: true,
              intersect: false,
            },
            xaxis: {
              categories: ['Kabupaten/Kota', 'Provinsi', 'Nasional'],
            },
          }}
          height={364}
        />
      </Box>
    </Card>
  );
}
