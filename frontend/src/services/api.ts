import axios from 'axios';

// Backend base URL — uses env var for production, localhost fallback for dev
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Axios instance create karo with default settings
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor:
// Har API request jaane se pehle token check karta hai
// Agar local storage mein token hai toh use headers mein attach karta hai
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor:
// API response aane par errors globally handle karne ke liye
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Agar 401 Unauthorized aaye (token expire/invalid) toh automatically logout
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
