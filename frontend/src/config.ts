// Geliştirme ortamında localhost, production'da IP adresi kullanılacak
const isDevelopment = process.env.NODE_ENV === 'development';
const LOCAL_API_URL = 'http://localhost:5000';
const NETWORK_API_URL = 'http://192.168.193.220:5000';

export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000'; 