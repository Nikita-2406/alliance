import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const featuredApps = [
    { id: 1, name: 'PhotoMaster Pro', category: 'Фото и видео', rating: 4.8, downloads: '10M+', icon: '📸', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { id: 2, name: 'Fitness Tracker', category: 'Здоровье', rating: 4.9, downloads: '5M+', icon: '💪', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { id: 3, name: 'Cloud Notes', category: 'Продуктивность', rating: 4.7, downloads: '8M+', icon: '📝', color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  ];

  const topWeek = [
    { id: 4, name: 'Music Streaming', category: 'Музыка', rating: 4.9, downloads: '20M+', icon: '🎵', size: '45 MB' },
    { id: 5, name: 'Language Learning', category: 'Образование', rating: 4.8, downloads: '15M+', icon: '🌍', size: '120 MB' },
    { id: 6, name: 'Budget Manager', category: 'Финансы', rating: 4.6, downloads: '3M+', icon: '💰', size: '30 MB' },
    { id: 7, name: 'Recipe Book', category: 'Еда и напитки', rating: 4.7, downloads: '7M+', icon: '🍳', size: '55 MB' },
    { id: 8, name: 'Travel Guide', category: 'Путешествия', rating: 4.8, downloads: '12M+', icon: '✈️', size: '90 MB' },
  ];

  const categories = [
    { name: 'Игры', icon: '🎮', color: '#FF2D55' },
    { name: 'Социальные', icon: '💬', color: '#5856D6' },
    { name: 'Развлечения', icon: '🎬', color: '#FF9500' },
    { name: 'Продуктивность', icon: '⚡', color: '#34C759' },
  ];

  return (
    <div className="home-page">
      <div className="home-content">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-card glass-card">
            <h1 className="hero-title">Добро пожаловать!</h1>
            <p className="hero-subtitle">Откройте для себя лучшие приложения</p>
          </div>
        </section>

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
            {categories.map((cat, idx) => (
              <Link to="/categories" key={idx} className="category-quick glass-card">
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

