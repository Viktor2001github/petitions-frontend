import React from 'react';
import { Link } from 'react-router-dom';

export const RecomendationPage: React.FC = () => {
  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: 'calc(100vh - 200px)', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Баннер / Заголовок сторінки */}
        <div 
          style={{ 
            backgroundColor: '#19436e', 
            color: '#fff', 
            borderRadius: '12px', 
            padding: '35px 30px', 
            marginBottom: '30px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}
        >
          <h1 style={{ margin: '0 0 10px 0', fontSize: '28px', fontWeight: 'bold' }}>
            Як правильно створити електронну петицію
          </h1>
          <p style={{ margin: 0, fontSize: '16px', opacity: 0.9, maxWidth: '700px'}}>
            Дотримуйтесь цих рекомендацій, щоб ваша петиція пройшла модерацію та була успішно розглянута Боярською міською радою.
          </p>
        </div>

        {/* Покрокова інструкція */}
        <h2 style={{ fontSize: '22px', color: '#19436e', marginBottom: '20px', borderLeft: '4px solid #f1c40f', paddingLeft: '12px' }}>
          Кроки для успішної петиції
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          
          <div style={cardStyle}>
            <div style={stepBadgeStyle}>1</div>
            <h3 style={cardTitleStyle}>Чіткий заголовок</h3>
            <p style={cardTextStyle}>
              Сформулюйте суть проблеми в 5-10 словах. Наприклад: <em>«Облаштування пішохідного переходу по вул. Г Dragon»</em> замість <em>«Зробіть дороги»</em>.
            </p>
          </div>

          <div style={cardStyle}>
            <div style={stepBadgeStyle}>2</div>
            <h3 style={cardTitleStyle}>Аргументований опис</h3>
            <p style={cardTextStyle}>
              Опишіть проблему, чому вона важлива для Боярської громади, та запропонуйте конкретні шляхи її вирішення.
            </p>
          </div>

          <div style={cardStyle}>
            <div style={stepBadgeStyle}>3</div>
            <h3 style={cardTitleStyle}>Коректність та етика</h3>
            <p style={cardTextStyle}>
              Не використовуйте нецензурну лексику, заклики до насильства чи особисті образи. Такі петиції відхиляються модератором.
            </p>
          </div>

        </div>

        {/* Що варто та чого не варто робити (Do's and Don'ts) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px', marginBottom: '40px' }}>
          
          {/* Поради "ЩО ВАРТО РОБИТИ" */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', padding: '25px', borderTop: '4px solid #27ae60', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <h3 style={{ color: '#27ae60', marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>✓</span> Рекомендовано
            </h3>
            <ul style={{ paddingLeft: '20px', margin: 0, lineHeight: '1.7', color: '#444' }}>
              <li>Вказувати точні адреси, локації або номери об'єктів.</li>
              <li>Пропонувати конкретні реалістичні рішення.</li>
              <li>Перевірити, чи немає вже аналогічної петиції на сайті.</li>
              <li>Поширювати посилання на петицію в соцмережах для збору голосів.</li>
            </ul>
          </div>

          {/* Заборони "ЧОГО НЕ ВАРТО РОБИТИ" */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', padding: '25px', borderTop: '4px solid #e74c3c', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <h3 style={{ color: '#e74c3c', marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>✕</span> Причини відмови в публікації
            </h3>
            <ul style={{ paddingLeft: '20px', margin: 0, lineHeight: '1.7', color: '#444' }}>
              <li>Питання, що не належать до компетенції міської ради.</li>
              <li>Містить конфіденційну інформацію про інших осіб.</li>
              <li>Дублює вже діючу активну петицію.</li>
              <li>Комерційна реклама або просування послуг.</li>
            </ul>
          </div>

        </div>

        {/* Блок із закликом до дії */}
        <div style={{ backgroundColor: '#ffffff', border: '2px dashed #f1c40f', borderRadius: '12px', padding: '30px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#19436e' }}>Готові подати свою петицію?</h3>
          <p style={{ color: '#666', marginBottom: '20px' }}>Якщо ви ознайомилися з правилами, можете перейти до створення.</p>
          <Link 
            to="/create-petition"
            style={{
              backgroundColor: '#f1c40f',
              color: '#000',
              padding: '12px 28px',
              borderRadius: '6px',
              fontWeight: 'bold',
              textDecoration: 'none',
              display: 'inline-block',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
            }}
          >
            Створити петицію
          </Link>
        </div>

      </div>
    </div>
  );
};

// Допоміжні стилі для карток
const cardStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '10px',
  padding: '25px',
  position: 'relative',
  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  border: '1px solid #eee'
};

const stepBadgeStyle: React.CSSProperties = {
  position: 'absolute',
  top: '-12px',
  left: '20px',
  backgroundColor: '#f1c40f',
  color: '#000',
  fontWeight: 'bold',
  width: '28px',
  height: '28px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '14px'
};

const cardTitleStyle: React.CSSProperties = {
  marginTop: '10px',
  marginBottom: '10px',
  color: '#19436e',
  fontSize: '18px'
};

const cardTextStyle: React.CSSProperties = {
  margin: 0,
  color: '#555',
  fontSize: '14px',
  lineHeight: '1.5'
};