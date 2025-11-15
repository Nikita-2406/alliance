import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCategories, getAllApps } from '../../services/api';
import './Categories.css';

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

const Categories = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [allApps, setAllApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingApps, setDownloadingApps] = useState({});
  const [completedApps, setCompletedApps] = useState({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const [cats, apps] = await Promise.all([
          getCategories(),
          getAllApps()
        ]);

        if (cats.success && apps.success) {
          const categoriesWithApps = cats.data.map(cat => {
            const categoryApps = apps.data.filter(app => app.category === cat.name);
            return {
              ...cat,
              apps: categoryApps,
              color: `linear-gradient(135deg, ${cat.color} 0%, #0E103D 100%)`
            };
          });
          setCategories(categoriesWithApps);
          setAllApps(apps.data);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

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

  if (loading) {
    return (
      <div className="categories-page">
        <div className="categories-content">
          <div className="loading-state glass-card">
            <p>Загрузка...</p>
          </div>
        </div>
      </div>
    );
  }

  const oldCategories = [
  ];

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  return (
    <div className="categories-page">
      <div className="categories-content">
        <section className="categories-intro glass-card">
          <h1>Категории приложений</h1>
          <p>Исследуйте тысячи приложений в разных категориях</p>
        </section>

        <div className="categories-grid">
          {categories.map((category) => (
            <div key={category.id} className="category-section">
              <div
                className="category-card glass-card"
                onClick={() => handleCategoryClick(category.id)}
              >
                <div className="category-header" style={{ background: category.color }}>
                  <span className="category-icon-large">{category.icon}</span>
                </div>
                <div className="category-body">
                  <h2 className="category-title">{category.name}</h2>
                  <p className="category-count">{category.count} приложений</p>
                  <button className="explore-btn">
                    {selectedCategory === category.id ? '△ Свернуть' : '▽ Показать'}
                  </button>
                </div>
              </div>

              {selectedCategory === category.id && (
                <div className="category-apps">
                  {category.apps.map((app) => (
                    <Link
                      to={`/app/${app.id}`}
                      key={app.id}
                      className="category-app-item glass-card"
                    >
                      <div className="category-app-icon">{app.icon}</div>
                      <div className="category-app-info">
                        <h4>{app.name}</h4>
                        <div className="category-app-meta">
                          <span><StarIcon /> {app.rating}</span>
                          <span>📥 {app.downloads}</span>
                        </div>
                      </div>
                      <button 
                        className={`mini-download-btn ${downloadingApps[app.id] ? 'downloading' : ''} ${completedApps[app.id] ? 'complete' : ''}`}
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
                  <Link to="/search" className="view-all-btn glass-card">
                    Показать все приложения →
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Categories;

