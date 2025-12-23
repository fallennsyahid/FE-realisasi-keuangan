import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Paper,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import Select from 'react-select';
import axios from '../variable/axios';

export default function RealizationForm({ open, onClose, onSuccess }) {
  const [date, setDate] = useState('');
  const [rows, setRows] = useState([
    {
      code: '',
      unit_id: null,
      budget: '',
      aa: '',
      budget_aa: '',
      realization_spp: '',
      sp2d: '',
    },
  ]);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  // Deputi & Unit states
  const [deputiOptions, setDeputiOptions] = useState([]);
  const [unitOptions, setUnitOptions] = useState([]);
  const [selectedDeputi, setSelectedDeputi] = useState(null);
  const [loadingDeputi, setLoadingDeputi] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(false);

  // Fetch deputi dropdown data on dialog open
  useEffect(() => {
    if (open) {
      fetchDeputi();
      // Reset selections when dialog opens
      setSelectedDeputi(null);
      setUnitOptions([]);
    }
  }, [open]);

  // Fetch units when deputi changes
  useEffect(() => {
    if (selectedDeputi) {
      fetchUnits(selectedDeputi.value);
      // Reset unit in all rows
      setRows(rows.map((row) => ({ ...row, unit_id: null, code: '' })));
    } else {
      setUnitOptions([]);
      // Reset all rows
      setRows(rows.map((row) => ({ ...row, unit_id: null, code: '' })));
    }
  }, [selectedDeputi]);

  const fetchDeputi = async () => {
    setLoadingDeputi(true);
    try {
      const response = await axios.get('param/deputi_dropdown');
      const options = response.data.data.map((item) => ({
        value: item.value,
        label: item.label,
      }));
      setDeputiOptions(options);
    } catch (error) {
      console.error('Error fetching deputi:', error);
      alert('Gagal memuat data deputi');
    } finally {
      setLoadingDeputi(false);
    }
  };

  const fetchUnits = async (parentCode) => {
    setLoadingUnits(true);
    try {
      const response = await axios.get(`param/asdep_dropdown?parent_code=${parentCode}`);
      const options = response.data.data.map((item) => ({
        value: item.value,
        label: item.label,
      }));
      setUnitOptions(options);
    } catch (error) {
      console.error('Error fetching units:', error);
      alert('Gagal memuat data unit');
    } finally {
      setLoadingUnits(false);
    }
  };

  const handleDateChange = (e) => {
    setDate(e.target.value);
  };

  const handleRowChange = (index, field, value) => {
    const newRows = [...rows];

    if (field === 'unit_id') {
      // Jika dropdown dipilih, set code otomatis dari unit.value
      newRows[index].code = value?.value || '';
      newRows[index].unit_id = value;
    } else {
      newRows[index][field] = value;
    }

    // Auto calculate budget_aa jika budget atau aa berubah
    if (field === 'budget' || field === 'aa') {
      const budget = parseFloat(newRows[index].budget) || 0;
      const aa = parseFloat(newRows[index].aa) || 0;
      newRows[index].budget_aa = budget - aa;
    }

    setRows(newRows);
  };

  const addRow = () => {
    setRows([
      ...rows,
      {
        code: '',
        unit_id: null,
        budget: '',
        aa: '',
        budget_aa: '',
        realization_spp: '',
        sp2d: '',
      },
    ]);
  };

  const deleteRow = (index) => {
    if (rows.length > 1) {
      const newRows = rows.filter((_, i) => i !== index);
      setRows(newRows);
    }
  };

  const calculateTotal = (field) => {
    return rows.reduce((sum, row) => sum + (parseFloat(row[field]) || 0), 0);
  };

  const handleSubmit = async () => {
    if (!date) {
      alert('Tanggal harus diisi!');
      return;
    }

    if (!selectedDeputi) {
      alert('Deputi harus dipilih!');
      return;
    }

    // Validasi semua code terisi
    const emptyCode = rows.find((row) => !row.code);
    if (emptyCode) {
      alert('Semua Unit harus dipilih!');
      return;
    }

    setLoadingSubmit(true);

    try {
      // Submit setiap row
      for (const row of rows) {
        await axios.post('realization', {
          code: row.code,
          budget: Number(row.budget) || 0,
          aa: Number(row.aa) || 0,
          budget_aa: Number(row.budget_aa) || 0,
          realization_spp: Number(row.realization_spp) || 0,
          sp2d: Number(row.sp2d) || 0,
          date: date,
        });
      }

      alert('✅ Data berhasil disimpan!');
      onSuccess?.();
      onClose();

      // Reset form
      setDate('');
      setSelectedDeputi(null);
      setUnitOptions([]);
      setRows([
        {
          code: '',
          unit_id: null,
          budget: '',
          aa: '',
          budget_aa: '',
          realization_spp: '',
          sp2d: '',
        },
      ]);
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.meta?.message || 'Gagal menyimpan data realisasi';
      alert('❌ ' + errorMsg);
    } finally {
      setLoadingSubmit(false);
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('id-ID').format(num);
  };

  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      minHeight: '40px',
      fontSize: '14px',
      borderColor: state.isFocused ? '#1976d2' : '#ccc',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(25, 118, 210, 0.1)' : 'none',
      '&:hover': {
        borderColor: '#1976d2',
      },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#1976d2' : state.isFocused ? '#f5f5f5' : '#fff',
      color: state.isSelected ? '#fff' : '#333',
      cursor: 'pointer',
      fontSize: '14px',
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 1300,
    }),
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Input Realisasi Anggaran</Typography>
          <TextField
            label="Tanggal"
            name="date"
            type="date"
            size="small"
            InputLabelProps={{ shrink: true }}
            value={date}
            onChange={handleDateChange}
            sx={{ width: 200 }}
            required
          />
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {loadingDeputi ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Dropdown Deputi */}
            <Box mb={3}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Deputi <span style={{ color: 'red' }}>*</span>
              </Typography>
              <Select
                options={deputiOptions}
                value={selectedDeputi}
                onChange={setSelectedDeputi}
                placeholder="Pilih Deputi..."
                isClearable
                isSearchable
                styles={customSelectStyles}
                noOptionsMessage={() => 'Deputi tidak ditemukan'}
              />
            </Box>
          </>
        )}

        {!loadingDeputi && (
          <>
            <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#FFF9C4' }}>
                    <TableCell align="center" sx={{ minWidth: 50, bgcolor: '#FFF9C4', fontWeight: 'bold' }}>
                      No
                    </TableCell>
                    <TableCell sx={{ minWidth: 280, bgcolor: '#FFF9C4', fontWeight: 'bold' }}>Unit</TableCell>
                    <TableCell sx={{ minWidth: 120, bgcolor: '#FFF9C4', fontWeight: 'bold', display: 'none' }}>
                      Code Unit
                    </TableCell>
                    <TableCell align="right" sx={{ minWidth: 120, bgcolor: '#FFF9C4', fontWeight: 'bold' }}>
                      Pagu Awal
                    </TableCell>
                    <TableCell align="right" sx={{ minWidth: 120, bgcolor: '#FFF9C4', fontWeight: 'bold' }}>
                      Automatic Adjustment
                    </TableCell>
                    <TableCell align="right" sx={{ minWidth: 140, bgcolor: '#FFF9C4', fontWeight: 'bold' }}>
                      Pagu Setelah AA
                    </TableCell>
                    <TableCell align="right" sx={{ minWidth: 120, bgcolor: '#FFF9C4', fontWeight: 'bold' }}>
                      Realisasi SPP
                    </TableCell>
                    <TableCell align="right" sx={{ minWidth: 120, bgcolor: '#FFF9C4', fontWeight: 'bold' }}>
                      Realisasi SP2D
                    </TableCell>
                    <TableCell align="center" sx={{ minWidth: 70, bgcolor: '#FFF9C4', fontWeight: 'bold' }}>
                      Aksi
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row, index) => (
                    <TableRow key={index} hover>
                      <TableCell align="center">{index + 1}</TableCell>
                      <TableCell>
                        <Select
                          options={unitOptions}
                          value={row.unit_id}
                          onChange={(selected) => handleRowChange(index, 'unit_id', selected)}
                          placeholder={selectedDeputi ? 'Pilih Unit...' : 'Pilih Deputi dulu'}
                          isClearable
                          isSearchable
                          isDisabled={!selectedDeputi || loadingUnits}
                          isLoading={loadingUnits}
                          styles={customSelectStyles}
                          noOptionsMessage={() => 'Unit tidak ditemukan'}
                        />
                      </TableCell>
                      <TableCell sx={{ display: 'none' }}>
                        <TextField size="small" fullWidth value={row.code} disabled placeholder="Auto dari unit" />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          fullWidth
                          value={row.budget}
                          onChange={(e) => handleRowChange(index, 'budget', e.target.value)}
                          inputProps={{ min: 0, step: '0.01' }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          fullWidth
                          value={row.aa}
                          onChange={(e) => handleRowChange(index, 'aa', e.target.value)}
                          inputProps={{ min: 0, step: '0.01' }}
                        />
                      </TableCell>
                      <TableCell sx={{ bgcolor: '#fff9e6' }}>
                        <TextField
                          size="small"
                          type="number"
                          fullWidth
                          value={row.budget_aa}
                          disabled
                          sx={{
                            '& .MuiOutlinedInput-root.Mui-disabled': {
                              backgroundColor: '#ffd966',
                            },
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          fullWidth
                          value={row.realization_spp}
                          onChange={(e) => handleRowChange(index, 'realization_spp', e.target.value)}
                          inputProps={{ min: 0, step: '0.01' }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          fullWidth
                          value={row.sp2d}
                          onChange={(e) => handleRowChange(index, 'sp2d', e.target.value)}
                          inputProps={{ min: 0, step: '0.01' }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => deleteRow(index)}
                          disabled={rows.length === 1}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}

                  {/* Total Row */}
                  <TableRow sx={{ bgcolor: '#FFF9C4' }}>
                    <TableCell
                      colSpan={3}
                      align="center"
                      sx={{ fontWeight: 'bold', bgcolor: '#FFF9C4', fontSize: '1rem' }}
                    >
                      TOTAL
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: '#FFF9C4' }}>
                      {formatNumber(calculateTotal('budget'))}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: '#FFF9C4' }}>
                      {formatNumber(calculateTotal('aa'))}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: '#FFF9C4' }}>
                      {formatNumber(calculateTotal('budget_aa'))}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: '#FFF9C4' }}>
                      {formatNumber(calculateTotal('realization_spp'))}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: '#FFF9C4' }}>
                      {formatNumber(calculateTotal('sp2d'))}
                    </TableCell>
                    <TableCell sx={{ bgcolor: '#FFF9C4' }} />
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <Box mt={2}>
              <Button variant="outlined" startIcon={<AddIcon />} onClick={addRow} fullWidth disabled={!selectedDeputi}>
                Tambah Baris
              </Button>
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit" disabled={loadingSubmit}>
          Batal
        </Button>
        <Button variant="contained" onClick={handleSubmit} color="primary" disabled={loadingSubmit}>
          {loadingSubmit ? 'Menyimpan...' : `Simpan Semua Data (${rows.length} baris)`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
