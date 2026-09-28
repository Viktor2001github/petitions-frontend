import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Header: React.FC = () => {
  const { user, openAuthModal, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/');
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(prev => !prev);
  };

  return (
    <header className="header-root">
      <style>{`
        .header-root {
          background: #19436e;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          padding: 16px 20px;
          font-family: Roboto, 'Open Sans', Arial, sans-serif;
          position: relative;
        }

        .header-container {
          max-width: 1240px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        .header-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          user-select: none;
        }

        .header-nav {
          display: flex;
          gap: 20px;
          font-size: 15px;
          font-weight: 500;
        }

        .header-nav-link {
          color: #ffffff;
          text-decoration: none;
          opacity: 0.85;
          padding-bottom: 3px;
          transition: all 0.2s ease;
        }

        .header-nav-link:hover {
          opacity: 1;
        }

        .header-nav-link.active {
          color: #f1c40f;
          opacity: 1;
          border-bottom: 2px solid #f1c40f;
        }

        .header-search {
          display: flex;
          flex-grow: 1;
          max-width: 340px;
        }

        .header-auth-desktop {
          display: flex;
          align-items: center;
        }

        /* Анімація кнопки бурґера */
        .burger-btn {
          display: none;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 6px;
          width: 36px;
          height: 36px;
          position: relative;
          justify-content: center;
          align-items: center;
        }

        .burger-icon {
          width: 24px;
          height: 2px;
          background: #ffffff;
          position: relative;
          transition: all 0.3s ease-in-out;
        }

        .burger-icon::before,
        .burger-icon::after {
          content: '';
          position: absolute;
          width: 24px;
          height: 2px;
          background: #ffffff;
          transition: all 0.3s ease-in-out;
        }

        .burger-icon::before {
          transform: translateY(-7px);
        }

        .burger-icon::after {
          transform: translateY(7px);
        }

        .burger-btn.open .burger-icon {
          background: transparent;
        }

        .burger-btn.open .burger-icon::before {
          transform: rotate(45deg);
        }

        .burger-btn.open .burger-icon::after {
          transform: rotate(-45deg);
        }

        .mobile-menu-dropdown {
          display: none;
        }

        /* --- Адаптивність для мобільних (< 868px) --- */
        @media (max-width: 868px) {
          .header-container {
            flex-direction: column;
            align-items: stretch;
            gap: 14px;
          }

          .header-top-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
          }

          .burger-btn {
            display: flex;
          }

          .header-auth-desktop {
            display: none;
          }

          .header-search {
            max-width: 100%;
            width: 100%;
            order: 2;
          }

          .header-nav {
            order: 3;
            width: 100%;
            justify-content: center;
            gap: 16px;
            padding-top: 4px;
          }

          /* Плавне відкриття меню входу */
          .mobile-menu-dropdown {
            display: block;
            order: 4;
            max-height: 0;
            opacity: 0;
            overflow: hidden;
            transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease, margin 0.3s ease;
            background: #113153;
            margin: 0 -20px -16px -20px;
            padding: 0 20px;
            border-top: 1px solid rgba(255, 255, 255, 0);
          }

          .mobile-menu-dropdown.open {
            max-height: 160px;
            opacity: 1;
            padding: 16px 20px;
            margin-top: 8px;
            border-top-color: rgba(255, 255, 255, 0.1);
          }
        }
      `}</style>

      <div className="header-container">
        
        {/* 1. Оригінальне Лого з гербом + Бурґер */}
        <div className="header-top-row">
          <div className="header-logo" onClick={() => navigate('/')}>
            <img 
              src="/logo.png" 
              alt="Герб" 
              style={{ width: '42px', height: 'auto', objectFit: 'contain' }}
              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
            />
            <h1 style={{ 
              margin: 0, 
              fontSize: '15px', 
              fontWeight: '700', 
              color: '#ffffff', 
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              lineHeight: '1.3'
            }}>
              Портал петицій <br />
              <span style={{ opacity: 0.9, fontWeight: '400', fontSize: '13px', textTransform: 'none' }}>
                Боярської територіальної громади
              </span>
            </h1>
          </div>

          <button 
            className={`burger-btn ${isMenuOpen ? 'open' : ''}`} 
            onClick={toggleMenu} 
            aria-label="Меню авторизації"
          >
            <span className="burger-icon"></span>
          </button>
        </div>

        {/* 2. Пошуковий блок */}
        <form onSubmit={handleSearch} className="header-search">
          <input 
            type="text" 
            placeholder="Пошук петицій..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '9px 16px', 
              border: 'none', 
              borderRadius: '20px 0 0 20px', 
              fontSize: '14px',
              outline: 'none',
              background: '#ffffff'
            }}
          />
          <button 
            type="submit" 
            style={{ 
              padding: '9px 18px', 
              background: '#f1c40f', 
              color: '#000000', 
              border: 'none', 
              borderRadius: '0 20px 20px 0', 
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            Шукати
          </button>
        </form>

        {/* 3. Роутінг навігація */}
        <nav className="header-nav">
          <Link 
            to="/" 
            className={`header-nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Петиції
          </Link>
          <Link 
            to="/rules" 
            className={`header-nav-link ${location.pathname === '/rules' ? 'active' : ''}`}
          >
            Положення
          </Link>
          <Link 
            to="/recommendations" 
            className={`header-nav-link ${location.pathname === '/recommendations' ? 'active' : ''}`}
          >
            Рекомендації
          </Link>
        </nav>

        {/* 4. Авторизація для ПК */}
        <div className="header-auth-desktop">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#ffffff', fontSize: '14px' }}>
              <span>Вітаємо, <strong>{user.lastName} {user.firstName}</strong></span>
              <button 
                onClick={logout} 
                style={{ 
                  padding: '7px 16px', 
                  background: 'transparent', 
                  color: '#ffffff', 
                  border: '1px solid rgba(255, 255, 255, 0.6)', 
                  borderRadius: '18px', 
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                Вийти
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => openAuthModal('login')} 
                style={{ 
                  padding: '8px 20px', 
                  background: '#f1c40f', 
                  color: '#000000', 
                  border: 'none', 
                  borderRadius: '18px', 
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '13px'
                }}
              >
                Увійти
              </button>
              <button 
                onClick={() => openAuthModal('register')} 
                style={{ 
                  padding: '7px 20px', 
                  background: 'transparent', 
                  color: '#ffffff', 
                  border: '1px solid rgba(255, 255, 255, 0.6)', 
                  borderRadius: '18px', 
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                Реєстрація
              </button>
            </div>
          )}
        </div>

        {/* 5. Випадаюче анімоване меню входу/реєстрації */}
        <div className={`mobile-menu-dropdown ${isMenuOpen ? 'open' : ''}`}>
          {user ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', color: '#ffffff', textAlign: 'center' }}>
              <span>Вітаємо, <strong>{user.lastName} {user.firstName}</strong></span>
              <button 
                onClick={() => { logout(); setIsMenuOpen(false); }} 
                style={{ 
                  padding: '10px', 
                  background: 'transparent', 
                  color: '#ffffff', 
                  border: '1px solid rgba(255, 255, 255, 0.6)', 
                  borderRadius: '8px', 
                  cursor: 'pointer'
                }}
              >
                Вийти
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                onClick={() => { openAuthModal('login'); setIsMenuOpen(false); }} 
                style={{ 
                  padding: '10px', 
                  background: '#f1c40f', 
                  color: '#000000', 
                  border: 'none', 
                  borderRadius: '8px', 
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Увійти
              </button>
              <button 
                onClick={() => { openAuthModal('register'); setIsMenuOpen(false); }} 
                style={{ 
                  padding: '10px', 
                  background: 'transparent', 
                  color: '#ffffff', 
                  border: '1px solid rgba(255, 255, 255, 0.6)', 
                  borderRadius: '8px', 
                  cursor: 'pointer'
                }}
              >
                Реєстрація
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};