// Geliştirme ortamında localhost, production'da Railway URL'i kullanılacak
const isDevelopment = process.env.NODE_ENV === 'development';
const LOCAL_API_URL = 'http://localhost:5000';
const RAILWAY_URL = 'https://kamyon-takip.up.railway.app';

// API URL'ini environment variable'dan al, yoksa development/production'a göre seç
const baseUrl = process.env.REACT_APP_API_URL || (isDevelopment ? LOCAL_API_URL : RAILWAY_URL);

// URL'in başında http:// veya https:// yoksa ekle
export const API_URL = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`;

// Frontend domain'i
export const FRONTEND_URL = isDevelopment 
  ? 'http://localhost:3000'
  : 'https://kamyon-takip.vercel.app'; 