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
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [ratingFilter, setRatingFilter] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);

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
          const reviews = reviewsResult.data.length > 0 ? reviewsResult.data : [
            { id: 1, author: 'Александр', rating: 5, date: '2 дня назад', comment: 'Отличное приложение! Очень довольны функционалом.' },
            { id: 2, author: 'Мария', rating: 4, date: '1 неделя назад', comment: 'Хорошее приложение, но иногда тормозит на слабых устройствах.' },
            { id: 3, author: 'Дмитрий', rating: 5, date: '2 недели назад', comment: 'Профессиональные инструменты по доступной цене. Рекомендую!' },
            { id: 4, author: 'Елена', rating: 5, date: '3 недели назад', comment: 'Использую каждый день! Интуитивный интерфейс и много возможностей.' },
            { id: 5, author: 'Иван', rating: 3, date: '1 месяц назад', comment: 'Неплохо, но есть куда расти. Нужно больше функций.' },
            { id: 6, author: 'Ольга', rating: 5, date: '1 месяц назад', comment: 'Замечательное приложение! Всем рекомендую.' },
            { id: 7, author: 'Сергей', rating: 4, date: '2 месяца назад', comment: 'Хорошая работа, продолжайте в том же духе!' },
            { id: 8, author: 'Анна', rating: 2, date: '2 месяца назад', comment: 'Разочарован. Много багов и вылетов.' },
          ];
          setUserReviews(reviews);
          setFilteredReviews(reviews);
        }
      } catch (error) {
        console.error('Error loading app data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAppData();
  }, [id]);

  // Закрытие dropdown при клике вне его
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isFilterOpen && !event.target.closest('.filter-dropdown')) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isFilterOpen]);

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

  // SVG Star Component
  const StarIcon = ({ filled }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );

  const renderStars = (rating, size = 20) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <StarIcon key={i} filled={i <= Math.floor(rating)} />
      );
    }
    return <div className="stars-container">{stars}</div>;
  };

  // Подсчет отзывов по рейтингу
  const getRatingStats = () => {
    const stats = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    userReviews.forEach(review => {
      stats[review.rating]++;
    });
    return stats;
  };

  // Фильтрация отзывов
  const handleFilterChange = (filter) => {
    setRatingFilter(filter);
    setIsFilterOpen(false);
    
    if (filter === 'all') {
      setFilteredReviews(userReviews);
    } else {
      const rating = parseInt(filter);
      setFilteredReviews(userReviews.filter(review => review.rating === rating));
    }
  };

  const handleDownload = () => {
    alert(`Начинается скачивание ${appData.name}...`);
  };

  const filterOptions = [
    { value: 'all', label: 'Все отзывы' },
    { value: '5', label: '5 звезд' },
    { value: '4', label: '4 звезды' },
    { value: '3', label: '3 звезды' },
    { value: '2', label: '2 звезды' },
    { value: '1', label: '1 звезда' },
  ];

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
              Скачать сейчас
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
            ⭐ Отзывы ({userReviews.length})
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
              <div className="reviews-summary glass-card">
                <div className="rating-overview">
                  <div className="rating-main">
                    <span className="rating-large">{appData.rating}</span>
                    <div className="stars-large">{renderStars(appData.rating)}</div>
                    <span className="reviews-count">{userReviews.length} отзывов</span>
                  </div>
                  
                  <div className="rating-breakdown">
                    {[5, 4, 3, 2, 1].map(star => {
                      const stats = getRatingStats();
                      const count = stats[star];
                      const percentage = userReviews.length > 0 ? (count / userReviews.length) * 100 : 0;
                      
                      return (
                        <div key={star} className="rating-bar-row">
                          <span className="rating-bar-label">{star}</span>
                          <StarIcon filled={true} />
                          <div className="rating-bar-container">
                            <div 
                              className="rating-bar-fill" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="rating-bar-count">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Фильтр отзывов */}
              <div className="reviews-filter">
                <div className="filter-dropdown">
                  <button 
                    className="filter-btn glass-card"
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                  >
                    <span>{filterOptions.find(opt => opt.value === ratingFilter)?.label}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                  </button>
                  
                  {isFilterOpen && (
                    <div className="filter-dropdown-menu glass-card">
                      {filterOptions.map(option => (
                        <button
                          key={option.value}
                          className={`filter-option ${ratingFilter === option.value ? 'active' : ''}`}
                          onClick={() => handleFilterChange(option.value)}
                        >
                          {option.label}
                          {ratingFilter === option.value && (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <path d="M20 6L9 17l-5-5"/>
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <span className="filter-result-count">
                  Показано: {filteredReviews.length} из {userReviews.length}
                </span>
              </div>

              <div className="reviews-list">
                {filteredReviews.map((review) => (
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
                      <button className="helpful-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                        </svg>
                        Полезно
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button className="write-review-btn glass-card">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
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

