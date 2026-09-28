import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { Petition } from '../types';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

interface VoteUser {
  lastName?: string;
  firstName?: string;
  middleName?: string;
}

interface Vote {
  id: string;
  userId: string;
  user?: VoteUser;
  createdAt: string;
}

const BACKEND_URL = import.meta.env.VITE_API_URL || 'https://petitions-backend.onrender.com';
const TARGET_VOTES = 500; // Оновлений ліміт підписів
const VOTING_PERIOD_DAYS = 90; // Стандартний термін збору підписів

// Функція для форматування ПІБ у формат "Прізвище І.В."
const formatAuthorName = (user?: VoteUser): string => {
  if (!user) return 'Громадянин';

  const { lastName, firstName, middleName } = user;

  if (lastName) {
    const firstInitial = firstName ? `${firstName.charAt(0).toUpperCase()}.` : '';
    const middleInitial = middleName ? `${middleName.charAt(0).toUpperCase()}.` : '';
    return `${lastName} ${firstInitial}${middleInitial}`.trim();
  }

  return 'Громадянин';
};

export const PetitionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, openAuthModal } = useAuth();
  
  const [petition, setPetition] = useState<Petition | null>(null);
  const [voters, setVoters] = useState<Vote[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);

  const currentUserId = user
    ? user.id || (user as typeof user & { userId?: string }).userId
    : null;

  useEffect(() => {
    let isMounted = true;

    const fetchPetitionData = async () => {
      if (!id) return;
      setLoading(true);

      try {
        const response = await api.get(`/petitions/${id}`);
        if (isMounted) {
          setPetition(response.data);
        }
      } catch (err) {
        console.error('Помилка завантаження петиції:', err);
      }

      try {
        const votesResponse = await api.get(`/petitions/${id}/votes`);
        const rawData = votesResponse.data?.data || votesResponse.data;
        const votesList: Vote[] = Array.isArray(rawData) ? rawData : [];

        if (isMounted) {
          setVoters(votesList);

          if (currentUserId) {
            const isAlreadyVoted = votesList.some(
              v => String(v.userId) === String(currentUserId)
            );
            setHasVoted(isAlreadyVoted);
          } else {
            setHasVoted(false);
          }
        }
      } catch (err) {
        console.warn('Не вдалося завантажити список голосів:', err);
        if (isMounted) {
          setVoters([]);
          setHasVoted(false);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPetitionData();

    return () => {
      isMounted = false;
    };
  }, [id, currentUserId]);

  const handleVote = async () => {
    if (!user) {
      openAuthModal('login');
      return;
    }

    if (hasVoted || voting) return;

    setVoting(true);
    try {
      await api.post(`/petitions/${id}/vote`);
      setHasVoted(true);

      const votesResponse = await api.get(`/petitions/${id}/votes`);
      const rawData = votesResponse.data?.data || votesResponse.data;

      if (Array.isArray(rawData)) {
        setVoters(rawData);
      } else {
        const newVote: Vote = {
          id: Date.now().toString(),
          userId: String(currentUserId),
          user: {
            lastName: user.lastName,
            firstName: user.firstName,
            middleName: user.middleName,
          },
          createdAt: new Date().toISOString()
        };
        setVoters(prev => [newVote, ...prev]);
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string; error?: string } } };
      const errorMsg = errorObj.response?.data?.message || errorObj.response?.data?.error;
      if (errorMsg && errorMsg.toLowerCase().includes('вже')) {
        setHasVoted(true);
      }
      alert(errorMsg || 'Помилка при голосуванні');
    } finally {
      setVoting(false);
    }
  };

  const getImageUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${BACKEND_URL}${url}`;
  };

  // Розрахунок залишку днів/часу (з розрахунку 90 днів від створення)
  const calculateDaysLeft = (): { text: string; isExpired: boolean } => {
    if (!petition?.createdAt) return { text: '', isExpired: false };

    const createdAt = new Date(petition.createdAt).getTime();
    const expiresAt = createdAt + VOTING_PERIOD_DAYS * 24 * 60 * 60 * 1000;
    const now = new Date().getTime();
    const diff = expiresAt - now;

    if (diff <= 0) {
      return { text: 'Термін збору голосів вичерпано', isExpired: true };
    }

    const daysLeft = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hoursLeft = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (daysLeft > 0) {
      return { text: `Залишилося: ${daysLeft} дн. ${hoursLeft} год.`, isExpired: false };
    }
    return { text: `Залишилося: ${hoursLeft} год.`, isExpired: false };
  };

  // Логіка визначення статусу та повідомлень
  const renderStatusBanner = () => {
    if (!petition) return null;

    if (petition.status === 'REVIEW' || voters.length >= TARGET_VOTES) {
      return (
        <div style={{ background: '#d1ecf1', border: '1px solid #bee5eb', color: '#0c5460', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <strong>Статус:</strong> Петиція набрала необхідну кількість голосів ({TARGET_VOTES}) і перебуває на розгляді.
        </div>
      );
    }

    if (petition.status === 'APPROVED') {
      return (
        <div style={{ background: '#d4edda', border: '1px solid #c3e6cb', color: '#155724', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <strong>Статус:</strong> Петиція підтримана та відправлена на реалізацію.
        </div>
      );
    }

    if (petition.status === 'REJECTED') {
      return (
        <div style={{ background: '#f8d7da', border: '1px solid #f5c6cb', color: '#721c24', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <strong>Статус:</strong> Петиція відхилена адміністрацією.
        </div>
      );
    }

    const timerInfo = calculateDaysLeft();
    if (petition.status === 'EXPIRED' || timerInfo.isExpired) {
      return (
        <div style={{ background: '#fff3cd', border: '1px solid #ffeeba', color: '#856404', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <strong>Статус:</strong> Ця петиція не набрала достатню кількість голосів за {VOTING_PERIOD_DAYS} днів.
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return <div style={{ padding: '30px', textAlign: 'center' }}>Завантаження петиції...</div>;
  }

  if (!petition) {
    return <div style={{ padding: '30px', textAlign: 'center' }}>Петицію не знайдено.</div>;
  }

  const timerInfo = calculateDaysLeft();
  const statusUpper = (petition.status || '').toUpperCase();
  const isVotingActive = 
    (!petition.status || ['ACTIVE', 'PENDING', 'OPEN'].includes(statusUpper)) && 
    voters.length < TARGET_VOTES && 
    !timerInfo.isExpired;

  // Відсоток заповнення прогрес-бару
  const progressPercent = Math.min(Math.round((voters.length / TARGET_VOTES) * 100), 100);

  return (
    <div style={{ maxWidth: '900px', margin: '30px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
      <h2>{petition.title}</h2>
      
      <div style={{ display: 'flex', gap: '10px', color: '#666', marginBottom: '20px', fontSize: '14px', flexWrap: 'wrap' }}>
        <span><strong>Населений пункт:</strong> {petition.settlement || 'Загальне'}</span>
        <span>•</span>
        <span><strong>Автор:</strong> {formatAuthorName(petition.author)}</span>
        <span>•</span>
        <span><strong>Дата створення:</strong> {new Date(petition.createdAt).toLocaleDateString('uk-UA')}</span>
      </div>

      {/* Інформаційний банер про статус петиції */}
      {renderStatusBanner()}

      {petition.imageUrl && (
        <img 
          src={getImageUrl(petition.imageUrl)} 
          alt={petition.title} 
          style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '8px', marginBottom: '20px' }} 
        />
      )}

      {/* Стильний блок з підписами та прогрес-баром */}
      <div style={{
        position: 'relative',
        background: '#ebf5fb',
        borderRadius: '8px',
        overflow: 'hidden',
        marginBottom: '20px',
        border: '1px solid #d0e1fd',
        boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
      }}>
        {/* Темно-синя анімована лінійка прогресу */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: `${progressPercent}%`,
          background: 'linear-gradient(90deg, #19436e 0%, #2c3e50 100%)',
          transition: 'width 0.6s ease-in-out',
          zIndex: 1
        }} />

        {/* Контент поверх прогресу */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          padding: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          <div>
            <h3 style={{ 
              margin: 0, 
              fontSize: '24px', 
              fontWeight: 'bold',
              color: progressPercent > 20 ? '#ffffff' : '#19436e',
              transition: 'color 0.3s'
            }}>
              {voters.length} / {TARGET_VOTES} підписів ({progressPercent}%)
            </h3>
            <p style={{ 
              margin: '5px 0 0 0', 
              fontSize: '13px',
              color: progressPercent > 20 ? '#e0e6ed' : '#555',
              transition: 'color 0.3s'
            }}>
              {isVotingActive ? `Збір підписів триває • ${timerInfo.text}` : 'Збір підписів завершено'}
            </p>
          </div>

          {isVotingActive && (
            <button 
              onClick={handleVote} 
              disabled={voting || Boolean(user && hasVoted)}
              style={{ 
                padding: '12px 25px', 
                background: (user && hasVoted) ? '#7f8c8d' : '#27ae60', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '6px', 
                fontSize: '16px', 
                fontWeight: 'bold', 
                cursor: (user && hasVoted) ? 'default' : 'pointer',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
              }}>
                {voting ? 'Голосування...' : (user && hasVoted) ? 'Підписано ✓' : 'Підписати петицію'}
            </button>
          )}
        </div>
      </div>

      {/* Текст петиції */}
      <div style={{ lineHeight: '1.6', fontSize: '16px', marginBottom: '40px', whiteSpace: 'pre-line' }}>
        {petition.description}
      </div>

      {/* Блок відповідей та коментарів від адміністратора */}
      {petition.officialAnswer && (
        <div style={{ 
          background: '#f8f9fa', 
          borderLeft: '5px solid #2c3e50', 
          padding: '20px', 
          borderRadius: '4px', 
          marginBottom: '40px' 
        }}>
          <h3 style={{ marginTop: 0, color: '#2c3e50' }}>Офіційна відповідь / Коментар від адміністратора:</h3>
          <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.5', whiteSpace: 'pre-line' }}>
            {petition.officialAnswer}
          </p>
        </div>
      )}

      {/* Список тих, хто підписав */}
      <div style={{ borderTop: '2px solid #eee', paddingTop: '20px' }}>
        <h3>Підписали петицію ({voters.length}):</h3>
        {voters.length === 0 ? (
          <p style={{ color: '#888' }}>Будьте першим, хто підпише цю петицію!</p>
        ) : (
          <ol style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
            {voters.map((vote) => (
              <li key={vote.id}>
                <strong>{formatAuthorName(vote.user)}</strong> — <span style={{ fontSize: '12px', color: '#888' }}>{new Date(vote.createdAt).toLocaleDateString('uk-UA')}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
};