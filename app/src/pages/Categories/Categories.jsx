import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCategories, getAllApps } from '../../services/api';
import './Categories.css';

const Categories = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [allApps, setAllApps] = useState([]);
  const [loading, setLoading] = useState(true);

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
              apps: categoryApps
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

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
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

  return (
    <div className="categories-page">
      <div className="categories-content">
        <div className="categories-hero">
          <h1 className="categories-hero-title">Категории приложений</h1>
          <p className="categories-hero-subtitle">Найдите приложение для любой задачи</p>
        </div>

        <div className="categories-list">
          {categories.map((category) => (
            <div key={category.id} className="category-wrapper">
              <div className="category-main glass-card">
                <div className="category-icon-wrapper">
                  <span className="category-icon-big" style={{ color: category.color }}>{category.icon}</span>
                </div>
                <div className="category-details">
                  <h2 className="category-name-large">{category.name}</h2>
                  <p className="category-apps-count">{category.count} приложений</p>
                </div>
                <button 
                  className={`category-toggle-btn ${selectedCategory === category.id ? 'active' : ''}`}
                  onClick={() => handleCategoryClick(category.id)}
                >
                  {selectedCategory === category.id ? 'Скрыть' : 'Показать'}
                </button>
              </div>

              {selectedCategory === category.id && (
                <div className="category-apps-list">
                  <div className="apps-grid-category">
                    {category.apps.map((app) => (
                      <Link
                        to={`/app/${app.id}`}
                        key={app.id}
                        className="app-card-category glass-card"
                      >
                        <div className="app-card-icon">{app.icon}</div>
                        <div className="app-card-content">
                          <h4 className="app-card-name">{app.name}</h4>
                          <div className="app-card-stats">
                            <span className="app-stat">⭐ {app.rating}</span>
                            <span className="app-stat-separator">•</span>
                            <span className="app-stat">{app.size}</span>
                          </div>
                        </div>
                        <div className="app-card-download">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                          </svg>
                        </div>
                      </Link>
                    ))}
                  </div>
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

