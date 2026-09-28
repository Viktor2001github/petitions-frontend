import axios from 'axios';

const api = axios.create({
  baseURL: 'https://petitions-backend.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Додаємо перехоплювач (Interceptor), який перед КОЖНИМ запитом дістає токен
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Використовуємо ваш ключ 'token'
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;