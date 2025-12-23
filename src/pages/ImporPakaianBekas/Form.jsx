/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable array-callback-return */
import { useEffect, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { AddRounded, ClearRounded, QuestionMarkRounded, RemoveRounded } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { authentication } from '../../store/authentication';
import { IntegerFormat, NumberFormat } from '../../components/Format';
import Loading from '../../components/Loading';
import Page from '../../components/Page';
import axios from '../../variable/axios';
import mock from './mock';

export default function FormImporPakaianBekas() {
  const navigate = useNavigate();
  const { user } = useRecoilValue(authentication);

  const [data, setData] = useState(mock);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);

  const handleChange = (e) => {
    const targetName = e.target.name.split('.');
    const name1 = targetName[0];
    const name2 = targetName[1];
    setData({
      ...data,
      [name1]: {
        ...data[name1],
        [name2]: e.target.value,
      },
    });
    setError({
      ...error,
      [`${name1}.${name2}`]: undefined,
    });
  };

  const handleArray = (e, index) => {
    const targetName = e.target.name.split('.');
    const name1 = targetName[0];
    const name2 = targetName[1];
    const name3 = targetName[2];
    let newState = null;
    if (name3 === undefined) {
      newState = data[name1].map((row, key) =>
        index === key
          ? {
              ...row,
              [name2]: e.target.value,
            }
          : row
      );
      setData({
        ...data,
        [name1]: newState,
      });
      setError({
        ...error,
        [`${name1}.${index}.${name2}`]: undefined,
      });
    } else {
      newState = data[name1][name2].map((row, key) =>
        index === key
          ? {
              ...row,
              [name3]: e.target.value,
            }
          : row
      );
      setData({
        ...data,
        [name1]: {
          ...data[name1],
          [name2]: newState,
        },
      });
      setError({
        ...error,
        [`${name1}.${name2}.${index}.${name3}`]: undefined,
      });
    }
  };

  const handleCheckbox = (e, index, value) => {
    let newState = null;
    const targetName = e.target.name.split('.');
    const name1 = targetName[0];
    const name2 = targetName[1];
    const name3 = targetName[2];
    let staging = value.split(',');
    if (!staging.includes(e.target.value)) {
      staging = staging.concat(e.target.value);
    } else {
      staging = staging.filter((row) => row !== e.target.value);
    }
    newState = data[name1][name2].map((row, key) =>
      index === key
        ? {
            ...row,
            [name3]: staging.toString(),
          }
        : row
    );
    setData({
      ...data,
      [name1]: {
        ...data[name1],
        [name2]: newState,
      },
    });
    setError({
      ...error,
      [`${name1}.${name2}.${index}.${name3}`]: undefined,
    });
  };

  const handleAdd = (name) => {
    const targetName = name.split('.');
    const name1 = targetName[0];
    const name2 = targetName[1];
    let obj = null;
    if (name1 === 'total_industry') {
      obj = {
        total: '',
        year: '',
      };
    } else if (name1 === 'unrecorded_import_1') {
      obj = {
        year: '',
        krt: '',
        pdb: '',
        tpt_total: '',
        tpt_china: '',
      };
    } else if (name1 === 'unrecorded_import_2') {
      obj = {
        year: '',
        net_production: '',
        unrecorded_potential: '',
        import_tpt: '',
      };
    } else if (name1 === 'kur_bri_shoe' || name1 === 'kur_bri_clothes' || name1 === 'kur_bri_garmen') {
      obj = {
        year: '',
        total: '',
        deb: '',
      };
    } else if (name1 === 'complaint') {
      if (name2 === 'province') {
        obj = {
          name: '',
          total: '',
        };
      } else if (name2 === 'snippet') {
        obj = {
          title: '',
          total: '',
          sentiment: '',
        };
      }
    }
    let newState = null;
    if (name2 === undefined) {
      newState = data[name1].concat(obj);
      setData({
        ...data,
        [name1]: newState,
      });
    } else {
      newState = data[name1][name2].concat(obj);
      setData({
        ...data,
        [name1]: {
          ...data[name1],
          [name2]: newState,
        },
      });
    }
  };

  const handleDelete = (name, index) => {
    const targetName = name.split('.');
    const name1 = targetName[0];
    const name2 = targetName[1];

    let newState = null;
    if (name2 === undefined) {
      newState = data[name1].filter((row, key) => key !== index);
      setData({
        ...data,
        [name1]: newState,
      });
      // setError({
      //   ...error,
      //   [`${name1}.${index}.${name2}`]: undefined,
      // });
    } else {
      newState = data[name1][name2].filter((row, key) => key !== index);
      setData({
        ...data,
        [name1]: {
          ...data[name1],
          [name2]: newState,
        },
      });
      // setError({
      //   ...error,
      //   [`${name1}.${name2}.${index}.${name3}`]: undefined,
      // });
    }
  };

  const getData = async () => {
    const res = await axios.get(`priority_scale`);
    return res.data.data;
  };

  useEffect(() => {
    if (['superadmin'].includes(user.role)) {
      Promise.all([getData()]).then((res) => {
        //   console.log(res[0]);
        setData(res[0] !== null ? res[0].data : mock);
        setComplete(true);
      });
    } else {
      navigate('/top-isu');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const formData = new FormData();
    formData.append(`role_umkm[total]`, IntegerFormat(data.role_umkm.total));
    formData.append(`role_umkm[year]`, IntegerFormat(data.role_umkm.year));
    data.total_industry.map((value, index) => {
      formData.append(`total_industry[${index}][year]`, IntegerFormat(value.year));
      formData.append(`total_industry[${index}][total]`, IntegerFormat(value.total));
    });
    data.unrecorded_import_1.map((value, index) => {
      formData.append(`unrecorded_import_1[${index}][year]`, IntegerFormat(value.year));
      formData.append(`unrecorded_import_1[${index}][krt]`, IntegerFormat(value.krt));
      formData.append(`unrecorded_import_1[${index}][pdb]`, IntegerFormat(value.pdb));
      formData.append(`unrecorded_import_1[${index}][tpt_total]`, IntegerFormat(value.tpt_total));
      formData.append(`unrecorded_import_1[${index}][tpt_china]`, IntegerFormat(value.tpt_china));
    });
    data.unrecorded_import_2.map((value, index) => {
      formData.append(`unrecorded_import_2[${index}][year]`, IntegerFormat(value.year));
      formData.append(`unrecorded_import_2[${index}][net_production]`, IntegerFormat(value.net_production));
      formData.append(`unrecorded_import_2[${index}][unrecorded_potential]`, IntegerFormat(value.unrecorded_potential));
      formData.append(`unrecorded_import_2[${index}][import_tpt]`, IntegerFormat(value.import_tpt));
    });
    formData.append(`complaint[period]`, data.complaint.period);
    formData.append(`complaint[verified_report]`, IntegerFormat(data.complaint.verified_report));
    formData.append(`complaint[not_verified_report]`, IntegerFormat(data.complaint.not_verified_report));
    formData.append(`complaint[male]`, IntegerFormat(data.complaint.male));
    formData.append(`complaint[female]`, IntegerFormat(data.complaint.female));
    formData.append(`complaint[sd]`, IntegerFormat(data.complaint.sd));
    formData.append(`complaint[smp]`, IntegerFormat(data.complaint.smp));
    formData.append(`complaint[sma]`, IntegerFormat(data.complaint.sma));
    formData.append(`complaint[smk]`, IntegerFormat(data.complaint.smk));
    formData.append(`complaint[d3]`, IntegerFormat(data.complaint.d3));
    formData.append(`complaint[s1]`, IntegerFormat(data.complaint.s1));
    data.complaint.province.map((value, index) => {
      formData.append(`complaint[province][${index}][name]`, value.name);
      formData.append(`complaint[province][${index}][total]`, IntegerFormat(value.total));
    });
    data.complaint.snippet.map((value, index) => {
      formData.append(`complaint[snippet][${index}][title]`, value.title);
      formData.append(`complaint[snippet][${index}][total]`, IntegerFormat(value.total));
      formData.append(`complaint[snippet][${index}][sentiment]`, value.sentiment);
    });
    data.kur_bri_shoe.map((value, index) => {
      formData.append(`kur_bri_shoe[${index}][year]`, IntegerFormat(value.year));
      formData.append(`kur_bri_shoe[${index}][total]`, IntegerFormat(value.total));
      formData.append(`kur_bri_shoe[${index}][deb]`, IntegerFormat(value.deb));
    });
    data.kur_bri_clothes.map((value, index) => {
      formData.append(`kur_bri_clothes[${index}][year]`, IntegerFormat(value.year));
      formData.append(`kur_bri_clothes[${index}][total]`, IntegerFormat(value.total));
      formData.append(`kur_bri_clothes[${index}][deb]`, IntegerFormat(value.deb));
    });
    data.kur_bri_garmen.map((value, index) => {
      formData.append(`kur_bri_garmen[${index}][year]`, IntegerFormat(value.year));
      formData.append(`kur_bri_garmen[${index}][total]`, IntegerFormat(value.total));
      formData.append(`kur_bri_garmen[${index}][deb]`, IntegerFormat(value.deb));
    });
    //  console.clear();
    //  console.log(data);
    //  console.log(...formData);
    await axios
      .post(`priority_scale/upsert`, formData)
      .then(() => {
        navigate('/top-isu');
      })
      .catch((xhr) => {
        //   console.log(xhr.response);
        const err = xhr.response.data.errors;
        if (err) setError(err);
        setLoading(false);
      });
  };

  return (
    <Page title="Input Data Impor Pakaian Bekas">
      <Container maxWidth="xl">
        <Typography variant="h4" mb={4}>
          Input Data Impor Pakaian Bekas
        </Typography>
        {complete ? (
          <Card component="form" onSubmit={handleSubmit}>
            <CardContent>
              <Box>
                <Typography variant="h5" mb={3}>
                  Peran UMKM dalam Industri Pakaian
                </Typography>
                <Grid container spacing={2} mb={1}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <FormLabel sx={{ mb: 1 }}>
                        Total bekerja pada Industri Mikro dan Kecil pada pakaian jadi
                      </FormLabel>
                      <TextField
                        type="tel"
                        name="role_umkm.total"
                        value={NumberFormat(data.role_umkm.total)}
                        onChange={handleChange}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">Orang</InputAdornment>,
                        }}
                        error={!!error[`role_umkm.total`]}
                        helperText={error[`role_umkm.total`] !== undefined && mock.err}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <FormLabel sx={{ mb: 1 }}>Tahun</FormLabel>
                      <TextField
                        type="tel"
                        name="role_umkm.year"
                        value={data.role_umkm.year}
                        onChange={handleChange}
                        error={!!error[`role_umkm.year`]}
                        helperText={error[`role_umkm.year`] !== undefined && mock.err}
                      />
                    </FormControl>
                  </Grid>
                </Grid>
                <FormControl margin="normal" fullWidth>
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom align="center">
                    Jumlah Industri Mikro dan Kecil pada Sektor Pakaian Jadi dalam Unit Usaha
                  </Typography>
                  {data.total_industry.map((value, index) => (
                    <Box mb={2} key={index}>
                      <Grid container>
                        <Grid item xs>
                          <Divider sx={{ border: '1px dashed #eee', width: '100%', my: 2.3 }} />
                        </Grid>
                        {data.total_industry.length > 1 && (
                          <Grid item xs={1} textAlign="right">
                            <IconButton onClick={() => handleDelete('total_industry', index)}>
                              <ClearRounded />
                            </IconButton>
                          </Grid>
                        )}
                      </Grid>
                      <FormControl margin="normal" fullWidth>
                        <FormLabel sx={{ mb: 1 }}>Tahun</FormLabel>
                        <TextField
                          type="tel"
                          name="total_industry.year"
                          value={value.year}
                          onChange={(e) => handleArray(e, index)}
                          error={!!error[`total_industry.${index}.year`]}
                          helperText={error[`total_industry.${index}.year`] !== undefined && mock.err}
                        />
                      </FormControl>
                      <FormControl margin="normal" fullWidth>
                        <FormLabel sx={{ mb: 1 }}>Total</FormLabel>
                        <TextField
                          type="tel"
                          name="total_industry.total"
                          value={NumberFormat(value.total)}
                          onChange={(e) => handleArray(e, index)}
                          error={!!error[`total_industry.${index}.total`]}
                          helperText={error[`total_industry.${index}.total`] !== undefined && mock.err}
                        />
                      </FormControl>
                    </Box>
                  ))}
                  <FormControl margin="normal" fullWidth>
                    <Button
                      size="large"
                      variant="outlined"
                      startIcon={<AddRounded />}
                      onClick={() => handleAdd('total_industry')}
                    >
                      Tambah
                    </Button>
                  </FormControl>
                </FormControl>
              </Box>
              <Box mt={6}>
                <Typography variant="h5" mb={3}>
                  Besarnya Unrecorded Impor Pakaian
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom align="center">
                      Konsumsi Rumah Tangga (TPT, Kulit, Alas Kaki), PDB ADBH menurut Lapangan Usaha, Impor TPT Total
                      dan Impor TPT China dalam Triliun Rupiah
                    </Typography>
                    {data.unrecorded_import_1.map((value, index) => (
                      <Box mt={2} key={index}>
                        <Grid container>
                          <Grid item xs>
                            <Divider sx={{ border: '1px dashed #eee', width: '100%', my: 2.3 }} />
                          </Grid>
                          {data.unrecorded_import_1.length > 1 && (
                            <Grid item xs={1} textAlign="right">
                              <IconButton onClick={() => handleDelete('unrecorded_import_1', index)}>
                                <ClearRounded />
                              </IconButton>
                            </Grid>
                          )}
                        </Grid>
                        <FormControl margin="normal" fullWidth>
                          <FormLabel sx={{ mb: 1 }}>Tahun</FormLabel>
                          <TextField
                            type="tel"
                            name="unrecorded_import_1.year"
                            value={value.year}
                            onChange={(e) => handleArray(e, index)}
                            error={!!error[`unrecorded_import_1.${index}.year`]}
                            helperText={error[`unrecorded_import_1.${index}.year`] !== undefined && mock.err}
                          />
                        </FormControl>
                        <FormControl margin="normal" fullWidth>
                          <FormLabel sx={{ mb: 1 }}>Konsumsi Rumah Tangga (TPT, Kulit, Alas Kaki)</FormLabel>
                          <TextField
                            type="tel"
                            name="unrecorded_import_1.krt"
                            value={NumberFormat(value.krt)}
                            onChange={(e) => handleArray(e, index)}
                            error={!!error[`unrecorded_import_1.${index}.krt`]}
                            helperText={error[`unrecorded_import_1.${index}.krt`] !== undefined && mock.err}
                          />
                        </FormControl>
                        <FormControl margin="normal" fullWidth>
                          <FormLabel sx={{ mb: 1 }}>PDB ADBH menurut Lapangan Usaha</FormLabel>
                          <TextField
                            type="tel"
                            name="unrecorded_import_1.pdb"
                            value={NumberFormat(value.pdb)}
                            onChange={(e) => handleArray(e, index)}
                            error={!!error[`unrecorded_import_1.${index}.pdb`]}
                            helperText={error[`unrecorded_import_1.${index}.pdb`] !== undefined && mock.err}
                          />
                        </FormControl>
                        <FormControl margin="normal" fullWidth>
                          <FormLabel sx={{ mb: 1 }}>Impor TPT Total (Triliun Rupiah)</FormLabel>
                          <TextField
                            type="tel"
                            name="unrecorded_import_1.tpt_total"
                            value={NumberFormat(value.tpt_total)}
                            onChange={(e) => handleArray(e, index)}
                            error={!!error[`unrecorded_import_1.${index}.tpt_total`]}
                            helperText={error[`unrecorded_import_1.${index}.tpt_total`] !== undefined && mock.err}
                          />
                        </FormControl>
                        <FormControl margin="normal" fullWidth>
                          <FormLabel sx={{ mb: 1 }}>Impor TPT China (Triliun Rupiah)</FormLabel>
                          <TextField
                            type="tel"
                            name="unrecorded_import_1.tpt_china"
                            value={NumberFormat(value.tpt_china)}
                            onChange={(e) => handleArray(e, index)}
                            error={!!error[`unrecorded_import_1.${index}.tpt_china`]}
                            helperText={error[`unrecorded_import_1.${index}.tpt_china`] !== undefined && mock.err}
                          />
                        </FormControl>
                      </Box>
                    ))}
                    <FormControl margin="normal" fullWidth>
                      <Button
                        size="large"
                        variant="outlined"
                        startIcon={<AddRounded />}
                        onClick={() => handleAdd('unrecorded_import_1')}
                      >
                        Tambah
                      </Button>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom align="center">
                      Distribusi Net Produksi (PDB ADHB Lapangan Usaha - Ekspor TPT), Nilai Impor TPT (Triliun Rupiah)
                      dan Potensi Unrecorded/barang tidak tercatat pada TPT
                    </Typography>
                    {data.unrecorded_import_2.map((value, index) => (
                      <Box mt={2} key={index}>
                        <Grid container>
                          <Grid item xs>
                            <Divider sx={{ border: '1px dashed #eee', width: '100%', my: 2.3 }} />
                          </Grid>
                          {data.unrecorded_import_2.length > 1 && (
                            <Grid item xs={1} textAlign="right">
                              <IconButton onClick={() => handleDelete('unrecorded_import_2', index)}>
                                <ClearRounded />
                              </IconButton>
                            </Grid>
                          )}
                        </Grid>
                        <FormControl margin="normal" fullWidth>
                          <FormLabel sx={{ mb: 1 }}>Tahun</FormLabel>
                          <TextField
                            type="tel"
                            name="unrecorded_import_2.year"
                            value={value.year}
                            onChange={(e) => handleArray(e, index)}
                            error={!!error[`unrecorded_import_2.${index}.year`]}
                            helperText={error[`unrecorded_import_2.${index}.year`] !== undefined && mock.err}
                          />
                        </FormControl>
                        <FormControl margin="normal" fullWidth>
                          <FormLabel sx={{ mb: 1 }}>
                            Potensi Unrecorded/barang tidak tercatat pada TPT (Triliun Rupiah)
                          </FormLabel>
                          <TextField
                            type="tel"
                            name="unrecorded_import_2.unrecorded_potential"
                            value={NumberFormat(value.unrecorded_potential)}
                            onChange={(e) => handleArray(e, index)}
                            error={!!error[`unrecorded_import_2.${index}.unrecorded_potential`]}
                            helperText={
                              error[`unrecorded_import_2.${index}.unrecorded_potential`] !== undefined && mock.err
                            }
                          />
                        </FormControl>
                        <FormControl margin="normal" fullWidth>
                          <FormLabel sx={{ mb: 1 }}>Nilai Impor TPT (Triliun Rupiah)</FormLabel>
                          <TextField
                            type="tel"
                            name="unrecorded_import_2.import_tpt"
                            value={NumberFormat(value.import_tpt)}
                            onChange={(e) => handleArray(e, index)}
                            error={!!error[`unrecorded_import_2.${index}.import_tpt`]}
                            helperText={error[`unrecorded_import_2.${index}.import_tpt`] !== undefined && mock.err}
                          />
                        </FormControl>
                        <FormControl margin="normal" fullWidth>
                          <FormLabel sx={{ mb: 1 }}>Net Produksi (PDB ADHB Lapangan Usaha - Ekspor TPT)</FormLabel>
                          <TextField
                            type="tel"
                            name="unrecorded_import_2.net_production"
                            value={NumberFormat(value.net_production)}
                            onChange={(e) => handleArray(e, index)}
                            error={!!error[`unrecorded_import_2.${index}.net_production`]}
                            helperText={error[`unrecorded_import_2.${index}.net_production`] !== undefined && mock.err}
                          />
                        </FormControl>
                      </Box>
                    ))}
                    <FormControl margin="normal" fullWidth>
                      <Button
                        size="large"
                        variant="outlined"
                        startIcon={<AddRounded />}
                        onClick={() => handleAdd('unrecorded_import_2')}
                      >
                        Tambah
                      </Button>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>
              <Box mt={6}>
                <Typography variant="h5" mb={3}>
                  Ikhtisar Rekapitulasi
                </Typography>
                <FormControl margin="normal" fullWidth>
                  <FormLabel sx={{ mb: 1 }}>Periode</FormLabel>
                  <TextField
                    name="complaint.period"
                    value={data.complaint.period}
                    onChange={handleChange}
                    error={!!error[`complaint.period`]}
                    helperText={error[`complaint.period`] !== undefined && mock.err}
                  />
                </FormControl>
                <Grid container spacing={3} mt={0} mb={1}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <FormLabel sx={{ mb: 1 }}>Laporan Terverifikasi</FormLabel>
                      <TextField
                        type="tel"
                        name="complaint.verified_report"
                        value={NumberFormat(data.complaint.verified_report)}
                        onChange={handleChange}
                        error={!!error[`complaint.verified_report`]}
                        helperText={error[`complaint.verified_report`] !== undefined && mock.err}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <FormLabel sx={{ mb: 1 }}>Laporan Tidak Terverifikasi</FormLabel>
                      <TextField
                        type="tel"
                        name="complaint.not_verified_report"
                        value={NumberFormat(data.complaint.not_verified_report)}
                        onChange={handleChange}
                        error={!!error[`complaint.not_verified_report`]}
                        helperText={error[`complaint.not_verified_report`] !== undefined && mock.err}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <FormLabel sx={{ mb: 1 }}>Laki-Laki</FormLabel>
                      <TextField
                        type="tel"
                        name="complaint.male"
                        value={NumberFormat(data.complaint.male)}
                        onChange={handleChange}
                        error={!!error[`complaint.male`]}
                        helperText={error[`complaint.male`] !== undefined && mock.err}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <FormLabel sx={{ mb: 1 }}>Perempuan</FormLabel>
                      <TextField
                        type="tel"
                        name="complaint.female"
                        value={NumberFormat(data.complaint.female)}
                        onChange={handleChange}
                        error={!!error[`complaint.female`]}
                        helperText={error[`complaint.female`] !== undefined && mock.err}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={6} md={4} lg={2}>
                    <FormControl fullWidth>
                      <FormLabel sx={{ mb: 1 }}>SD</FormLabel>
                      <TextField
                        type="tel"
                        name="complaint.sd"
                        value={NumberFormat(data.complaint.sd)}
                        onChange={handleChange}
                        error={!!error[`complaint.sd`]}
                        helperText={error[`complaint.sd`] !== undefined && mock.err}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={6} md={4} lg={2}>
                    <FormControl fullWidth>
                      <FormLabel sx={{ mb: 1 }}>SMP</FormLabel>
                      <TextField
                        type="tel"
                        name="complaint.smp"
                        value={NumberFormat(data.complaint.smp)}
                        onChange={handleChange}
                        error={!!error[`complaint.smp`]}
                        helperText={error[`complaint.smp`] !== undefined && mock.err}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={6} md={4} lg={2}>
                    <FormControl fullWidth>
                      <FormLabel sx={{ mb: 1 }}>SMA</FormLabel>
                      <TextField
                        type="tel"
                        name="complaint.sma"
                        value={NumberFormat(data.complaint.sma)}
                        onChange={handleChange}
                        error={!!error[`complaint.sma`]}
                        helperText={error[`complaint.sma`] !== undefined && mock.err}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={6} md={4} lg={2}>
                    <FormControl fullWidth>
                      <FormLabel sx={{ mb: 1 }}>SMK</FormLabel>
                      <TextField
                        type="tel"
                        name="complaint.smk"
                        value={NumberFormat(data.complaint.smk)}
                        onChange={handleChange}
                        error={!!error[`complaint.smk`]}
                        helperText={error[`complaint.smk`] !== undefined && mock.err}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={6} md={4} lg={2}>
                    <FormControl fullWidth>
                      <FormLabel sx={{ mb: 1 }}>D3</FormLabel>
                      <TextField
                        type="tel"
                        name="complaint.d3"
                        value={NumberFormat(data.complaint.d3)}
                        onChange={handleChange}
                        error={!!error[`complaint.d3`]}
                        helperText={error[`complaint.d3`] !== undefined && mock.err}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={6} md={4} lg={2}>
                    <FormControl fullWidth>
                      <FormLabel sx={{ mb: 1 }}>S1</FormLabel>
                      <TextField
                        type="tel"
                        name="complaint.s1"
                        value={NumberFormat(data.complaint.s1)}
                        onChange={handleChange}
                        error={!!error[`complaint.s1`]}
                        helperText={error[`complaint.s1`] !== undefined && mock.err}
                      />
                    </FormControl>
                  </Grid>
                </Grid>
                <Grid container spacing={3} mt={0}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom align="center">
                      Provinsi
                    </Typography>
                    {data.complaint.province.map((value, index) => (
                      <Box mt={2} key={index}>
                        <Grid container>
                          <Grid item xs>
                            <Divider sx={{ border: '1px dashed #eee', width: '100%', my: 2.3 }} />
                          </Grid>
                          {data.complaint.province.length > 1 && (
                            <Grid item xs={1} textAlign="right">
                              <IconButton onClick={() => handleDelete('complaint.province', index)}>
                                <ClearRounded />
                              </IconButton>
                            </Grid>
                          )}
                        </Grid>
                        <FormControl margin="normal" fullWidth>
                          <FormLabel sx={{ mb: 1 }}>Provinsi</FormLabel>
                          <TextField
                            name="complaint.province.name"
                            value={value.name}
                            onChange={(e) => handleArray(e, index)}
                            error={!!error[`complaint.province.${index}.name`]}
                            helperText={error[`complaint.province.${index}.name`] !== undefined && mock.err}
                            select
                          >
                            {mock.province.map((value, index) => (
                              <MenuItem value={value.name} key={index}>
                                {value.name}
                              </MenuItem>
                            ))}
                          </TextField>
                        </FormControl>
                        <FormControl margin="normal" fullWidth>
                          <FormLabel sx={{ mb: 1 }}>Jumlah</FormLabel>
                          <TextField
                            type="tel"
                            name="complaint.province.total"
                            value={NumberFormat(value.total)}
                            onChange={(e) => handleArray(e, index)}
                            error={!!error[`complaint.province.${index}.total`]}
                            helperText={error[`complaint.province.${index}.total`] !== undefined && mock.err}
                          />
                        </FormControl>
                      </Box>
                    ))}
                    <FormControl margin="normal" fullWidth>
                      <Button
                        size="large"
                        variant="outlined"
                        startIcon={<AddRounded />}
                        onClick={() => handleAdd('complaint.province')}
                      >
                        Tambah
                      </Button>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom align="center">
                      Cuplikan Isi Laporan
                    </Typography>
                    {data.complaint.snippet.map((value, index) => (
                      <Box mt={2} key={index}>
                        <Grid container>
                          <Grid item xs>
                            <Divider sx={{ border: '1px dashed #eee', width: '100%', my: 2.3 }} />
                          </Grid>
                          {data.complaint.snippet.length > 1 && (
                            <Grid item xs={1} textAlign="right">
                              <IconButton onClick={() => handleDelete('complaint.snippet', index)}>
                                <ClearRounded />
                              </IconButton>
                            </Grid>
                          )}
                        </Grid>
                        <FormControl margin="normal" fullWidth>
                          <FormLabel sx={{ mb: 1 }}>Laporan</FormLabel>
                          <TextField
                            name="complaint.snippet.title"
                            value={value.title}
                            onChange={(e) => handleArray(e, index)}
                            error={!!error[`complaint.snippet.${index}.title`]}
                            helperText={error[`complaint.snippet.${index}.title`] !== undefined && mock.err}
                          />
                        </FormControl>
                        <FormControl margin="normal" fullWidth>
                          <FormLabel sx={{ mb: 1 }}>Jumlah</FormLabel>
                          <TextField
                            type="tel"
                            name="complaint.snippet.total"
                            value={NumberFormat(value.total)}
                            onChange={(e) => handleArray(e, index)}
                            error={!!error[`complaint.snippet.${index}.total`]}
                            helperText={error[`complaint.snippet.${index}.total`] !== undefined && mock.err}
                          />
                        </FormControl>
                        <FormControl margin="normal" fullWidth>
                          <FormLabel sx={{ mb: 1 }}>Sentimen</FormLabel>
                          <FormGroup>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  name="complaint.snippet.sentiment"
                                  value="1"
                                  checked={!!value.sentiment.split(',').includes('1')}
                                />
                              }
                              onChange={(e) => handleCheckbox(e, index, value.sentiment)}
                              label={
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <Avatar sx={{ width: 20, height: 20, bgcolor: 'primary.main' }}>
                                    <AddRounded fontSize="small" />
                                  </Avatar>
                                  <Typography>Dukungan dan siap jadi bagian solusi</Typography>
                                </Stack>
                              }
                            />
                            <FormControlLabel
                              control={
                                <Checkbox
                                  name="complaint.snippet.sentiment"
                                  value="2"
                                  checked={!!value.sentiment.split(',').includes('2')}
                                />
                              }
                              onChange={(e) => handleCheckbox(e, index, value.sentiment)}
                              label={
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <Avatar sx={{ width: 20, height: 20, bgcolor: 'warning.main' }}>
                                    <RemoveRounded fontSize="small" />
                                  </Avatar>
                                  <Typography>Menyayangkan</Typography>
                                </Stack>
                              }
                            />
                            <FormControlLabel
                              control={
                                <Checkbox
                                  name="complaint.snippet.sentiment"
                                  value="3"
                                  checked={!!value.sentiment.split(',').includes('3')}
                                />
                              }
                              onChange={(e) => handleCheckbox(e, index, value.sentiment)}
                              label={
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <Avatar sx={{ width: 20, height: 20, bgcolor: 'text.secondary' }}>
                                    <QuestionMarkRounded fontSize="small" />
                                  </Avatar>
                                  <Typography>Membutuhkan solusi</Typography>
                                </Stack>
                              }
                            />
                          </FormGroup>
                        </FormControl>
                        {!!error[`complaint.snippet.${index}.sentiment`] && (
                          <FormHelperText error>{mock.err}</FormHelperText>
                        )}
                      </Box>
                    ))}
                    <FormControl margin="normal" fullWidth>
                      <Button
                        size="large"
                        variant="outlined"
                        startIcon={<AddRounded />}
                        onClick={() => handleAdd('complaint.snippet')}
                      >
                        Tambah
                      </Button>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>
              <Box mt={6}>
                <Typography variant="h5" mb={3}>
                  Keberpihakan Pemerintah melalui Pembiayaan KUR pada Pelaku UMKM Sub Sektor Pakaian dan Alas Kaki
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle1" color="text.secondary">
                      Penyaluran KUR BRI Subsekon Sepatu/Alas Kaki
                    </Typography>
                    {data.kur_bri_shoe.map((value, index) => (
                      <Box mt={2} key={index}>
                        <Grid container>
                          <Grid item xs>
                            <Divider sx={{ border: '1px dashed #eee', width: '100%', my: 2.3 }} />
                          </Grid>
                          {data.kur_bri_shoe.length > 1 && (
                            <Grid item xs={1} textAlign="right">
                              <IconButton onClick={() => handleDelete('kur_bri_shoe', index)}>
                                <ClearRounded />
                              </IconButton>
                            </Grid>
                          )}
                        </Grid>
                        <FormControl margin="normal" fullWidth>
                          <FormLabel sx={{ mb: 1 }}>Tahun</FormLabel>
                          <TextField
                            type="tel"
                            name="kur_bri_shoe.year"
                            value={value.year}
                            onChange={(e) => handleArray(e, index)}
                            error={!!error[`kur_bri_shoe.${index}.year`]}
                            helperText={error[`kur_bri_shoe.${index}.year`] !== undefined && mock.err}
                          />
                        </FormControl>
                        <FormControl margin="normal" fullWidth>
                          <FormLabel sx={{ mb: 1 }}>Total</FormLabel>
                          <TextField
                            type="tel"
                            name="kur_bri_shoe.total"
                            value={NumberFormat(value.total)}
                            onChange={(e) => handleArray(e, index)}
                            error={!!error[`kur_bri_shoe.${index}.total`]}
                            helperText={error[`kur_bri_shoe.${index}.total`] !== undefined && mock.err}
                          />
                        </FormControl>
                        <FormControl margin="normal" fullWidth>
                          <FormLabel sx={{ mb: 1 }}>Deb</FormLabel>
                          <TextField
                            type="tel"
                            name="kur_bri_shoe.deb"
                            value={NumberFormat(value.deb)}
                            onChange={(e) => handleArray(e, index)}
                            error={!!error[`kur_bri_shoe.${index}.deb`]}
                            helperText={error[`kur_bri_shoe.${index}.deb`] !== undefined && mock.err}
                          />
                        </FormControl>
                      </Box>
                    ))}
                    <FormControl margin="normal" fullWidth>
                      <Button
                        size="large"
                        variant="outlined"
                        startIcon={<AddRounded />}
                        onClick={() => handleAdd('kur_bri_shoe')}
                      >
                        Tambah
                      </Button>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle1" color="text.secondary">
                      Penyaluran KUR BRI Subsekon Pakaian dan Alas Kaki
                    </Typography>
                    {data.kur_bri_clothes.map((value, index) => (
                      <Box mt={2} key={index}>
                        <Grid container>
                          <Grid item xs>
                            <Divider sx={{ border: '1px dashed #eee', width: '100%', my: 2.3 }} />
                          </Grid>
                          {data.kur_bri_clothes.length > 1 && (
                            <Grid item xs={1} textAlign="right">
                              <IconButton onClick={() => handleDelete('kur_bri_clothes', index)}>
                                <ClearRounded />
                              </IconButton>
                            </Grid>
                          )}
                        </Grid>
                        <FormControl margin="normal" fullWidth>
                          <FormLabel sx={{ mb: 1 }}>Tahun</FormLabel>
                          <TextField
                            type="tel"
                            name="kur_bri_clothes.year"
                            value={value.year}
                            onChange={(e) => handleArray(e, index)}
                            error={!!error[`kur_bri_clothes.${index}.year`]}
                            helperText={error[`kur_bri_clothes.${index}.year`] !== undefined && mock.err}
                          />
                        </FormControl>
                        <FormControl margin="normal" fullWidth>
                          <FormLabel sx={{ mb: 1 }}>Total</FormLabel>
                          <TextField
                            type="tel"
                            name="kur_bri_clothes.total"
                            value={NumberFormat(value.total)}
                            onChange={(e) => handleArray(e, index)}
                            error={!!error[`kur_bri_clothes.${index}.total`]}
                            helperText={error[`kur_bri_clothes.${index}.total`] !== undefined && mock.err}
                          />
                        </FormControl>
                        <FormControl margin="normal" fullWidth>
                          <FormLabel sx={{ mb: 1 }}>Deb</FormLabel>
                          <TextField
                            type="tel"
                            name="kur_bri_clothes.deb"
                            value={NumberFormat(value.deb)}
                            onChange={(e) => handleArray(e, index)}
                            error={!!error[`kur_bri_clothes.${index}.deb`]}
                            helperText={error[`kur_bri_clothes.${index}.deb`] !== undefined && mock.err}
                          />
                        </FormControl>
                      </Box>
                    ))}
                    <FormControl margin="normal" fullWidth>
                      <Button
                        size="large"
                        variant="outlined"
                        startIcon={<AddRounded />}
                        onClick={() => handleAdd('kur_bri_clothes')}
                      >
                        Tambah
                      </Button>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle1" color="text.secondary">
                      Penyaluran KUR BRI Subsekon Garmen/Pakaian
                    </Typography>
                    {data.kur_bri_garmen.map((value, index) => (
                      <Box mt={2} key={index}>
                        <Grid container>
                          <Grid item xs>
                            <Divider sx={{ border: '1px dashed #eee', width: '100%', my: 2.3 }} />
                          </Grid>
                          {data.kur_bri_garmen.length > 1 && (
                            <Grid item xs={1} textAlign="right">
                              <IconButton onClick={() => handleDelete('kur_bri_garmen', index)}>
                                <ClearRounded />
                              </IconButton>
                            </Grid>
                          )}
                        </Grid>
                        <FormControl margin="normal" fullWidth>
                          <FormLabel sx={{ mb: 1 }}>Tahun</FormLabel>
                          <TextField
                            type="tel"
                            name="kur_bri_garmen.year"
                            value={value.year}
                            onChange={(e) => handleArray(e, index)}
                            error={!!error[`kur_bri_garmen.${index}.year`]}
                            helperText={error[`kur_bri_garmen.${index}.year`] !== undefined && mock.err}
                          />
                        </FormControl>
                        <FormControl margin="normal" fullWidth>
                          <FormLabel sx={{ mb: 1 }}>Total</FormLabel>
                          <TextField
                            type="tel"
                            name="kur_bri_garmen.total"
                            value={NumberFormat(value.total)}
                            onChange={(e) => handleArray(e, index)}
                            error={!!error[`kur_bri_garmen.${index}.total`]}
                            helperText={error[`kur_bri_garmen.${index}.total`] !== undefined && mock.err}
                          />
                        </FormControl>
                        <FormControl margin="normal" fullWidth>
                          <FormLabel sx={{ mb: 1 }}>Deb</FormLabel>
                          <TextField
                            type="tel"
                            name="kur_bri_garmen.deb"
                            value={NumberFormat(value.deb)}
                            onChange={(e) => handleArray(e, index)}
                            error={!!error[`kur_bri_garmen.${index}.deb`]}
                            helperText={error[`kur_bri_garmen.${index}.deb`] !== undefined && mock.err}
                          />
                        </FormControl>
                      </Box>
                    ))}
                    <FormControl margin="normal" fullWidth>
                      <Button
                        size="large"
                        variant="outlined"
                        startIcon={<AddRounded />}
                        onClick={() => handleAdd('kur_bri_garmen')}
                      >
                        Tambah
                      </Button>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>
              <Box mt={3}>
                <FormControl margin="normal">
                  <LoadingButton type="submit" size="large" variant="contained" loading={loading}>
                    Submit
                  </LoadingButton>
                </FormControl>
              </Box>
            </CardContent>
          </Card>
        ) : (
          <Loading />
        )}
      </Container>
    </Page>
  );
}
