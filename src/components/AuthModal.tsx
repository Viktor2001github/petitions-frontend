import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authMode, login, openAuthModal } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Розділені поля ПІБ
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [phone, setPhone] = useState('');
  
  // Нові стани для відновлення пароля
  const [isForgotPasswordView, setIsForgotPasswordView] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  // РОЗДІЛЕНІ СТАНИ ЗАВАНТАЖЕННЯ
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isDiiaLoading, setIsDiiaLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  // Хендлер для скидання пароля
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsEmailLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', { email });
      setSuccessMessage(response.data?.message || 'Інструкції зі скидання пароля надіслано на ваш email.');
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: string; message?: string } } };
      setError(errorObj.response?.data?.error || errorObj.response?.data?.message || 'Не вдалося надіслати запит на скидання пароля');
    } finally {
      setIsEmailLoading(false);
    }
  };

  // Класичний handleSubmit (Email + Пароль)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsEmailLoading(true);

    try {
      if (authMode === 'login') {
        const response = await api.post('/auth/login', { email, password });
        login(response.data.token, response.data.user);
        closeAuthModal();
      } else {
        const response = await api.post('/auth/register', { 
          email, 
          password, 
          lastName,
          firstName,
          middleName,
          phone 
        });
        login(response.data.token, response.data.user);
        closeAuthModal();
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: string; message?: string } } };
      setError(errorObj.response?.data?.error || errorObj.response?.data?.message || 'Сталася помилка. Перевірте дані.');
    } finally {
      setIsEmailLoading(false);
    }
  };

  // Авторизація через Дія (імітація/тестування для розробки)
  const handleDiiaAuth = async () => {
    setError('');
    setIsDiiaLoading(true);
    try {
      const mockDiiaData = {
        diiaHash: 'mock_diia_hash_12345',
        rnokpp: '3456789012',
        email: 'taras@example.com',
        lastName: 'Шевченко',
        firstName: 'Тарас',
        middleName: 'Григорович',
      };

      const response = await api.post('/auth/diia-login-dev-mock', mockDiiaData);
      login(response.data.token, response.data.user);
      closeAuthModal();
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: string } } };
      setError(errorObj.response?.data?.error || 'Помилка авторизації через Дію');
    } finally {
      setIsDiiaLoading(false);
    }
  };

  const handleSwitchMode = (mode: 'login' | 'register') => {
    setError('');
    setSuccessMessage('');
    setIsForgotPasswordView(false);
    openAuthModal(mode);
  };

  const toggleForgotPasswordView = (show: boolean) => {
    setError('');
    setSuccessMessage('');
    setIsForgotPasswordView(show);
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <button type="button" onClick={closeAuthModal} style={closeButtonStyle}>✕</button>
        
        <h2 style={{ textAlign: 'center', marginBottom: '8px' }}>
          {isForgotPasswordView 
            ? 'Відновлення пароля' 
            : authMode === 'login' ? 'Вхід у систему' : 'Реєстрація'}
        </h2>
        
        <p style={{ fontSize: '13px', color: '#666', textAlign: 'center', marginBottom: '20px' }}>
          {isForgotPasswordView
            ? 'Введіть ваш Email для отримання посилання на зміну пароля.'
            : 'Офіційне підписання та подання петицій вимагає підтвердження особи.'}
        </p>

        {/* Форма відновлення пароля */}
        {isForgotPasswordView ? (
          <div>
            {successMessage ? (
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: 'green', marginBottom: '15px', fontSize: '14px' }}>{successMessage}</p>
                <button 
                  type="button" 
                  onClick={() => toggleForgotPasswordView(false)} 
                  style={submitButtonStyle}
                >
                  Повернутися до входу
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword}>
                {error && <div style={{ color: 'red', marginBottom: '10px', fontSize: '14px', textAlign: 'center' }}>{error}</div>}

                <div style={inputGroupStyle}>
                  <label>Email *:</label>
                  <input 
                    type="email" 
                    required 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    style={inputStyle}
                    placeholder="example@mail.com"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isEmailLoading} 
                  style={submitButtonStyle}
                >
                  {isEmailLoading ? 'Завантаження...' : 'Надіслати посилання'}
                </button>

                <div style={{ marginTop: '15px', textAlign: 'center' }}>
                  <button 
                    type="button" 
                    onClick={() => toggleForgotPasswordView(false)} 
                    style={linkButtonStyle}
                  >
                    Повернутися до входу
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          /* Основна форма: Вхід або Реєстрація */
          <>
            {/* КНОПКА ДІЯ */}
            <button 
              type="button" 
              onClick={handleDiiaAuth} 
              disabled={isDiiaLoading || isEmailLoading} 
              style={diiaButtonStyle}
            >
              {isDiiaLoading ? 'Завантаження...' : 'Увійти через Дія'}
            </button>

            <div style={dividerStyle}>
              <span style={dividerTextStyle}>або за email</span>
            </div>
            
            {error && <div style={{ color: 'red', marginBottom: '10px', fontSize: '14px', textAlign: 'center' }}>{error}</div>}

            <form onSubmit={handleSubmit}>
              {authMode === 'register' && (
                <>
                  <div style={inputGroupStyle}>
                    <label>Прізвище *:</label>
                    <input 
                      type="text" 
                      required 
                      value={lastName} 
                      onChange={(e) => setLastName(e.target.value)}
                      style={inputStyle}
                    />
                  </div>

                  <div style={inputGroupStyle}>
                    <label>Ім'я *:</label>
                    <input 
                      type="text" 
                      required 
                      value={firstName} 
                      onChange={(e) => setFirstName(e.target.value)}
                      style={inputStyle}
                    />
                  </div>

                  <div style={inputGroupStyle}>
                    <label>По батькові:</label>
                    <input 
                      type="text" 
                      value={middleName} 
                      onChange={(e) => setMiddleName(e.target.value)}
                      style={inputStyle}
                    />
                  </div>

                  <div style={inputGroupStyle}>
                    <label>Телефон:</label>
                    <input 
                      type="tel" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                </>
              )}

              <div style={inputGroupStyle}>
                <label>Email *:</label>
                <input 
                  type="email" 
                  autoComplete="username"
                  required 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div style={inputGroupStyle}>
                <label>Пароль *:</label>
                <input 
                  type="password" 
                  autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                  required 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  style={inputStyle}
                />
              </div>

              {/* Посилання "Забули пароль?" у режимі входу */}
              {authMode === 'login' && (
                <div style={{ textAlign: 'right', marginBottom: '15px' }}>
                  <button 
                    type="button" 
                    onClick={() => toggleForgotPasswordView(true)} 
                    style={{ ...linkButtonStyle, fontSize: '12px' }}
                  >
                    Забули пароль?
                  </button>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isEmailLoading || isDiiaLoading} 
                style={submitButtonStyle}
              >
                {isEmailLoading ? 'Завантаження...' : authMode === 'login' ? 'Увійти' : 'Зареєструватися'}
              </button>
            </form>

            <div style={{ marginTop: '15px', textAlign: 'center' }}>
              {authMode === 'login' ? (
                <p>Немає акаунта? <button type="button" onClick={() => handleSwitchMode('register')} style={linkButtonStyle}>Зареєструватися</button></p>
              ) : (
                <p>Вже є акаунт? <button type="button" onClick={() => handleSwitchMode('login')} style={linkButtonStyle}>Увійти</button></p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// СТИЛІ
const overlayStyle: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
  justifyContent: 'center', alignItems: 'center', zIndex: 1000
};

const modalStyle: React.CSSProperties = {
  background: '#fff', padding: '30px', borderRadius: '12px',
  width: '100%', maxWidth: '400px', position: 'relative',
  maxHeight: '90vh', overflowY: 'auto'
};

const closeButtonStyle: React.CSSProperties = {
  position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer'
};

const diiaButtonStyle: React.CSSProperties = {
  width: '100%', padding: '12px', background: '#000', color: '#fff',
  border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: 'bold',
  cursor: 'pointer', marginBottom: '15px'
};

const dividerStyle: React.CSSProperties = {
  borderBottom: '1px solid #ddd', textAlign: 'center', margin: '15px 0 20px 0', lineHeight: '0.1em'
};

const dividerTextStyle: React.CSSProperties = {
  background: '#fff', padding: '0 10px', color: '#888', fontSize: '12px'
};

const inputGroupStyle: React.CSSProperties = { marginBottom: '15px' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '8px', boxSizing: 'border-box', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' };
const submitButtonStyle: React.CSSProperties = { width: '100%', padding: '10px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };
const linkButtonStyle: React.CSSProperties = { background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline' };