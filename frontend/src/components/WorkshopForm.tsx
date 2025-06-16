import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';

interface WorkshopFormData {
  dukkan_adi: string;
}

const WorkshopForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState<WorkshopFormData>({
    dukkan_adi: ''
  });

  useEffect(() => {
    if (id) {
      fetchWorkshop();
    }
  }, [id]);

  const fetchWorkshop = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/workshops/${id}`);
      const data = await response.json();
      setFormData(data);
    } catch (error) {
      console.error('Dükkan bilgileri yüklenirken hata:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = id
        ? `http://localhost:5000/api/workshops/${id}`
        : 'http://localhost:5000/api/workshops';
      const method = id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        navigate('/workshops');
      }
    } catch (error) {
      console.error('Form gönderilirken hata:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {id ? 'Dükkan Düzenle' : 'Yeni Dükkan Ekle'}
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Dükkan Adı"
                value={formData.dukkan_adi}
                onChange={(e) => setFormData({ ...formData, dukkan_adi: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button variant="outlined" onClick={() => navigate('/workshops')}>
                  İptal
                </Button>
                <Button type="submit" variant="contained" color="primary">
                  {id ? 'Güncelle' : 'Kaydet'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default WorkshopForm; 