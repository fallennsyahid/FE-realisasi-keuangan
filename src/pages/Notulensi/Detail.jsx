import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  Link,
  ListItemIcon,
  Menu,
  MenuItem,
  //   Radio,
  //   RadioGroup,
  //   FormControlLabel,
  //   FormLabel,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import {
  AddRounded,
  ArrowBackRounded,
  AttachFile,
  ClearRounded,
  DeleteRounded,
  EditRounded,
  FileUploadOutlined,
  InsertDriveFileRounded,
  MoreVert,
} from '@mui/icons-material';
import { LoadingButton, MobileDateTimePicker } from '@mui/lab';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';
import { useRecoilValue } from 'recoil';
import { authentication } from '../../store/authentication';
import axios from '../../variable/axios';
import Page from '../../components/Page';
import Loading from '../../components/Loading';
import { DateFormat, DateFormat2 } from '../../components/Format';

export default function DetailNotulensi() {
  const { id } = useParams();
  const { user } = useRecoilValue(authentication);
  const navigate = useNavigate();

  const [note, setNote] = useState();
  const [data, setData] = useState('');
  const [complete, setComplete] = useState(false);

  const getNote = async () => {
    await axios.get(`note/${id}`).then((res) => {
      const value = res.data.data;
      value.content = value.content !== null ? value.content : '';
      value.instruction = value.instruction !== null ? value.instruction : '';
      // value.participant = value.participant !== null ? value.participant.map((v) => ({ name: v })) : [];
      value.participant = value.participant !== null ? value.participant : [];
      value.material_preparation = value.material_preparation !== null ? value.material_preparation : [];
      value.unit_id = value.note_unit.map((v) => v.unit.id);
      value.note_follow_up = value.note_follow_up.reverse();
      value.upload = false;
      // console.log(value);
      setNote(value);
      setComplete(true);
    });
  };

  useEffect(() => {
    getNote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [loading, setLoading] = useState(false);
  const handleApi = async (note, data) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('_method', 'patch');
    formData.append('title', note.title);
    formData.append('name', note.name);
    formData.append('institution', note.institution);
    if (note.participant.length > 0) {
      // eslint-disable-next-line array-callback-return
      note.participant.map((value, index) => {
        formData.append(`participant[${index}]`, value);
      });
    }
    if (note.material_preparation.length > 0) {
      // eslint-disable-next-line array-callback-return
      note.material_preparation.map((value, index) => {
        formData.append(`material_preparation[${index}]`, value);
      });
    }
    formData.append('date', note.date);
    formData.append('content', note.content);
    formData.append('instruction', note.instruction);
    // eslint-disable-next-line array-callback-return
    note.unit_id.map((value, index) => {
      formData.append(`unit_id[${index}]`, value);
    });
    if (note.files.length > 0) {
      // eslint-disable-next-line array-callback-return
      note.files.map((value, index) => {
        if (value.id !== undefined) {
          formData.append(`file[${index}][id]`, value.id);
        } else {
          formData.append(`file[${index}][file]`, value.file);
        }
      });
    }
    if (note.document_notulensi.length > 0) {
      // eslint-disable-next-line array-callback-return
      note.document_notulensi.map((value, index) => {
        if (value.id !== undefined) {
          formData.append(`document_notulensi[${index}][id]`, value.id);
        } else {
          formData.append(`document_notulensi[${index}][file]`, value.file);
        }
      });
    }
    if (note.note_follow_up.length > 0) {
      // eslint-disable-next-line array-callback-return
      note.note_follow_up.map((value, index) => {
        formData.append(`note_follow_up[${index}][id]`, value.id);
        formData.append(`note_follow_up[${index}][title]`, value.title);
        formData.append(`note_follow_up[${index}][target_date]`, value.target_date);
        formData.append(`note_follow_up[${index}][status]`, value.status);
      });
    }
    if (data !== undefined) {
      const noteLength = note.note_follow_up.length;
      formData.append(`note_follow_up[${noteLength}][title]`, data.title);
      formData.append(`note_follow_up[${noteLength}][target_date]`, data.target_date);
      formData.append(`note_follow_up[${noteLength}][status]`, data.status);
    }
    //  console.clear();
    //  console.log(data);
    //  console.log(Object.fromEntries(formData));
    axios
      .post(`note/${id}`, formData)
      .then((res) => {
        const value = res.data.data;
        //   console.log(value);
        if (note.upload) getNote();
        setDialog(false);
        setDialogDelete(false);
        setNote({
          ...note,
          note_follow_up: value.note_follow_up.reverse(),
          upload: false,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (data.id === undefined) {
      handleApi(note, data);
    } else {
      const newState = note.note_follow_up.map((row) => (data.id === row.id ? data : row));
      note.note_follow_up = newState;
      handleApi(note);
    }
  };

  const handleCheckbox = (value) => {
    const newState = note.note_follow_up.map((row) =>
      value.id === row.id
        ? {
            ...row,
            status: value.status === 'progress' ? 'finish' : 'progress',
          }
        : row
    );
    note.note_follow_up = newState;
    handleApi(note);
  };

  const handleFile = (e, name, type, index) => {
    if (type === 'add') {
      if (e.target.files[0] !== undefined) {
        if (e.target.files[0].size <= 5000000) {
          const newState = note;
          newState[name].push({ file: e.target.files[0] });
          newState.upload = true;
          handleApi(newState);
          e.target.value = '';
        }
      }
    } else if (type === 'delete') {
      const newState = note[name].filter((row, key) => index !== key);
      note[name] = newState;
      handleApi(note);
    }
  };

  const handleEdit = () => {
    handleMenu();
    handleDialog();
    setData(staging);
  };

  const handleDelete = () => {
    const newState = note.note_follow_up.filter((row) => staging.id !== row.id);
    note.note_follow_up = newState;
    handleApi(note);
  };

  const handleChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  const [staging, setStaging] = useState();
  const [popover, setPopover] = useState('note');
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleMenu = (event, target) => {
    if (!open) {
      setAnchorEl(event.currentTarget);
      setPopover(target);
    } else {
      setAnchorEl(null);
    }
  };

  const [dialog, setDialog] = useState(false);
  const handleDialog = () => {
    setDialog(!dialog);
    if (dialog === false) {
      setData({
        title: '',
        target_date: null,
        status: 'progress',
      });
    }
  };

  const [dialogDelete, setDialogDelete] = useState(false);
  const handleDialogDelete = () => {
    if (open) handleMenu();
    setDialogDelete(!dialogDelete);
  };

  const [dialogNoteDelete, setDialogNoteDelete] = useState(false);
  const handleDialogNoteDelete = () => {
    setAnchorEl(null);
    setDialogNoteDelete(!dialogNoteDelete);
  };

  const handleNoteDelete = () => {
    setLoading(true);
    axios
      .delete(`note/${id}`)
      .then(() => {
        navigate(`/notulensi-rapim`);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Page title={note?.title}>
      <Container maxWidth="xl">
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} mb={2}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton component={RouterLink} to="/notulensi-rapim">
              <ArrowBackRounded />
            </IconButton>
            <Typography variant="h4" mt={1}>
              Detail Notulensi Rapim
            </Typography>
          </Stack>
          {user !== null && ['superadmin', 'rapim'].includes(user.role) && (
            <IconButton onClick={(e) => handleMenu(e, 'note')}>
              <MoreVert />
            </IconButton>
          )}
        </Stack>
        {complete ? (
          <Card>
            <CardContent>
              <Stack direction="row" spacing={1} mb={2}>
                <AttachFile fontSize="large" sx={{ ml: -1 }} />
                <div>
                  <Typography variant="h5" gutterBottom>
                    {note.title}
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    {note.name} ({note.institution})
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {note.date !== null && `${DateFormat(note.date)} ${note.date.substr(10, 6)} WIB`}
                  </Typography>
                </div>
              </Stack>
              <Grid container spacing={2}>
                <Grid item xs={12} md={5}>
                  <Box sx={{ border: '1px #000 dashed', minHeight: '400px' }} p={2}>
                    <Typography variant="h6" gutterBottom>
                      Isi
                    </Typography>
                    <Typography
                      component="pre"
                      sx={{
                        overflowX: 'auto',
                        whiteSpace: 'pre-wrap',
                        wordWrap: 'break-word',
                      }}
                    >
                      {note.content}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={7}>
                  <Box sx={{ border: '1px #000 solid', minHeight: '242px' }} p={2} mb={2}>
                    <Typography variant="h6" gutterBottom>
                      Arahan Menteri
                    </Typography>
                    <Typography
                      component="pre"
                      sx={{
                        overflowX: 'auto',
                        whiteSpace: 'pre-wrap',
                        wordWrap: 'break-word',
                      }}
                    >
                      {note.instruction}
                    </Typography>
                  </Box>
                  <Box sx={{ border: '1px #000 solid', minHeight: '142px' }} p={2}>
                    <Typography variant="h6" gutterBottom>
                      Unit Penindaklanjut
                    </Typography>
                    <ol type="a">
                      {note.note_unit.map((value, index) => (
                        <li key={index} style={{ marginLeft: 20 }}>
                          {value.unit.name}
                        </li>
                      ))}
                    </ol>
                  </Box>
                </Grid>
                <Grid item xs={12} md={5}>
                  <Box sx={{ border: '1px #000 solid' }} p={2}>
                    <Typography variant="h6" gutterBottom>
                      List Peserta
                    </Typography>
                    <ol>
                      {note.participant.map((value, index) => (
                        <li key={index} style={{ marginLeft: 20 }}>
                          {value}
                        </li>
                      ))}
                    </ol>
                  </Box>
                  <Box sx={{ border: '1px #000 solid' }} mt={2} p={2}>
                    <Typography variant="h6" gutterBottom>
                      Penyedia Bahan
                    </Typography>
                    <ol>
                      {note.material_preparation.map((value, index) => (
                        <li key={index} style={{ marginLeft: 20 }}>
                          {value}
                        </li>
                      ))}
                    </ol>
                  </Box>
                  <Box sx={{ border: '1px #000 solid' }} mt={2} p={2}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                      <Typography variant="h6">Dokumen Bahan Rapat</Typography>
                      {user !== null && ['superadmin', 'rapim'].includes(user.role) && (
                        <Button variant="outlined" startIcon={<FileUploadOutlined />} component="label">
                          <input
                            type="file"
                            // accept="image/*,application/pdf"
                            onChange={(e) => handleFile(e, 'files', 'add')}
                            hidden
                          />
                          Upload
                        </Button>
                      )}
                    </Stack>
                    <TableContainer>
                      <Table>
                        <TableBody>
                          {note.files.map(
                            (value, index) =>
                              value.file_path !== undefined && (
                                <TableRow key={index}>
                                  <TableCell
                                    component={Link}
                                    href={value.file_path}
                                    target="_blank"
                                    rel="noreferrer"
                                    underline="none"
                                  >
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                      <InsertDriveFileRounded fontSize="small" sx={{ color: 'text.secondary' }} />
                                      <Typography
                                        sx={{
                                          maxWidth: 360,
                                          whiteSpace: 'nowrap',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                        }}
                                      >
                                        {value.file_path.substr(value.file_path.lastIndexOf('/') + 1)}
                                      </Typography>
                                    </Stack>
                                  </TableCell>
                                  <TableCell align="right">
                                    {user !== null && ['superadmin', 'rapim'].includes(user.role) && (
                                      <IconButton onClick={(e) => handleFile(e, 'files', 'delete', index)}>
                                        <ClearRounded fontSize="small" />
                                      </IconButton>
                                    )}
                                  </TableCell>
                                </TableRow>
                              )
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                  <Box sx={{ border: '1px #000 solid' }} mt={2} p={2}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                      <Typography variant="h6">Dokumen Notulensi</Typography>
                      {user !== null && ['superadmin', 'notulensi'].includes(user.role) && (
                        <Button variant="outlined" startIcon={<FileUploadOutlined />} component="label">
                          <input
                            type="file"
                            // accept="image/*,application/pdf"
                            onChange={(e) => handleFile(e, 'document_notulensi', 'add')}
                            hidden
                          />
                          Upload
                        </Button>
                      )}
                    </Stack>
                    <TableContainer>
                      <Table>
                        <TableBody>
                          {note.document_notulensi.map(
                            (value, index) =>
                              value.file_path !== undefined && (
                                <TableRow key={index}>
                                  <TableCell
                                    component={Link}
                                    href={value.file_path}
                                    target="_blank"
                                    rel="noreferrer"
                                    underline="none"
                                  >
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                      <InsertDriveFileRounded fontSize="small" sx={{ color: 'text.secondary' }} />
                                      <Typography
                                        sx={{
                                          maxWidth: 360,
                                          whiteSpace: 'nowrap',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                        }}
                                      >
                                        {value.file_path.substr(value.file_path.lastIndexOf('/') + 1)}
                                      </Typography>
                                    </Stack>
                                  </TableCell>
                                  <TableCell align="right">
                                    {user !== null && ['superadmin', 'notulensi'].includes(user.role) && (
                                      <IconButton onClick={(e) => handleFile(e, 'document_notulensi', 'delete', index)}>
                                        <ClearRounded fontSize="small" />
                                      </IconButton>
                                    )}
                                  </TableCell>
                                </TableRow>
                              )
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                </Grid>
                <Grid item xs={12} md={7}>
                  <Box sx={{ border: '1px #000 solid' }} p={2}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                      <Typography variant="h6">Langkah Tindaklanjut</Typography>
                      {user !== null && user.role !== 'superadmin' && note.unit_id.includes(user.id) && (
                        <Button variant="outlined" startIcon={<AddRounded />} onClick={handleDialog}>
                          Tambah
                        </Button>
                      )}
                    </Stack>
                    {note.note_follow_up.map((value, index) => (
                      <Stack direction="row" alignItems="start" spacing={1} mb={2} key={index}>
                        {user !== null ? (
                          <Checkbox
                            checked={value.status === 'finish'}
                            disabled={value.user.id !== user.id}
                            onChange={() => handleCheckbox(value)}
                          />
                        ) : (
                          <Checkbox checked={value.status === 'finish'} disabled />
                        )}
                        <Box pt={1.1} width="100%">
                          <Typography fontWeight="bold">{value.user.name}</Typography>
                          <Typography gutterBottom>{value.title}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Target selesai: {DateFormat2(value.target_date)} {value.target_date.substr(10, 6)} WIB
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Last update: {DateFormat2(value.updated_at)} {value.updated_at.substr(10, 6)} WIB
                          </Typography>
                        </Box>
                        {user !== null && user.role !== 'superadmin' && note.unit_id.includes(user.id) && (
                          <IconButton
                            onClick={(e) => {
                              handleMenu(e, 'follow_up');
                              setStaging(value);
                            }}
                          >
                            <MoreVert />
                          </IconButton>
                        )}
                      </Stack>
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ) : (
          <Loading />
        )}
      </Container>
      <Menu
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenu}
      >
        {popover === 'note' ? (
          <div>
            <MenuItem component={RouterLink} to={`/notulensi-rapim/edit/${id}`}>
              <ListItemIcon>
                <EditRounded />
              </ListItemIcon>
              Ubah
            </MenuItem>
            <MenuItem onClick={handleDialogNoteDelete}>
              <ListItemIcon>
                <DeleteRounded />
              </ListItemIcon>
              Hapus
            </MenuItem>
          </div>
        ) : (
          <div>
            <MenuItem onClick={handleEdit}>
              <ListItemIcon>
                <EditRounded />
              </ListItemIcon>
              Ubah
            </MenuItem>
            <MenuItem onClick={handleDialogDelete}>
              <ListItemIcon>
                <DeleteRounded />
              </ListItemIcon>
              Hapus
            </MenuItem>
          </div>
        )}
      </Menu>
      <Dialog open={dialog} onClose={handleDialog} maxWidth="sm" component="form" onSubmit={handleSubmit} fullWidth>
        <DialogTitle>{data.id !== undefined ? 'Ubah' : 'Tambah'} Langkah Tindaklanjut</DialogTitle>
        <DialogContent>
          <FormControl margin="normal" fullWidth>
            <TextField label="Langkah Tindaklanjut" name="title" value={data.title} onChange={handleChange} required />
          </FormControl>
          <FormControl margin="normal" fullWidth>
            <MobileDateTimePicker
              label="Tanggal Selesai"
              inputFormat="dd/MM/yyyy HH:mm"
              ampm={false}
              value={data.target_date}
              onChange={(newValue) => {
                setData({ ...data, target_date: moment(newValue).format('yyyy-MM-DD HH:mm:ss') });
              }}
              renderInput={(params) => <TextField {...params} fullWidth required />}
            />
          </FormControl>
          {/* <FormControl margin="normal">
            <FormLabel sx={{ mb: 1 }}>Status</FormLabel>
            <RadioGroup name="status" defaultValue="" value={data.status} onChange={handleChange}>
              <FormControlLabel value="progress" control={<Radio size="small" />} label="Progress" />
              <FormControlLabel value="finish" control={<Radio size="small" />} label="Finish" />
            </RadioGroup>
          </FormControl> */}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button variant="outlined" onClick={handleDialog}>
            Batal
          </Button>
          <LoadingButton type="submit" variant="contained" loading={loading}>
            Submit
          </LoadingButton>
        </DialogActions>
      </Dialog>
      <Dialog open={dialogDelete} onClose={handleDialogDelete} maxWidth="xs" fullWidth>
        <DialogTitle>Hapus Langkah Tindaklanjut</DialogTitle>
        <DialogContent>Anda yakin ingin menghapus langkah tindaklanjut?</DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button variant="outlined" onClick={handleDialogDelete}>
            Batal
          </Button>
          <LoadingButton variant="contained" loading={loading} onClick={handleDelete}>
            Hapus
          </LoadingButton>
        </DialogActions>
      </Dialog>
      <Dialog open={dialogNoteDelete} onClose={handleDialogNoteDelete} maxWidth="xs" fullWidth>
        <DialogTitle>Hapus Notulensi Rapim</DialogTitle>
        <DialogContent>
          Anda yakin ingin menghapus <b>{note?.title}</b>?
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button variant="outlined" onClick={handleDialogNoteDelete}>
            Batal
          </Button>
          <LoadingButton variant="contained" loading={loading} onClick={handleNoteDelete}>
            Submit
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Page>
  );
}
