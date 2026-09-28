import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Activity } from '../types/index.ts';
import api from '../api/axios';

export const RecentActivities: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const navigate = useNavigate();

  

  useEffect(() => {
    const fetchActivities = async () => {
        try {
            const res = await api.get('/petitions/recent-votes');
            setActivities(res.data);
        } 
        catch (err) {
            console.error('Помилка завантаження останніх дій:', err);
        }
  };

    fetchActivities();
    // Автоматичне оновлення кожні 10 секунд (Live monitoring)
    const interval = setInterval(fetchActivities, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="sidebar" style={{ background: '#0a407e', color: '#fff', padding: '20px', borderRadius: '8px', height: 'fit-content', boxSizing: 'border-box', width: '300px' }}>
      <h3 style={{ margin: '0 0 15px 0', borderBottom: '1px solid #aaa', paddingBottom: '10px' }}>
        Останні дії
      </h3>

      {activities.length === 0 ? (
        <p style={{ fontSize: '13px', color: '#ccc' }}>Активностей поки немає.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {activities.map((act) => (
            <div key={act.id} style={{ fontSize: '13px', lineHeight: '1.4' }}>
              <p style={{ color: '#f1c40f', fontWeight: 'bold', margin: '0 0 2px 0' }}>
                {act.userName}
              </p>
              <p style={{ margin: 0 }}>
                підписав(ла) петицію{' '}
                <span 
                  onClick={() => navigate(`/petitions/${act.petitionId}`)}
                  style={{ fontStyle: 'italic', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  «{act.petitionTitle}»
                </span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};