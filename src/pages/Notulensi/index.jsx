import FullCalendar from '@fullcalendar/react'; // => request placed at the top
import listPlugin from '@fullcalendar/list';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import timelinePlugin from '@fullcalendar/timeline';
import interactionPlugin from '@fullcalendar/interaction';
import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Card,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { AssignmentIndRounded, AddRounded, AttachFile, FilterListRounded } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { Link as RouterLink } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { authentication } from '../../store/authentication';
import Page from '../../components/Page';
import axios from '../../variable/axios';
import useSettings from '../../hooks/useSettings';
import useResponsive from '../../hooks/useResponsive';
import { useDispatch } from '../../redux/store';
import { updateEvent, selectEvent, selectRange } from '../../redux/slices/calendar';
import { CalendarStyle, CalendarToolbar } from '../../sections/@dashboard/calendar';
import { DateFormat } from '../../components/Format';
import Loading from '../../components/Loading';

const renderEventContent = (eventInfo) => {
  const custom = eventInfo.event._def.extendedProps;
  //   console.log(custom);
  return (
    <>
      <Stack direction="row" alignItems="center" spacing={0.5}>
        {custom.assigned && <AssignmentIndRounded fontSize="small" />}
        <Typography variant="body2" fontWeight="bold" noWrap>
          {eventInfo.event.title}
        </Typography>
      </Stack>
      <Typography variant="caption" fontWeight="500">
        {custom.time} WIB
      </Typography>
    </>
  );
};

export default function Notulensi() {
  const { user } = useRecoilValue(authentication);
  const { themeStretch } = useSettings();
  const dispatch = useDispatch();
  const isDesktop = useResponsive('up', 'sm');
  const calendarRef = useRef(null);
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState(isDesktop ? 'dayGridMonth' : 'listWeek');

  const [rows, setRows] = useState();
  const [filter, setFilter] = useState({
    start_date: '',
    end_date: '',
    unit_id: 'all',
  });

  const [note, setNote] = useState([]);
  const getNote = async () => {
    const res = await axios.get(`note`);
    return res.data.data.data;
  };

  const [unit, setUnit] = useState([]);
  const getUnit = async () => {
    const res = await axios.get(`param/note_unit`);
    return res.data.data;
  };

  const randomColor = () => {
    const colors = ['#FF4842', '#FFC107', '#54D62C', '#1890FF', '#04297A', '#7A0C2E'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  useEffect(() => {
    Promise.all([getNote(), getUnit()]).then((res) => {
      // console.log(res[0]);
      const newState = res[0].map((value) => ({
        ...value,
        date: value.date.substr(0, 10),
        time: value.date.substr(11, 5),
        textColor: randomColor(),
        assigned: !!(value.note_unit.length > 0 && value.note_unit.map((row) => row.unit.id).includes(user?.id)),
      }));
      // console.log(newState);
      setNote(newState);
      setUnit(res[1]);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const calendarEl = calendarRef.current;
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();
      const newView = isDesktop ? 'dayGridMonth' : 'listWeek';
      calendarApi.changeView(newView);
      setView(newView);
    }
  }, [isDesktop]);

  const handleClickToday = () => {
    const calendarEl = calendarRef.current;
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();
      calendarApi.today();
      setDate(calendarApi.getDate());
    }
  };

  const handleChangeView = (newView) => {
    const calendarEl = calendarRef.current;
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();
      calendarApi.changeView(newView);
      setView(newView);
    }
  };

  const handleClickDatePrev = () => {
    const calendarEl = calendarRef.current;
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();
      calendarApi.prev();
      setDate(calendarApi.getDate());
    }
  };

  const handleClickDateNext = () => {
    const calendarEl = calendarRef.current;
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();
      calendarApi.next();
      setDate(calendarApi.getDate());
    }
  };

  const handleSelectRange = (arg) => {
    const calendarEl = calendarRef.current;
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();
      calendarApi.unselect();
    }
    dispatch(selectRange(arg.start, arg.end));
  };

  const handleSelectEvent = async (arg) => {
    dispatch(selectEvent(arg.event.id));
    handleDialog();
    setStaging('');
    axios.get(`note/${arg.event.id}`).then((res) => {
      const value = res.data.data;
      //  console.log(value);
      setStaging(value);
    });
  };

  const handleResizeEvent = async ({ event }) => {
    try {
      dispatch(
        updateEvent(event.id, {
          allDay: event.allDay,
          start: event.start,
          end: event.end,
        })
      );
    } catch (error) {
      // console.error(error);
    }
  };

  const handleDropEvent = async ({ event }) => {
    try {
      dispatch(
        updateEvent(event.id, {
          allDay: event.allDay,
          start: event.start,
          end: event.end,
        })
      );
    } catch (error) {
      // console.error(error);
    }
  };

  const handleFilter = (e) => {
    setFilter({
      ...filter,
      [e.target.name]: e.target.value,
    });
  };

  const [staging, setStaging] = useState('');
  const [dialog, setDialog] = useState(false);
  const handleDialog = () => {
    setDialog(!dialog);
  };

  const [loadingRekap, setLoadingRekap] = useState(false);
  const [dialogRekap, setDialogRekap] = useState(false);
  const handleDialogRekap = () => {
    setDialogRekap(!dialogRekap);
    if (dialogRekap === false) {
      setRows(undefined);
      setFilter({
        start_date: '',
        end_date: '',
      });
    }
  };

  const handleRekap = async () => {
    setLoadingRekap(true);
    await axios
      .get(`note`, {
        params: {
          start_date: filter.start_date,
          end_date: filter.end_date,
          unit_id: filter.unit_id !== 'all' ? filter.unit_id : '',
        },
      })
      .then((res) => {
        //   console.log(res.data.data);
        setRows(res.data.data.data);
        setLoadingRekap(false);
      });
  };

  const handleReset = () => {
    setFilter({
      start_date: '',
      end_date: '',
      unit_id: 'all',
    });
  };

  const [loading, setLoading] = useState(false);
  const [dialogNoteDelete, setDialogNoteDelete] = useState(false);
  const handleDialogNoteDelete = () => {
    setDialog(false);
    setDialogNoteDelete(!dialogNoteDelete);
  };

  const handleNoteDelete = () => {
    setLoading(true);
    axios
      .delete(`note/${staging.id}`)
      .then(() => {
        getNote();
        setDialogNoteDelete(false);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Page title="Notulensi Rapim" background="dark.jpg">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          alignItems={{ xs: 'left', md: 'flex-end' }}
          justifyContent="space-between"
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Box>
            <Typography variant="h4" color="#fff" gutterBottom>
              Notulensi Rapim
            </Typography>
            <Typography variant="body2" color="#fff" gutterBottom>
              Kementerian Koperasi dan UKM Republik Indonesia
            </Typography>
          </Box>
          <Box mx="0 auto">
            <Stack direction="row" justifyContent="flex-end" spacing={1}>
              {user !== null && ['superadmin', 'rapim'].includes(user.role) && (
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<AddRounded />}
                  component={RouterLink}
                  to="./create"
                >
                  Tambah
                </Button>
              )}
              <Box sx={{ background: '#fff', borderRadius: 1 }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleDialogRekap}
                  startIcon={<FilterListRounded />}
                >
                  Tampil Rekap
                </Button>
              </Box>
            </Stack>
          </Box>
        </Stack>
        <Card>
          <CalendarStyle>
            <CalendarToolbar
              date={date}
              view={view}
              onNextDate={handleClickDateNext}
              onPrevDate={handleClickDatePrev}
              onToday={handleClickToday}
              onChangeView={handleChangeView}
            />
            <FullCalendar
              weekends
              editable
              events={note}
              ref={calendarRef}
              rerenderDelay={10}
              initialDate={date}
              initialView={view}
              dayMaxEventRows={3}
              eventDisplay="block"
              headerToolbar={false}
              allDayMaintainDuration
              eventResizableFromStart
              select={handleSelectRange}
              eventDrop={handleDropEvent}
              eventClick={handleSelectEvent}
              eventResize={handleResizeEvent}
              eventContent={renderEventContent}
              height={isDesktop ? 720 : 'auto'}
              plugins={[listPlugin, dayGridPlugin, timelinePlugin, timeGridPlugin, interactionPlugin]}
            />
          </CalendarStyle>
        </Card>
        <Dialog open={dialog} onClose={handleDialog} maxWidth="lg" fullWidth>
          {staging !== '' ? (
            <>
              <DialogContent>
                <Stack direction="row" spacing={1} mb={2}>
                  <AttachFile fontSize="large" sx={{ ml: -1 }} />
                  <div>
                    <Typography variant="h5" gutterBottom>
                      {staging.title}
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom>
                      {staging.name} ({staging.institution})
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {staging.date !== null && `${DateFormat(staging.date)} ${staging.date.substr(10, 6)} WIB`}
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
                        {staging.content}
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
                        {staging.instruction}
                      </Typography>
                    </Box>
                    <Box sx={{ border: '1px #000 solid', minHeight: '142px' }} p={2}>
                      <Typography variant="h6" gutterBottom>
                        Unit Penindaklanjut
                      </Typography>
                      <ol type="a">
                        {staging.note_unit.map((value, index) => (
                          <li key={index} style={{ marginLeft: 20 }}>
                            {value.unit.name}
                          </li>
                        ))}
                      </ol>
                    </Box>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions sx={{ px: 3, pb: 3 }}>
                {user !== null && ['superadmin', 'rapim'].includes(user.role) && (
                  <Box mr="auto">
                    <Button
                      variant="outlined"
                      onClick={handleReset}
                      sx={{ mr: 1 }}
                      component={RouterLink}
                      to={`./edit/${staging.id}`}
                    >
                      Ubah
                    </Button>
                    <Button variant="outlined" color="error" onClick={handleDialogNoteDelete}>
                      Hapus
                    </Button>
                  </Box>
                )}
                <Button variant="outlined" onClick={handleDialog} sx={{ mr: 1 }}>
                  Tutup
                </Button>
                <Button variant="contained" component={RouterLink} to={`./${staging.id}`}>
                  Detail
                </Button>
              </DialogActions>
            </>
          ) : (
            <Loading />
          )}
        </Dialog>
        <Dialog open={dialogRekap} onClose={handleDialogRekap} maxWidth="md" fullWidth>
          <DialogTitle>Tampil Rekap</DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mb: rows !== undefined ? 2 : 0, mt: 0 }}>
              <Grid item xs={6} md={4}>
                <TextField
                  label="Dari Tanggal"
                  name="start_date"
                  type="date"
                  value={filter.start_date}
                  onChange={handleFilter}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6} md={4}>
                <TextField
                  label="Sampai Tanggal"
                  name="end_date"
                  type="date"
                  value={filter.end_date}
                  onChange={handleFilter}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  label="Unit Penindaklanjut"
                  name="unit_id"
                  value={filter.unit_id ?? 'all'}
                  defaultValue="all"
                  onChange={handleFilter}
                  select
                  fullWidth
                >
                  <MenuItem value="all">Semua Unit Penindaklanjut</MenuItem>
                  {unit.map((value, index) => (
                    <MenuItem key={index} value={value.id}>
                      {value.param}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
            {rows !== undefined && (
              <TableContainer component={Card}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">No.</TableCell>
                      <TableCell>Judul</TableCell>
                      <TableCell>Tanggal</TableCell>
                      <TableCell>Nama Penyampai</TableCell>
                      <TableCell>Nama Lembaga</TableCell>
                      <TableCell>Unit Penindaklanjut</TableCell>
                      <TableCell>Langkah Tindaklanjut</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.length > 0 ? (
                      rows.map((value, index) => (
                        <TableRow key={index}>
                          <TableCell align="center">{index + 1}.</TableCell>
                          <TableCell>{value.title}</TableCell>
                          <TableCell>{DateFormat(value.date)}</TableCell>
                          <TableCell>{value.name}</TableCell>
                          <TableCell>{value.institution}</TableCell>
                          <TableCell>
                            {value.note_unit.map((row, key) => (
                              <Typography variant="body2" key={key}>
                                - {row.unit.name}
                              </Typography>
                            ))}
                          </TableCell>
                          <TableCell>{value.follow_up !== null ? value.follow_up : 'Belum ditindaklanjuti'}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell align="center" colSpan={10}>
                          Data tidak ditemukan.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Box mr="auto">
              <Button variant="outlined" onClick={handleReset}>
                Reset
              </Button>
            </Box>
            <Button variant="outlined" onClick={handleDialogRekap}>
              Batal
            </Button>
            <LoadingButton variant="contained" onClick={handleRekap} loading={loadingRekap}>
              Terapkan
            </LoadingButton>
          </DialogActions>
        </Dialog>
        <Dialog open={dialogNoteDelete} onClose={handleDialogNoteDelete} maxWidth="xs" fullWidth>
          <DialogTitle>Hapus Notulensi Rapim</DialogTitle>
          <DialogContent>
            Anda yakin ingin menghapus <b>{staging.title}</b>?
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
      </Container>
    </Page>
  );
}
