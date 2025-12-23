/* eslint-disable array-callback-return */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { Card, CardContent, Container, FormControl, MenuItem, TextField, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Page from '../../components/Page';
import Loading from '../../components/Loading';
import Validate from '../../components/Validate';
import { IntegerFormat, NumberFormat } from '../../components/Format';

const mock = {
  category_id: '',
  data_source_id: '',
  non_jkn: '',
  jkn: '',
  active_jkn: '',
  not_active_jkn: '',
};

export default function Form(props) {
  const { type } = { ...props };
  const navigate = useNavigate();
  const { id } = useParams();

  const [rows, setRows] = useState();
  const [data, setData] = useState(mock);
  const [error, setError] = useState('');
  const [isFetch, setFetch] = useState(false);
  const [loading, setLoading] = useState(false);

  const getCategory = async () => {
    const res = await axios.get(`param/padanan_data_category`);
    return res.data.data;
  };
  const getDataSource = async () => {
    const res = await axios.get(`param/padanan_data_source`);
    return res.data.data;
  };
  const getData = async () => {
    const res = await axios.get(`padanan_data/${id}`);
    const value = res.data.data;
    value.category_id = value.category.id;
    value.data_source_id = value.data_source.id;
    value.non_jkn = value.non_jkn !== null ? NumberFormat(value.non_jkn) : '';
    value.jkn = value.jkn !== null ? NumberFormat(value.jkn) : '';
    value.active_jkn = value.active_jkn !== null ? NumberFormat(value.active_jkn) : '';
    value.not_active_jkn = value.not_active_jkn !== null ? NumberFormat(value.not_active_jkn) : '';
    return res.data.data;
  };

  useEffect(() => {
    Promise.all([type === 'edit' && getData(), getCategory(), getDataSource()]).then((res) => {
      if (type === 'edit') setData(res[0]);
      setRows({
        category: res[1],
        data_source: res[2],
      });
      setFetch(true);
    });
  }, []);

  const handleChange = (e) => {
    if (e.target.type === 'tel') {
      setData({
        ...data,
        [e.target.name]: NumberFormat(e.target.value),
      });
    } else {
      setData({
        ...data,
        [e.target.name]: e.target.value,
      });
    }
    setError({
      ...error,
      [e.target.name]: undefined,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const formData = new FormData(e.target);
    if (type === 'edit') formData.append('_method', 'PUT');
    formData.append('non_jkn', IntegerFormat(data.non_jkn));
    formData.append('jkn', IntegerFormat(data.jkn));
    formData.append('active_jkn', IntegerFormat(data.active_jkn));
    formData.append('not_active_jkn', IntegerFormat(data.not_active_jkn));
    axios
      .post(type === 'create' ? `padanan_data` : `padanan_data/${id}`, formData)
      .then(() => {
        navigate('/bpjs-kesehatan');
      })
      .catch((xhr) => {
        if (xhr.response.data.errors) {
          setError(xhr.response.data.errors);
        }
        setLoading(false);
      });
  };

  return (
    <Page title={`${type === 'create' ? 'Tambah' : 'Ubah'} Data`}>
      <Container maxWidth="xl">
        <Typography variant="h4" gutterBottom>
          {type === 'create' ? 'Tambah' : 'Ubah'} Data
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Integrasi KemenkopUKM dan BPJS Kesehatan
        </Typography>
        {isFetch ? (
          <Card>
            <CardContent component="form" onSubmit={handleSubmit} noValidate>
              <FormControl margin="normal" fullWidth>
                <TextField
                  name="segment"
                  label="Segmen"
                  defaultValue={data.segment}
                  error={!!error.segment}
                  helperText={!!error.segment && Validate(error.segment[0])}
                  autoFocus={type === 'create'}
                  required
                />
              </FormControl>
              <FormControl margin="normal" fullWidth>
                <TextField
                  name="category_id"
                  label="Kategori"
                  defaultValue=""
                  value={data.category_id}
                  error={!!error.category_id}
                  helperText={!!error.category_id && 'Pilih kategori.'}
                  onChange={handleChange}
                  required
                  select
                >
                  {rows.category.map((value, index) => (
                    <MenuItem value={value.id} key={index}>
                      {value.param}
                    </MenuItem>
                  ))}
                </TextField>
              </FormControl>
              <FormControl margin="normal" fullWidth>
                <TextField
                  name="data_source_id"
                  label="Sumber Data"
                  defaultValue=""
                  value={data.data_source_id}
                  error={!!error.data_source_id}
                  helperText={!!error.data_source_id && 'Pilih sumber data.'}
                  onChange={handleChange}
                  required
                  select
                >
                  {rows.data_source.map((value, index) => (
                    <MenuItem value={value.id} key={index}>
                      {value.param}
                    </MenuItem>
                  ))}
                </TextField>
              </FormControl>
              <FormControl margin="normal" fullWidth>
                <TextField
                  type="tel"
                  name="non_jkn"
                  label="Tidak Padan (Non JKN)"
                  value={data.non_jkn}
                  onChange={handleChange}
                  error={!!error.non_jkn}
                  helperText={!!error.non_jkn && 'Masukkan tidak padan (non JKN).'}
                />
              </FormControl>
              <FormControl margin="normal" fullWidth>
                <TextField
                  type="tel"
                  name="jkn"
                  label="Padan (Terdaftar JKN)"
                  value={data.jkn}
                  onChange={handleChange}
                  error={!!error.jkn}
                  helperText={!!error.jkn && 'Masukkan padan (terdaftar JKN).'}
                />
              </FormControl>
              {rows.category.filter((value) => value.id === data.category_id)[0]?.param !== 'Entitas' && (
                <>
                  <FormControl margin="normal" fullWidth>
                    <TextField
                      type="tel"
                      name="active_jkn"
                      label="Peserta Aktif JKN"
                      value={data.active_jkn}
                      onChange={handleChange}
                      error={!!error.active_jkn}
                      helperText={!!error.active_jkn && 'Masukkan peserta aktif JKN.'}
                    />
                  </FormControl>
                  <FormControl margin="normal" fullWidth>
                    <TextField
                      type="tel"
                      name="not_active_jkn"
                      label="Peserta Non Aktif JKN"
                      value={data.not_active_jkn}
                      onChange={handleChange}
                      error={!!error.not_active_jkn}
                      helperText={!!error.not_active_jkn && 'Masukkan peserta non aktif JKN.'}
                    />
                  </FormControl>
                </>
              )}
              <FormControl margin="normal">
                <LoadingButton type="submit" size="large" variant="contained" loading={loading}>
                  Submit
                </LoadingButton>
              </FormControl>
            </CardContent>
          </Card>
        ) : (
          <Loading />
        )}
      </Container>
    </Page>
  );
}
