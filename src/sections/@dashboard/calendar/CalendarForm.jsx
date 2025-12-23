import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
// import * as Yup from 'yup';
import merge from 'lodash/merge';
// import { isBefore } from 'date-fns';
// import { useSnackbar } from 'notistack';
// form
import { useForm, Controller } from 'react-hook-form';
// import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import {
  Box,
  Stack,
  Button,
  Tooltip,
  TextField,
  IconButton,
  DialogActions,
  FormGroup,
  Typography,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { DatePicker } from '@mui/x-date-pickers';
// redux
import { useDispatch } from '../../../redux/store';
import { createEvent, updateEvent, deleteEvent } from '../../../redux/slices/calendar';
// components
import axios from '../../../variable/axios';
import Iconify from '../../../components/Iconify';
// import { ColorSinglePicker } from '../../../components/color-utils';
// import { Box, RHFTextField, RHFSwitch } from '../../../components/hook-form';

// ----------------------------------------------------------------------

// const COLOR_OPTIONS = [
//   '#00AB55', // theme.palette.primary.main,
//   '#1890FF', // theme.palette.info.main,
//   '#54D62C', // theme.palette.success.main,
//   '#FFC107', // theme.palette.warning.main,
//   '#FF4842', // theme.palette.error.main
//   '#04297A', // theme.palette.info.darker
//   '#7A0C2E', // theme.palette.error.darker
// ];

const getInitialValues = (event, range) => {
  const _event = {
    //  title: '',
    //  description: '',
    //  textColor: '#1890FF',
    //  allDay: false,
    //  start: range ? new Date(range.start) : new Date(),
    //  end: range ? new Date(range.end) : new Date(),
    title: '',
    name: '',
    institution: '',
    date: '',
    content: '',
    instruction: '',
    unit_id: [],
  };

  if (event || range) {
    return merge({}, _event, event);
  }

  return _event;
};

// ----------------------------------------------------------------------

CalendarForm.propTypes = {
  event: PropTypes.object,
  range: PropTypes.object,
  unit: PropTypes.array,
  setUnit: PropTypes.func,
  onCancel: PropTypes.func,
};

export default function CalendarForm({ event, range, unit, setUnit, onCancel }) {
  const [data, setData] = useState({
    title: '',
    name: '',
    institution: '',
    date: '',
    content: '',
    instruction: '',
    unit_id: [],
  });

  const getExecutionUnit = async () => {
    await axios.get(`param/execution_unit`).then((res) => {
      // console.log(res.data.data);
      setUnit(res.data.data);
    });
  };

  useEffect(() => {
    if (unit.length < 1) getExecutionUnit();
  });

  const handleChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  //   const { enqueueSnackbar } = useSnackbar();

  const dispatch = useDispatch();

  const isCreating = Object.keys(event).length === 0;

  //   const EventSchema = Yup.object().shape({
  //     title: Yup.string().max(255).required('Title is required'),
  //     description: Yup.string().max(5000),
  //   });

  const methods = useForm({
    //  resolver: yupResolver(EventSchema),
    defaultValues: getInitialValues(event, range),
  });

  const {
    reset,
    //  watch,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data) => {
    try {
      console.log(data);
      const formData = new FormData();
      if (event.id) formData.append('_method', 'patch');
      formData.append('title', data.title);
      formData.append('name', data.name);
      formData.append('institution', data.institution);
      formData.append('date', data.date);
      formData.append('content', data.content);
      formData.append('instruction', data.instruction);
      data.unit_id.map((value, index) => formData.append(`unit_id[${index}]`, value));
      if (event.id) {
        dispatch(updateEvent(event.id, formData));
        //   enqueueSnackbar('Update success!');
      } else {
        //   enqueueSnackbar('Create success!');
        dispatch(createEvent(formData));
      }
      // onCancel();
      reset();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!event.id) return;
    try {
      onCancel();
      dispatch(deleteEvent(event.id));
      // enqueueSnackbar('Delete success!');
    } catch (error) {
      console.error(error);
    }
  };

  //   const values = watch();

  //   const isDateError = isBefore(new Date(values.end), new Date(values.start));

  const handleCheckbox = (e) => {
    const filter = data.unit_id.filter((value) => value === e.target.value);
    if (filter.length < 1) {
      setData({
        ...data,
        unit_id: [...data.unit_id, e.target.value],
      });
    } else {
      const newState = data.unit_id.filter((value) => value !== e.target.value);
      setData({
        ...data,
        unit_id: newState,
      });
    }
    //   setError({
    //     ...error,
    //     unit_id: undefined,
    //   });
  };

  return (
    <Box component="form" methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3} sx={{ p: 3 }}>
        <TextField name="title" label="Judul" value={data.title} onChange={handleChange} />
        <TextField name="name" label="Nama Penyampai Audiensi/Rapat" value={data.name} onChange={handleChange} />
        <TextField name="institution" label="Lembaga Audiensi/Rapat" value={data.institution} onChange={handleChange} />
        <Controller
          name="date"
          control={control}
          render={({ field }) => (
            <DatePicker
              {...field}
              label="Tanggal Audiensi/Rapat"
              inputFormat="dd/MM/yyyy"
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          )}
        />
        <TextField
          name="content"
          label="Isi Audiensi/Rapat"
          multiline
          rows={4}
          value={data.content}
          onChange={handleChange}
        />
        <TextField
          name="instruction"
          label="Arahan Menteri"
          multiline
          rows={4}
          value={data.instruction}
          onChange={handleChange}
        />
        <FormGroup>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Unit Penindaklanjut
          </Typography>
          {unit.map((value, index) => (
            <FormControlLabel
              key={index}
              control={
                <Checkbox checked={data.unit_id.includes(value.id)} onChange={handleCheckbox} value={value.id} />
              }
              label={value.param}
            />
          ))}
        </FormGroup>
      </Stack>

      <DialogActions>
        {!isCreating && (
          <Tooltip title="Delete Event">
            <IconButton onClick={handleDelete}>
              <Iconify icon="eva:trash-2-outline" width={20} height={20} />
            </IconButton>
          </Tooltip>
        )}
        <Box sx={{ flexGrow: 1 }} />

        <Button variant="outlined" color="inherit" onClick={onCancel}>
          Batal
        </Button>

        <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
          Submit
        </LoadingButton>
      </DialogActions>
    </Box>
  );
}
