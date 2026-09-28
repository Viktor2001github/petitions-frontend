import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import api from '../api/axios';

const CATEGORIES = [
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

export const CreatePetitionPage: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [postalCode, setPostalCode] = useState('');
  const [settlement, setSettlement] = useState('');
  const [address, setAddress] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(
    token ? null : 'Необхідна авторизація для створення петиції'
  );
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Валідація обов'язкових полів
    if (!title.trim()) {
      return setError('Будь ласка, вкажіть назву петиції.');
    }
    if (!category) {
      return setError('Будь ласка, оберіть категорію.');
    }
    if (!description.trim()) {
      return setError('Будь ласка, додайте опис петиції.');
    }
    if (!postalCode.trim()) {
      return setError('Будь ласка, вкажіть поштовий індекс.');
    }
    if (!settlement.trim()) {
      return setError('Будь ласка, вкажіть населений пункт.');
    }
    if (!address.trim()) {
      return setError('Будь ласка, вкажіть адресу.');
    }
    if (!imageFile) {
      return setError('Будь ласка, завантажте фото обкладинки петиції.');
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('category', category);
      formData.append('postalCode', postalCode.trim());
      formData.append('settlement', settlement.trim());
      formData.append('address', address.trim());
      formData.append('image', imageFile);

      await api.post('/petitions', formData);

      alert('Петицію успішно створено!');
      navigate('/');
    } catch (err: unknown) {
      console.error('Помилка при створенні петиції:', err);
      const errorResponse = err instanceof AxiosError
        ? err.response?.data as { error?: string } | undefined
        : undefined;
      setError(errorResponse?.error || 'Помилка при створенні петиції');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#f4f6f9', minHeight: '100vh', padding: '40px 20px', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>
      <div style={{ maxWidth: '750px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        
        <div style={{ background: '#3498db', color: '#ffffff', padding: '30px' }}>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', textAlign: 'center' }}>Створити нову петицію</h1>
          <p style={{ margin: '8px 0 0 0', opacity: 0.9, fontSize: '14px', textAlign: 'center' }}>
            Оформіть свою ініціативу, щоб зібрати підписи громади та привернути увагу органов влади.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {error && (
            <div style={{ backgroundColor: '#fde8e8', color: '#e74c3c', borderLeft: '4px solid #e74c3c', padding: '12px 16px', borderRadius: '4px', fontSize: '14px' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '10px', fontSize: '13px', color: '#666' }}>
            <span>Усі поля, позначені <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>*</span>, є обов'язковими для заповнення</span>
            <span>Формат: Електронна петиція</span>
          </div>

          {/* Назва */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontWeight: '600', color: '#333', fontSize: '14px' }}>
                Назва петиції <span style={{ color: '#e74c3c' }}>*</span>
              </label>
              <span style={{ fontSize: '12px', color: '#999' }}>{title.length}/200</span>
            </div>
            <input
              type="text"
              maxLength={200}
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Наприклад: Створити притулок для безпритульних тварин"
              style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '15px', outline: 'none' }}
            />
          </div>

          {/* Категорія */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontWeight: '600', color: '#333', fontSize: '14px' }}>
              Категорія (напрямок) <span style={{ color: '#e74c3c' }}>*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '15px', outline: 'none', background: '#fff', cursor: 'pointer' }}
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Опис */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontWeight: '600', color: '#333', fontSize: '14px' }}>
              Суть та опис петиції <span style={{ color: '#e74c3c' }}>*</span>
            </label>
            <textarea
              required
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Детально опишіть проблему, обґрунтування та пропозиції щодо її вирішення..."
              style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '15px', outline: 'none', resize: 'vertical' }}
            />
          </div>

          {/* Географія */}
          <div style={{ backgroundColor: '#f8f9fa', padding: '16px', borderRadius: '8px', border: '1px solid #e9ecef' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Географія звернення <span style={{ color: '#e74c3c' }}>*</span>
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#555', marginBottom: '4px' }}>
                  Індекс <span style={{ color: '#e74c3c' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="01001"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#555', marginBottom: '4px' }}>
                  Населений пункт <span style={{ color: '#e74c3c' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={settlement}
                  onChange={(e) => setSettlement(e.target.value)}
                  placeholder="м. Київ"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#555', marginBottom: '4px' }}>
                  Адреса <span style={{ color: '#e74c3c' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="вул. Хрещатик, 1"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          </div>

          {/* Фото обкладинки */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontWeight: '600', color: '#333', fontSize: '14px' }}>
              Обкладинка петиції <span style={{ color: '#e74c3c' }}>*</span>
            </label>
            {!imagePreview ? (
              <label style={{ border: '2px dashed #cbd5e1', padding: '25px', textAlign: 'center', borderRadius: '8px', cursor: 'pointer', backgroundColor: '#fafafa' }}>
                <span style={{ color: '#64748b', fontSize: '14px', display: 'block', fontWeight: '500' }}>📷 Натисніть для завантаження фото</span>
                <span style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px', display: 'block' }}>PNG, JPG або WEBP</span>
                <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
              </label>
            ) : (
              <div style={{ position: 'relative', marginTop: '5px' }}>
                <img src={imagePreview} alt="Прев’ю" style={{ width: '100%', maxHeight: '220px', objectFit: 'cover', borderRadius: '8px' }} />
                <button
                  type="button"
                  onClick={removeImage}
                  style={{ position: 'absolute', top: '10px', right: '10px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Кнопка відправки */}
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '14px',
              backgroundColor: loading ? '#95a5a6' : '#27ae60',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '10px',
              transition: 'background-color 0.2s'
            }}
          >
            {loading ? 'Опублікування...' : 'Опублікувати петицію'}
          </button>

        </form>
      </div>
    </div>
  );
};