import PropTypes from 'prop-types';
// @mui
import {
  Card,
  CardHeader,
  Typography,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell,
  useTheme,
  alpha,
  CardContent,
} from '@mui/material';
// utils
import { NumberFormat } from '../../../components/Format';
// components
import Image from '../../../components/Image';
import Scrollbar from '../../../components/Scrollbar';

AppTopInstalledCountries.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
  list: PropTypes.array.isRequired,
};

export default function AppTopInstalledCountries({ title, subheader, list, ...other }) {
  const theme = useTheme();
  //   const list4 = list.sort((a, b) => (a.realization < b.realization ? 1 : -1)).filter((value, index) => index < 4);
  //   const list3 = list.sort((a, b) => (a.realization < b.realization ? 1 : -1)).filter((value, index) => index < 3);
  //   const inthelist = list4.some((v) => v.name === 'KEMENTERIAN PERTAHANANs');
  //   const list1 = list.map((value) => value.name === 'KEMENTERIAN KOPERASI DAN PENGUSAHA KECIL DAN MENENGAH');
  //   console.clear();
  //   console.log(inthelist === true ? list4 : list3);
  return (
    <Card {...other} sx={{ height: '100%' }}>
      <CardHeader title={title} subheader={subheader} sx={{ mb: 3 }} />
      {list.length > 0 ? (
        <Scrollbar>
          <TableContainer>
            <Table>
              <TableBody>
                {list
                  .sort((a, b) => (a.realization < b.realization ? 1 : -1))
                  .map(
                    (data, index) =>
                      index < 4 && (
                        <TableRow
                          key={index}
                          sx={{
                            bgcolor:
                              data.name === 'KEMENTERIAN KOPERASI DAN PENGUSAHA KECIL DAN MENENGAH'
                                ? alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity)
                                : '',
                          }}
                        >
                          <TableCell>
                            <Typography variant="subtitle2">{index + 1}.</Typography>
                          </TableCell>
                          <TableCell>
                            <Image
                              disabledEffect
                              alt={data.name}
                              src={`/assets/logos/${encodeURIComponent(data.name)}.png`}
                              sx={{ width: 28 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="subtitle2">{data.name}</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2">{NumberFormat(data.realization, 'Rp')}</Typography>
                          </TableCell>
                        </TableRow>
                      )
                  )}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>
      ) : (
        <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          gada
        </CardContent>
      )}
    </Card>
  );
}
