import React, { useState, useEffect } from 'react';

export const Footer: React.FC = () => {
  const [showScroll, setShowScroll] = useState(false);

  // Логіка для кнопки "Вгору"
  useEffect(() => {
    const checkScroll = () => {
      if (window.scrollY > 300) {
        setShowScroll(true);
      } else {
        setShowScroll(false);
      }
    };

    window.addEventListener('scroll', checkScroll, { passive: true });
    return () => window.removeEventListener('scroll', checkScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <footer style={{ background: '#19436e', color: '#ffffff', fontFamily: 'Arial, sans-serif', marginTop: 'auto' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px 15px 15px 15px' }}>
        
        {/* Верхня частина з контактами (2 колонки) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', marginBottom: '30px' }}>
          
          {/* Ліва колонка: Аварійні служби */}
          <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '15px' }}>
              Аварійні служби:
            </p>

            <div style={{ marginBottom: '10px' }}>
              КП «Боярка-водоканал»:<br />
              <strong>
                <a href="tel:+380675064330" style={{ color: '#f1c40f', textDecoration: 'none' }}>
                  067-506-43-30
                </a>
              </strong>
            </div>

            <div style={{ marginBottom: '10px' }}>
              КП «БГВУЖКГ»:<br />
              <strong>
                <a href="tel:+380939840357" style={{ color: '#f1c40f', textDecoration: 'none' }}>
                  093-984-03-57
                </a>
              </strong>
            </div>

            <div style={{ marginBottom: '10px' }}>
              КП «Муніципальна безпека»:<br />
              <strong>
                <a href="tel:+380957521509" style={{ color: '#f1c40f', textDecoration: 'none' }}>
                  095-752-15-09
                </a>
              </strong>
            </div>
          </div>

          {/* Права колонка: Адреса та загальні контакти */}
          <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
            <p style={{ marginBottom: '10px' }}>
              08150, Україна, Київська область, Фастівський район,<br />
              місто Боярка, вулиця Михайла Грушевського, 39
            </p>

            <p style={{ marginBottom: '10px' }}>
              Електронна пошта загальна:{' '}
              <a href="mailto:mailer@mistoboyarka.gov.ua" style={{ color: '#f1c40f', textDecoration: 'none' }}>
                mailer@mistoboyarka.gov.ua
              </a>
            </p>

            <p style={{ marginBottom: '10px' }}>
              <strong>
                <a href="tel:+380672040995" style={{ color: '#f1c40f', textDecoration: 'none' }}>
                  067-204-09-95
                </a>
              </strong>
            </p>

            <p style={{ fontSize: '12px', opacity: 0.85, marginTop: '15px' }}>
              При використанні нормативно-правових документів, інформаційних фото та відео матеріалів, посилання на сайт обов'язкове.
            </p>
          </div>

        </div>

        {/* Нижній ярус: Copyright та Соцмережі */}
        <div style={{ 
          borderTop: '1px solid rgba(255, 255, 255, 0.15)', 
          paddingTop: '15px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap',
          gap: '10px',
          fontSize: '13px' 
        }}>
          <div>
            © 2026 Боярська Міська Рада - всі права захищено.
          </div>

          <div>
            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Ми у Facebook"
              style={{ color: '#ffffff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              🌐 Facebook
            </a>
          </div>
        </div>

      </div>

      {/* Кнопка "Прокрутка вгору" */}
      <button
        onClick={scrollToTop}
        aria-label="Вгору"
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          width: '45px',
          height: '45px',
          borderRadius: '50%',
          backgroundColor: '#f1c40f',
          color: '#000',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          fontWeight: 'bold',
          transition: 'opacity 0.3s ease, visibility 0.3s ease',
          opacity: showScroll ? 1 : 0,
          visibility: showScroll ? 'visible' : 'hidden',
          zIndex: 1000
        }}
      >
        ↑
      </button>
    </footer>
  );
};