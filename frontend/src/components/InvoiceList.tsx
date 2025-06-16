import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Typography,
    Paper,
    Container,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Dialog,
    DialogContent,
    DialogTitle,
    DialogActions,
    Alert,
    TextField,
    InputAdornment
} from '@mui/material';
import {
    Add as AddIcon,
    Search as SearchIcon,
    Visibility as ViewIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { API_URL } from '../config';

interface Invoice {
    _id: string;
    kamyon_plaka: string;
    tarih: string;
    tonaj: number;
    fatura_no: string;
    fatura_tutari: number;
    fatura_resmi: string;
}

const InvoiceList: React.FC = () => {
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [openDialog, setOpenDialog] = useState(false);

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            const response = await fetch(`${API_URL}/api/invoices`);
            if (!response.ok) throw new Error('Faturalar yüklenirken bir hata oluştu');
            const data = await response.json();
            setInvoices(data);
        } catch (err) {
            setError('Faturalar yüklenirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`${API_URL}/api/invoices/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw new Error('Fatura silinemedi');
            
            await fetchInvoices();
        } catch (err) {
            setError('Fatura silinirken bir hata oluştu');
        }
    };

    const filteredInvoices = invoices.filter(invoice =>
        invoice.kamyon_plaka.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.fatura_no.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Container maxWidth="lg">
            <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5">
                        Faturalar
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/invoice/new')}
                    >
                        Yeni Fatura
                    </Button>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Plaka veya fatura no ile ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ mb: 3 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Plaka</TableCell>
                                <TableCell>Tarih</TableCell>
                                <TableCell>Fatura No</TableCell>
                                <TableCell align="right">Tonaj</TableCell>
                                <TableCell align="right">Tutar</TableCell>
                                <TableCell align="center">İşlemler</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredInvoices.map((invoice) => (
                                <TableRow key={invoice._id}>
                                    <TableCell>{invoice.kamyon_plaka}</TableCell>
                                    <TableCell>
                                        {format(new Date(invoice.tarih), 'dd MMMM yyyy', { locale: tr })}
                                    </TableCell>
                                    <TableCell>{invoice.fatura_no || '-'}</TableCell>
                                    <TableCell align="right">{invoice.tonaj.toFixed(2)} ton</TableCell>
                                    <TableCell align="right">
                                        {(invoice.fatura_tutari || 0).toLocaleString('tr-TR', {
                                            style: 'currency',
                                            currency: 'TRY'
                                        })}
                                    </TableCell>
                                    <TableCell align="center">
                                        <IconButton
                                            onClick={() => {
                                                setSelectedInvoice(invoice);
                                                setOpenDialog(true);
                                            }}
                                            color="primary"
                                        >
                                            <ViewIcon />
                                        </IconButton>
                                        <IconButton
                                            onClick={() => handleDelete(invoice._id)}
                                            color="error"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Dialog
                    open={openDialog}
                    onClose={() => setOpenDialog(false)}
                    maxWidth="md"
                    fullWidth
                >
                    <DialogTitle>
                        Fatura Detayı - {selectedInvoice?.kamyon_plaka}
                    </DialogTitle>
                    <DialogContent>
                        {selectedInvoice && (
                            <Box sx={{ mt: 2 }}>
                                <img
                                    src={selectedInvoice.fatura_resmi}
                                    alt="Fatura"
                                    style={{
                                        width: '100%',
                                        maxHeight: '70vh',
                                        objectFit: 'contain',
                                        borderRadius: '8px'
                                    }}
                                />
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenDialog(false)}>
                            Kapat
                        </Button>
                    </DialogActions>
                </Dialog>
            </Paper>
        </Container>
    );
};

export default InvoiceList; 