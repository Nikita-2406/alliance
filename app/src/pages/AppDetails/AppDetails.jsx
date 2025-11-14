import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './AppDetails.css';

const AppDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('about');
  
  const [reviews, setReviews] = useState([]);
  const [isReviewFormOpen, setReviewFormOpen] = useState(false);
  const [newReview, setNewReview] = useState({ 
    author: '', 
    text: '', 
    rating: 0,
    vk_user_id: null 
  });
  const [loading, setLoading] = useState(false);
  const [appData, setAppData] = useState(null);
  const [hoverRating, setHoverRating] = useState(0);
  const [vkUser, setVkUser] = useState(null);

  // Функция для инициализации VK SDK
  const initVK = () => {
    if (window.VK) {
      window.VK.init({
        apiId: process.env.REACT_APP_VK_APP_ID
      });
      console.log('VK SDK инициализирован');
    } else {
      console.log('VK SDK не загружен');
    }
  };

  // Проверка авторизации VK
  const checkVKAuth = () => {
    const savedVkUser = localStorage.getItem('vk_user');
    if (savedVkUser) {
      setVkUser(JSON.parse(savedVkUser));
      setNewReview(prev => ({
        ...prev,
        author: JSON.parse(savedVkUser).first_name,
        vk_user_id: JSON.parse(savedVkUser).id
      }));
    }
  };

  // Авторизация через VK
  const handleVKLogin = () => {
    if (!window.VK) {
      alert('VK SDK не загружен. Пожалуйста, обновите страницу.');
      return;
    }

    window.VK.Auth.login((response) => {
      if (response.session) {
        // Получаем информацию о пользователе
        window.VK.Api.call('users.get', { fields: 'photo_100' }, (r) => {
          if (r.response) {
            const user = r.response[0];
            const vkUserData = {
              id: user.id,
              first_name: user.first_name,
              last_name: user.last_name,
              photo_100: user.photo_100
            };
            
            setVkUser(vkUserData);
            localStorage.setItem('vk_user', JSON.stringify(vkUserData));
            setNewReview(prev => ({
              ...prev,
              author: `${user.first_name} ${user.last_name}`,
              vk_user_id: user.id
            }));
            
            alert(`Успешная авторизация через VK! Добро пожаловать, ${user.first_name}!`);
          }
        });
      } else {
        alert('Авторизация через VK не удалась');
      }
    }, 4); // 4 - права доступа к базовой информации
  };

  const handleVKLogout = () => {
    if (window.VK) {
      window.VK.Auth.logout();
    }
    setVkUser(null);
    localStorage.removeItem('vk_user');
    setNewReview(prev => ({
      ...prev,
      author: '',
      vk_user_id: null
    }));
    alert('Вы вышли из VK');
  };

  // Загрузка данных приложения и отзывов
  useEffect(() => {
    fetchAppData();
    fetchReviews();
    initVK();
    checkVKAuth();
  }, [id]);

  // Функция для загрузки данных приложения
  const fetchAppData = async () => {
    const mockAppData = {
      id: parseInt(id),
      name: `Приложение ${id}`,
      developer: `Разработчик ${id}`,
      category: 'Игра',
      rating: 4.5,
      downloads: '1M+',
      size: '156 MB',
      version: '1.2.3',
      description: 'Это увлекательное приложение с потрясающей графикой и интересным геймплеем.',
      features: [
        'Высококачественная графика',
        'Множество уровней',
        'Регулярные обновления',
        'Поддержка многопользовательской игры'
      ],
      requirements: {
        os: 'Android 8.0+',
        storage: '200 MB',
        ram: '2 GB'
      },
      changelog: [
        { version: '1.2.3', date: '15.12.2023', changes: ['Исправлены ошибки', 'Добавлены новые уровни'] },
        { version: '1.2.2', date: '01.12.2023', changes: ['Оптимизация производительности'] }
      ]
    };
    
    // Загружаем актуальный рейтинг
    try {
      const response = await fetch(`http://localhost:5000/api/apps/${id}/rating`);
      if (response.ok) {
        const ratingData = await response.json();
        mockAppData.rating = ratingData.average_rating || 4.5;
        mockAppData.totalReviews = ratingData.total_reviews || 0;
      }
    } catch (error) {
      console.error('Ошибка загрузки рейтинга:', error);
    }
    
    setAppData(mockAppData);
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
    if (newReview.author && newReview.text && newReview.rating > 0) {
      try {
        const response = await fetch(`http://localhost:5000/api/apps/${id}/reviews`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            author: newReview.author,
            text: newReview.text,
            rating: newReview.rating,
            vk_user_id: newReview.vk_user_id
          })
        });

        const data = await response.json();
        
        if (response.ok) {
          setReviews([data, ...reviews]);
          setNewReview({ 
            author: vkUser ? `${vkUser.first_name} ${vkUser.last_name}` : '', 
            text: '', 
            rating: 0, 
            vk_user_id: vkUser?.id || null 
          });
          setReviewFormOpen(false);
          // Обновляем данные приложения для актуального рейтинга
          fetchAppData();
        } else {
          console.error('Ошибка добавления отзыва:', data.error);
          alert('Ошибка при добавлении отзыва: ' + data.error);
        }
      } catch (error) {
        console.error('Ошибка сети:', error);
        alert('Ошибка сети при добавлении отзыва');
      }
    } else {
      alert('Пожалуйста, заполните все поля и поставьте оценку');
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

  // Компонент выбора рейтинга (встроенный)
  const StarRating = ({ rating, onRatingChange, hoverRating, onHoverChange, readonly = false }) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`star-btn ${star <= (hoverRating || rating) ? 'active' : ''} ${readonly ? 'readonly' : ''}`}
            onClick={() => !readonly && onRatingChange(star)}
            onMouseEnter={() => !readonly && onHoverChange(star)}
            onMouseLeave={() => !readonly && onHoverChange(0)}
            disabled={readonly}
          >
            ★
          </button>
        ))}
        {!readonly && (
          <span className="rating-text">
            {rating > 0 ? `Ваша оценка: ${rating}` : 'Выберите оценку'}
          </span>
        )}
      </div>
    );
  };

  // Функция для отображения звезд рейтинга (только чтение)
  const renderStars = (rating, size = 'normal') => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    const starClass = size === 'large' ? 'stars-large' : 'stars-normal';
    
    return (
      <span className={starClass}>
        {'★'.repeat(fullStars)}
        {halfStar && '★'}
        {'☆'.repeat(emptyStars)}
      </span>
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
            <button className="back-btn" onClick={() => navigate(-1)}>
              ← Назад
            </button>
            
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
                <span className="stat-value-large">{appData.rating.toFixed(1)}</span>
                <div className="stat-stars">
                  {renderStars(appData.rating)}
                </div>
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

            <button className="download-main-btn">
              📥 Скачать бесплатно
            </button>
          </div>
        </section>

        {/* Tabs Navigation */}
        <div className="details-tabs">
          <button 
            className={`details-tab ${selectedTab === 'about' ? 'active' : ''}`}
            onClick={() => setSelectedTab('about')}
          >
            О приложении
          </button>
          <button 
            className={`details-tab ${selectedTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setSelectedTab('reviews')}
          >
            Отзывы ({reviews.length})
          </button>
          <button 
            className={`details-tab ${selectedTab === 'changelog' ? 'active' : ''}`}
            onClick={() => setSelectedTab('changelog')}
          >
            История версий
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
                <h3>Особенности</h3>
                <ul className="features-list">
                  {appData.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>

              <div className="about-card glass-card">
                <h3>Системные требования</h3>
                <div className="requirements-grid">
                  <div className="requirement-item">
                    <span className="req-icon">📱</span>
                    <div>
                      <span className="req-label">ОС</span>
                      <span className="req-value">{appData.requirements.os}</span>
                    </div>
                  </div>
                  <div className="requirement-item">
                    <span className="req-icon">💾</span>
                    <div>
                      <span className="req-label">Память</span>
                      <span className="req-value">{appData.requirements.storage}</span>
                    </div>
                  </div>
                  <div className="requirement-item">
                    <span className="req-icon">⚡</span>
                    <div>
                      <span className="req-label">Оперативная память</span>
                      <span className="req-value">{appData.requirements.ram}</span>
                    </div>
                  </div>
                </div>
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
                  <span className="rating-large">{appData.rating.toFixed(1)}</span>
                  <div className="rating-details">
                    <div className="stars-large">{renderStars(appData.rating, 'large')}</div>
                    <span className="reviews-count">{appData.totalReviews || reviews.length} отзывов</span>
                  </div>
                </div>
              </div>

              {/* Кнопка добавления отзыва */}
              <div className="reviews-header">
                {vkUser ? (
                  <div className="vk-user-info">
                    <img src={vkUser.photo_100} alt="VK Avatar" className="vk-avatar" />
                    <span>Вы вошли как {vkUser.first_name}</span>
                    <button className="vk-logout-btn" onClick={handleVKLogout}>
                      Выйти
                    </button>
                  </div>
                ) : (
                  <button className="vk-login-btn" onClick={handleVKLogin}>
                    <img src="https://vk.com/images/icons/favicons/fav_logo.ico" alt="VK" />
                    Войти через VK
                  </button>
                )}
                
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
                    
                    {!vkUser && (
                      <input
                        type="text"
                        placeholder="Ваше имя"
                        value={newReview.author}
                        onChange={(e) => setNewReview({...newReview, author: e.target.value})}
                        className="review-input"
                      />
                    )}
                    
                    <div className="rating-section">
                      <label>Ваша оценка:</label>
                      <StarRating
                        rating={newReview.rating}
                        onRatingChange={(rating) => setNewReview({...newReview, rating})}
                        hoverRating={hoverRating}
                        onHoverChange={setHoverRating}
                      />
                    </div>
                    
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
                        disabled={!newReview.author || !newReview.text || !newReview.rating}
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
                          {review.vk_user_id ? (
                            <img 
                              src="https://via.placeholder.com/40" 
                              alt="VK" 
                              className="author-avatar vk-avatar"
                            />
                          ) : (
                            <span className="author-avatar">👤</span>
                          )}
                          <div>
                            <div className="author-info">
                              <span className="author-name">{review.author}</span>
                              {review.vk_user_id && (
                                <span className="vk-badge">VK</span>
                              )}
                            </div>
                            <span className="review-date">{review.date}</span>
                          </div>
                        </div>
                        <div className="review-rating">
                          {renderStars(review.rating)}
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

          {selectedTab === 'changelog' && (
            <div className="changelog-section">
              {appData.changelog.map((version, index) => (
                <div key={index} className="changelog-card glass-card">
                  <div className="version-header">
                    <h3>Версия {version.version}</h3>
                    <span className="version-date">{version.date}</span>
                  </div>
                  <ul className="changes-list">
                    {version.changes.map((change, changeIndex) => (
                      <li key={changeIndex}>• {change}</li>
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