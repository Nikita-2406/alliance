import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './AppDetails.css';

const AppDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('about');
  
  const [reviews, setReviews] = useState([]);
  const [isReviewFormOpen, setReviewFormOpen] = useState(false);
  const [newReview, setNewReview] = useState({ author: '', text: '' });
  const [loading, setLoading] = useState(false);

  // Загрузка отзывов с сервера
  useEffect(() => {
    fetchReviews();
  }, [id]);

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

  // Остальной код компонента остается таким же...
  const appData = {
    // ... существующие данные
  };

  // Остальная разметка остается без изменений...
  return (
    <div className="app-details-page">
      <div className="app-details-content">
        {/* Hero Section */}
        <section className="app-hero">
          {/* ... существующая разметка hero section ... */}
        </section>

        {/* Screenshots */}
        <section className="screenshots-section">
          {/* ... существующая разметка screenshots ... */}
        </section>

        {/* Tabs */}
        <div className="details-tabs">
          {/* ... существующие табы ... */}
        </div>

        {/* Tab Content */}
        <div className="details-tab-content">
          {selectedTab === 'about' && (
            <div className="about-section">
              {/* ... существующая разметка about section ... */}
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
                <div className="modal-overlay" onClick={() => setReviewFormOpen(false)}>
                  <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
                      rows="4"
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
                          👍 Полезно ({review.likes})
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {selectedTab === 'changelog' && (
            <div className="changelog-section">
              {/* ... существующая разметка changelog ... */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppDetails;