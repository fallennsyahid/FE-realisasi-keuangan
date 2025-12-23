import PropTypes from 'prop-types';
import merge from 'lodash/merge';
import { useState } from 'react';
import ReactApexChart from 'react-apexcharts';
// @mui
import { Card, CardHeader, Box, CardContent, Divider, Table, TableRow, TableCell } from '@mui/material';
// components
import BaseOptionChart from './BaseOptionChart';
import { NumberFormat } from '../Format';

// ----------------------------------------------------------------------

DoubleBarChart.propTypes = {
  title: PropTypes.string,
  body: PropTypes.element,
  subheader: PropTypes.string,
  chartData: PropTypes.array.isRequired,
  chartLabels: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default function DoubleBarChart({ title, body, subheader, chartLabels, chartData, ...other }) {
  const [seriesData] = useState('Year');

  //   const handleChangeSeriesData = (event) => {
  //     setSeriesData(event.target.value);
  //   };

  const chartOptions = merge(BaseOptionChart(), {
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories: chartLabels,
    },
    tooltip: {
      y: {
        formatter: (val) => NumberFormat(val),
      },
    },
  });

  return (
    <Card sx={{ height: '100%' }} {...other}>
      <CardHeader
        title={title}
        subheader={subheader}
        //   action={
        //     <TextField
        //       select
        //       fullWidth
        //       value={seriesData}
        //       SelectProps={{ native: true }}
        //       onChange={handleChangeSeriesData}
        //       sx={{
        //         '& fieldset': { border: '0 !important' },
        //         '& select': { pl: 1, py: 0.5, pr: '24px !important', typography: 'subtitle2' },
        //         '& .MuiOutlinedInput-root': { borderRadius: 0.75, bgcolor: 'background.neutral' },
        //         '& .MuiNativeSelect-icon': { top: 4, right: 0, width: 20, height: 20 },
        //       }}
        //     >
        //       {chartData.map((option) => (
        //         <option key={option.year} value={option.year}>
        //           {option.year}
        //         </option>
        //       ))}
        //     </TextField>
        //   }
      />

      {chartData.map((item) => (
        <Box key={item.year} sx={{ mt: 3, mx: 3 }} dir="ltr">
          {item.year === seriesData && (
            <ReactApexChart type="bar" series={item.data} options={chartOptions} height={364} />
          )}
        </Box>
      ))}
      {body && <CardContent>{body}</CardContent>}
      <Divider />
      <CardContent sx={{ p: 1 }}>
        <Table size="small">
          {chartData[0].data.map((value) =>
            value.data.map((row, key) => (
              <TableRow key={key}>
                <TableCell>
                  {value.name} {chartLabels[key]}
                </TableCell>
                <TableCell align="right">{NumberFormat(row)}</TableCell>
              </TableRow>
            ))
          )}
        </Table>
      </CardContent>
    </Card>
  );
}
