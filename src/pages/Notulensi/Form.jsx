import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Collapse,
  Container,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { MobileDateTimePicker } from '@mui/x-date-pickers';
import {
  AddRounded,
  InsertDriveFileRounded,
  ClearRounded,
  FileUploadOutlined,
  ExpandLessRounded,
  ExpandMoreRounded,
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import Page from '../../components/Page';
import axios from '../../variable/axios';
import Loading from '../../components/Loading';
import { NumberFormat } from '../../components/Format';

export default function FormNotulensi(props) {
  const { id } = { ...props };
  const navigate = useNavigate();

  const [complete, setComplete] = useState(false);
  const [rows, setRows] = useState();
  const [data, setData] = useState({
    title: '',
    name: '',
    institution: '',
    date: null,
    content: '',
    instruction: '',
    participant: [],
    additional_participant: [],
    material_preparation: [],
    files: [],
    document_notulensi: [],
    unit_id: [],
    note_follow_up: [],
  });

  const getNote = async () => {
    const res = await axios.get(`note/${id}`);
    return res.data.data;
  };
  const getParticipant = async () => {
    const res = await axios.get(`param/participant`);
    return res.data.data;
  };
  const getMaterialPreparation = async () => {
    const res = await axios.get(`param/participant?type=material_preparation`);
    return res.data.data;
  };
  const getUnit = async () => {
    const res = await axios.get(`param/note_unit`);
    return res.data.data;
  };

  useEffect(() => {
    Promise.all([id !== undefined && getNote(), getParticipant(), getMaterialPreparation(), getUnit()]).then((res) => {
      const grouping = (arr) => {
        const newState = arr
          .map((row) => ({
            group: row.group,
            participant: arr.filter((value) => value.group === row.group),
          }))
          .filter((v, i, a) => a.findIndex((v2) => v2.group === v.group) === i);
        return newState;
      };
      setRows({
        participant: grouping(res[1]),
        material_preparation: grouping(res[2]),
        unit: res[3],
      });
      if (id !== undefined) {
        const value = res[0];
        value.content = value.content !== null ? value.content : '';
        value.instruction = value.instruction !== null ? value.instruction : '';
        const newState = res[1].map((value) => value.name);
        value.additional_participant =
          value.participant !== null ? value.participant.filter((item) => !newState.includes(item)) : [];
        value.participant =
          value.participant !== null ? value.participant.filter((item) => newState.includes(item)) : [];
        value.material_preparation = value.material_preparation !== null ? value.material_preparation : [];
        value.unit_id = value.note_unit.map((v) => v.unit.id);
        value.note_follow_up = value.note_follow_up.reverse();
        //   console.log(value);
        setData(value);
      }
      setComplete(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleParticipant = (type, index, name, value) => {
    let newState = null;
    if (type === 'handle') {
      newState = data.additional_participant.map((row, key) => (index === key ? value : row));
      setError({
        ...error,
        [`participant.${index}`]: undefined,
      });
    } else if (type === 'add') {
      newState = data.additional_participant.concat('');
    } else if (type === 'delete') {
      newState = data.additional_participant.filter((row, key) => key !== index);
      setError({
        ...error,
        [`participant.${index}`]: undefined,
      });
    }
    setData({
      ...data,
      additional_participant: newState,
    });
  };

  const handleFile = (e, type, index) => {
    let newState = null;
    if (type === 'add') {
      if (e.target.files[0] !== undefined) {
        if (e.target.files[0].size <= 5000000) {
          newState = data.files;
          newState.push({ file: e.target.files[0] });
          e.target.value = '';
        }
      }
    } else if (type === 'delete') {
      newState = data.files.filter((row, key) => index !== key);
    }
    setData({
      ...data,
      files: newState,
    });
    setError({
      ...error,
      [`file.${index}.file`]: undefined,
    });
  };

  const handleCheckbox = (e, name) => {
    const filter = data[name].filter((value) => value === e.target.value);
    if (filter.length < 1) {
      setData({
        ...data,
        [name]: [...data[name], e.target.value],
      });
    } else {
      const newState = data[name].filter((value) => value !== e.target.value);
      setData({
        ...data,
        [name]: newState,
      });
    }
    setError({
      ...error,
      [name]: undefined,
    });
  };

  const [collapse, setCollapse] = useState({
    participant: false,
    material_preparation: false,
  });
  const handleCollapse = (name) => {
    setCollapse({
      ...collapse,
      [name]: !collapse[name],
    });
  };

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const formData = new FormData();
    if (data.id) formData.append('_method', 'patch');
    formData.append('title', data.title);
    formData.append('name', data.name);
    formData.append('institution', data.institution);
    if (data.participant.length > 0) {
      // eslint-disable-next-line array-callback-return
      data.participant.map((value, index) => {
        formData.append(`participant[${index}]`, value);
      });
    }
    if (data.additional_participant.length > 0) {
      // eslint-disable-next-line array-callback-return
      data.additional_participant.map((value, index) => {
        formData.append(`participant[${data.participant.length + index}]`, value);
      });
    }
    if (data.material_preparation.length > 0) {
      // eslint-disable-next-line array-callback-return
      data.material_preparation.map((value, index) => {
        formData.append(`material_preparation[${index}]`, value);
      });
    }
    formData.append('date', data.date);
    formData.append('content', data.content);
    formData.append('instruction', data.instruction);
    // eslint-disable-next-line array-callback-return
    data.unit_id.map((value, index) => {
      formData.append(`unit_id[${index}]`, value);
    });
    if (data.files.length > 0) {
      // eslint-disable-next-line array-callback-return
      data.files.map((value, index) => {
        if (value.id !== undefined) {
          formData.append(`file[${index}][id]`, value.id);
        } else {
          formData.append(`file[${index}][file]`, value.file);
        }
      });
    }
    if (data.document_notulensi.length > 0) {
      // eslint-disable-next-line array-callback-return
      data.document_notulensi.map((value, index) => {
        if (value.id !== undefined) {
          formData.append(`document_notulensi[${index}][id]`, value.id);
        } else {
          formData.append(`document_notulensi[${index}][file]`, value.file);
        }
      });
    }
    if (data.note_follow_up.length > 0) {
      // eslint-disable-next-line array-callback-return
      data.note_follow_up.map((value, index) => {
        formData.append(`note_follow_up[${index}][id]`, value.id);
        formData.append(`note_follow_up[${index}][title]`, value.title);
        formData.append(`note_follow_up[${index}][target_date]`, value.target_date);
        formData.append(`note_follow_up[${index}][status]`, value.status);
      });
    }
    //  console.clear();
    //  console.log(data);
    //  console.log(Object.fromEntries(formData));
    axios
      .post(id === undefined ? `note` : `note/${id}`, formData)
      .then((res) => {
        const value = res.data.data;
        //   console.log(value);
        navigate(`/notulensi-rapim/${value.id}`);
      })
      .catch((xhr) => {
        //   console.log(xhr.response);
        const err = xhr.response.data.errors;
        if (err) setError(err);
        setLoading(false);
      });
  };

  return (
    <Page title="Notulensi Rapim">
      <Container maxWidth="xl">
        <Typography variant="h4" mb={3}>
          {id !== undefined ? 'Ubah' : 'Tambah'} Notulensi Rapim
        </Typography>
        {complete ? (
          <Card>
            <CardContent component="form" onSubmit={handleSubmit} noValidate>
              <FormControl margin="normal" fullWidth>
                <TextField
                  name="title"
                  label="Judul"
                  value={data.title}
                  onChange={handleChange}
                  error={!!error.title}
                  helperText={error.title !== undefined && 'Masukkan judul.'}
                  autoFocus={id === undefined}
                  required
                />
              </FormControl>
              <FormControl margin="normal" fullWidth>
                <TextField
                  name="name"
                  label="Pelaksana"
                  value={data.name}
                  onChange={handleChange}
                  error={!!error.name}
                  helperText={error.name !== undefined && 'Masukkan pelaksana.'}
                  required
                />
              </FormControl>
              <FormControl margin="normal" fullWidth>
                <TextField
                  name="institution"
                  label="Lembaga/Tempat Pelaksana"
                  value={data.institution}
                  onChange={handleChange}
                  error={!!error.institution}
                  helperText={error.institution !== undefined && 'Masukkan lembaga/tempat pelaksana.'}
                  required
                />
              </FormControl>
              <FormControl margin="normal" fullWidth>
                <FormLabel onClick={() => handleCollapse('participant')} sx={{ cursor: 'pointer' }}>
                  <Stack direction="row" alignItems="center">
                    <Typography mr={1}>
                      List Peserta{' '}
                      {data.participant.length > 0 || data.additional_participant.length > 0
                        ? `(${data.participant.length + data.additional_participant.length})`
                        : null}
                    </Typography>
                    {collapse.participant ? <ExpandLessRounded /> : <ExpandMoreRounded />}
                  </Stack>
                </FormLabel>
                <Collapse in={collapse.participant}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} lg={6}>
                      {rows.participant.map(
                        (row, key) =>
                          key < rows.participant.length - 1 && (
                            <Box key={key}>
                              <Typography mt={2} fontWeight="bold">
                                {row.group}
                              </Typography>
                              {row.participant.map((value, index) => (
                                <FormControlLabel
                                  key={index}
                                  sx={{ display: 'block' }}
                                  control={
                                    <Checkbox
                                      checked={data.participant.includes(value.name)}
                                      onChange={(e) => handleCheckbox(e, 'participant')}
                                      value={value.name}
                                    />
                                  }
                                  label={value.name}
                                />
                              ))}
                            </Box>
                          )
                      )}
                    </Grid>
                    <Grid item xs={12} md={6}>
                      {rows.participant.map(
                        (row, key) =>
                          key === rows.participant.length - 1 && (
                            <Box key={key}>
                              <Typography mt={2} fontWeight="bold">
                                {row.group}
                              </Typography>
                              {row.participant.map((value, index) => (
                                <FormControlLabel
                                  key={index}
                                  sx={{ display: 'block' }}
                                  control={
                                    <Checkbox
                                      checked={data.participant.includes(value.name)}
                                      onChange={(e) => handleCheckbox(e, 'participant')}
                                      value={value.name}
                                    />
                                  }
                                  label={value.name}
                                />
                              ))}
                            </Box>
                          )
                      )}
                    </Grid>
                  </Grid>
                  {data.additional_participant.map((value, index) => (
                    <Stack direction="row" spacing={2} mt={2} key={index}>
                      <TextField
                        name="name"
                        placeholder="Nama Peserta"
                        value={value}
                        onChange={(e) => handleParticipant('handle', index, e.target.name, e.target.value)}
                        error={!!error[`participant.${index}`]}
                        helperText={error[`participant.${index}`] !== undefined && 'Masukkan nama peserta.'}
                        fullWidth
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => handleParticipant('delete', index)}>
                                <ClearRounded fontSize="small" />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Stack>
                  ))}
                  <Button
                    variant="outlined"
                    sx={{ mt: 2, mb: 1 }}
                    startIcon={<AddRounded />}
                    onClick={() => handleParticipant('add')}
                    fullWidth
                  >
                    Tambah Peserta
                  </Button>
                </Collapse>
              </FormControl>
              <FormControl margin="normal" sx={{ mb: 2 }} fullWidth>
                <FormLabel onClick={() => handleCollapse('material_preparation')} sx={{ cursor: 'pointer' }}>
                  <Stack direction="row" alignItems="center">
                    <Typography mr={1}>
                      Penyiapan Bahan {data.material_preparation.length > 0 && `(${data.material_preparation.length})`}
                    </Typography>
                    {collapse.material_preparation ? <ExpandLessRounded /> : <ExpandMoreRounded />}
                  </Stack>
                </FormLabel>
                <Collapse in={collapse.material_preparation}>
                  {rows.material_preparation.map((row, key) => (
                    <Box key={key}>
                      <Typography mt={2} fontWeight="bold">
                        {row.group}
                      </Typography>
                      {row.participant.map((value, index) => (
                        <FormControlLabel
                          key={index}
                          sx={{ display: 'block' }}
                          control={
                            <Checkbox
                              checked={data.material_preparation.includes(value.name)}
                              onChange={(e) => handleCheckbox(e, 'material_preparation')}
                              value={value.name}
                            />
                          }
                          label={value.name}
                        />
                      ))}
                    </Box>
                  ))}
                </Collapse>
              </FormControl>
              <FormControl margin="normal" fullWidth>
                <MobileDateTimePicker
                  label="Tanggal"
                  inputFormat="dd/MM/yyyy HH:mm"
                  ampm={false}
                  value={data.date}
                  onChange={(newValue) => {
                    setData({ ...data, date: moment(newValue).format('yyyy-MM-DD HH:mm:ss') });
                    setError({ ...error, date: undefined });
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={!!error.date}
                      helperText={error.date !== undefined && 'Pilih tanggal.'}
                      required
                    />
                  )}
                />
              </FormControl>
              <FormControl margin="normal" fullWidth>
                <TextField
                  name="content"
                  label="Isi"
                  value={data.content}
                  onChange={handleChange}
                  error={!!error.content}
                  helperText={error.content !== undefined && 'Masukkan isi.'}
                  multiline
                  // rows={4}
                />
              </FormControl>
              <FormControl margin="normal" fullWidth>
                <TextField
                  name="instruction"
                  label="Arahan Menteri"
                  value={data.instruction}
                  onChange={handleChange}
                  error={!!error.instruction}
                  helperText={error.instruction !== undefined && 'Masukkan arahan menteri.'}
                  multiline
                  // rows={4}
                />
              </FormControl>
              <FormControl margin="normal" fullWidth>
                <FormGroup>
                  <FormLabel sx={{ mb: 1 }}>Unit Penindaklanjut</FormLabel>
                  {rows.unit.map((value, index) => (
                    <FormControlLabel
                      key={index}
                      control={
                        <Checkbox
                          checked={data.unit_id.includes(value.id)}
                          onChange={(e) => handleCheckbox(e, 'unit_id')}
                          value={value.id}
                        />
                      }
                      label={value.name}
                    />
                  ))}
                  <FormHelperText error={!!error.unit_id}>
                    {error.unit_id !== undefined && 'Pilih unit penindaklanjut.'}
                  </FormHelperText>
                </FormGroup>
              </FormControl>
              <FormControl margin="normal" fullWidth>
                <FormLabel>Dokumen Bahan Rapat</FormLabel>
                {data.files.map((value, index) => (
                  <TextField
                    key={index}
                    disabled
                    value={
                      value.id !== undefined
                        ? value.file_path.substring(value.file_path.lastIndexOf('/') + 1)
                        : value.file.name
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <InsertDriveFileRounded fontSize="small" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={(e) => handleFile(e, 'delete', index)}>
                            <ClearRounded fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mt: 2 }}
                  />
                ))}
                <Button
                  variant="outlined"
                  startIcon={<FileUploadOutlined />}
                  component="label"
                  //  color={error[`certificate.${index}.certificate`] !== undefined ? 'error' : 'primary'}
                  sx={{ mt: 2 }}
                >
                  <input
                    name="certificate"
                    type="file"
                    // accept="image/*,application/pdf"
                    onChange={(e) => handleFile(e, 'add')}
                    hidden
                  />
                  Upload
                </Button>
              </FormControl>
              <FormControl margin="normal">
                <LoadingButton type="submit" variant="contained" loading={loading}>
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
