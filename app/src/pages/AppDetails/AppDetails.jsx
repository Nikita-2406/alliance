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

  // Загрузка отзывов с сервера
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/apps/${id}/reviews`);
      const data = await response.json();
      
      if (response.ok) {
        setReviews(data);
      } else {
        console.error('Ошибка загрузки отзывов:', data.error);
      }
    } catch (error) {
      console.error('Ошибка сети:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReview = async () => {
    if (newReview.author && newReview.text) {
      try {
        const response = await fetch(`http://localhost:5000/api/apps/${id}/reviews`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            author: newReview.author,
            text: newReview.text
          })
        });

        const data = await response.json();
        
        if (response.ok) {
          setReviews([data, ...reviews]);
          setNewReview({ author: '', text: '' });
          setReviewFormOpen(false);
        } else {
          console.error('Ошибка добавления отзыва:', data.error);
          alert('Ошибка при добавлении отзыва');
        }
      } catch (error) {
        console.error('Ошибка сети:', error);
        alert('Ошибка сети при добавлении отзыва');
      }
    }
  };

  const handleLike = async (reviewId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/reviews/${reviewId}/like`, {
        method: 'POST'
      });

      const data = await response.json();
      
      if (response.ok) {
        setReviews(reviews.map(review => 
          review.id === reviewId ? { ...review, likes: data.likes } : review
        ));
      } else {
        console.error('Ошибка лайка:', data.error);
      }
    } catch (error) {
      console.error('Ошибка сети при лайке:', error);
    }
  };

  // Функция для отображения звезд рейтинга
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    return (
      <>
        {'★'.repeat(fullStars)}
        {halfStar && '★'}
        {'☆'.repeat(emptyStars)}
      </>
    );
  };

  if (!appData) {
    return <div className="app-details-page">Загрузка...</div>;
  }

  return (
    <div className="app-details-page">
      <div className="app-details-content">
        {/* Hero Section */}
        <section className="app-hero">
          <div className="app-hero-bg" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}></div>
          <div className="app-hero-content glass-card">
            <div className="app-main-info">
              <div className="app-icon-large">
                {appData.name.charAt(0)}
              </div>
              <div className="app-title-section">
                <h1 className="app-title">{appData.name}</h1>
                <div className="app-developer">{appData.developer}</div>
                <span className="app-category-badge">{appData.category}</span>
              </div>
            </div>

            <div className="app-quick-stats">
              <div className="quick-stat glass-card">
                <span className="stat-value-large">{appData.rating}</span>
                <span className="stat-label-small">Рейтинг</span>
              </div>
              <div className="quick-stat glass-card">
                <span className="stat-value-large">{appData.downloads}</span>
                <span className="stat-label-small">Загрузки</span>
              </div>
              <div className="quick-stat glass-card">
                <span className="stat-value-large">{appData.size}</span>
                <span className="stat-label-small">Размер</span>
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
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="screenshot-card glass-card">
                <div className="screenshot-icon">🖼️</div>
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
            📝 О приложении
          </button>
          <button 
            className={`details-tab ${selectedTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setSelectedTab('reviews')}
          >
            💬 Отзывы ({reviews.length})
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
                    <span className="info-label">Версия</span>
                    <span className="info-value">{appData.version}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Разработчик</span>
                    <span className="info-value">{appData.developer}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Категория</span>
                    <span className="info-value">{appData.category}</span>
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
                    <span className="reviews-count">{reviews.length} отзывов</span>
                  </div>
                </div>
              </div>

              {/* Кнопка добавления отзыва */}
              <div className="reviews-header">
                <button 
                  className="write-review-btn glass-card"
                  onClick={() => setReviewFormOpen(true)}
                >
                  ✏️ Написать отзыв
                </button>
              </div>

              {/* Модальное окно для нового отзыва */}
              {isReviewFormOpen && (
                <div className="modal-overlay">
                  <div className="modal-content">
                    <h3>Добавить отзыв</h3>
                    <input
                      type="text"
                      placeholder="Ваше имя"
                      value={newReview.author}
                      onChange={(e) => setNewReview({...newReview, author: e.target.value})}
                      className="review-input"
                    />
                    <textarea
                      placeholder="Текст отзыва"
                      value={newReview.text}
                      onChange={(e) => setNewReview({...newReview, text: e.target.value})}
                      className="review-textarea"
                    />
                    <div className="modal-actions">
                      <button 
                        className="cancel-btn"
                        onClick={() => setReviewFormOpen(false)}
                      >
                        Отмена
                      </button>
                      <button 
                        className="submit-btn"
                        onClick={handleAddReview}
                        disabled={!newReview.author || !newReview.text}
                      >
                        Опубликовать
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Список отзывов */}
              <div className="reviews-list">
                {loading ? (
                  <div className="loading-message">Загрузка отзывов...</div>
                ) : reviews.length === 0 ? (
                  <div className="no-reviews-message glass-card">
                    Пока нет отзывов. Будьте первым!
                  </div>
                ) : (
                  reviews.map(review => (
                    <div key={review.id} className="review-card glass-card">
                      <div className="review-header">
                        <div className="review-author">
                          <span className="author-avatar">👤</span>
                          <div>
                            <span className="author-name">{review.author}</span>
                            <span className="review-date">{review.date}</span>
                          </div>
                        </div>
                      </div>
                      <p className="review-text">{review.text}</p>
                      <div className="review-actions">
                        <button 
                          className="like-btn"
                          onClick={() => handleLike(review.id)}
                        >
                          👍 Полезно ({review.likes || 0})
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AppDetails;