import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Автоматично додаємо токен до кожного запиту
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // або 'accessToken' — перевір як називається ключ у LocalStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;