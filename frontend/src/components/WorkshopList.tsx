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
  useTheme,
  TextField
} from '@mui/material';
import {
  Edit,
  Delete,
  Restore,
  Add,
  DeleteForever,
  Warning,
  Store,
  CheckCircle,
  Cancel
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import { API_URL } from '../config';

interface Workshop {
  _id: string;
  dukkan_adi: string;
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

const WorkshopList: React.FC = () => {
  const navigate = useNavigate();
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
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
    fetchWorkshops();
  }, []);

  const fetchWorkshops = async () => {
    try {
      const response = await fetch(`${API_URL}/api/workshops`);
      const data = await response.json();
      setWorkshops(data);
    } catch (error) {
      showAlert('Dükkanlar yüklenirken bir hata oluştu', 'error');
      console.error('Dükkanlar yüklenirken hata:', error);
    }
  };

  const handleDelete = async (id: string, isim: string) => {
    const deleteAction = async () => {
      try {
        const response = await fetch(`${API_URL}/api/workshops/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          showAlert(`${isim} isimli dükkan başarıyla silindi`, 'success');
          fetchWorkshops();
        }
      } catch (error) {
        showAlert('Silme işlemi sırasında bir hata oluştu', 'error');
        console.error('Silme işlemi sırasında hata:', error);
      }
      handleCloseConfirmDialog();
    };

    showConfirmDialog(
      'Dükkanı Sil',
      `${isim} isimli dükkanı silmek istediğinize emin misiniz?`,
      deleteAction,
      'delete'
    );
  };

  const handleRestore = async (id: string, isim: string) => {
    try {
      const response = await fetch(`${API_URL}/api/workshops/${id}/restore`, {
        method: 'PUT',
      });

      if (response.ok) {
        showAlert(`${isim} isimli dükkan başarıyla geri yüklendi`, 'success');
        fetchWorkshops();
      }
    } catch (error) {
      showAlert('Geri yükleme işlemi sırasında bir hata oluştu', 'error');
      console.error('Geri yükleme işlemi sırasında hata:', error);
    }
  };

  const handlePermanentDelete = async (id: string, isim: string) => {
    const permanentDeleteAction = async () => {
      try {
        const response = await fetch(`${API_URL}/api/workshops/${id}/permanent`, {
          method: 'DELETE',
        });

        if (response.ok) {
          showAlert(`${isim} isimli dükkan kalıcı olarak silindi`, 'success');
          fetchWorkshops();
        }
      } catch (error) {
        showAlert('Kalıcı silme işlemi sırasında bir hata oluştu', 'error');
        console.error('Kalıcı silme işlemi sırasında hata:', error);
      }
      handleCloseConfirmDialog();
    };

    showConfirmDialog(
      'Kalıcı Olarak Sil',
      `${isim} isimli dükkanı kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz!`,
      permanentDeleteAction,
      'permanentDelete'
    );
  };

  const filteredWorkshops = workshops.filter(workshop =>
    workshop.dukkan_adi.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (showDeleted ? !workshop.isActive : workshop.isActive)
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
            <Store sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
              Dükkan Listesi
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={() => {
                const dukkan_adi = prompt('Dükkan adını giriniz:');
                if (dukkan_adi) {
                  fetch(`${API_URL}/api/workshops`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ dukkan_adi }),
                  })
                    .then(response => {
                      if (response.ok) {
                        showAlert('Dükkan başarıyla eklendi', 'success');
                        fetchWorkshops();
                      }
                    })
                    .catch(error => {
                      showAlert('Dükkan eklenirken bir hata oluştu', 'error');
                      console.error('Dükkan ekleme hatası:', error);
                    });
                }
              }}
              sx={{ 
                ml: 'auto',
                borderRadius: 2,
                px: 3,
                py: 1,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            >
              Yeni Dükkan Ekle
            </Button>
          </Box>

          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <SearchBar
                placeholder="Dükkan adına göre ara..."
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
                label="Silinen Dükkanları Göster"
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
                  <Store />
                  Dükkan Adı
                </Box>
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Durum</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredWorkshops.map((workshop) => (
              <TableRow 
                key={workshop._id}
                sx={{ 
                  '&:hover': { 
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <TableCell>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {workshop.dukkan_adi}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    icon={workshop.isActive ? <CheckCircle /> : <Cancel />}
                    label={workshop.isActive ? 'Aktif' : 'Silinmiş'}
                    color={workshop.isActive ? 'success' : 'error'}
                    variant="outlined"
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  {workshop.isActive ? (
                    <>
                      <Tooltip title="Düzenle">
                        <IconButton 
                          onClick={() => {
                            const yeniDukkanAdi = prompt('Yeni dükkan adını giriniz:', workshop.dukkan_adi);
                            if (yeniDukkanAdi) {
                              fetch(`${API_URL}/api/workshops/${workshop._id}`, {
                                method: 'PUT',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ dukkan_adi: yeniDukkanAdi }),
                              })
                                .then(response => {
                                  if (response.ok) {
                                    showAlert('Dükkan adı başarıyla güncellendi', 'success');
                                    fetchWorkshops();
                                  }
                                })
                                .catch(error => {
                                  showAlert('Dükkan adı güncellenirken bir hata oluştu', 'error');
                                  console.error('Güncelleme hatası:', error);
                                });
                            }
                          }}
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
                          onClick={() => handleDelete(workshop._id, workshop.dukkan_adi)}
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
                          onClick={() => handleRestore(workshop._id, workshop.dukkan_adi)}
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
                          onClick={() => handlePermanentDelete(workshop._id, workshop.dukkan_adi)}
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

export default WorkshopList; 