import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

interface ApiErrorResponse {
  response?: {
    data?: {
      error?: string;
      message?: string;
    };
  };
}

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError('Токен скидання пароля відсутній або некоректний.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Паролі не збігаються.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/reset-password', {
        token,
        newPassword,
      });

      setMessage(response.data?.message || 'Пароль успішно змінено!');
      setTimeout(() => navigate('/'), 3000);
    } catch (err: unknown) {
      const errorObj = err as ApiErrorResponse;
      setError(
        errorObj.response?.data?.error || 
        errorObj.response?.data?.message || 
        'Помилка при скиданні пароля. Можливо, посилання застаріло.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div style={{ maxWidth: '400px', margin: '50px auto', textAlign: 'center' }}>
        <h3 style={{ color: 'red' }}>Помилка</h3>
        <p>Токен скидання пароля відсутній у посиланні.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '30px', background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Встановлення нового пароля</h2>

      {message ? (
        <div style={{ textAlign: 'center', color: 'green' }}>
          <p>{message}</p>
          <p style={{ fontSize: '13px', color: '#666' }}>Вас буде перенаправлено на головну сторінку...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && <div style={{ color: 'red', marginBottom: '10px', fontSize: '14px', textAlign: 'center' }}>{error}</div>}

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Новий пароль *:</label>
            <input
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Підтвердіть новий пароль *:</label>
            <input
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            {loading ? 'Збереження...' : 'Зберегти пароль'}
          </button>
        </form>
      )}
    </div>
  );
};