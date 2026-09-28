import axios from 'axios';

// Очищаємо VITE_API_URL від можливого слешу в кінці
const rawUrl = import.meta.env.VITE_API_URL || 'https://petitions-backend.onrender.com';
const cleanUrl = rawUrl.replace(/\/+$/, '');

const api = axios.create({
  baseURL: `${cleanUrl}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;