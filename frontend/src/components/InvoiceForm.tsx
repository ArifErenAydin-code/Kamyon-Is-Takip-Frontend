import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    Container,
    CircularProgress,
    Alert,
    IconButton,
    Card,
    CardContent,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stack
} from '@mui/material';

import { PhotoCamera, CameraAlt, Check, Clear } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

interface ExtractedData {
    tonaj: number | null;
}

interface Prediction {
    class: string;
    confidence: number;
    bbox: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    text?: string;
}

const InvoiceForm: React.FC = () => {
    const navigate = useNavigate();
    const [kamyonPlaka, setKamyonPlaka] = useState('');
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [showCamera, setShowCamera] = useState(false);
    const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
    const [imageData, setImageData] = useState<string | null>(null);
    const [plakaValid, setPlakaValid] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
    const [showPermissionDialog, setShowPermissionDialog] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [currentDetectedWeight, setCurrentDetectedWeight] = useState<string | number | null>(null);
    const processingRef = useRef<boolean>(false);
    const processIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const [detections, setDetections] = useState<any[]>([]);
    const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
    const [isSearching, setIsSearching] = useState(true);

    // Kamera başlatma işlemi
    const initializeCamera = async () => {
            try {
            console.log('Kamera başlatma denemesi...');
                
            // Önce mediaDevices API'sinin varlığını kontrol et
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Bu tarayıcı kamera erişimini desteklemiyor!');
                    }

            // Mevcut kameraları listele
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            console.log('Bulunan kameralar:', videoDevices);

            if (videoDevices.length === 0) {
                throw new Error('Hiç kamera bulunamadı!');
                        }

                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 1280 },
                        height: { ideal: 720 },
                    facingMode: 'environment'
                    }
                });

            if (!videoRef.current) {
                throw new Error('Video elementi bulunamadı!');
                }

                    videoRef.current.srcObject = mediaStream;
            videoRef.current.setAttribute('playsinline', 'true');
                    videoRef.current.setAttribute('autoplay', 'true');
                    setStream(mediaStream);
            
            console.log('Kamera stream başarıyla alındı');
                    
                    try {
                        await videoRef.current.play();
                console.log('Video oynatma başarılı');
                        setError(null);
                startContinuousProcessing();
            } catch (playError) {
                        console.error('Video oynatma hatası:', playError);
                throw new Error('Video oynatılamadı: ' + (playError as Error).message);
            }
        } catch (err) {
            console.error('Kamera başlatma hatası:', err);
            setError((err as Error).message || 'Kamera başlatılamadı');
        setShowCamera(false);
        }
    };

    // Sürekli görüntü işleme
    const startContinuousProcessing = () => {
        setIsSearching(true);
        if (processIntervalRef.current) {
            clearInterval(processIntervalRef.current);
        }

        processIntervalRef.current = setInterval(async () => {
            if (!processingRef.current && videoRef.current && canvasRef.current && isSearching) {
                await processCurrentFrame();
            }
        }, 1000); // Her saniye bir kare işle
    };
                        
    // Tespit kutularını çiz
    const drawDetections = (detections: any[]) => {
        const canvas = overlayCanvasRef.current;
        if (!canvas || !videoRef.current) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        // Canvas boyutlarını video boyutlarına ayarla
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;

        // Önceki çizimleri temizle
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Her tespit için kutu çiz
        detections.forEach(detection => {
            const { bbox, confidence } = detection;
            
            // Kutuyu çiz
            context.strokeStyle = '#00ff00';
            context.lineWidth = 2;
            context.strokeRect(bbox.x1, bbox.y1, bbox.x2 - bbox.x1, bbox.y2 - bbox.y1);

            // Güven skorunu yaz
            context.fillStyle = '#00ff00';
            context.font = '16px Arial';
            context.fillText(
                `${Math.round(confidence * 100)}%`,
                bbox.x1,
                bbox.y1 > 20 ? bbox.y1 - 5 : bbox.y1 + 20
            );
        });
    };

    // Anlık kareyi işle
    const processCurrentFrame = async () => {
        if (!videoRef.current || !canvasRef.current || processingRef.current || !isSearching) return;

        processingRef.current = true;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (!context) return;

        // Video boyutlarını canvas'a ayarla
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Görüntüyü canvas'a çiz
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        try {
            const blob = await new Promise<Blob>((resolve) => {
                canvas.toBlob((blob) => {
                    resolve(blob!);
                }, 'image/jpeg');
            });

            const formData = new FormData();
            formData.append('fatura_resmi', blob, 'frame.jpg');

            const response = await fetch(`${API_URL}/api/invoices/upload`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Görüntü işleme hatası');
            }

            const result = await response.json();
            
            if (result.detections) {
                setDetections(result.detections);
                drawDetections(result.detections);
            }
            
            if (result.tonaj !== null) {
                setCurrentDetectedWeight(result.tonaj);
                setError(null);
                setIsSearching(false); // Sayı bulunduğunda aramayı durdur
            }
        } catch (error) {
            console.error('Görüntü işleme hatası:', error);
        } finally {
            processingRef.current = false;
        }
    };

    // Kamera kontrolü
    const handleCameraClick = async () => {
        if (showCamera) {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                setStream(null);
            }
            if (processIntervalRef.current) {
                clearInterval(processIntervalRef.current);
                processIntervalRef.current = null;
            }
            setShowCamera(false);
            setCurrentDetectedWeight(null);
            setIsSearching(true);
        } else {
            setShowCamera(true);
            await initializeCamera();
        }
    };

    // Cleanup effect
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            if (processIntervalRef.current) {
                clearInterval(processIntervalRef.current);
            }
        };
    }, [stream]);

    // Form gönderme
    const handleSubmit = async () => {
        if (!currentDetectedWeight) {
            setError('Lütfen önce bir tonaj değeri tespit edin');
            return;
        }

        try {
            const formData = {
                kamyon_plaka: kamyonPlaka,
                tonaj: currentDetectedWeight,
                tarih: new Date().toISOString()
            };

            console.log('Gönderilecek veri:', formData);

            const response = await fetch(`${API_URL}/api/invoices`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Sunucu hatası:', errorData);
                throw new Error(errorData.message || 'Fatura kaydedilemedi');
            }

            const responseData = await response.json();
            console.log('Sunucu yanıtı:', responseData);

            setSuccess('Fatura başarıyla kaydedildi');
            
            // Fatura kaydedildikten sonra:
            setCurrentDetectedWeight(null); // Mevcut tonajı temizle
            setIsSearching(true); // Aramayı tekrar başlat
            setSuccess(null); // Başarı mesajını temizle
            
        } catch (error) {
            console.error('Form gönderme hatası:', error);
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError('Fatura kaydedilirken bir hata oluştu');
            }
        }
    };

    const handleContinueSearch = () => {
        setCurrentDetectedWeight(null);
        setIsSearching(true);
        setError(null);
        setSuccess(null);
    };

    return (
        <Container maxWidth="md">
            <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
                <Typography variant="h5" gutterBottom>
                    Yeni Fatura Ekle
                </Typography>

                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Kamyon Plakası"
                            value={kamyonPlaka}
                            onChange={(e) => setKamyonPlaka(e.target.value)}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column" gap={2}>
                            <Button
                                variant="contained"
                                startIcon={showCamera ? <Clear /> : <CameraAlt />}
                                onClick={handleCameraClick}
                                color="primary"
                                size="large"
                            >
                                {showCamera ? 'Kamerayı Kapat' : 'Kamerayı Aç'}
                            </Button>

                            {showCamera && (
                                <Box sx={{ 
                                    width: '100%', 
                                    position: 'relative',
                                    border: '2px solid #ccc',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    backgroundColor: '#f5f5f5'
                                }}>
                                    <video
                                        ref={videoRef}
                                        style={{ 
                                            width: '100%', 
                                            maxWidth: '500px', 
                                            display: 'block', 
                                            margin: '0 auto',
                                            backgroundColor: '#000'
                                        }}
                                        playsInline
                                        autoPlay
                                    />
                                    <canvas 
                                        ref={overlayCanvasRef}
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            width: '100%',
                                            maxWidth: '500px',
                                            pointerEvents: 'none'
                                        }}
                                    />
                                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                                    {processing && (
                                        <Box sx={{ 
                                            position: 'absolute', 
                                            top: '50%', 
                                            left: '50%', 
                                            transform: 'translate(-50%, -50%)',
                                            backgroundColor: 'rgba(255,255,255,0.8)',
                                            padding: '20px',
                                            borderRadius: '50%'
                                        }}>
                                            <CircularProgress />
                                        </Box>
                                    )}
                                </Box>
                            )}
                        </Box>
                    </Grid>

                    {error && (
                        <Grid item xs={12}>
                            <Alert severity="error" sx={{ mt: 2 }}>
                                <Typography variant="body1" component="div">
                                    {error}
                                </Typography>
                            </Alert>
                        </Grid>
                    )}

                    {currentDetectedWeight && (
                        <Grid item xs={12}>
                            <Alert severity="info" sx={{ mt: 2 }}>
                                <Typography variant="h6" component="div">
                                    Tespit Edilen Tonaj: {currentDetectedWeight} kg
                                </Typography>
                                {!isSearching && (
                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                        Tonaj değeri tespit edildi. Kaydetmek için "Kaydet" butonuna basın veya aramaya devam etmek için "Devam Et" butonuna basın.
                                    </Typography>
                                )}
                            </Alert>
                        </Grid>
                    )}

                    {success && (
                        <Grid item xs={12}>
                            <Alert severity="success">{success}</Alert>
                        </Grid>
                    )}

                    <Grid item xs={12}>
                        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                            <Button
                                fullWidth
                                variant="contained"
                                color="primary"
                                onClick={handleSubmit}
                                disabled={!currentDetectedWeight || !kamyonPlaka}
                                size="large"
                            >
                                Kaydet
                            </Button>
                            {currentDetectedWeight && !isSearching && (
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    color="secondary"
                                    onClick={handleContinueSearch}
                                    size="large"
                                >
                                    Devam Et
                                </Button>
                            )}
                        </Stack>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
};

export default InvoiceForm;
