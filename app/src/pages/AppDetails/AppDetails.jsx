import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAppById, getReviewsForApp } from '../../services/api';
import './AppDetails.css';

const AppDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('about');
  const [appData, setAppData] = useState(null);
  const [userReviews, setUserReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewFilter, setReviewFilter] = useState('all'); // all, 5, 4, 3, 2, 1

  useEffect(() => {
    const loadAppData = async () => {
      try {
        const [appResult, reviewsResult] = await Promise.all([
          getAppById(id),
          getReviewsForApp(id)
        ]);

        if (appResult.success) {
          const app = appResult.data;
          setAppData({
            ...app,
            changelog: [
              { version: app.version, date: app.lastUpdate, changes: ['Исправлены ошибки', 'Улучшена производительность', 'Добавлены новые функции'] },
              { version: '3.1.0', date: '1 ноября 2024', changes: ['Новый интерфейс', 'Поддержка темной темы', 'Оптимизация работы'] },
            ]
          });
        }

        if (reviewsResult.success) {
          setUserReviews(reviewsResult.data.length > 0 ? reviewsResult.data : [
            { id: 1, author: 'Александр', rating: 5, date: '2 дня назад', comment: 'Отличное приложение! Очень довольны функционалом.' },
            { id: 2, author: 'Мария', rating: 4, date: '1 неделя назад', comment: 'Хорошее приложение, но иногда тормозит на слабых устройствах.' },
            { id: 3, author: 'Дмитрий', rating: 5, date: '2 недели назад', comment: 'Профессиональные инструменты по доступной цене. Рекомендую!' },
            { id: 4, author: 'Елена', rating: 5, date: '3 недели назад', comment: 'Использую каждый день! Интуитивный интерфейс и много возможностей.' },
          ]);
        }
      } catch (error) {
        console.error('Error loading app data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAppData();
  }, [id]);

  if (loading || !appData) {
    return (
      <div className="app-details-page">
        <div className="app-details-content">
          <div className="loading-state glass-card">
            <p>Загрузка...</p>
          </div>
        </div>
      </div>
    );
  }

  const oldAppData = {
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    return (
      <span className="stars-display">
        {'★'.repeat(fullStars)}
        {hasHalfStar ? '⯨' : ''}
        {'☆'.repeat(5 - fullStars - (hasHalfStar ? 1 : 0))}
      </span>
    );
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
            <div className="app-main-info">
              <div className="app-icon-large">{appData.icon}</div>
              <div className="app-title-section">
                <h1 className="app-title">{appData.name}</h1>
                <p className="app-developer">{appData.developer}</p>
                <p className="app-category-badge">{appData.category}</p>
                
                {/* Рейтинг отдельно под основным текстом */}
                <div className="app-rating-inline">
                  <span className="rating-stars">⭐</span>
                  <span className="rating-value">{appData.rating}</span>
                  <span className="rating-label">({appData.reviews.toLocaleString()} отзывов)</span>
                </div>
              </div>
            </div>
            
            {/* Кнопка скачать */}
            <button className="download-main-btn" onClick={handleDownload}>
              Скачать
            </button>
            
            {/* Горизонтальный блок с информацией */}
            <div className="app-info-bar">
              <div className="info-bar-item">
                <span className="info-bar-icon">📥</span>
                <div className="info-bar-text">
                  <span className="info-bar-value">{appData.downloads}</span>
                  <span className="info-bar-label">Скачиваний</span>
                </div>
              </div>
              <div className="info-bar-divider"></div>
              <div className="info-bar-item">
                <span className="info-bar-icon">💾</span>
                <div className="info-bar-text">
                  <span className="info-bar-value">{appData.size}</span>
                  <span className="info-bar-label">Размер</span>
                </div>
              </div>
              <div className="info-bar-divider"></div>
              <div className="info-bar-item">
                <span className="info-bar-icon">🔞</span>
                <div className="info-bar-text">
                  <span className="info-bar-value">{appData.ageRating}</span>
                  <span className="info-bar-label">Возраст</span>
                </div>
              </div>
            </div>
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
            <span className="stars-display">★</span> Отзывы ({appData.reviews.toLocaleString()})
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
              {/* Статистика рейтинга */}
              <div className="reviews-summary glass-card">
                <div className="rating-overview-detailed">
                  <div className="rating-main-block">
                    <span className="rating-large">{appData.rating}</span>
                    <div className="rating-details">
                      <div className="stars-large">{renderStars(appData.rating)}</div>
                      <span className="reviews-count">{appData.reviews.toLocaleString()} отзывов</span>
                    </div>
                  </div>
                  
                  {/* Распределение по звездам */}
                  <div className="rating-distribution">
                    {[5, 4, 3, 2, 1].map((stars) => {
                      const count = userReviews.filter(r => r.rating === stars).length;
                      const percentage = userReviews.length > 0 ? (count / userReviews.length) * 100 : 0;
                      return (
                        <div key={stars} className="rating-bar-row">
                          <span className="rating-bar-label">{stars} <span className="stars-display">★</span></span>
                          <div className="rating-bar-container">
                            <div 
                              className="rating-bar-fill" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="rating-bar-count">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Фильтры */}
              <div className="reviews-filters glass-card">
                <button 
                  className={`filter-btn ${reviewFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setReviewFilter('all')}
                >
                  Все отзывы ({userReviews.length})
                </button>
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = userReviews.filter(r => r.rating === stars).length;
                  if (count === 0) return null;
                  return (
                    <button 
                      key={stars}
                      className={`filter-btn ${reviewFilter === stars ? 'active' : ''}`}
                      onClick={() => setReviewFilter(stars)}
                    >
                      {stars} <span className="stars-display">★</span> ({count})
                    </button>
                  );
                })}
              </div>

              {/* Список отзывов */}
              <div className="reviews-list">
                {(reviewFilter === 'all' 
                  ? userReviews 
                  : userReviews.filter(r => r.rating === reviewFilter)
                ).map((review) => (
                  <div key={review.id} className="review-card glass-card">
                    <div className="review-header-detail">
                  <div className="review-author">
                    <div className="author-avatar">
                      {review.author.charAt(0).toUpperCase()}
                    </div>
                    <div className="author-info">
                      <span className="author-name">{review.author}</span>
                      <span className="review-date-small">{review.date}</span>
                    </div>
                  </div>
                      <div className="review-rating-small">{renderStars(review.rating)}</div>
                    </div>
                    <p className="review-text">{review.comment}</p>
                    <div className="review-helpful">
                      <button className="helpful-btn">
                        <span className="helpful-icon">▲</span>
                        Полезно
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Кнопка написать отзыв */}
              <button className="write-review-btn glass-card">
                <span className="write-icon">+</span>
                Написать отзыв
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AppDetails;

