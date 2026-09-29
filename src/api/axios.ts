import axios from 'axios';

// Якщо змінна з Vercel задана, використовуємо її + '/api', інакше дефолтний URL
const baseURL = (import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : 'https://petitions-backend.onrender.com/api'
).replace(/\/+/g, '/').replace(':/', '://');

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;