import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('downloads');

  const userInfo = {
    name: 'Пользователь',
    email: 'user@example.com',
    avatar: '👤',
    memberSince: 'Октябрь 2024'
  };

  const downloadedApps = [
    { id: 1, name: 'PhotoMaster Pro', icon: '📸', size: '85 MB', downloadDate: '2 дня назад', version: '3.2.1' },
    { id: 2, name: 'Fitness Tracker', icon: '💪', size: '65 MB', downloadDate: '5 дней назад', version: '2.5.0' },
    { id: 3, name: 'Cloud Notes', icon: '📝', size: '40 MB', downloadDate: '1 неделя назад', version: '4.1.2' },
    { id: 4, name: 'Music Streaming', icon: '🎵', size: '45 MB', downloadDate: '2 недели назад', version: '5.0.1' },
  ];

  const reviews = [
    {
      id: 1,
      appName: 'PhotoMaster Pro',
      appIcon: '📸',
      rating: 5,
      comment: 'Отличное приложение! Очень удобный интерфейс и множество функций для редактирования фотографий.',
      date: '3 дня назад'
    },
    {
      id: 2,
      appName: 'Fitness Tracker',
      appIcon: '💪',
      rating: 4,
      comment: 'Хорошее приложение для отслеживания тренировок. Можно было бы добавить больше упражнений.',
      date: '1 неделя назад'
    },
    {
      id: 3,
      appName: 'Cloud Notes',
      appIcon: '📝',
      rating: 5,
      comment: 'Лучшее приложение для заметок! Синхронизация работает отлично.',
      date: '2 недели назад'
    },
  ];

  const favorites = [
    { id: 1, name: 'PhotoMaster Pro', icon: '📸', category: 'Фото и видео', rating: 4.8 },
    { id: 5, name: 'Language Learning', icon: '🌍', category: 'Образование', rating: 4.8 },
    { id: 9, name: 'Video Editor Pro', icon: '🎬', category: 'Фото и видео', rating: 4.7 },
  ];

  const renderStars = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <div className="profile-page">
      <div className="profile-content">
        {/* Profile Header */}
        <section className="profile-header glass-card">
          <div className="profile-avatar">{userInfo.avatar}</div>
          <div className="profile-info">
            <h1 className="profile-name">{userInfo.name}</h1>
            <p className="profile-email">{userInfo.email}</p>
            <p className="profile-member">Участник с {userInfo.memberSince}</p>
          </div>
          <button className="edit-profile-btn">✏️ Редактировать</button>
        </section>

        {/* Stats */}
        <section className="profile-stats">
          <div className="stat-card glass-card">
            <span className="stat-icon">📥</span>
            <span className="stat-value">{downloadedApps.length}</span>
            <span className="stat-label">Скачано</span>
          </div>
          <div className="stat-card glass-card">
            <span className="stat-icon">⭐</span>
            <span className="stat-value">{reviews.length}</span>
            <span className="stat-label">Отзывов</span>
          </div>
          <div className="stat-card glass-card">
            <span className="stat-icon">❤️</span>
            <span className="stat-value">{favorites.length}</span>
            <span className="stat-label">Избранное</span>
          </div>
        </section>

        {/* Tabs */}
        <div className="profile-tabs">
          <button
            className={`tab-btn ${activeTab === 'downloads' ? 'active' : ''}`}
            onClick={() => setActiveTab('downloads')}
          >
            📥 Скачанные
          </button>
          <button
            className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            ⭐ Отзывы
          </button>
          <button
            className={`tab-btn ${activeTab === 'favorites' ? 'active' : ''}`}
            onClick={() => setActiveTab('favorites')}
          >
            ❤️ Избранное
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'downloads' && (
            <div className="downloads-list">
              {downloadedApps.map((app) => (
                <Link to={`/app/${app.id}`} key={app.id} className="download-item glass-card">
                  <div className="download-icon">{app.icon}</div>
                  <div className="download-info">
                    <h3>{app.name}</h3>
                    <p className="download-meta">
                      Версия {app.version} • {app.size}
                    </p>
                    <p className="download-date">Скачано {app.downloadDate}</p>
                  </div>
                  <button className="action-btn">Обновить</button>
                </Link>
              ))}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="reviews-list">
              {reviews.map((review) => (
                <div key={review.id} className="review-item glass-card">
                  <div className="review-header">
                    <div className="review-app">
                      <span className="review-app-icon">{review.appIcon}</span>
                      <span className="review-app-name">{review.appName}</span>
                    </div>
                    <span className="review-date">{review.date}</span>
                  </div>
                  <div className="review-rating">{renderStars(review.rating)}</div>
                  <p className="review-comment">{review.comment}</p>
                  <div className="review-actions">
                    <button className="review-action-btn">✏️ Редактировать</button>
                    <button className="review-action-btn">🗑️ Удалить</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className="favorites-list">
              {favorites.map((app) => (
                <Link to={`/app/${app.id}`} key={app.id} className="favorite-item glass-card">
                  <div className="favorite-icon">{app.icon}</div>
                  <div className="favorite-info">
                    <h3>{app.name}</h3>
                    <p className="favorite-category">{app.category}</p>
                    <p className="favorite-rating">⭐ {app.rating}</p>
                  </div>
                  <button className="action-btn">Скачать</button>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

