import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFeaturedApps, getTopWeekApps, getCategories } from '../../services/api';
import './Home.css';

const Home = () => {
  const [featuredApps, setFeaturedApps] = useState([]);
  const [topWeek, setTopWeek] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [featured, top, cats] = await Promise.all([
          getFeaturedApps(3),
          getTopWeekApps(5),
          getCategories()
        ]);

        if (featured.success) setFeaturedApps(featured.data);
        if (top.success) setTopWeek(top.data);
        if (cats.success) setCategories(cats.data.slice(0, 4));
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
      <div className="home-page">
        <div className="home-content">
          <div className="loading-state glass-card">
            <p>Загрузка...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <div className="home-content">
        {/* Featured Apps */}
        <section className="section">
          <h2 className="section-title">Рекомендуемые</h2>
          <div className="featured-grid">
            {featuredApps.map((app) => (
              <Link to={`/app/${app.id}`} key={app.id} className="featured-card glass-card">
                <div className="featured-header" style={{ background: app.color }}>
                  <span className="featured-icon">{app.icon}</span>
                </div>
                <div className="featured-body">
                  <h3 className="app-name">{app.name}</h3>
                  <p className="app-category">{app.category}</p>
                  <div className="app-stats">
                    <span className="stat">⭐ {app.rating}</span>
                    <span className="stat">📥 {app.downloads}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Quick Categories */}
        <section className="section">
          <h2 className="section-title">Категории</h2>
          <div className="categories-quick">
            {categories.map((cat) => (
              <Link to="/categories" key={cat.id} className="category-quick glass-card">
                <span className="category-icon" style={{ color: cat.color }}>{cat.icon}</span>
                <span className="category-name">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Top This Week */}
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Топ недели</h2>
            <Link to="/search" className="see-all">Все →</Link>
          </div>
          <div className="top-list">
            {topWeek.map((app, idx) => (
              <Link to={`/app/${app.id}`} key={app.id} className="app-item glass-card">
                <div className="app-rank">{idx + 1}</div>
                <div className="app-icon-small">{app.icon}</div>
                <div className="app-info">
                  <h4 className="app-name">{app.name}</h4>
                  <p className="app-meta">{app.category} • {app.size}</p>
                </div>
                <div className="app-rating">
                  <span>⭐</span>
                  <span>{app.rating}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;

