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
  Snackbar
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';

interface MonthlyRecordData {
  kamyon_plaka: string;
  ay: string;
  mazot_litre: number | null;
  mazot_maliyet: number | null;
  sefer_sayisi: number | null;
  lastik_tamir_sayisi: number | null;
  lastik_tamir_maliyet: number | null;
  isActive?: boolean;
}

interface Truck {
  _id: string;
  plaka: string;
  isActive: boolean;
}

const MonthlyRecordForm: React.FC = () => {
  const navigate = useNavigate();
  const { plaka, ay } = useParams();
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [error, setError] = useState<string>('');
  
  const [formData, setFormData] = useState<MonthlyRecordData>({
    kamyon_plaka: plaka || '',
    ay: ay || new Date().toISOString().slice(0, 7), // YYYY-MM formatı
    mazot_litre: null,
    mazot_maliyet: null,
    sefer_sayisi: null,
    lastik_tamir_sayisi: null,
    lastik_tamir_maliyet: null
  });

  useEffect(() => {
    fetchTrucks();
    if (plaka && ay) {
      fetchExistingRecord();
    }
  }, [plaka, ay]);

  const fetchTrucks = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/trucks');
      const data = await response.json();
      setTrucks(data.filter((t: Truck) => t.isActive));
    } catch (error) {
      console.error('Kamyonlar yüklenirken hata:', error);
      setError('Kamyonlar yüklenirken bir hata oluştu');
    }
  };

  const fetchExistingRecord = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/monthly-records/${plaka}/${ay}`);
      if (response.ok) {
        const data = await response.json();
        setFormData(data);
      }
    } catch (error) {
      console.error('Kayıt yüklenirken hata:', error);
      setError('Kayıt yüklenirken bir hata oluştu');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Null değerleri 0'a çevir
      const submitData = {
        ...formData,
        mazot_litre: formData.mazot_litre ?? 0,
        mazot_maliyet: formData.mazot_maliyet ?? 0,
        sefer_sayisi: formData.sefer_sayisi ?? 0,
        lastik_tamir_sayisi: formData.lastik_tamir_sayisi ?? 0,
        lastik_tamir_maliyet: formData.lastik_tamir_maliyet ?? 0,
        isActive: true
      };

      console.log('Gönderilen veri:', submitData); // Debug için veriyi logla

      const url = plaka && ay
        ? `http://localhost:5000/api/monthly-records/${plaka}/${ay}`
        : 'http://localhost:5000/api/monthly-records';

      const response = await fetch(url, {
        method: plaka && ay ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Kayıt eklenemedi');
      }

      navigate('/monthly-records');
    } catch (error) {
      console.error('Form gönderilirken hata:', error);
      setError(error instanceof Error ? error.message : 'Kayıt eklenirken bir hata oluştu');
    }
  };

  const handleChange = (field: keyof MonthlyRecordData, value: string | number | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Aylık Kayıt {plaka && ay ? 'Düzenle' : 'Ekle'}
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
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

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="month"
                label="Ay"
                value={formData.ay}
                onChange={(e) => handleChange('ay', e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Mazot Litre</InputLabel>
                <OutlinedInput
                  type="text"
                  inputProps={{
                    inputMode: 'numeric',
                    pattern: '[0-9]*',
                    min: 0,
                    style: { textAlign: 'right' }
                  }}
                  value={formData.mazot_litre || ''}
                  onChange={(e) => handleChange('mazot_litre', e.target.value === '' ? null : Number(e.target.value))}
                  endAdornment={<InputAdornment position="end">Lt</InputAdornment>}
                  label="Mazot Litre"
                  placeholder="0"
                  required
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Mazot Maliyet</InputLabel>
                <OutlinedInput
                  type="text"
                  inputProps={{
                    inputMode: 'numeric',
                    pattern: '[0-9]*',
                    min: 0,
                    style: { textAlign: 'right' }
                  }}
                  value={formData.mazot_maliyet || ''}
                  onChange={(e) => handleChange('mazot_maliyet', e.target.value === '' ? null : Number(e.target.value))}
                  endAdornment={<InputAdornment position="end">TL</InputAdornment>}
                  label="Mazot Maliyet"
                  placeholder="0"
                  required
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="text"
                inputProps={{
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                  min: 0,
                  style: { textAlign: 'right' }
                }}
                label="Sefer Sayısı"
                value={formData.sefer_sayisi || ''}
                onChange={(e) => handleChange('sefer_sayisi', e.target.value === '' ? null : Number(e.target.value))}
                placeholder="0"
                required
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Lastik Tamir Sayısı</InputLabel>
                <OutlinedInput
                  type="text"
                  inputProps={{
                    inputMode: 'numeric',
                    pattern: '[0-9]*',
                    min: 0,
                    style: { textAlign: 'right' }
                  }}
                  value={formData.lastik_tamir_sayisi || ''}
                  onChange={(e) => handleChange('lastik_tamir_sayisi', e.target.value === '' ? null : Number(e.target.value))}
                  endAdornment={<InputAdornment position="end">Adet</InputAdornment>}
                  label="Lastik Tamir Sayısı"
                  placeholder="0"
                  required
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Lastik Tamir Maliyet</InputLabel>
                <OutlinedInput
                  type="text"
                  inputProps={{
                    inputMode: 'numeric',
                    pattern: '[0-9]*',
                    min: 0,
                    style: { textAlign: 'right' }
                  }}
                  value={formData.lastik_tamir_maliyet || ''}
                  onChange={(e) => handleChange('lastik_tamir_maliyet', e.target.value === '' ? null : Number(e.target.value))}
                  endAdornment={<InputAdornment position="end">TL</InputAdornment>}
                  label="Lastik Tamir Maliyet"
                  placeholder="0"
                  required
                />
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button variant="outlined" onClick={() => navigate('/monthly-records')}>
                  İptal
                </Button>
                <Button type="submit" variant="contained" color="primary">
                  {plaka && ay ? 'Güncelle' : 'Kaydet'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError('')}
      >
        <Alert onClose={() => setError('')} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MonthlyRecordForm; 