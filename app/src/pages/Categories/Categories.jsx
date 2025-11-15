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
  const [categories, setCategories] = useState([]);
  const [topApps, setTopApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [cats, apps] = await Promise.all([
          getCategories(),
          getAllApps()
        ]);

        if (cats.success && apps.success) {
          const categoriesWithCount = cats.data.map(cat => {
            const categoryApps = apps.data.filter(app => app.category === cat.name);
            return {
              ...cat,
              count: categoryApps.length,
              color: cat.color || '#2196F3'
            };
          });
          setCategories(categoriesWithCount);
          
          // Получаем топ приложений (сортируем по рейтингу)
          const sortedApps = [...apps.data].sort((a, b) => b.rating - a.rating);
          setTopApps(sortedApps.slice(0, 8)); // Топ 8 приложений
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

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
        {/* Заголовок страницы */}
        <section className="categories-hero">
          <div className="hero-background"></div>
          <div className="hero-content">
            <h1 className="hero-title">Категории приложений</h1>
            <p className="hero-subtitle">Исследуйте тысячи приложений, организованных по категориям</p>
          </div>
        </section>

        {/* Список категорий */}
        <section className="categories-list-section">
          <h2 className="section-heading">Все категории</h2>
          <div className="categories-grid">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/category/${category.name}`}
                className="category-card-new glass-card"
              >
                <div className="category-card-gradient" style={{ 
                  background: `linear-gradient(135deg, ${category.color}15 0%, ${category.color}05 100%)` 
                }}></div>
                <div className="category-card-content">
                  <span className="category-icon-new">{category.icon}</span>
                  <h3 className="category-name">{category.name}</h3>
                  <p className="category-apps-count">{category.count} приложений</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Топ приложений */}
        <section className="top-apps-section">
          <div className="section-header">
            <h2 className="section-heading">Топ приложений</h2>
            <Link to="/search" className="see-all-link">Посмотреть все →</Link>
          </div>
          <div className="top-apps-grid">
            {topApps.map((app) => (
              <Link
                key={app.id}
                to={`/app/${app.id}`}
                className="top-app-card glass-card"
              >
                <div className="top-app-icon">{app.icon}</div>
                <div className="top-app-info">
                  <h4 className="top-app-name">{app.name}</h4>
                  <p className="top-app-category">{app.category}</p>
                  <div className="top-app-stats">
                    <span className="top-app-rating">
                      <StarIcon /> {app.rating}
                    </span>
                    <span className="top-app-downloads">📥 {app.downloads}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Categories;

