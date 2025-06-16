import React, { useEffect, useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Box,
  Button,
  Grid,
  TextField,
  MenuItem,
  Card,
  CardContent,
  useTheme,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Edit,
  Add,
  Build,
  LocalShipping,
  Store,
  DateRange,
  Delete,
  Warning
} from '@mui/icons-material';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import { API_URL } from '../config';

interface Operation {
  _id: string;
  dukkan_id: {
    _id: string;
    dukkan_adi: string;
  };
  kamyon_plaka: string;
  maliyet: number;
  yapilan_is: string;
  tarih: string;
}

interface Workshop {
  _id: string;
  dukkan_adi: string;
  isActive: boolean;
}

interface Truck {
  _id: string;
  plaka: string;
  isActive: boolean;
}

const OperationList: React.FC = () => {
  const navigate = useNavigate();
  const [operations, setOperations] = useState<Operation[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorkshop, setSelectedWorkshop] = useState('');
  const [selectedTruck, setSelectedTruck] = useState('');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
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

  const fetchData = async () => {
    try {
      const [operationsRes, workshopsRes, trucksRes] = await Promise.all([
        fetch(`${API_URL}/api/operations`),
        fetch(`${API_URL}/api/workshops`),
        fetch(`${API_URL}/api/trucks`)
      ]);

      const [operationsData, workshopsData, trucksData] = await Promise.all([
        operationsRes.json(),
        workshopsRes.json(),
        trucksRes.json()
      ]);

      setOperations(Array.isArray(operationsData) ? operationsData : []);
      setWorkshops(Array.isArray(workshopsData) ? workshopsData.filter((w: Workshop) => w.isActive) : []);
      setTrucks(Array.isArray(trucksData) ? trucksData.filter((t: Truck) => t.isActive) : []);
    } catch (error) {
      console.error('Veri yüklenirken hata:', error);
      setOperations([]);
      setWorkshops([]);
      setTrucks([]);
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/operation/edit/${id}`);
  };

  const handleDelete = async (id: string, yapilan_is: string) => {
    showConfirmDialog(
      'İşlemi Sil',
      `"${yapilan_is}" işlemini silmek istediğinize emin misiniz?`,
      async () => {
        try {
          const response = await fetch(`${API_URL}/api/operations/${id}`, {
            method: 'DELETE',
          });
          
          if (response.ok) {
            showAlert('İşlem başarıyla silindi', 'success');
            fetchData();
          } else {
            showAlert('İşlem silinirken bir hata oluştu', 'error');
          }
        } catch (error) {
          console.error('Silme işlemi sırasında hata:', error);
          showAlert('İşlem silinirken bir hata oluştu', 'error');
        }
        handleCloseConfirmDialog();
      }
    );
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: tr });
  };

  const filteredOperations = useMemo(() => {
    return operations.filter(operation => {
      const matchesSearch = operation.yapilan_is.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesWorkshop = !selectedWorkshop || operation.dukkan_id._id === selectedWorkshop;
      const matchesTruck = !selectedTruck || operation.kamyon_plaka === selectedTruck;
      
      // Ay bazlı filtreleme için tarih kontrolü
      const operationDate = new Date(operation.tarih);
      const operationMonth = operationDate.getFullYear() + '-' + String(operationDate.getMonth() + 1).padStart(2, '0');
      
      const matchesDateRange = (!dateRange.start || operationMonth >= dateRange.start) &&
                             (!dateRange.end || operationMonth <= dateRange.end);

      return matchesSearch && matchesWorkshop && matchesTruck && matchesDateRange;
    });
  }, [operations, searchTerm, selectedWorkshop, selectedTruck, dateRange]);

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Box>
      <Card sx={{ mb: 4, p: 2, borderRadius: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Build sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
              İşlem Listesi
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={() => navigate('/operation/new')}
              sx={{ 
                ml: 'auto',
                borderRadius: 2,
                px: 3,
                py: 1,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            >
              Yeni İşlem Ekle
            </Button>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <SearchBar
                placeholder="Yapılan işe göre ara..."
                value={searchTerm}
                onChange={setSearchTerm}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                label="Dükkan Filtrele"
                value={selectedWorkshop}
                onChange={(e) => setSelectedWorkshop(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              >
                <MenuItem value="">Tümü</MenuItem>
                {workshops.map((workshop) => (
                  <MenuItem key={workshop._id} value={workshop._id}>
                    {workshop.dukkan_adi}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
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
            <Grid item xs={12} md={2}>
              <TextField
                type="month"
                fullWidth
                label="Başlangıç Ayı"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                type="month"
                fullWidth
                label="Bitiş Ayı"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
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
                  <DateRange />
                  Tarih
                </Box>
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocalShipping />
                  Kamyon
                </Box>
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Store />
                  Dükkan
                </Box>
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Build />
                  Yapılan İş
                </Box>
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Tutar</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOperations.map((operation) => (
              <TableRow 
                key={operation._id}
                sx={{ 
                  '&:hover': { 
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {format(new Date(operation.tarih), 'dd MMMM yyyy', { locale: tr })}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    icon={<LocalShipping />}
                    label={operation.kamyon_plaka}
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
                  <Chip
                    icon={<Store />}
                    label={operation.dukkan_id?.dukkan_adi}
                    variant="outlined"
                    size="small"
                    sx={{ 
                      borderColor: 'secondary.main',
                      color: 'secondary.main',
                      '& .MuiChip-icon': {
                        color: 'secondary.main',
                      }
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {operation.yapilan_is}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {operation.maliyet.toLocaleString('tr-TR')} ₺
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Düzenle">
                    <IconButton 
                      onClick={() => handleEdit(operation._id)}
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
                      onClick={() => handleDelete(operation._id, operation.yapilan_is)}
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

export default OperationList; 