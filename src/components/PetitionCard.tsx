import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Petition } from '../types';

interface PetitionCardProps {
  petition: Petition;
  targetVotes?: number;
}

const rawUrl = import.meta.env.VITE_API_URL || 'https://petitions-backend.onrender.com';
const BACKEND_URL = rawUrl.replace(/\/+$/, '');

const DEFAULT_PLACEHOLDER = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180"><rect width="320" height="180" fill="%23eeeeee"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="16" fill="%23888888">Немає фото</text></svg>`;

export const PetitionCard: React.FC<PetitionCardProps> = ({ petition, targetVotes = 500 }) => {
  const navigate = useNavigate();
  const currentVotes = petition._count?.votes || 0;

  const getImageUrl = () => {
    if (!petition.imageUrl) return DEFAULT_PLACEHOLDER;
    if (petition.imageUrl.startsWith('http')) return petition.imageUrl;
    return `${BACKEND_URL}${petition.imageUrl}`;
  };

  return (
    <div 
      onClick={() => navigate(`/petitions/${petition.id}`)}
      style={{
        width: '320px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        overflow: 'hidden',
        cursor: 'pointer',
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}
    >
      {/* Зображення та КАТЕГОРІЯ */}
      <div style={{ position: 'relative', height: '180px', width: '100%', background: '#eee' }}>
        <img 
          src={getImageUrl()} 
          alt={petition.title}
          onError={(e) => {
            (e.target as HTMLImageElement).src = DEFAULT_PLACEHOLDER;
          }}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {/* Жовта плашка з Категорією */}
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '0',
          background: '#ffc107',
          color: '#000',
          padding: '2px 10px',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          {petition.category || 'Загальне'}
        </div>
      </div>

      {/* Синій блок з лічильником голосів */}
      <div style={{
        background: '#3498db',
        color: '#fff',
        textAlign: 'center',
        padding: '8px 0',
        fontSize: '18px',
        fontWeight: 'bold'
      }}>
        {currentVotes} / {targetVotes}
      </div>

      {/* Заголовок */}
      <div style={{ padding: '15px', flexGrow: 1 }}>
        <h3 style={{ margin: 0, fontSize: '15px', color: '#333', lineHeight: '1.4' }}>
          {petition.title}
        </h3>
      </div>

      {/* Дати та статус */}
      <div style={{
        borderTop: '1px solid #eee',
        padding: '10px 15px',
        fontSize: '11px',
        color: '#666',
        display: 'flex',
        justifyContent: 'space-between',
        background: '#f9f9f9'
      }}>
        <div>📅 створено {new Date(petition.createdAt).toLocaleDateString('uk-UA')}</div>
        <div>⏱️ {petition.status}</div>
      </div>
    </div>
  );
};