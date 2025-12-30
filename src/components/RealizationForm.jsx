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
  Chip,
  Divider,
  alpha,
  Tooltip,
  Fade,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  CalendarMonth as CalendarIcon,
  AccountBalance as AccountIcon,
  Save as SaveIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import Select from 'react-select';
import axios from '../variable/axios';

export default function RealizationForm({ open, onClose, onSuccess }) {
  // Auto-fill with today's date
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [date, setDate] = useState(getTodayDate());
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
  // Fixed deputi: Deputi Bidang Kewirausahaan (401744)
  const [selectedDeputi, setSelectedDeputi] = useState({
    value: '401744',
    label: 'Deputi Bidang Kewirausahaan',
  });
  const [loadingUnits, setLoadingUnits] = useState(false);

  // Fetch units on dialog open (deputi is fixed to 401744)
  useEffect(() => {
    if (open) {
      // Deputi is fixed, fetch units directly
      fetchUnits('401744');
    }
  }, [open]);

  const fetchUnits = async (parentCode = 401744) => {
    setLoadingUnits(true);
    try {
      const response = await axios.get(`param/asdep_dropdown?parent_code=${parentCode}`);
      const options = response.data.data
        .map((item) => ({
          value: item.value,
          label: item.label,
        }))
        .reverse();
      setUnitOptions(options);
    } catch (error) {
      console.error('Error fetching units:', error);
      alert('Gagal memuat data unit');
    } finally {
      setLoadingUnits(false);
    }
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

    // Validasi semua code terisi
    const emptyCode = rows.find((row) => !row.code);
    if (emptyCode) {
      alert('Semua Unit harus dipilih!');
      return;
    }

    setLoadingSubmit(true);

    try {
      // 1. Hitung total untuk parent (Deputi)
      const parentData = {
        code: selectedDeputi.value, // Parent code dari deputi
        budget: calculateTotal('budget'),
        aa: calculateTotal('aa'),
        budget_aa: calculateTotal('budget_aa'),
        realization_spp: calculateTotal('realization_spp'),
        sp2d: calculateTotal('sp2d'),
        date: date,
        parent_code: null, // Parent tidak punya parent_code
      };

      // 2. Insert parent row terlebih dahulu
      await axios.post('realization', parentData);

      // 3. Insert semua child rows dengan parent_code
      for (const row of rows) {
        await axios.post('realization', {
          code: row.code,
          budget: Number(row.budget) || 0,
          aa: Number(row.aa) || 0,
          budget_aa: Number(row.budget_aa) || 0,
          realization_spp: Number(row.realization_spp) || 0,
          sp2d: Number(row.sp2d) || 0,
          date: date,
          parent_code: selectedDeputi.value, // Set parent_code ke deputi
        });
      }

      alert('✅ Data berhasil disimpan!');
      onSuccess?.();
      onClose();

      // Reset form
      setDate('');
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
      minHeight: '42px',
      fontSize: '14px',
      borderRadius: '8px',
      borderColor: state.isFocused ? '#1976d2' : '#e0e0e0',
      backgroundColor: state.isDisabled ? '#f5f5f5' : '#fff',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(25, 118, 210, 0.15)' : 'none',
      transition: 'all 0.2s ease',
      '&:hover': {
        borderColor: '#1976d2',
      },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#1976d2' : state.isFocused ? '#e3f2fd' : '#fff',
      color: state.isSelected ? '#fff' : '#333',
      cursor: 'pointer',
      fontSize: '14px',
      padding: '10px 12px',
      transition: 'background-color 0.15s ease',
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
      borderRadius: '8px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      overflow: 'hidden',
    }),
    menuPortal: (provided) => ({
      ...provided,
      zIndex: 9999,
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#9e9e9e',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#333',
      fontWeight: 500,
    }),
  };

  // Common styles
  const headerCellStyle = {
    bgcolor: '#1976d2',
    color: '#fff',
    fontWeight: 600,
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    py: 1.5,
    borderBottom: 'none',
  };

  const inputStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
      transition: 'all 0.2s ease',
      '&:hover': {
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: '#1976d2',
        },
      },
      '&.Mui-focused': {
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: '#1976d2',
          borderWidth: '2px',
        },
      },
    },
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      TransitionComponent={Fade}
      transitionDuration={300}
      PaperProps={{
        sx: {
          borderRadius: '16px',
        },
      }}
    >
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          color: '#fff',
          py: 2.5,
          px: 3,
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1.5}>
            <AccountIcon sx={{ fontSize: 28 }} />
            <Typography variant="h6" fontWeight={600}>
              Input Realisasi Anggaran
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={2}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                bgcolor: 'rgba(255,255,255,0.15)',
                borderRadius: '10px',
                px: 1.5,
                py: 0.75,
              }}
            >
              <CalendarIcon sx={{ mr: 1, fontSize: 20 }} />
              <Typography sx={{ fontSize: '14px', fontWeight: 500 }}>
                {new Date(date).toLocaleDateString('id-ID', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
              </Typography>
            </Box>
            <IconButton
              onClick={onClose}
              sx={{
                color: '#fff',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3, bgcolor: '#fafafa' }}>
        {/* Hidden input for fixed Deputi: Deputi Bidang Kewirausahaan (401744) */}
        <input type="hidden" name="deputi" value="401744" />

        {loadingUnits ? (
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            minHeight="300px"
            gap={2}
          >
            <CircularProgress size={48} thickness={4} />
            <Typography color="text.secondary">Memuat data...</Typography>
          </Box>
        ) : (
          <>
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{
                my: 2,
                maxHeight: 450,
                borderRadius: '12px',
                border: '1px solid #e0e0e0',
              }}
            >
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell align="center" sx={{ ...headerCellStyle, minWidth: 50 }}>
                      No
                    </TableCell>
                    <TableCell sx={{ ...headerCellStyle, minWidth: 280 }}>Unit</TableCell>
                    <TableCell align="right" sx={{ ...headerCellStyle, minWidth: 130 }}>
                      Pagu Awal
                    </TableCell>
                    <TableCell align="right" sx={{ ...headerCellStyle, minWidth: 130 }}>
                      Auto Adjustment
                    </TableCell>
                    <TableCell align="right" sx={{ ...headerCellStyle, minWidth: 140, bgcolor: '#0d47a1' }}>
                      Pagu Setelah AA
                    </TableCell>
                    <TableCell align="right" sx={{ ...headerCellStyle, minWidth: 130 }}>
                      Realisasi SPP
                    </TableCell>
                    <TableCell align="right" sx={{ ...headerCellStyle, minWidth: 130 }}>
                      Realisasi SP2D
                    </TableCell>
                    <TableCell align="center" sx={{ ...headerCellStyle, minWidth: 60 }}>
                      Aksi
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row, index) => (
                    <TableRow
                      key={index}
                      sx={{
                        bgcolor: index % 2 === 0 ? '#fff' : '#fafafa',
                        '&:hover': {
                          bgcolor: '#e3f2fd',
                        },
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      <TableCell align="center" sx={{ fontWeight: 600, color: '#666' }}>
                        {index + 1}
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <Select
                          options={unitOptions}
                          value={row.unit_id}
                          onChange={(selected) => handleRowChange(index, 'unit_id', selected)}
                          placeholder={selectedDeputi ? '🔍 Pilih Unit...' : '⚠️ Pilih Deputi dulu'}
                          isClearable
                          isSearchable
                          isDisabled={!selectedDeputi || loadingUnits}
                          isLoading={loadingUnits}
                          styles={customSelectStyles}
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                          noOptionsMessage={() => 'Unit tidak ditemukan'}
                        />
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <TextField
                          size="small"
                          type="number"
                          fullWidth
                          value={row.budget}
                          onChange={(e) => handleRowChange(index, 'budget', e.target.value)}
                          inputProps={{ min: 0, step: '0.01' }}
                          placeholder="0"
                          sx={inputStyle}
                        />
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <TextField
                          size="small"
                          type="number"
                          fullWidth
                          value={row.aa}
                          onChange={(e) => handleRowChange(index, 'aa', e.target.value)}
                          inputProps={{ min: 0, step: '0.01' }}
                          placeholder="0"
                          sx={inputStyle}
                        />
                      </TableCell>
                      <TableCell sx={{ py: 1.5, bgcolor: alpha('#1976d2', 0.08) }}>
                        <TextField
                          size="small"
                          type="number"
                          fullWidth
                          value={row.budget_aa}
                          disabled
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '8px',
                              bgcolor: alpha('#1976d2', 0.15),
                              '& input': {
                                fontWeight: 600,
                                color: '#1565c0',
                                textAlign: 'right',
                              },
                            },
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <TextField
                          size="small"
                          type="number"
                          fullWidth
                          value={row.realization_spp}
                          onChange={(e) => handleRowChange(index, 'realization_spp', e.target.value)}
                          inputProps={{ min: 0, step: '0.01' }}
                          placeholder="0"
                          sx={inputStyle}
                        />
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <TextField
                          size="small"
                          type="number"
                          fullWidth
                          value={row.sp2d}
                          onChange={(e) => handleRowChange(index, 'sp2d', e.target.value)}
                          inputProps={{ min: 0, step: '0.01' }}
                          placeholder="0"
                          sx={inputStyle}
                        />
                      </TableCell>
                      <TableCell align="center" sx={{ py: 1.5 }}>
                        <Tooltip title={rows.length === 1 ? 'Minimal 1 baris' : 'Hapus baris'} arrow>
                          <span>
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => deleteRow(index)}
                              disabled={rows.length === 1}
                              sx={{
                                bgcolor: rows.length === 1 ? 'transparent' : alpha('#f44336', 0.1),
                                '&:hover': {
                                  bgcolor: alpha('#f44336', 0.2),
                                },
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}

                  {/* Total Row - Representing Parent (Deputi) */}
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      sx={{
                        background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        py: 2,
                        textAlign: 'center',
                      }}
                    >
                      📊 TOTAL {selectedDeputi ? `(${selectedDeputi.label})` : ''}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        bgcolor: '#fff3e0',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        color: '#e65100',
                        py: 2,
                      }}
                    >
                      {formatNumber(calculateTotal('budget'))}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        bgcolor: '#fff3e0',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        color: '#e65100',
                        py: 2,
                      }}
                    >
                      {formatNumber(calculateTotal('aa'))}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        bgcolor: '#e3f2fd',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        color: '#1565c0',
                        py: 2,
                      }}
                    >
                      {formatNumber(calculateTotal('budget_aa'))}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        bgcolor: '#fff3e0',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        color: '#e65100',
                        py: 2,
                      }}
                    >
                      {formatNumber(calculateTotal('realization_spp'))}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        bgcolor: '#fff3e0',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        color: '#e65100',
                        py: 2,
                      }}
                    >
                      {formatNumber(calculateTotal('sp2d'))}
                    </TableCell>
                    <TableCell sx={{ bgcolor: '#fff3e0', py: 2 }} />
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <Box mt={2.5}>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addRow}
                fullWidth
                disabled={!selectedDeputi}
                sx={{
                  py: 1.5,
                  borderRadius: '10px',
                  borderWidth: 2,
                  borderStyle: 'dashed',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  textTransform: 'none',
                  '&:hover': {
                    borderWidth: 2,
                    bgcolor: alpha('#1976d2', 0.05),
                  },
                  '&.Mui-disabled': {
                    borderColor: '#e0e0e0',
                  },
                }}
              >
                + Tambah Baris Unit
              </Button>
            </Box>
          </>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2, bgcolor: '#fafafa' }}>
        <Button
          onClick={onClose}
          disabled={loadingSubmit}
          startIcon={<CloseIcon />}
          sx={{
            px: 3,
            py: 1,
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 500,
            color: '#666',
            '&:hover': {
              bgcolor: '#f5f5f5',
            },
          }}
        >
          Batal
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loadingSubmit || !selectedDeputi || !date}
          startIcon={loadingSubmit ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
          sx={{
            px: 4,
            py: 1,
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.95rem',
            background: 'linear-gradient(135deg, #4caf50 0%, #43a047 100%)',
            boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #43a047 0%, #388e3c 100%)',
              boxShadow: '0 6px 16px rgba(76, 175, 80, 0.4)',
            },
            '&.Mui-disabled': {
              background: '#e0e0e0',
              boxShadow: 'none',
            },
          }}
        >
          {loadingSubmit ? 'Menyimpan...' : `Simpan Data`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
