/* eslint-disable array-callback-return */
/* eslint-disable no-nested-ternary */
import { useEffect, useState, useRef } from 'react';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  Checkbox,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Stack,
  Step,
  StepButton,
  Stepper,
  TextField,
  Typography,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import {
  DescriptionRounded,
  FactoryRounded,
  StoreMallDirectoryRounded,
  TrendingUp,
  PsychologyRounded,
  EmojiObjectsRounded,
  AddRounded,
  MoreVert,
  ListAltRounded,
  CrisisAlert,
  AccountBalanceWalletRounded,
  HomeRounded,
  ChevronRightRounded,
  EditRounded,
} from '@mui/icons-material';
import axios from 'axios';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { useRecoilValue } from 'recoil';
import { authentication } from '../store/authentication';
import Page from '../components/Page';
// import Scrollbar from '../components/Scrollbar';
import { BankingCurrentBalance } from '../sections/@dashboard/banking';
import { DateFormat, IntegerFormat, NumberFormat } from '../components/Format';
import Loading from '../components/Loading';
import Validate from '../components/Validate';
import Label from '../components/Label';

const colorVariant = (index) => {
  let color;
  if (index === 0) {
    color = '#f68570';
  } else if (index === 1) {
    color = '#6993c3';
  } else if (index === 2) {
    color = '#909090';
  } else if (index === 3) {
    color = '#d78bac';
  } else if (index === 4) {
    color = '#5e6c80';
  } else if (index === 5) {
    color = '#9cd15c';
  } else if (index === 6) {
    color = '#fdd835';
  }
  return color;
};

const CustomCard = (props) => {
  const { children } = { ...props };
  return (
    <Card
      {...props}
      sx={{
        borderRadius: 1,
        bgcolor: '#eee',
        mb: 3,
        px: 2,
        py: 1,
      }}
    >
      {children}
    </Card>
  );
};

export default function ProgramStrategis() {
  const { user } = useRecoilValue(authentication);
  const myRef1 = useRef(null);
  const myRef2 = useRef(null);

  const getPriorityProgram = async () => {
    const res = await axios.get(`param/priority_program`);
    return res.data.data;
  };
  const getTotalProgramActivity = async (categoryId) => {
    const res = await axios.get(`program_activity/statistics/total?priority_program_id=${categoryId}`);
    return res.data.data;
  };
  const getProgramActivity = async (categoryId) => {
    const res = await axios.get(`program_activity?priority_program_id=${categoryId}`);
    return res.data.data;
  };
  const getMonev = async (activityId) => {
    const res = await axios.get(`monev?program_activity_id=${activityId}`);
    return res.data.data;
  };
  const [unit, setUnit] = useState([]);
  const getUnit = async () => {
    await axios.get(`param/unit`).then((res) => {
      // console.log(res.data.data);
      setUnit(res.data.data);
    });
  };
  const [executionUnit, setExecutionUnit] = useState([]);
  const getExecutionUnit = async () => {
    await axios.get(`param/execution_unit`).then((res) => {
      // console.log(res.data.data);
      setExecutionUnit(res.data.data);
    });
  };

  const [program, setProgram] = useState();
  useEffect(() => {
    Promise.all([getPriorityProgram()]).then((res) => {
      setProgram(res[0]);
    });
  }, []);

  const [total, setTotal] = useState();
  const [order, setOrder] = useState();
  const [category, setCategory] = useState();
  const [programActivity, setProgramActivity] = useState();
  useEffect(() => {
    if (category !== undefined) {
      setProgramActivity(undefined);
      setActivity(undefined);
      Promise.all([getTotalProgramActivity(category.id), getProgramActivity(category.id)]).then((res) => {
        setTotal(res[0]);
        setProgramActivity(res[1]);
        myRef1.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, [category]);

  const [activity, setActivity] = useState();
  const [monev, setMonev] = useState();
  useEffect(() => {
    if (activity !== undefined) {
      // console.log(activity);
      setMonev(undefined);
      Promise.all([getMonev(activity.id)]).then((res) => {
        setMonev(res[0]);
        myRef2.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, [activity]);

  const [data, setData] = useState({
    name: '',
    target: '',
    unit_id: '',
    budget: '',
    executor_id: [],
    date: '',
    realization: '',
    narasi: '',
    constraint: '',
    solution: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const submitActivity = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const formData = new FormData();
    if (data.id === undefined) {
      formData.append('priority_program_id', category.id);
    } else {
      formData.append('_method', 'patch');
      formData.append('priority_program_id', category.id);
    }
    formData.append('name', data.name);
    formData.append('target', IntegerFormat(data.target));
    formData.append('unit_id', data.unit_id);
    formData.append('budget', IntegerFormat(data.budget));
    data.executor_id.map((value, index) => {
      formData.append(`executor_id[${index}]`, value);
    });
    //  console.clear();
    //  console.log(data);
    //  console.log(Object.fromEntries(formData));
    axios
      .post(data.id === undefined ? `program_activity` : `program_activity/${data.id}`, formData)
      .then((row) => {
        Promise.all([getTotalProgramActivity(category.id), getProgramActivity(category.id)]).then((res) => {
          setTotal(res[0]);
          setProgramActivity(res[1]);
          setActivity(row.data.data);
        });
        handleDialogActivity();
      })
      .catch((xhr) => {
        //   console.log(xhr.response);
        const err = xhr.response.data.errors;
        if (err) setError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const submitMonev = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const formData = new FormData();
    if (data.id === undefined) {
      formData.append('program_activity_id', activity.id);
    } else {
      formData.append('_method', 'patch');
      formData.append('program_activity_id', activity.id);
    }
    formData.append('date', data.date);
    formData.append('target', IntegerFormat(data.target));
    formData.append('unit_id', data.unit_id);
    formData.append('realization', IntegerFormat(data.realization));
    formData.append('narasi', data.narasi);
    formData.append('constraint', data.constraint);
    formData.append('solution', data.solution);
    //  console.clear();
    //  console.log(data);
    //  console.log(Object.fromEntries(formData));
    axios
      .post(data.id === undefined ? `monev` : `monev/${data.id}`, formData)
      .then((value) => {
        Promise.all([getProgramActivity(category.id), getMonev(activity.id)]).then((res) => {
          setProgramActivity(res[0]);
          setMonev(res[1]);
          if (data.id !== undefined) {
            setActivity({
              ...activity,
              realization_percent: value.data.data.realization_percent,
            });
          }
        });
        handleDialogMonev();
      })
      .catch((xhr) => {
        //   console.log(xhr.response);
        const err = xhr.response.data.errors;
        if (err) setError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleCategory = (value, index) => {
    setCategory(value);
    setOrder(index);
  };

  const [dialogActivity, setDialogActivity] = useState(false);
  const handleDialogActivity = () => {
    setDialogActivity(!dialogActivity);
    if (unit.length < 1) getUnit();
    if (executionUnit.length < 1) getExecutionUnit();
    setData({
      ...data,
      id: undefined,
      name: '',
      target: '',
      unit_id: '',
      budget: '',
      executor_id: [],
    });
    setError('');
  };

  const [narasi, setNarasi] = useState('');
  const [dialogNarasi, setDialogNarasi] = useState(false);
  const handleDialogNarasi = (e, type) => {
    //   console.log(e, type);
    setDialogNarasi(!dialogNarasi);
    if (type !== undefined && type !== 'backdropClick') {
      setNarasi({
        ...narasi,
        type,
      });
    }
  };
  const submitNarasi = async (e) => {
    e.preventDefault();
    //  setLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('_method', 'patch');
    formData.append('priority_program_id', activity.priority_program.id);
    formData.append('name', activity.name);
    formData.append('target', activity.target);
    formData.append('unit_id', activity.unit.id);
    formData.append('budget', activity.budget);
    activity.executor.map((value, index) => {
      formData.append(`executor_id[${index}]`, value.executor.id);
    });
    formData.append('recommendation', narasi.recommendation !== null ? narasi.recommendation : '');
    formData.append('narrative', narasi.narrative !== null ? narasi.narrative : '');
    formData.append('narrative_outcome', narasi.narrative_outcome !== null ? narasi.narrative_outcome : '');
    //  console.clear();
    //  console.log(activity);
    //  console.log(Object.fromEntries(formData));
    axios
      .post(`program_activity/${activity.id}`, formData)
      .then((res) => {
        //   console.log(res.data.data);
        const value = res.data.data;
        handleDialogNarasi();
        setActivity({
          ...activity,
          narrative: value.narrative,
          narrative_outcome: value.narrative_outcome,
          recommendation: value.recommendation,
        });
      })
      .catch((xhr) => {
        //   console.log(xhr.response);
        const err = xhr.response.data.errors;
        if (err) setError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const [dialogMonev, setDialogMonev] = useState(false);
  const handleDialogMonev = () => {
    setDialogMonev(!dialogMonev);
    if (unit.length < 1) getUnit();
    setData({
      ...data,
      id: undefined,
      date: '',
      target: '',
      unit_id: '',
      realization: '',
      narasi: '',
      constraint: '',
      solution: '',
    });
    setError('');
  };

  const editActivity = (value) => {
    handleClose('activity');
    setDialogActivity(true);
    if (unit.length < 1) getUnit();
    if (executionUnit.length < 1) getExecutionUnit();
    setData({
      ...data,
      id: value.id,
      name: value.name,
      target: NumberFormat(value.target),
      unit_id: value.unit.id,
      budget: NumberFormat(value.budget),
      executor_id: value.executor.map((v) => v.executor.id),
    });
  };

  const editMonev = (value) => {
    handleClose('monev');
    setDialogMonev(true);
    if (unit.length < 1) getUnit();
    setData({
      ...data,
      id: value.id,
      date: value.date,
      target: NumberFormat(value.target),
      unit_id: value.unit.id,
      realization: NumberFormat(value.realization),
      narasi: value.narasi,
      constraint: value.constraint,
      solution: value.solution,
    });
  };

  const [staging, setStaging] = useState('');
  const [dialogDelete, setDialogDelete] = useState(false);
  const handleDialogDelete = (type, value) => {
    handleClose(type);
    setDialogDelete(!dialogDelete);
    setStaging({
      type,
      data: value,
    });
  };

  const [activeStep, setActiveStep] = useState(0);
  const handleStep = (step, value) => {
    setActiveStep(step);
    handleDialogDetail();
    setStaging({
      type: 'monev',
      data: value,
    });
  };

  const [dialogDetail, setDialogDetail] = useState(false);
  const handleDialogDetail = () => {
    setDialogDetail(!dialogDetail);
  };

  const handleDelete = async () => {
    await axios.delete(`${staging.type === 'activity' ? 'program_activity' : 'monev'}/${staging.data.id}`).then(() => {
      handleDialogDelete();
      if (staging.type === 'activity') {
        Promise.all([getTotalProgramActivity(category.id), getProgramActivity(category.id)]).then((res) => {
          setTotal(res[0]);
          setProgramActivity(res[1]);
          setActivity(undefined);
        });
      } else {
        Promise.all([getMonev(activity.id)]).then((res) => {
          setMonev(res[0]);
        });
      }
    });
  };

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

  const handleCheckbox = (e) => {
    const filter = data.executor_id.filter((value) => value === e.target.value);
    if (filter.length < 1) {
      setData({
        ...data,
        executor_id: [...data.executor_id, e.target.value],
      });
    } else {
      const newState = data.executor_id.filter((value) => value !== e.target.value);
      setData({
        ...data,
        executor_id: newState,
      });
    }
    setError({
      ...error,
      executor_id: undefined,
    });
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const handleClick = (e, type, data) => {
    setStaging({ type, data });
    setAnchorEl(e.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Page title="Program Strategis">
      <Container maxWidth="xl">
        <Typography variant="h4" gutterBottom>
          Program Strategis
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Kementerian Koperasi dan UKM Republik Indonesia
        </Typography>
        {program !== undefined ? (
          <Grid container spacing={1} sx={{ mt: 3 }}>
            {program.map((value, index) => (
              <Grid item xs key={index}>
                <Card
                  sx={{
                    height: '100%',
                    bgcolor: colorVariant(index),
                    color: '#fff',
                  }}
                >
                  <CardActionArea onClick={() => handleCategory(value, index)} sx={{ height: '100%' }}>
                    <CardContent sx={{ height: '100%' }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                        {index === 0 ? (
                          <DescriptionRounded fontSize="large" />
                        ) : index === 1 ? (
                          <FactoryRounded fontSize="large" />
                        ) : index === 2 ? (
                          <StoreMallDirectoryRounded fontSize="large" />
                        ) : index === 3 ? (
                          <TrendingUp fontSize="large" />
                        ) : index === 4 ? (
                          <PsychologyRounded fontSize="large" />
                        ) : index === 5 ? (
                          <EmojiObjectsRounded fontSize="large" />
                        ) : index === 6 ? (
                          <HomeRounded fontSize="large" />
                        ) : null}
                        <Typography variant="h3" align="right">
                          0{index + 1}
                        </Typography>
                      </Stack>
                      <Typography variant="h6" fontWeight="bold" mt={3}>
                        {value.param}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Loading />
        )}
        {category !== undefined && (
          <>
            {total !== undefined && programActivity !== undefined ? (
              <Box position="relative">
                <div style={{ position: 'absolute', top: '-20px' }} ref={myRef1} />
                <Typography variant="h4" align="center" py={5}>
                  {category.param}
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={4}>
                    <BankingCurrentBalance
                      data={{
                        title: 'Total Kegiatan',
                        total: `${NumberFormat(total.total_program_activity)} Kegiatan`,
                        icon: <ListAltRounded fontSize="large" />,
                        background: colorVariant(order),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <BankingCurrentBalance
                      data={{
                        title: 'Total Target',
                        total: `${NumberFormat(total.total_target !== null ? total.total_target : 0)}`,
                        icon: <CrisisAlert fontSize="large" />,
                        background: colorVariant(order),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <BankingCurrentBalance
                      data={{
                        title: 'Total Anggaran',
                        total: NumberFormat(total.total_budget !== null ? total.total_budget : 0, 'Rp'),
                        icon: <AccountBalanceWalletRounded fontSize="large" />,
                        background: colorVariant(order),
                      }}
                    />
                  </Grid>
                </Grid>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={programActivity.data.length > 0 ? 6 : 0} mt={6}>
                    <Card sx={{ height: '100%' }}>
                      <CardHeader
                        title="Data/Kegiatan"
                        action={
                          user !== null &&
                          ['superadmin', 'biro_mkos'].includes(user.role) && (
                            <Button variant="outlined" onClick={handleDialogActivity} startIcon={<AddRounded />}>
                              Tambah Kegiatan
                            </Button>
                          )
                        }
                        sx={{ mb: 3 }}
                      />
                      <Divider />
                      {programActivity.data.length > 0 ? (
                        programActivity.data.map((value, index) => (
                          <CardActionArea
                            key={index}
                            onClick={() => {
                              setActivity(value);
                              setNarasi(value);
                            }}
                            sx={{
                              background: activity !== undefined && activity.id === value.id ? '#eee' : '',
                            }}
                          >
                            <CardContent>
                              <Stack direction="row" justifyContent="space-between" spacing={2}>
                                <Box>
                                  <Chip label={value.user.name} size="small" variant="outlined" />
                                  <Typography fontWeight="bold" gutterBottom mt={1}>
                                    {value.name}
                                  </Typography>
                                  {value.executor.map((v, i) => (
                                    <Typography variant="body2" noWrap key={i}>
                                      - {v.executor.param}
                                      {/* {value.executor.length > i + 1 ? ',' : ''} */}
                                    </Typography>
                                  ))}
                                  <Label
                                    variant="ghost"
                                    color={value.realization_percent < 100 ? 'warning' : 'success'}
                                    sx={{ mt: 1 }}
                                  >
                                    {value.realization_percent < 100 ? 'Progress' : 'Finish'} -{' '}
                                    {value.realization_percent <= 100 ? value.realization_percent : 100}%
                                  </Label>
                                </Box>
                                <ChevronRightRounded color="action" />
                              </Stack>
                            </CardContent>
                            <Divider />
                          </CardActionArea>
                        ))
                      ) : (
                        <Stack align="center" py={10}>
                          <Typography variant="body2">Belum ada data/kegiatan.</Typography>
                        </Stack>
                      )}
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6} position="relative">
                    <div style={{ position: 'absolute', top: '0px' }} ref={myRef2} />
                    {activity !== undefined && (
                      <>
                        <Stack direction="row" justifyContent="space-between" spacing={2} mb={2} pt={6}>
                          <Typography variant="h5">{activity.name}</Typography>
                          {user !== null && ['superadmin', 'biro_mkos'].includes(user.role) && (
                            <Box>
                              <IconButton onClick={(e) => handleClick(e, 'activity', activity)}>
                                <MoreVert fontSize="small" />
                              </IconButton>
                            </Box>
                          )}
                        </Stack>
                        {monev !== undefined ? (
                          <Stack spacing={3}>
                            {/* Output */}
                            <Card>
                              <CardHeader
                                title="Output"
                                action={
                                  user !== null &&
                                  ['superadmin', 'biro_mkos'].includes(user.role) && (
                                    <Button
                                      onClick={(e) => handleDialogNarasi(e, 'narrative')}
                                      startIcon={<EditRounded fontSize="small" />}
                                    >
                                      Masukkan Narasi
                                    </Button>
                                  )
                                }
                              />
                              <CardContent>
                                {activity.narrative !== null && (
                                  <CustomCard>
                                    <Box dangerouslySetInnerHTML={{ __html: activity.narrative }} />
                                  </CustomCard>
                                )}
                                <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                                  <Typography variant="body2" width={130}>
                                    Nama Kegiatan
                                  </Typography>
                                  <Typography variant="body2">:</Typography>
                                  <Typography variant="body2">{activity.name}</Typography>
                                </Stack>
                                <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                                  <Typography variant="body2" width={130}>
                                    Target
                                  </Typography>
                                  <Typography variant="body2">:</Typography>
                                  <Typography variant="body2" width={150}>
                                    {NumberFormat(activity.target)} {activity.unit.param}
                                  </Typography>
                                </Stack>
                                <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                                  <Typography variant="body2" width={130}>
                                    Anggaran
                                  </Typography>
                                  <Typography variant="body2">:</Typography>
                                  <Typography variant="body2" width={150}>
                                    {NumberFormat(activity.budget, 'Rp')}
                                  </Typography>
                                </Stack>
                                <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                                  <Typography variant="body2" width={130}>
                                    Unit Pelaksana
                                  </Typography>
                                  <Typography variant="body2">:</Typography>
                                  <div>
                                    {activity.executor.map((v, i) => (
                                      <Typography variant="body2" noWrap key={i} mb={1}>
                                        - {v.executor.param}
                                        {/* {activity.executor.length > i + 1 ? ',' : ''} */}
                                      </Typography>
                                    ))}
                                  </div>
                                </Stack>
                                <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                                  <Typography variant="body2" width={130}>
                                    Status
                                  </Typography>
                                  <Typography variant="body2">:</Typography>
                                  <Typography variant="body2">
                                    <Label
                                      variant="ghost"
                                      color={activity.realization_percent < 100 ? 'warning' : 'success'}
                                    >
                                      {activity.realization_percent < 100 ? 'Progress' : 'Finish'} -{' '}
                                      {activity.realization_percent <= 100 ? activity.realization_percent : 100}%
                                    </Label>
                                  </Typography>
                                </Stack>
                              </CardContent>
                            </Card>
                            {/* Outcome */}
                            <Card>
                              <CardHeader
                                title="Outcome"
                                action={
                                  user !== null &&
                                  ['superadmin', 'biro_mkos'].includes(user.role) && (
                                    <Button
                                      onClick={(e) => handleDialogNarasi(e, 'narrative_outcome')}
                                      startIcon={<EditRounded fontSize="small" />}
                                    >
                                      Masukkan Narasi
                                    </Button>
                                  )
                                }
                              />
                              <CardContent>
                                {activity.narrative_outcome !== null && (
                                  <CustomCard>
                                    <Box dangerouslySetInnerHTML={{ __html: activity.narrative_outcome }} />
                                  </CustomCard>
                                )}
                                {user !== null && ['superadmin', 'biro_mkos'].includes(user.role) && (
                                  <Button
                                    variant="outlined"
                                    onClick={handleDialogMonev}
                                    startIcon={<AddRounded />}
                                    sx={{ mb: 2 }}
                                    fullWidth
                                  >
                                    Tambah Outcome
                                  </Button>
                                )}
                                <ul style={{ paddingLeft: 20 }}>
                                  {monev.data
                                    .slice(0)
                                    .reverse()
                                    .map((value, index) => (
                                      <li style={{ paddingBottom: 20 }} key={index}>
                                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                                          <b>{DateFormat(value.date)}</b>
                                          {user !== null && ['superadmin', 'biro_mkos'].includes(user.role) && (
                                            <IconButton onClick={(e) => handleClick(e, 'monev', value)}>
                                              <MoreVert fontSize="small" />
                                            </IconButton>
                                          )}
                                        </Stack>
                                        <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                                          <Typography variant="body2" width={130}>
                                            Capaian Target
                                          </Typography>
                                          <Typography variant="body2">:</Typography>
                                          <Typography variant="body2" width={150}>
                                            {NumberFormat(value.target)} {value.unit.param}
                                          </Typography>
                                          <Divider orientation="vertical" flexItem />
                                          <Typography variant="body2">{value.target_percent}%</Typography>
                                        </Stack>
                                        <Stack direction="row" spacing={2}>
                                          <Typography variant="body2" width={130}>
                                            Capaian Realisasi
                                          </Typography>
                                          <Typography variant="body2">:</Typography>
                                          <Typography variant="body2" width={150}>
                                            {NumberFormat(value.realization, 'Rp')}
                                          </Typography>
                                          <Divider orientation="vertical" flexItem />
                                          <Typography variant="body2">
                                            {value.realization_percent <= 100 ? value.realization_percent : 100}%
                                          </Typography>
                                        </Stack>
                                      </li>
                                    ))}
                                </ul>
                              </CardContent>
                            </Card>
                            {/* Rekomendasi */}
                            <Card>
                              <CardHeader
                                title="Rekomendasi"
                                action={
                                  user !== null &&
                                  ['superadmin', 'biro_mkos'].includes(user.role) && (
                                    <Button
                                      onClick={(e) => handleDialogNarasi(e, 'recommendation')}
                                      startIcon={<EditRounded fontSize="small" />}
                                    >
                                      Masukkan Rekomendasi
                                    </Button>
                                  )
                                }
                              />
                              <CardContent>
                                {activity.recommendation !== null && (
                                  <Box dangerouslySetInnerHTML={{ __html: activity.recommendation }} />
                                )}
                              </CardContent>
                            </Card>
                            {/* Timeline */}
                            <Card>
                              <CardContent>
                                <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
                                  <Typography variant="h6" ml={1}>
                                    Start
                                  </Typography>
                                  <Typography variant="h6" mr={1}>
                                    Finish
                                  </Typography>
                                </Stack>
                                <Stepper nonLinear activeStep={activeStep}>
                                  {monev.data.map((value, index) => (
                                    <Step key={index}>
                                      <StepButton color="inherit" onClick={() => handleStep(index, value)}>
                                        {DateFormat(value.date)}
                                      </StepButton>
                                    </Step>
                                  ))}
                                </Stepper>
                              </CardContent>
                            </Card>
                          </Stack>
                        ) : (
                          <Loading />
                        )}
                      </>
                    )}
                  </Grid>
                </Grid>
              </Box>
            ) : (
              <Loading />
            )}
          </>
        )}
      </Container>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {staging.type === 'activity' ? (
          <MenuItem onClick={() => editActivity(staging.data)}>Ubah</MenuItem>
        ) : (
          <MenuItem onClick={() => editMonev(staging.data)}>Ubah</MenuItem>
        )}
        <MenuItem onClick={() => handleDialogDelete(staging.type, staging.data)}>Hapus</MenuItem>
      </Menu>
      <Dialog open={dialogActivity} onClose={handleDialogActivity} fullWidth component="form" onSubmit={submitActivity}>
        <DialogTitle>{data.id === undefined ? 'Tambah' : 'Ubah'} Kegiatan</DialogTitle>
        <DialogContent>
          <FormControl margin="normal" fullWidth>
            <TextField
              label="Nama Kegiatan"
              name="name"
              value={data.name}
              onChange={handleChange}
              error={!!error.name}
              helperText={error.name !== undefined && Validate(error.name[0])}
            />
          </FormControl>
          <Grid container spacing={{ xs: 0, sm: 3 }}>
            <Grid item xs={12} sm={6}>
              <FormControl margin="normal" fullWidth>
                <TextField
                  label="Target"
                  name="target"
                  type="tel"
                  value={data.target}
                  onChange={handleChange}
                  error={!!error.target}
                  helperText={error.target !== undefined && Validate(error.target[0])}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl margin="normal" fullWidth>
                <TextField
                  label="Satuan"
                  name="unit_id"
                  defaultValue=""
                  value={data.unit_id}
                  onChange={handleChange}
                  error={!!error.unit_id}
                  helperText={error.unit_id !== undefined && Validate(error.unit_id[0])}
                  select
                >
                  <MenuItem value="" disabled selected>
                    Pilih Satuan
                  </MenuItem>
                  {unit.map((value, index) => (
                    <MenuItem key={index} value={value.id}>
                      {value.param}
                    </MenuItem>
                  ))}
                </TextField>
              </FormControl>
            </Grid>
          </Grid>
          <FormControl margin="normal" fullWidth>
            <TextField
              label="Anggaran"
              name="budget"
              type="tel"
              value={data.budget}
              onChange={handleChange}
              InputProps={{
                startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
              }}
              error={!!error.budget}
              helperText={error.budget !== undefined && Validate(error.budget[0])}
            />
          </FormControl>
          <FormGroup>
            <Typography variant="caption" color="text.secondary" mt={2} gutterBottom>
              Pilih Unit Pelaksana
            </Typography>
            {executionUnit.map((value, index) => (
              <FormControlLabel
                key={index}
                control={
                  <Checkbox checked={data.executor_id.includes(value.id)} onChange={handleCheckbox} value={value.id} />
                }
                label={value.param}
              />
            ))}
          </FormGroup>
          <FormHelperText error={!!error.executor_id}>
            {error.executor_id !== undefined && Validate(error.executor_id[0])}
          </FormHelperText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button variant="outlined" onClick={handleDialogActivity}>
            Batal
          </Button>
          <LoadingButton variant="contained" type="submit" loading={loading}>
            Submit
          </LoadingButton>
        </DialogActions>
      </Dialog>
      <Dialog open={dialogNarasi} onClose={handleDialogNarasi} fullWidth component="form" onSubmit={submitNarasi}>
        <DialogTitle>Masukkan {narasi.type === 'recommendation' ? 'Rekomendasi' : 'Narasi'}</DialogTitle>
        <DialogContent>
          <FormControl margin="normal" fullWidth>
            <CKEditor
              editor={ClassicEditor}
              data={narasi[narasi.type]}
              onChange={(e, editor) => {
                const newValue = editor.getData();
                setNarasi({ ...narasi, [narasi.type]: newValue });
                setError({ ...error, [narasi.type]: undefined });
              }}
            />
            {!!error[narasi.type] && (
              <FormHelperText error sx={{ ml: 0 }}>
                {Validate(error[narasi.type][0])}
              </FormHelperText>
            )}
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button variant="outlined" onClick={handleDialogNarasi}>
            Batal
          </Button>
          <LoadingButton variant="contained" type="submit" loading={loading}>
            Submit
          </LoadingButton>
        </DialogActions>
      </Dialog>
      <Dialog open={dialogMonev} onClose={handleDialogMonev} fullWidth component="form" onSubmit={submitMonev}>
        <DialogTitle>{data.id === undefined ? 'Tambah' : 'Ubah'} Outcome</DialogTitle>
        <DialogContent>
          <FormControl margin="normal" fullWidth>
            <TextField
              label="Tanggal"
              name="date"
              type="date"
              value={data.date}
              onChange={handleChange}
              error={!!error.date}
              helperText={error.date !== undefined && 'Masukkan tanggal.'}
              InputLabelProps={{ shrink: true }}
            />
          </FormControl>
          <Grid container spacing={{ xs: 0, sm: 3 }}>
            <Grid item xs={12} sm={6}>
              <FormControl margin="normal" fullWidth>
                <TextField
                  label="Capaian Target"
                  name="target"
                  type="tel"
                  value={data.target}
                  onChange={handleChange}
                  error={!!error.target}
                  helperText={error.target !== undefined && 'Masukkan capaian target.'}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl margin="normal" fullWidth>
                <TextField
                  label="Satuan"
                  name="unit_id"
                  defaultValue=""
                  value={data.unit_id}
                  onChange={handleChange}
                  error={!!error.unit_id}
                  helperText={error.unit_id !== undefined && Validate(error.unit_id[0])}
                  select
                >
                  <MenuItem value="" disabled selected>
                    Pilih Satuan
                  </MenuItem>
                  {unit.map((value, index) => (
                    <MenuItem key={index} value={value.id}>
                      {value.param}
                    </MenuItem>
                  ))}
                </TextField>
              </FormControl>
            </Grid>
          </Grid>
          <FormControl margin="normal" fullWidth>
            <TextField
              label="Capaian Realisasi"
              name="realization"
              type="tel"
              value={data.realization}
              onChange={handleChange}
              InputProps={{
                startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
              }}
              error={!!error.realization}
              helperText={error.realization !== undefined && 'Masukkan capaian realisasi.'}
            />
          </FormControl>
          <FormControl margin="normal" fullWidth>
            <TextField
              label="Narasi"
              name="narasi"
              value={data.narasi}
              onChange={handleChange}
              error={!!error.narasi}
              helperText={error.narasi !== undefined && 'Masukkan narasi.'}
              multiline
              rows={4}
            />
          </FormControl>
          <FormControl margin="normal" fullWidth>
            <TextField
              label="Kendala"
              name="constraint"
              value={data.constraint}
              onChange={handleChange}
              error={!!error.constraint}
              helperText={error.constraint !== undefined && 'Masukkan kendala.'}
              multiline
              rows={4}
            />
          </FormControl>
          <FormControl margin="normal" fullWidth>
            <TextField
              label="Solusi"
              name="solution"
              value={data.solution}
              onChange={handleChange}
              error={!!error.solution}
              helperText={error.solution !== undefined && 'Masukkan solusi.'}
              multiline
              rows={4}
            />
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button variant="outlined" onClick={handleDialogMonev}>
            Batal
          </Button>
          <LoadingButton variant="contained" type="submit" loading={loading}>
            Submit
          </LoadingButton>
        </DialogActions>
      </Dialog>
      <Dialog open={dialogDelete} onClose={handleDialogDelete} maxWidth="xs" fullWidth>
        <DialogTitle>Hapus {staging.type === 'activity' ? 'Kegiatan' : 'Outcome'}</DialogTitle>
        <DialogContent>
          Anda yakin ingin menghapus {staging.type === 'activity' ? 'kegiatan' : 'Outcome'}?
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button variant="outlined" onClick={handleDialogDelete}>
            Batal
          </Button>
          <LoadingButton variant="contained" type="submit" loading={loading} onClick={() => handleDelete()}>
            Hapus
          </LoadingButton>
        </DialogActions>
      </Dialog>
      <Dialog open={dialogDetail} onClose={handleDialogDetail} fullWidth>
        <DialogTitle>Outcome Tanggal {staging.data?.date !== undefined && DateFormat(staging.data?.date)}</DialogTitle>
        <Divider />
        <DialogTitle>Narasi</DialogTitle>
        <DialogContent>{staging.data?.narasi}</DialogContent>
        <DialogTitle>Kendala</DialogTitle>
        <DialogContent>{staging.data?.constraint}</DialogContent>
        <DialogTitle>Solusi</DialogTitle>
        <DialogContent>{staging.data?.solution}</DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button variant="outlined" onClick={handleDialogDetail}>
            Tutup
          </Button>
        </DialogActions>
      </Dialog>
    </Page>
  );
}
