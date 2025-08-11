import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { API_URL } from '../config';

interface MonthlyRecord {
  kamyon_plaka: string;
  ay: string;
  mazot_litre: number;
  mazot_maliyet: number;
  sefer_sayisi: number;
  lastik_tamir_sayisi: number;
  lastik_tamir_maliyet: number;
}

interface Statistics {
  toplam_mazot_litre: number;
  toplam_mazot_maliyet: number;
  toplam_sefer: number;
  toplam_lastik_tamir: number;
  toplam_lastik_maliyet: number;
  toplam_islem_maliyeti?: number;
}

const Reports: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [selectedTruck, setSelectedTruck] = useState<string>('');
  const [trucks, setTrucks] = useState<string[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);

  // Sabit değerler
  const TONAJ_PER_SEFER = 25; // Her sefer başına ortalama 25 ton
  const FIYAT_PER_TON = 156; // Ton başına 156 TL

  useEffect(() => {
    fetchTrucks();
  }, []);

  useEffect(() => {
    fetchStatistics();
    fetchOperationTotal();
  }, [selectedMonth, selectedTruck]);

  const fetchTrucks = async () => {
    try {
      const response = await fetch(`${API_URL}/api/trucks`);
      const data = await response.json();
      const activeTrucks = data.filter((truck: { isActive: boolean }) => truck.isActive);
      setTrucks(activeTrucks.map((truck: { plaka: string }) => truck.plaka));
    } catch (error) {
      console.error('Kamyonlar yüklenirken hata:', error);
    }
  };

  const fetchStatistics = async () => {
    try {
      let url = `${API_URL}/api/monthly-records/statistics/${selectedMonth}`;
      if (selectedTruck) {
        url += `?plaka=${selectedTruck}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('İstatistikler getirilemedi');
      }
      const data = await response.json();
      setStatistics(data);
    } catch (error) {
      console.error('İstatistikler yüklenirken hata:', error);
      setStatistics(null);
    }
  };

  const fetchOperationTotal = async () => {
    try {
      let url = `${API_URL}/api/operations/monthly-total/${selectedMonth}`;
      if (selectedTruck) {
        url += `?plaka=${selectedTruck}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('İşlem tutarları getirilemedi');
      }
      const data = await response.json();
      setStatistics(prev => prev ? { ...prev, toplam_islem_maliyeti: data.toplam_maliyet } : null);
    } catch (error) {
      console.error('İşlem tutarları yüklenirken hata:', error);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('tr-TR').format(num);
  };

  // Toplam gelir hesaplama
  const calculateIncome = (seferSayisi: number) => {
    return seferSayisi * TONAJ_PER_SEFER * FIYAT_PER_TON;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Aylık Raporlar
        </Typography>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="month"
              label="Ay Seçin"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Kamyon Seçin</InputLabel>
              <Select
                value={selectedTruck}
                onChange={(e) => setSelectedTruck(e.target.value)}
                label="Kamyon Seçin"
              >
                <MenuItem value="">Tümü</MenuItem>
                {trucks.map((plaka) => (
                  <MenuItem key={plaka} value={plaka}>
                    {plaka}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {statistics && (
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e9' }}>
                <Typography variant="h6">Toplam Sefer</Typography>
                <Typography variant="h4">{formatNumber(statistics.toplam_sefer)}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fff3e0' }}>
                <Typography variant="h6">Lastik Tamir</Typography>
                <Typography variant="h4">{formatNumber(statistics.toplam_lastik_maliyet)} TL</Typography>
                <Typography variant="subtitle2">
                  ({formatNumber(statistics.toplam_lastik_tamir)} Adet)
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f3e5f5' }}>
                <Typography variant="h6">Tahmini Gelir</Typography>
                <Typography variant="h4">{formatNumber(calculateIncome(statistics.toplam_sefer))} TL</Typography>
                <Typography variant="subtitle2">
                  ({TONAJ_PER_SEFER} Ton × {FIYAT_PER_TON} TL/Ton)
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Paper>
    </Box>
  );
};

export default Reports; 