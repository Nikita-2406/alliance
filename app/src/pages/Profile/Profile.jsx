import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserDownloads, getUserFavorites, getUserReviews } from '../../services/api';
import './Profile.css';

// SVG иконки
const StarIcon = ({ size = 20, filled = false, className = "" }) => (
  <svg 
    className={`icon-svg ${className}`}
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
);

const UserIcon = ({ size = 80 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const EditIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const DownloadIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

const HeartIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
  </svg>
);

const TrashIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

const Profile = () => {
  const [activeTab, setActiveTab] = useState('downloads');
  const [downloadedApps, setDownloadedApps] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [downloadingApps, setDownloadingApps] = useState({});
  const [completedApps, setCompletedApps] = useState({});

  const userInfo = {
    name: 'Пользователь',
    email: 'user@example.com',
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
      }
    };

    loadData();
  }, []);

  const renderStars = (rating) => {
    return (
      <span className="stars-display">
        {Array.from({ length: 5 }, (_, i) => (
          <StarIcon key={i} size={18} filled={i < rating} />
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
        {/* Desktop Layout */}
        <div className="profile-top-section">
          {/* Left: User Info */}
          <section className="profile-user-card glass-card">
            <div className="user-avatar">
              <UserIcon size={80} />
            </div>
            <div className="user-details">
              <h1 className="user-name">{userInfo.name}</h1>
              <p className="user-email">{userInfo.email}</p>
              <p className="user-member">Участник с {userInfo.memberSince}</p>
            </div>
            <button className="edit-btn glass-card">
              <EditIcon size={20} />
              <span>Редактировать</span>
            </button>
          </section>

          {/* Right: Stats Cards */}
          <section className="profile-stats-section">
            <div 
              className={`stat-card glass-card ${activeTab === 'downloads' ? 'active' : ''}`}
              onClick={() => setActiveTab('downloads')}
            >
              <div className="stat-icon-wrapper">
                <span className="stat-icon"><DownloadIcon size={28} /></span>
              </div>
              <div className="stat-content">
                <span className="stat-value">{downloadedApps.length}</span>
                <span className="stat-label">Скачано</span>
              </div>
            </div>
            <div 
              className={`stat-card glass-card ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              <div className="stat-icon-wrapper">
                <span className="stat-icon"><StarIcon size={28} /></span>
              </div>
              <div className="stat-content">
                <span className="stat-value">{reviews.length}</span>
                <span className="stat-label">Отзывов</span>
              </div>
            </div>
            <div 
              className={`stat-card glass-card ${activeTab === 'favorites' ? 'active' : ''}`}
              onClick={() => setActiveTab('favorites')}
            >
              <div className="stat-icon-wrapper">
                <span className="stat-icon"><HeartIcon size={28} /></span>
              </div>
              <div className="stat-content">
                <span className="stat-value">{favorites.length}</span>
                <span className="stat-label">Избранное</span>
              </div>
            </div>
          </section>
        </div>

        {/* Desktop Tabs */}
        <div className="profile-tabs-section">
          <div className="desktop-tabs">
            <button
              className={`tab-btn glass-card ${activeTab === 'downloads' ? 'active' : ''}`}
              onClick={() => setActiveTab('downloads')}
            >
              <span className="tab-icon"><DownloadIcon size={20} /></span>
              <span>Скачанные</span>
            </button>
            <button
              className={`tab-btn glass-card ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              <span className="tab-icon"><StarIcon size={20} className={activeTab === 'reviews' ? '' : 'tab-star-icon'} /></span>
              <span>Отзывы</span>
            </button>
            <button
              className={`tab-btn glass-card ${activeTab === 'favorites' ? 'active' : ''}`}
              onClick={() => setActiveTab('favorites')}
            >
              <span className="tab-icon"><HeartIcon size={20} /></span>
              <span>Избранное</span>
            </button>
          </div>
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
                <Link to={`/app/${review.appId}`} key={review.id} className="review-item glass-card">
                  <div className="review-icon">{review.appIcon}</div>
                  <div className="review-info">
                    <h3>{review.appName}</h3>
                    <div className="review-rating-wrapper">
                      {renderStars(review.rating)}
                    </div>
                    <p className="review-comment">{review.comment}</p>
                  </div>
                  <button 
                    className="action-btn delete-btn" 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    title="Удалить отзыв"
                  >
                    <TrashIcon size={18} />
                  </button>
                </Link>
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

