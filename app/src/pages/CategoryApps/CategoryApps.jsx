import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getAllApps } from '../../services/api';
import './CategoryApps.css';

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

const CategoryApps = () => {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('rating'); // rating, name, downloads
  const [downloadingApps, setDownloadingApps] = useState({});
  const [completedApps, setCompletedApps] = useState({});

  useEffect(() => {
    const loadApps = async () => {
      try {
        const result = await getAllApps();
        
        if (result.success) {
          // Фильтруем приложения по категории
          const categoryApps = result.data.filter(app => app.category === categoryName);
          setApps(categoryApps);
        }
      } catch (error) {
        console.error('Error loading apps:', error);
      } finally {
        setLoading(false);
      }
    };

    loadApps();
  }, [categoryName]);

  // Сортировка приложений
  const getSortedApps = () => {
    const sorted = [...apps];
    
    switch (sortBy) {
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'downloads':
        return sorted.sort((a, b) => {
          const aDownloads = parseFloat(a.downloads.replace(/[^\d.]/g, ''));
          const bDownloads = parseFloat(b.downloads.replace(/[^\d.]/g, ''));
          return bDownloads - aDownloads;
        });
      default:
        return sorted;
    }
  };

  const handleDownload = (e, appId) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (downloadingApps[appId] || completedApps[appId]) return;
    
    setDownloadingApps(prev => ({ ...prev, [appId]: true }));
    
    setTimeout(() => {
      setDownloadingApps(prev => ({ ...prev, [appId]: false }));
    alert("Ошибка, вы не авторизованы")
      // setCompletedApps(prev => ({ ...prev, [appId]: true }));
    }, 2000);
  };

  if (loading) {
    return (
      <div className="category-apps-page">
        <div className="category-apps-content">
          <div className="loading-state glass-card">
            <p>Загрузка...</p>
          </div>
        </div>
      </div>
    );
  }

  const sortedApps = getSortedApps();

  return (
    <div className="category-apps-page">
      <div className="category-apps-content">
        {/* Header */}
        <div className="category-header-section">
          <div className="category-title-section glass-card">
            <h1 className="category-page-title">{categoryName}</h1>
            <p className="category-page-count">{apps.length} приложений</p>
          </div>
        </div>

        {/* Сортировка */}
        <div className="sort-section glass-card">
          <span className="sort-label">Сортировать:</span>
          <div className="sort-buttons">
            <button 
              className={`sort-btn ${sortBy === 'rating' ? 'active' : ''}`}
              onClick={() => setSortBy('rating')}
            >
              По рейтингу
            </button>
            <button 
              className={`sort-btn ${sortBy === 'name' ? 'active' : ''}`}
              onClick={() => setSortBy('name')}
            >
              По названию
            </button>
            <button 
              className={`sort-btn ${sortBy === 'downloads' ? 'active' : ''}`}
              onClick={() => setSortBy('downloads')}
            >
              По популярности
            </button>
          </div>
        </div>

        {/* Список приложений */}
        {sortedApps.length > 0 ? (
          <div className="apps-grid">
            {sortedApps.map((app) => (
              <Link
                key={app.id}
                to={`/app/${app.id}`}
                className="app-card glass-card"
              >
                <img src={app.icon} alt={app.name} className="app-card-icon" />
                <div className="app-card-info">
                  <h3 className="app-card-name">{app.name}</h3>
                  <p className="app-card-developer">{app.developer}</p>
                  <div className="app-card-stats">
                    <span className="app-card-rating">
                      <StarIcon /> {app.rating}
                    </span>
                    <span className="app-card-downloads">📥 {app.downloads}</span>
                  </div>
                  <button 
                    className={`app-card-download ${downloadingApps[app.id] ? 'downloading' : ''} ${completedApps[app.id] ? 'complete' : ''}`}
                    onClick={(e) => handleDownload(e, app.id)}
                    disabled={downloadingApps[app.id] || completedApps[app.id]}
                  >
                    <span className="btn-bg-fill"></span>
                    <span className="btn-text">
                      {completedApps[app.id] ? 'Готово' : 'Установить'}
                    </span>
                  </button>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="no-apps-message glass-card">
            <p>В этой категории пока нет приложений</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryApps;

