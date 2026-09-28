import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PetitionCard } from '../components/PetitionCard';
import type { Petition } from '../types';
import api from '../api/axios';

import { RecentActivities } from '../components/RecentActivities';

const CATEGORIES = [
  'Усі напрямки',
  'Сміття',
  'Охорона здоров\'я та спорт',
  'Благоустрій та довкілля',
  'Дорожнє господарство',
  'Культура та освіта',
  'Житлова комунальна інфраструктура',
  'Соціальний захист',
  'Транспорт',
  'Паркування',
  'Містобудування',
  'МАФи та стихійна торгівля',
  'Перейменування вулиць',
  'Тварини'
];

const ITEMS_PER_PAGE = 6;

export const PetitionsPage: React.FC = () => {
  const [petitions, setPetitions] = useState<Petition[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const { user, openAuthModal } = useAuth();
  const navigate = useNavigate();

  const isInitialMount = useRef(true);

  // Параметри з URL
  const currentTab = searchParams.get('tab') || 'NEW';
  const selectedCategory = searchParams.get('category') || 'Усі напрямки';
  const searchQuery = searchParams.get('search') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    let ignore = false;

    const fetchPetitions = async () => {
      if (isInitialMount.current) {
        setLoading(true);
      } else {
        setIsFetching(true);
      }

      try {
        const res = await api.get('/petitions', {
          params: {
            tab: currentTab,
            category: (selectedCategory !== 'Усі напрямки' && selectedCategory !== 'Усі категорії') ? selectedCategory : undefined,
            search: searchQuery || undefined,
            page: currentPage,
            limit: ITEMS_PER_PAGE
          }
        });

        if (!ignore) {
          // Бекенд повертає об'єкт { data: [...], meta: { totalPages, ... } }
          const responseData = res.data;
          
          if (Array.isArray(responseData)) {
            // Резервний варіант (якщо бекенд поверне просто масив)
            setPetitions(responseData);
            setTotalPages(Math.ceil(responseData.length / ITEMS_PER_PAGE) || 1);
          } else {
            // Стандартна робота з новою структурою
            setPetitions(responseData.data || []);
            setTotalPages(responseData.meta?.totalPages || 1);
          }
        }
      } catch (err) {
        console.error('Помилка завантаження петицій:', err);
      } finally {
        if (!ignore) {
          setLoading(false);
          setIsFetching(false);
          isInitialMount.current = false;
        }
      }
    };

    fetchPetitions();

    return () => {
      ignore = true;
    };
  }, [currentTab, selectedCategory, searchQuery, currentPage]);

  const handleCreateClick = () => {
    if (!user) {
      openAuthModal('login');
    } else {
      navigate('/create-petition');
    }
  };

  const handleTabChange = (tabKey: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', tabKey);
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const newParams = new URLSearchParams(searchParams);
    if (val === 'Усі напрямки' || val === 'Усі категорії') {
      newParams.delete('category');
    } else {
      newParams.set('category', val);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '0 15px', fontFamily: 'sans-serif' }}>
      
      <style>{`
        .main-container {
          display: flex;
          gap: 30px;
        }
        .filter-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
        }
        .tabs-wrapper {
          display: flex;
          flex-wrap: wrap;
          background: #f4f6f7;
          padding: 4px;
          border-radius: 10px;
          gap: 4px;
        }
        .tab-button {
          padding: 8px 16px;
          border-radius: 8px;
          border: none;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          background: transparent;
          color: #363b42;
        }
        .tab-button.active {
          background: #19436e;
          color: #fffb1d;
          font-weight: bold;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        .category-wrapper {
          display: flex;
          align-items: center;
          gap: 10px;
          max-width: 100%;
        }
        .category-select {
          padding: 8px 12px;
          font-size: 14px;
          color: #1e293b;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          background-color: #ffffff;
          outline: none;
          cursor: pointer;
          max-width: 100%;
          box-sizing: border-box;
        }
        .sidebar {
          width: 300px;
          flex-shrink: 0;
        }
        
        .petitions-content {
          flex-grow: 1;
          min-height: 550px;
          transition: opacity 0.2s ease;
        }

        .petitions-content.fetching {
          opacity: 0.5;
          pointer-events: none;
        }

        .petitions-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
        }

        .skeleton-card {
          width: 280px;
          height: 360px;
          background: linear-gradient(90deg, #f0f3f5 25%, #e2e8f0 50%, #f0f3f5 75%);
          background-size: 200% 100%;
          animation: skeleton-loading 1.5s infinite;
          border-radius: 8px;
        }

        @keyframes skeleton-loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .pagination-container {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          margin-top: 30px;
        }

        .pagination-btn {
          padding: 8px 14px;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          color: #1e293b;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .pagination-btn:hover:not(:disabled) {
          background: #f1f5f9;
          border-color: #94a3b8;
        }

        .pagination-btn.active {
          background: #19436e;
          color: #ffffff;
          border-color: #19436e;
          font-weight: bold;
        }

        .pagination-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .main-container {
            flex-direction: column;
          }
          .sidebar {
            width: 100%;
            order: 2;
          }
          .petitions-content {
            order: 1;
            width: 100%;
            min-height: auto;
          }
          .filter-container {
            flex-direction: column;
            align-items: stretch;
          }
          .tabs-wrapper {
            width: 100%;
            justify-content: space-between;
          }
          .tab-button {
            flex: 1 1 auto;
            text-align: center;
            padding: 8px 6px;
            font-size: 13px;
          }
          .category-wrapper {
            flex-direction: column;
            align-items: flex-start;
            width: 100%;
          }
          .category-select {
            width: 100%;
          }
          .create-btn {
            width: 100%;
          }
          .skeleton-card {
            width: 100%;
          }
        }
      `}</style>
      
      {/* 1. Кнопка "Створити петицію" */}
      <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '20px' }}>
        <button 
          className="create-btn"
          onClick={handleCreateClick}
          style={{ 
            padding: '12px 24px', 
            background: '#f39c12', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '8px', 
            fontSize: '16px', 
            fontWeight: 'bold', 
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(243, 156, 18, 0.3)'
          }}
        >
          Створити петицію
        </button>
      </div>

      {/* 2. Блок сортування та категорій */}
      <div className="filter-container" style={{
        background: '#19436e',
        borderRadius: '12px',
        padding: '12px 16px',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
        marginBottom: '25px'
      }}>
        
        <div className="tabs-wrapper">
          {[
            { key: 'NEW', label: 'Нові' },
            { key: 'POPULAR', label: 'Популярні' },
            { key: 'SUPPORTED', label: 'Підтримані' },
            { key: 'ALL', label: 'Усі' },
          ].map((tab) => {
            const isActive = currentTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`tab-button ${isActive ? 'active' : ''}`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="category-wrapper">
          <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#ffffff' }}>
            За напрямками:
          </span>
          <select 
            value={selectedCategory} 
            onChange={handleCategoryChange}
            className="category-select"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {searchQuery && (
        <div style={{ marginBottom: '15px', fontSize: '15px' }}>
          Результати пошуку за запитом: <strong>"{searchQuery}"</strong>
        </div>
      )}

      {/* 3. Список петицій та Права панель */}
      <div className="main-container">
        <div className={`petitions-content ${isFetching ? 'fetching' : ''}`}>
          {loading ? (
            <div className="petitions-grid">
              <div className="skeleton-card" />
              <div className="skeleton-card" />
              <div className="skeleton-card" />
            </div>
          ) : petitions.length === 0 ? (
            <p style={{ fontSize: '16px', color: '#666' }}>Петицій за вашим запитом не знайдено.</p>
          ) : (
            <>
              <div className="petitions-grid">
                {petitions.map((petition) => (
                  <PetitionCard key={petition.id} petition={petition} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="pagination-container">
                  <button 
                    className="pagination-btn"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    &lt;
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                    >
                      {page}
                    </button>
                  ))}

                  <button 
                    className="pagination-btn"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    &gt;
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Права панель */}
        <RecentActivities />

      </div>
    </div>
  );
};