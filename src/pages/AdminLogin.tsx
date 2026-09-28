import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminSecret, setAdminSecret] = useState(''); // <-- Новий стан
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Відправляємо запит на спеціальний роут /auth/admin-login
      const res = await api.post('/auth/admin-login', { 
        email, 
        password, 
        adminSecret 
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.user.role);

      navigate('/admin');
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.error ?? 'Помилка авторизації')
        : 'Помилка авторизації';

      setError(message);
    }
  };

  return (
    <div style={{ maxWidth: '380px', margin: '100px auto', padding: '25px', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <h2>Вхід в адмінпанель</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '15px' }}>
          <label>Email / Логін:</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Пароль:</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label>Секретний ключ адміна:</label>
          <input
            type="password"
            required
            value={adminSecret}
            onChange={(e) => setAdminSecret(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <button type="submit" style={{ width: '100%', padding: '10px', background: '#2c3e50', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Увійти
        </button>
      </form>
    </div>
  );
};