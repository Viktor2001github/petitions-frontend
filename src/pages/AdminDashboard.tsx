import React, { useState, useEffect, } from 'react';
import api from '../api/axios';

interface Petition {
  id: number;
  title: string;
  category: string;
  status: 'PENDING' | 'ACTIVE' | 'REVIEW' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  author?: { id: string; fullName: string; email: string };
  _count?: { votes: number };
}

interface FetchPetitionsResponse {
  petitions: Petition[];
  totalPages: number;
  totalCount: number;
  currentPage: number;
}

export const AdminDashboard: React.FC = () => {
  // Фільтрація, сортування та пагінація
  const [petitions, setPetitions] = useState<Petition[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('createdAt_desc');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Модальне вікно опрацювання
  const [activePetition, setActivePetition] = useState<Petition | null>(null);
  const [officialAnswer, setOfficialAnswer] = useState('');
  const [selectedStatusAction, setSelectedStatusAction] = useState<'APPROVED' | 'REJECTED' | null>(null);
  
  // Розсилка
  const [notifySubject, setNotifySubject] = useState('');
  const [notifyBody, setNotifyBody] = useState('');

  // Блок Бану користувачів
  const [userIdToBan, setUserIdToBan] = useState('');

  // Функція оновлення даних
  const refetch = () => setRefreshTrigger((prev) => prev + 1);

  // Отримання списку петицій
  useEffect(() => {
  let isMounted = true;

  const fetchPetitions = async () => {
    try {
      const res = await api.get<FetchPetitionsResponse>('/admin/petitions', {
        params: {
          status: selectedStatus || undefined,
          search: searchQuery || undefined,
          sortBy,
          page,
          limit: 30,
        },
      });

      if (isMounted) {
        setPetitions(res.data.petitions);
        setTotalPages(res.data.totalPages);
      }
    } catch (err) {
      console.error(err);
      alert('Помилка завантаження петицій');
    }
  };

  fetchPetitions();

  return () => {
    isMounted = false;
  };
}, [selectedStatus, searchQuery, sortBy, page, refreshTrigger]);

  // Експорт в Excel
  const handleExportExcel = async () => {
    try {
      const res = await api.get('/admin/export/petitions', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'petitions_report.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert('Помилка експорту Excel');
    }
  };

  // Швидка модерація
  const handleModerate = async (id: number, action: 'APPROVE' | 'REJECT') => {
    try {
      await api.patch(`/admin/petitions/${id}/moderate`, { action });
      refetch();
    } catch {
      alert('Помилка при зміні статусу');
    }
  };

  // Відкриття модального вікна
  const handleOpenModal = (petition: Petition) => {
    setActivePetition(petition);
    setOfficialAnswer('');
    setNotifySubject('');
    setNotifyBody('');
    setSelectedStatusAction(null);
  };

  // Комплексна відправка з модального вікна
  const handleProcessSubmit = async () => {
    if (!activePetition) return;

    try {
      // 1. Збереження відповіді та зміна статусу (якщо вибрано статус)
      if (officialAnswer.trim() || selectedStatusAction) {
        await api.post(`/admin/petitions/${activePetition.id}/response`, {
          officialAnswer,
          status: selectedStatusAction || undefined,
        });
      }

      // 2. Створення розсилки, якщо заповнені поля
      if (notifySubject.trim() && notifyBody.trim()) {
        await api.post(`/admin/petitions/${activePetition.id}/notify`, {
          subject: notifySubject,
          body: notifyBody,
        });
        // Запуск черги
        await api.post('/admin/notifications/process');
      }

      alert('Операцію успішно виконано!');
      setActivePetition(null);
      refetch();
    } catch {
      alert('Помилка при обробці запиту');
    }
  };

  // Видалення петиції
  const handleDeletePetition = async (id: number) => {
    if (!window.confirm(`Ви дійсно бажаєте видалити петицію №${id}?`)) return;

    try {
      await api.delete(`/admin/petitions/${id}`);
      alert('Петицію успішно видалено!');
      if (activePetition?.id === id) setActivePetition(null);
      refetch();
    } catch {
      alert('Помилка при видаленні петиції');
    }
  };

  // Бан / Розбан
  const handleToggleBan = async () => {
    if (!userIdToBan) return alert('Введіть UUID користувача');
    try {
      const res = await api.patch(`/admin/users/${userIdToBan}/toggle-ban`);
      alert(res.data.message);
      setUserIdToBan('');
    } catch {
      alert('Помилка при зміні бану');
    }
  };

  return (
    <div style={{ padding: '25px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h2>Адмінпанель Петицій</h2>

      {/* Панель з баном користувача */}
      <div style={{ padding: '15px', background: '#f8f9fa', border: '1px solid #ddd', borderRadius: '6px', marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 10px 0' }}>Управління блокуванням (Бан користувача)</h4>
        <div style={{ display: 'flex', gap: '10px', maxWidth: '500px' }}>
          <input
            type="text"
            placeholder="UUID користувача"
            value={userIdToBan}
            onChange={(e) => setUserIdToBan(e.target.value)}
            style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <button onClick={handleToggleBan} style={{ padding: '8px 15px', background: '#c0392b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Бан / Розбан
          </button>
        </div>
      </div>

      {/* Панель фільтрів, пошуку та завантаження Excel */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Пошук за назвою або ID..."
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
          style={{ padding: '8px 12px', minWidth: '220px', borderRadius: '4px', border: '1px solid #ccc' }}
        />

        <select value={selectedStatus} onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }} style={{ padding: '8px' }}>
          <option value="">Всі статуси</option>
          <option value="PENDING">Очікують модерації (PENDING)</option>
          <option value="ACTIVE">Активні (ACTIVE)</option>
          <option value="REVIEW">На розгляді (REVIEW)</option>
          <option value="APPROVED">Підтримані / APPROVED</option>
          <option value="REJECTED">Відхилені / REJECTED</option>
        </select>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: '8px' }}>
          <option value="createdAt_desc">Спочатку нові</option>
          <option value="createdAt_asc">Спочатку старі</option>
          <option value="votes_desc">Найбільше голосів</option>
        </select>

        <button onClick={handleExportExcel} style={{ padding: '8px 15px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginLeft: 'auto' }}>
          Завантажити Excel-звіт
        </button>
      </div>

      {/* Таблиця петицій */}
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
        <thead>
          <tr style={{ background: '#f4f4f4', textAlign: 'left' }}>
            <th style={{ border: '1px solid #ddd', padding: '10px' }}>ID</th>
            <th style={{ border: '1px solid #ddd', padding: '10px' }}>Заголовок</th>
            <th style={{ border: '1px solid #ddd', padding: '10px' }}>Автор</th>
            <th style={{ border: '1px solid #ddd', padding: '10px' }}>Голоси</th>
            <th style={{ border: '1px solid #ddd', padding: '10px' }}>Статус</th>
            <th style={{ border: '1px solid #ddd', padding: '10px' }}>Дії</th>
          </tr>
        </thead>
        <tbody>
          {petitions.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>Петицій не знайдено</td>
            </tr>
          ) : (
            petitions.map((p) => (
              <tr key={p.id}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{p.id}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{p.title}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{p.author?.fullName || 'Анонім'}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{p._count?.votes || 0}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}><b>{p.status}</b></td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {p.status === 'PENDING' && (
                    <>
                      <button onClick={() => handleModerate(p.id, 'APPROVE')} style={{ marginRight: '5px', background: '#27ae60', color: '#fff', border: 'none', padding: '5px 8px', borderRadius: '3px', cursor: 'pointer' }}>Схвалити</button>
                      <button onClick={() => handleModerate(p.id, 'REJECT')} style={{ marginRight: '5px', background: '#e74c3c', color: '#fff', border: 'none', padding: '5px 8px', borderRadius: '3px', cursor: 'pointer' }}>Відхилити</button>
                    </>
                  )}
                  <button onClick={() => handleOpenModal(p)} style={{ padding: '5px 10px', background: '#2980b9', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>
                    Опрацювати
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Пагінація */}
      {totalPages > 1 && (
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
          <button disabled={page === 1} onClick={() => setPage((prev) => prev - 1)} style={{ padding: '6px 12px' }}>
            Попередня
          </button>
          <span style={{ alignSelf: 'center' }}>
            Сторінка {page} з {totalPages}
          </span>
          <button disabled={page === totalPages} onClick={() => setPage((prev) => prev + 1)} style={{ padding: '6px 12px' }}>
            Наступна
          </button>
        </div>
      )}

      {/* МОДАЛЬНЕ ВІКНО ОПРАЦЮВАННЯ */}
      {activePetition && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{ background: '#fff', width: '550px', padding: '25px', borderRadius: '8px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
            <h3 style={{ marginTop: 0 }}>Опрацювання петиції №{activePetition.id}</h3>
            
            <p><b>Заголовок:</b> {activePetition.title}</p>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Офіційна відповідь на петицію:</label>
              <textarea
                rows={3}
                value={officialAnswer}
                onChange={(e) => setOfficialAnswer(e.target.value)}
                placeholder="Введіть текст офіційної відповіді..."
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              />
            </div>

            {/* Чекбокси вибору статусу */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Зміна стану петиції:</label>
              <div style={{ display: 'flex', gap: '20px' }}>
                <label style={{ cursor: 'pointer', color: '#27ae60', fontWeight: 'bold' }}>
                  <input
                    type="checkbox"
                    checked={selectedStatusAction === 'APPROVED'}
                    onChange={() => setSelectedStatusAction(selectedStatusAction === 'APPROVED' ? null : 'APPROVED')}
                  /> Підтримано
                </label>
                <label style={{ cursor: 'pointer', color: '#c0392b', fontWeight: 'bold' }}>
                  <input
                    type="checkbox"
                    checked={selectedStatusAction === 'REJECTED'}
                    onChange={() => setSelectedStatusAction(selectedStatusAction === 'REJECTED' ? null : 'REJECTED')}
                  /> Відхилено
                </label>
              </div>
            </div>

            <hr style={{ border: '0.5px solid #eee', margin: '15px 0' }} />

            <div style={{ marginBottom: '15px' }}>
              <h4 style={{ margin: '0 0 10px 0' }}>Розсилка новин підписантам цієї петиції:</h4>
              <input
                type="text"
                placeholder="Тема листа"
                value={notifySubject}
                onChange={(e) => setNotifySubject(e.target.value)}
                style={{ width: '100%', padding: '8px', marginBottom: '8px', boxSizing: 'border-box' }}
              />
              <textarea
                rows={3}
                placeholder="Текст повідомлення для громадян"
                value={notifyBody}
                onChange={(e) => setNotifyBody(e.target.value)}
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              />
            </div>

            {/* Дії модального вікна */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
              <button
                onClick={() => handleDeletePetition(activePetition.id)}
                style={{ padding: '8px 12px', background: '#c0392b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Видалити петицію
              </button>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setActivePetition(null)}
                  style={{ padding: '8px 12px', background: '#95a5a6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Скасувати
                </button>
                <button
                  onClick={handleProcessSubmit}
                  style={{ padding: '8px 16px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Відправити
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};