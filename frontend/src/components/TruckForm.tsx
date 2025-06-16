import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  Alert,
  Snackbar
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';

interface TruckFormData {
  plaka: string;
  isActive: boolean;
}

const TruckForm: React.FC = () => {
  const navigate = useNavigate();
  const { plaka } = useParams();
  const [formData, setFormData] = useState<TruckFormData>({
    plaka: '',
    isActive: true
  });
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (plaka) {
      fetchTruck();
    }
  }, [plaka]);

  const fetchTruck = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/trucks/${plaka}`);
      const data = await response.json();
      setFormData(data);
    } catch (error) {
      console.error('Kamyon bilgileri yüklenirken hata:', error);
      setError('Kamyon bilgileri yüklenirken hata oluştu');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const url = plaka
        ? `http://localhost:5000/api/trucks/${plaka}`
        : 'http://localhost:5000/api/trucks';
      const method = plaka ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/');
      } else {
        setError(data.message || 'Bir hata oluştu');
      }
    } catch (error) {
      console.error('Form gönderilirken hata:', error);
      setError('Form gönderilirken bir hata oluştu');
    }
  };

  const handleChange = (field: keyof TruckFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {plaka ? 'Kamyon Düzenle' : 'Yeni Kamyon Ekle'}
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Plaka"
                value={formData.plaka}
                onChange={(e) => handleChange('plaka', e.target.value)}
                disabled={!!plaka}
                required
                error={!!error}
                helperText={error}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
              >
                {plaka ? 'Güncelle' : 'Kaydet'}
              </Button>
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

export default TruckForm; 