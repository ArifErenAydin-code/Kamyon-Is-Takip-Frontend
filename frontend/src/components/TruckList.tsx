import React, { useEffect, useState } from 'react';
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
  Switch,
  FormControlLabel,
  Tooltip,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
  Grid,
  Card,
  CardContent,
  useTheme
} from '@mui/material';
import {
  Edit,
  Delete,
  Restore,
  Add,
  DeleteForever,
  Warning,
  LocalShipping,
  CheckCircle,
  Cancel,
  Search as SearchIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import { API_URL } from '../config';

interface Truck {
  _id: string;
  plaka: string;
  isActive: boolean;
}

interface AlertState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
}

interface ConfirmDialogState {
  open: boolean;
  title: string;
  message: string;
  confirmAction: () => Promise<void>;
  type: 'delete' | 'permanentDelete';
}

const TruckList: React.FC = () => {
  const navigate = useNavigate();
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);
  const [alert, setAlert] = useState<AlertState>({
    open: false,
    message: '',
    severity: 'info'
  });
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    open: false,
    title: '',
    message: '',
    confirmAction: async () => {},
    type: 'delete'
  });

  const theme = useTheme();

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  const showAlert = (message: string, severity: AlertState['severity']) => {
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
    confirmAction: () => Promise<void>,
    type: 'delete' | 'permanentDelete'
  ) => {
    setConfirmDialog({
      open: true,
      title,
      message,
      confirmAction,
      type
    });
  };

  useEffect(() => {
    fetchTrucks();
  }, []);

  const fetchTrucks = async () => {
    try {
      const response = await fetch(`${API_URL}/api/trucks`);
      const data = await response.json();
      setTrucks(Array.isArray(data) ? data : []);
    } catch (error) {
      showAlert('Kamyonlar yüklenirken bir hata oluştu', 'error');
      console.error('Kamyonlar yüklenirken hata:', error);
      setTrucks([]); // Ensure trucks is an empty array on error
    }
  };

  const handleEdit = (plaka: string) => {
    navigate(`/truck/edit/${plaka}`);
  };

  const handleDelete = async (plaka: string) => {
    const deleteAction = async () => {
      try {
        // Kamyonu soft delete yap
        const truckResponse = await fetch(`${API_URL}/api/trucks/${plaka}`, {
          method: 'DELETE',
        });

        if (truckResponse.ok) {
          // İşlemleri soft delete yap
          await fetch(`${API_URL}/api/operations/by-truck/${plaka}`, {
            method: 'DELETE',
          });

          // Aylık kayıtları soft delete yap
          await fetch(`${API_URL}/api/monthly-records/by-truck/${plaka}`, {
            method: 'DELETE',
          });

          showAlert(`${plaka} plakalı kamyon başarıyla silindi`, 'success');
          fetchTrucks();
        }
      } catch (error) {
        showAlert('Silme işlemi sırasında bir hata oluştu', 'error');
        console.error('Silme işlemi sırasında hata:', error);
      }
      handleCloseConfirmDialog();
    };

    showConfirmDialog(
      'Kamyonu Sil',
      `${plaka} plakalı kamyonu ve ilgili tüm kayıtları silmek istediğinize emin misiniz?`,
      deleteAction,
      'delete'
    );
  };

  const handleRestore = async (plaka: string) => {
    try {
      // Kamyonu geri yükle
      const response = await fetch(`${API_URL}/api/trucks/${plaka}/restore`, {
        method: 'PUT',
      });

      if (response.ok) {
        // İşlemleri geri yükle
        await fetch(`${API_URL}/api/operations/by-truck/${plaka}/restore`, {
          method: 'PUT',
        });

        // Aylık kayıtları geri yükle
        await fetch(`${API_URL}/api/monthly-records/by-truck/${plaka}/restore`, {
          method: 'PUT',
        });

        showAlert(`${plaka} plakalı kamyon başarıyla geri yüklendi`, 'success');
        fetchTrucks();
      }
    } catch (error) {
      showAlert('Geri yükleme işlemi sırasında bir hata oluştu', 'error');
      console.error('Geri yükleme işlemi sırasında hata:', error);
    }
  };

  const handlePermanentDelete = async (plaka: string) => {
    const permanentDeleteAction = async () => {
      try {
        // İşlemleri kalıcı olarak sil
        await fetch(`${API_URL}/api/operations/by-truck/${plaka}/permanent`, {
          method: 'DELETE',
        });

        // Aylık kayıtları kalıcı olarak sil
        await fetch(`${API_URL}/api/monthly-records/by-truck/${plaka}/permanent`, {
          method: 'DELETE',
        });

        // Kamyonu kalıcı olarak sil
        const response = await fetch(`${API_URL}/api/trucks/${plaka}/permanent`, {
          method: 'DELETE',
        });

        if (response.ok) {
          showAlert(`${plaka} plakalı kamyon kalıcı olarak silindi`, 'success');
          fetchTrucks();
        }
      } catch (error) {
        showAlert('Kalıcı silme işlemi sırasında bir hata oluştu', 'error');
        console.error('Kalıcı silme işlemi sırasında hata:', error);
      }
      handleCloseConfirmDialog();
    };

    showConfirmDialog(
      'Kalıcı Olarak Sil',
      `${plaka} plakalı kamyonu ve ilgili tüm kayıtları kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz!`,
      permanentDeleteAction,
      'permanentDelete'
    );
  };

  const filteredTrucks = trucks.filter(truck =>
    truck.plaka.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (showDeleted ? !truck.isActive : truck.isActive)
  );

  return (
    <Box>
      <Snackbar 
        open={alert.open} 
        autoHideDuration={6000} 
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseAlert} 
          severity={alert.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {alert.message}
        </Alert>
      </Snackbar>

      <Dialog
        open={confirmDialog.open}
        onClose={handleCloseConfirmDialog}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            bgcolor: confirmDialog.type === 'permanentDelete' ? 'error.light' : 'warning.light',
            color: 'white'
          }}
        >
          <Warning />
          {confirmDialog.title}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <DialogContentText>
            {confirmDialog.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleCloseConfirmDialog} 
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            İptal
          </Button>
          <Button
            onClick={() => confirmDialog.confirmAction()}
            color={confirmDialog.type === 'permanentDelete' ? 'error' : 'warning'}
            variant="contained"
            autoFocus
            sx={{ borderRadius: 2 }}
          >
            {confirmDialog.type === 'permanentDelete' ? 'Kalıcı Olarak Sil' : 'Sil'}
          </Button>
        </DialogActions>
      </Dialog>

      <Card sx={{ mb: 4, p: 2, borderRadius: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <LocalShipping sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
              Kamyon Listesi
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={() => navigate('/truck/new')}
              sx={{ 
                ml: 'auto',
                borderRadius: 2,
                px: 3,
                py: 1,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            >
              Yeni Kamyon Ekle
            </Button>
          </Box>

          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <SearchBar
                placeholder="Plakaya göre ara..."
                value={searchTerm}
                onChange={setSearchTerm}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={showDeleted}
                    onChange={(e) => setShowDeleted(e.target.checked)}
                    color="primary"
                  />
                }
                label="Silinen Kamyonları Göster"
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
                  Plaka
                </Box>
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Durum</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTrucks.map((truck) => (
              <TableRow 
                key={truck._id}
                sx={{ 
                  '&:hover': { 
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <TableCell>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {truck.plaka}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    icon={truck.isActive ? <CheckCircle /> : <Cancel />}
                    label={truck.isActive ? 'Aktif' : 'Silinmiş'}
                    color={truck.isActive ? 'success' : 'error'}
                    variant="outlined"
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  {truck.isActive ? (
                    <>
                      <Tooltip title="Düzenle">
                        <IconButton 
                          onClick={() => handleEdit(truck.plaka)}
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
                          onClick={() => handleDelete(truck.plaka)}
                          sx={{ 
                            color: 'warning.main',
                            '&:hover': { bgcolor: 'warning.light', color: 'white' },
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </>
                  ) : (
                    <>
                      <Tooltip title="Geri Yükle">
                        <IconButton 
                          onClick={() => handleRestore(truck.plaka)}
                          sx={{ 
                            color: 'success.main',
                            '&:hover': { bgcolor: 'success.light', color: 'white' },
                          }}
                        >
                          <Restore />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Kalıcı Olarak Sil">
                        <IconButton 
                          onClick={() => handlePermanentDelete(truck.plaka)}
                          sx={{ 
                            color: 'error.main',
                            '&:hover': { bgcolor: 'error.light', color: 'white' },
                          }}
                        >
                          <DeleteForever />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TruckList; 