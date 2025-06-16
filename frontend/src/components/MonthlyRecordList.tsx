import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  TextField,
  MenuItem,
  Card,
  CardContent,
  useTheme,
  Chip,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Add,
  Edit,
  LocalShipping,
  LocalGasStation,
  DirectionsCar,
  AttachMoney,
  DateRange,
  Delete,
  Warning
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import SearchBar from './SearchBar';
import { API_URL } from '../config';

interface MonthlyRecord {
  _id: string;
  kamyon_plaka: string;
  ay: string;
  mazot_litre: number;
  mazot_maliyet: number;
  sefer_sayisi: number;
  lastik_tamir_sayisi: number;
  lastik_tamir_maliyet: number;
}

interface Truck {
  _id: string;
  plaka: string;
  isActive: boolean;
}

const MonthlyRecordList: React.FC = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<MonthlyRecord[]>([]);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTruck, setSelectedTruck] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [alert, setAlert] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    confirmAction: () => Promise<void>;
  }>({
    open: false,
    title: '',
    message: '',
    confirmAction: async () => {}
  });

  const theme = useTheme();

  useEffect(() => {
    fetchRecords();
    fetchTrucks();
  }, [selectedTruck, selectedMonth]);

  const fetchRecords = async () => {
    try {
      let url = `${API_URL}/api/monthly-records`;
      
      // Ay ve kamyon seçili ise o ayın kayıtlarını getir ve frontend'de filtrele
      if (selectedMonth) {
        url = `${API_URL}/api/monthly-records/by-month/${selectedMonth}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Kayıtlar getirilemedi');
      }
      
      const data = await response.json();
      let records = Array.isArray(data) ? data : data ? [data] : [];

      // Eğer kamyon seçili ise, kayıtları kamyona göre filtrele
      if (selectedTruck) {
        records = records.filter(record => record?.kamyon_plaka === selectedTruck);
      }

      setRecords(records);
    } catch (error) {
      console.error('Kayıtlar yüklenirken hata:', error);
      setRecords([]);
    }
  };

  const fetchTrucks = async () => {
    try {
      const response = await fetch(`${API_URL}/api/trucks`);
      if (!response.ok) {
        throw new Error('Kamyonlar getirilemedi');
      }
      const data = await response.json();
      setTrucks(data.filter((t: Truck) => t.isActive));
    } catch (error) {
      console.error('Kamyonlar yüklenirken hata:', error);
      setTrucks([]);
    }
  };

  const handleEdit = (plaka: string, ay: string) => {
    navigate(`/monthly-record/edit/${plaka}/${ay}`);
  };

  const handleDelete = async (plaka: string, ay: string) => {
    const ayTarih = new Date(ay).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' });
    showConfirmDialog(
      'Kaydı Sil',
      `${plaka} plakalı aracın ${ayTarih} ayına ait kaydını silmek istediğinize emin misiniz?`,
      async () => {
      try {
        const response = await fetch(`${API_URL}/api/monthly-records/${plaka}/${ay}`, {
          method: 'DELETE',
        });
          
          if (response.ok) {
            showAlert('Kayıt başarıyla silindi', 'success');
        fetchRecords();
          } else {
            showAlert('Kayıt silinirken bir hata oluştu', 'error');
          }
      } catch (error) {
        console.error('Silme işlemi sırasında hata:', error);
          showAlert('Kayıt silinirken bir hata oluştu', 'error');
        }
        handleCloseConfirmDialog();
      }
    );
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  const showAlert = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setAlert({
      open: true,
      message,
      severity
    });
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialog({ ...confirmDialog, open: false });
  };

  const showConfirmDialog = (
    title: string,
    message: string,
    confirmAction: () => Promise<void>
  ) => {
    setConfirmDialog({
      open: true,
      title,
      message,
      confirmAction
    });
  };

  const filteredRecords = records.filter(record => {
    if (!record?.kamyon_plaka) return false;
    return record.kamyon_plaka.toLowerCase().includes((searchTerm || '').toLowerCase());
  });

  return (
    <Box>
      <Card sx={{ mb: 4, p: 2, borderRadius: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <DateRange sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
              Aylık Kayıtlar
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={() => navigate('/monthly-record/new')}
              sx={{ 
                ml: 'auto',
                borderRadius: 2,
                px: 3,
                py: 1,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            >
              Yeni Kayıt Ekle
            </Button>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <SearchBar
                placeholder="Plakaya göre ara..."
                value={searchTerm}
                onChange={setSearchTerm}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Kamyon Filtrele"
                value={selectedTruck}
                onChange={(e) => setSelectedTruck(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              >
                <MenuItem value="">Tümü</MenuItem>
                {trucks.map((truck) => (
                  <MenuItem key={truck._id} value={truck.plaka}>
                    {truck.plaka}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                type="month"
                fullWidth
                label="Ay Filtrele"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <TableContainer 
        component={Paper}
        sx={{ 
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.light' }}>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocalShipping />
                  Kamyon
                </Box>
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DateRange />
                  Ay
                </Box>
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocalGasStation />
                  Mazot
                </Box>
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DirectionsCar />
                  Sefer Sayısı
                </Box>
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AttachMoney />
                  Lastik Tamir
                </Box>
              </TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRecords.map((record) => (
              <TableRow 
                key={`${record.kamyon_plaka}-${record.ay}`}
                sx={{ 
                  '&:hover': { 
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <TableCell>
                  <Chip
                    icon={<LocalShipping />}
                    label={record.kamyon_plaka}
                    variant="outlined"
                    size="small"
                    sx={{ 
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      '& .MuiChip-icon': {
                        color: 'primary.main',
                      }
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {new Date(record.ay).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' })}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body2">
                      {record.mazot_litre?.toLocaleString('tr-TR')} Litre
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {record.mazot_maliyet?.toLocaleString('tr-TR')} ₺
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {record.sefer_sayisi} Sefer
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body2">
                      {record.lastik_tamir_sayisi} Adet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {record.lastik_tamir_maliyet?.toLocaleString('tr-TR')} ₺
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Düzenle">
                    <IconButton 
                      onClick={() => handleEdit(record.kamyon_plaka, record.ay)}
                      sx={{ 
                        color: 'primary.main',
                        '&:hover': { bgcolor: 'primary.light', color: 'white' },
                      }}
                    >
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Sil">
                    <IconButton 
                      onClick={() => handleDelete(record.kamyon_plaka, record.ay)}
                      sx={{ 
                        color: 'warning.main',
                        '&:hover': { bgcolor: 'warning.light', color: 'white' },
                      }}
                    >
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={confirmDialog.open}
        onClose={handleCloseConfirmDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Warning sx={{ color: 'warning.main' }} />
          {confirmDialog.title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {confirmDialog.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog} color="primary">
            İptal
          </Button>
          <Button 
            onClick={() => confirmDialog.confirmAction()} 
            color="warning"
            variant="contained"
            autoFocus
          >
            Sil
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseAlert} severity={alert.severity} sx={{ width: '100%' }}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MonthlyRecordList; 