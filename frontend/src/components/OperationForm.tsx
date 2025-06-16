import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  MenuItem,
  Select,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { API_URL } from '../config';

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

interface OperationFormData {
  islem_id?: string;
  dukkan_id: string;
  kamyon_plaka: string;
  maliyet: number | null;
  yapilan_is: string;
  tarih: string;
}

const OperationForm: React.FC = () => {
  const navigate = useNavigate();
  const { islem_id } = useParams();
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<OperationFormData>({
    dukkan_id: '',
    kamyon_plaka: '',
    maliyet: null,
    yapilan_is: '',
    tarih: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Önce dükkanları ve kamyonları yükle
        const [workshopsRes, trucksRes] = await Promise.all([
          fetch(`${API_URL}/api/workshops`),
          fetch(`${API_URL}/api/trucks`)
        ]);

        if (!workshopsRes.ok || !trucksRes.ok) {
          throw new Error('Veriler yüklenirken hata oluştu');
        }

        const [workshopsData, trucksData] = await Promise.all([
          workshopsRes.json(),
          trucksRes.json()
        ]);

        setWorkshops(workshopsData.filter((w: Workshop) => w.isActive));
        setTrucks(trucksData.filter((t: Truck) => t.isActive));

        // Eğer düzenleme modundaysa, işlem verilerini yükle
        if (islem_id) {
          console.log('İşlem ID:', islem_id); // Debug için
          const operationRes = await fetch(`${API_URL}/api/operations/${islem_id}`);
          
          if (!operationRes.ok) {
            throw new Error('İşlem bulunamadı');
          }

          const operationData = await operationRes.json();
          console.log('İşlem verileri:', operationData); // Debug için

          // Tarihi YYYY-MM-DD formatına çevir
          const date = new Date(operationData.tarih);
          const formattedDate = date.toISOString().split('T')[0];
          
          setFormData({
            dukkan_id: operationData.dukkan_id._id,
            kamyon_plaka: operationData.kamyon_plaka,
            maliyet: operationData.maliyet,
            yapilan_is: operationData.yapilan_is,
            tarih: formattedDate
          });
        }
      } catch (error) {
        console.error('Veri yüklenirken hata:', error);
        setError('Veriler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [islem_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const url = islem_id
        ? `${API_URL}/api/operations/${islem_id}`
        : `${API_URL}/api/operations`;
      const method = islem_id ? 'PUT' : 'POST';

      const submitData = {
        ...formData,
        maliyet: formData.maliyet ?? 0
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        throw new Error('İşlem kaydedilirken bir hata oluştu');
      }

      navigate('/operations');
    } catch (error) {
      console.error('Form gönderilirken hata:', error);
      setError('İşlem kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const handleChange = (field: keyof OperationFormData, value: string | number | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
          {islem_id ? 'İşlem Düzenle' : 'Yeni İşlem Ekle'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Dükkân</InputLabel>
                <Select
                  value={formData.dukkan_id}
                  onChange={(e) => handleChange('dukkan_id', e.target.value)}
                  label="Dükkân"
                  required
                >
                  {workshops.map((workshop) => (
                    <MenuItem key={workshop._id} value={workshop._id}>
                      {workshop.dukkan_adi}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Kamyon</InputLabel>
                <Select
                  value={formData.kamyon_plaka}
                  onChange={(e) => handleChange('kamyon_plaka', e.target.value)}
                  label="Kamyon"
                  required
                >
                  {trucks.map((truck) => (
                    <MenuItem key={truck._id} value={truck.plaka}>
                      {truck.plaka}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Maliyet</InputLabel>
                <OutlinedInput
                  type="text"
                  inputProps={{
                    inputMode: 'numeric',
                    pattern: '[0-9]*',
                    min: 0,
                    style: { textAlign: 'right' }
                  }}
                  value={formData.maliyet || ''}
                  onChange={(e) => handleChange('maliyet', e.target.value === '' ? null : Number(e.target.value))}
                  endAdornment={<InputAdornment position="end">TL</InputAdornment>}
                  label="Maliyet"
                  placeholder="0"
                  required
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Tarih"
                value={formData.tarih}
                onChange={(e) => handleChange('tarih', e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Yapılan İş"
                value={formData.yapilan_is}
                onChange={(e) => handleChange('yapilan_is', e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button 
                  variant="outlined" 
                  onClick={() => navigate('/operations')}
                  sx={{ borderRadius: 2 }}
                >
                  İptal
                </Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  sx={{ borderRadius: 2 }}
                >
                  {islem_id ? 'Güncelle' : 'Kaydet'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default OperationForm; 