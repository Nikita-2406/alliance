import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getAppById, getReviewsForApp } from '../../services/api';
import './AppDetails.css';

// SVG иконка звезды
const StarIcon = ({ filled = true, className = "" }) => (
  <svg 
    className={`star-icon ${className}`}
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const AppDetails = () => {
  const { id } = useParams();
  const [selectedTab, setSelectedTab] = useState('about');
  const [appData, setAppData] = useState(null);
  const [userReviews, setUserReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewFilter, setReviewFilter] = useState('all'); // all, 5, 4, 3, 2, 1
  const [sortOrder, setSortOrder] = useState('newest'); // newest, oldest, highest, lowest
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);

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

  // Закрытие dropdown при клике вне его
  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdown = document.querySelector('.reviews-filter-dropdown');
      if (dropdown && !dropdown.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isDropdownOpen]);

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
    if (isDownloading || downloadComplete) return;
    
    setIsDownloading(true);
    
    // Через 2 секунды меняем статус на "готово"
    setTimeout(() => {
      setIsDownloading(false);
      setDownloadComplete(true);
    }, 2000);
  };

  // Функция для получения отфильтрованных и отсортированных отзывов
  const getFilteredAndSortedReviews = () => {
    // Фильтрация
    let filtered = reviewFilter === 'all' 
      ? [...userReviews]
      : userReviews.filter(r => r.rating === reviewFilter);
    
    // Сортировка
    switch (sortOrder) {
      case 'newest':
        // Предполагаем, что более новые отзывы имеют больший id
        filtered.sort((a, b) => b.id - a.id);
        break;
      case 'oldest':
        filtered.sort((a, b) => a.id - b.id);
        break;
      case 'highest':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest':
        filtered.sort((a, b) => a.rating - b.rating);
        break;
      default:
        break;
    }
    
    return filtered;
  };

  // Получаем текст для кнопки dropdown
  const getDropdownLabel = () => {
    const filterLabels = {
      'all': 'Все отзывы',
      5: '5 звёзд',
      4: '4 звезды',
      3: '3 звезды',
      2: '2 звезды',
      1: '1 звезда'
    };
    
    const sortLabels = {
      'newest': 'Сначала новые',
      'oldest': 'Сначала старые',
      'highest': 'Высокий рейтинг',
      'lowest': 'Низкий рейтинг'
    };
    
    return `${filterLabels[reviewFilter]} • ${sortLabels[sortOrder]}`;
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
                  <span className="rating-stars"><StarIcon /></span>
                  <span className="rating-value">{appData.rating}</span>
                </div>
              </div>
            </div>
            
            {/* Кнопка скачать */}
            <button 
              className={`download-main-btn ${isDownloading ? 'downloading' : ''} ${downloadComplete ? 'complete' : ''}`}
              onClick={handleDownload}
              disabled={isDownloading || downloadComplete}
            >
              <span className="btn-bg-fill"></span>
              <span className="btn-text">
                {downloadComplete ? 'Готово' : 'Скачать'}
              </span>
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
            <StarIcon /> Отзывы ({appData.reviews.toLocaleString()})
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
                          <span className="rating-bar-label">{stars} <StarIcon /></span>
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

              {/* Выпадающий список фильтрации */}
              <div className="reviews-filter-dropdown glass-card">
                <button 
                  className="dropdown-toggle"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <span className="dropdown-icon">🔽</span>
                  <span className="dropdown-label">{getDropdownLabel()}</span>
                  <span className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}>▼</span>
                </button>
                
                {isDropdownOpen && (
                  <div className="dropdown-menu glass-card">
                    {/* Секция фильтров */}
                    <div className="dropdown-section">
                      <div className="dropdown-section-title">Фильтр по рейтингу</div>
                      <button 
                        className={`dropdown-item ${reviewFilter === 'all' ? 'active' : ''}`}
                        onClick={() => {
                          setReviewFilter('all');
                          setIsDropdownOpen(false);
                        }}
                      >
                        <span className="dropdown-item-icon">⭐</span>
                        <span className="dropdown-item-text">Все отзывы</span>
                        <span className="dropdown-item-count">({userReviews.length})</span>
                      </button>
                      {[5, 4, 3, 2, 1].map((stars) => {
                        const count = userReviews.filter(r => r.rating === stars).length;
                        return (
                          <button 
                            key={stars}
                            className={`dropdown-item ${reviewFilter === stars ? 'active' : ''}`}
                            onClick={() => {
                              setReviewFilter(stars);
                              setIsDropdownOpen(false);
                            }}
                          >
                            <span className="dropdown-item-icon">{'⭐'.repeat(stars)}</span>
                            <span className="dropdown-item-text">{stars} звёзд</span>
                            <span className="dropdown-item-count">({count})</span>
                          </button>
                        );
                      })}
                    </div>
                    
                    {/* Разделитель */}
                    <div className="dropdown-divider"></div>
                    
                    {/* Секция сортировки */}
                    <div className="dropdown-section">
                      <div className="dropdown-section-title">Сортировка</div>
                      <button 
                        className={`dropdown-item ${sortOrder === 'newest' ? 'active' : ''}`}
                        onClick={() => {
                          setSortOrder('newest');
                          setIsDropdownOpen(false);
                        }}
                      >
                        <span className="dropdown-item-icon">🕐</span>
                        <span className="dropdown-item-text">Сначала новые</span>
                      </button>
                      <button 
                        className={`dropdown-item ${sortOrder === 'oldest' ? 'active' : ''}`}
                        onClick={() => {
                          setSortOrder('oldest');
                          setIsDropdownOpen(false);
                        }}
                      >
                        <span className="dropdown-item-icon">⏰</span>
                        <span className="dropdown-item-text">Сначала старые</span>
                      </button>
                      <button 
                        className={`dropdown-item ${sortOrder === 'highest' ? 'active' : ''}`}
                        onClick={() => {
                          setSortOrder('highest');
                          setIsDropdownOpen(false);
                        }}
                      >
                        <span className="dropdown-item-icon">⬆️</span>
                        <span className="dropdown-item-text">Высокий рейтинг</span>
                      </button>
                      <button 
                        className={`dropdown-item ${sortOrder === 'lowest' ? 'active' : ''}`}
                        onClick={() => {
                          setSortOrder('lowest');
                          setIsDropdownOpen(false);
                        }}
                      >
                        <span className="dropdown-item-icon">⬇️</span>
                        <span className="dropdown-item-text">Низкий рейтинг</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Список отзывов */}
              <div className="reviews-list">
                {getFilteredAndSortedReviews().map((review) => (
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

