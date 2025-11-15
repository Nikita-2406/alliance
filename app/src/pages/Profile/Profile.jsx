import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserDownloads, getUserFavorites, getUserReviews } from '../../services/api';
import './Profile.css';

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

const Profile = () => {
  const [activeTab, setActiveTab] = useState('downloads');
  const [downloadedApps, setDownloadedApps] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingApps, setDownloadingApps] = useState({});
  const [completedApps, setCompletedApps] = useState({});

  const userInfo = {
    name: 'Пользователь',
    email: 'user@example.com',
    avatar: '👤',
    memberSince: 'Октябрь 2024'
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [downloads, favs, revs] = await Promise.all([
          getUserDownloads(),
          getUserFavorites(),
          getUserReviews()
        ]);

        if (downloads.success) setDownloadedApps(downloads.data);
        if (favs.success) setFavorites(favs.data);
        if (revs.success) setReviews(revs.data);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const renderStars = (rating) => {
    return (
      <span className="stars-display">
        {Array.from({ length: 5 }, (_, i) => (
          <StarIcon key={i} filled={i < rating} />
        ))}
      </span>
    );
  };

  const handleDownload = (e, appId) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (downloadingApps[appId] || completedApps[appId]) return;
    
    setDownloadingApps(prev => ({ ...prev, [appId]: true }));
    
    setTimeout(() => {
      setDownloadingApps(prev => ({ ...prev, [appId]: false }));
      setCompletedApps(prev => ({ ...prev, [appId]: true }));
    }, 2000);
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
            <span className="stat-icon"><StarIcon /></span>
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
            <StarIcon /> Отзывы
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
                    <p className="favorite-rating"><StarIcon /> {app.rating}</p>
                  </div>
                  <button 
                    className={`action-btn ${downloadingApps[app.id] ? 'downloading' : ''} ${completedApps[app.id] ? 'complete' : ''}`}
                    onClick={(e) => handleDownload(e, app.id)}
                    disabled={downloadingApps[app.id] || completedApps[app.id]}
                  >
                    <span className="btn-bg-fill"></span>
                    <span className="btn-text">
                      {completedApps[app.id] ? 'Готово' : 'Скачать'}
                    </span>
                  </button>
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

