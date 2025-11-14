import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './AppDetails.css';

const AppDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('about');

  // Mock data - в реальном приложении это будет загружаться по ID
  const appData = {
    id: id,
    name: 'PhotoMaster Pro',
    icon: '📸',
    category: 'Фото и видео',
    developer: 'Creative Studio Inc.',
    rating: 4.8,
    reviews: 12500,
    downloads: '10M+',
    size: '85 MB',
    version: '3.2.1',
    lastUpdate: '15 ноября 2024',
    ageRating: '4+',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    screenshots: ['📱', '🖼️', '✨', '🎨', '📷'],
    description: 'PhotoMaster Pro - это профессиональное приложение для редактирования фотографий с множеством инструментов и фильтров. Создавайте потрясающие изображения с помощью интуитивно понятного интерфейса.',
    features: [
      '✨ Более 100 профессиональных фильтров',
      '🎨 Расширенные инструменты редактирования',
      '📐 Точная настройка цвета и экспозиции',
      '🔄 Пакетная обработка фотографий',
      '☁️ Облачная синхронизация',
      '📤 Экспорт в высоком разрешении'
    ],
    requirements: {
      os: 'Windows 10/11, macOS 12+, Linux',
      ram: '4 GB',
      storage: '100 MB',
      internet: 'Требуется для некоторых функций'
    },
    userReviews: [
      { id: 1, author: 'Александр', rating: 5, date: '2 дня назад', comment: 'Лучшее приложение для редактирования! Очень довольны функционалом.' },
      { id: 2, author: 'Мария', rating: 4, date: '1 неделя назад', comment: 'Хорошее приложение, но иногда тормозит на слабых устройствах.' },
      { id: 3, author: 'Дмитрий', rating: 5, date: '2 недели назад', comment: 'Профессиональные инструменты по доступной цене. Рекомендую!' },
      { id: 4, author: 'Елена', rating: 5, date: '3 недели назад', comment: 'Использую каждый день! Интуитивный интерфейс и много возможностей.' },
    ],
    changelog: [
      { version: '3.2.1', date: '15 ноября 2024', changes: ['Исправлены ошибки', 'Улучшена производительность', 'Добавлены новые фильтры'] },
      { version: '3.2.0', date: '1 ноября 2024', changes: ['Новый интерфейс', 'Поддержка темной темы', 'Оптимизация работы'] },
    ]
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    return '⭐'.repeat(fullStars) + (hasHalfStar ? '✨' : '') + '☆'.repeat(5 - fullStars - (hasHalfStar ? 1 : 0));
  };

  const handleDownload = () => {
    alert(`Начинается скачивание ${appData.name}...`);
  };

  return (
    <div className="app-details-page">
      <div className="app-details-content">
        {/* Hero Section */}
        <section className="app-hero">
          <div className="app-hero-bg" style={{ background: appData.color }}></div>
          <div className="app-hero-content glass-card">
            <button className="back-btn" onClick={() => navigate(-1)}>
              ← Назад
            </button>
            <div className="app-main-info">
              <div className="app-icon-large">{appData.icon}</div>
              <div className="app-title-section">
                <h1 className="app-title">{appData.name}</h1>
                <p className="app-developer">{appData.developer}</p>
                <p className="app-category-badge">{appData.category}</p>
              </div>
            </div>
            <div className="app-quick-stats">
              <div className="quick-stat">
                <span className="stat-value-large">{appData.rating}</span>
                <span className="stat-label-small">⭐ Рейтинг</span>
              </div>
              <div className="quick-stat">
                <span className="stat-value-large">{appData.downloads}</span>
                <span className="stat-label-small">📥 Скачиваний</span>
              </div>
              <div className="quick-stat">
                <span className="stat-value-large">{appData.size}</span>
                <span className="stat-label-small">💾 Размер</span>
              </div>
            </div>
            <button className="download-main-btn" onClick={handleDownload}>
              📥 Скачать сейчас
            </button>
          </div>
        </section>

        {/* Screenshots */}
        <section className="screenshots-section">
          <h2 className="section-title">Скриншоты</h2>
          <div className="screenshots-grid">
            {appData.screenshots.map((screenshot, idx) => (
              <div key={idx} className="screenshot-card glass-card">
                <span className="screenshot-icon">{screenshot}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Tabs */}
        <div className="details-tabs">
          <button
            className={`details-tab ${selectedTab === 'about' ? 'active' : ''}`}
            onClick={() => setSelectedTab('about')}
          >
            📖 О приложении
          </button>
          <button
            className={`details-tab ${selectedTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setSelectedTab('reviews')}
          >
            ⭐ Отзывы ({appData.reviews})
          </button>
          <button
            className={`details-tab ${selectedTab === 'changelog' ? 'active' : ''}`}
            onClick={() => setSelectedTab('changelog')}
          >
            📋 История версий
          </button>
        </div>

        {/* Tab Content */}
        <div className="details-tab-content">
          {selectedTab === 'about' && (
            <div className="about-section">
              <div className="about-card glass-card">
                <h3>Описание</h3>
                <p className="app-description">{appData.description}</p>
              </div>

              <div className="about-card glass-card">
                <h3>Возможности</h3>
                <ul className="features-list">
                  {appData.features.map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
              </div>

              <div className="about-card glass-card">
                <h3>Системные требования</h3>
                <div className="requirements-grid">
                  <div className="requirement-item">
                    <span className="req-icon">💻</span>
                    <div>
                      <span className="req-label">Операционная система:</span>
                      <span className="req-value">{appData.requirements.os}</span>
                    </div>
                  </div>
                  <div className="requirement-item">
                    <span className="req-icon">🧠</span>
                    <div>
                      <span className="req-label">Оперативная память:</span>
                      <span className="req-value">{appData.requirements.ram}</span>
                    </div>
                  </div>
                  <div className="requirement-item">
                    <span className="req-icon">💾</span>
                    <div>
                      <span className="req-label">Свободное место:</span>
                      <span className="req-value">{appData.requirements.storage}</span>
                    </div>
                  </div>
                  <div className="requirement-item">
                    <span className="req-icon">🌐</span>
                    <div>
                      <span className="req-label">Интернет:</span>
                      <span className="req-value">{appData.requirements.internet}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="about-card glass-card">
                <h3>Информация</h3>
                <div className="info-list">
                  <div className="info-item">
                    <span className="info-label">Версия:</span>
                    <span className="info-value">{appData.version}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Обновлено:</span>
                    <span className="info-value">{appData.lastUpdate}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Возрастной рейтинг:</span>
                    <span className="info-value">{appData.ageRating}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Разработчик:</span>
                    <span className="info-value">{appData.developer}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'reviews' && (
            <div className="reviews-section">
              <div className="reviews-summary glass-card">
                <div className="rating-overview">
                  <span className="rating-large">{appData.rating}</span>
                  <div className="rating-details">
                    <div className="stars-large">{renderStars(appData.rating)}</div>
                    <span className="reviews-count">{appData.reviews.toLocaleString()} отзывов</span>
                  </div>
                </div>
              </div>

              <div className="reviews-list">
                {appData.userReviews.map((review) => (
                  <div key={review.id} className="review-card glass-card">
                    <div className="review-header-detail">
                      <div className="review-author">
                        <span className="author-avatar">👤</span>
                        <div>
                          <span className="author-name">{review.author}</span>
                          <span className="review-date-small">{review.date}</span>
                        </div>
                      </div>
                      <div className="review-rating-small">{renderStars(review.rating)}</div>
                    </div>
                    <p className="review-text">{review.comment}</p>
                    <div className="review-helpful">
                      <button className="helpful-btn">👍 Полезно</button>
                    </div>
                  </div>
                ))}
              </div>

              <button className="write-review-btn glass-card">
                ✏️ Написать отзыв
              </button>
            </div>
          )}

          {selectedTab === 'changelog' && (
            <div className="changelog-section">
              {appData.changelog.map((version, idx) => (
                <div key={idx} className="changelog-card glass-card">
                  <div className="version-header">
                    <h3>Версия {version.version}</h3>
                    <span className="version-date">{version.date}</span>
                  </div>
                  <ul className="changes-list">
                    {version.changes.map((change, changeIdx) => (
                      <li key={changeIdx}>• {change}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppDetails;

