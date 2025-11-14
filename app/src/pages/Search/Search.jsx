import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Search.css';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const allApps = [
    { id: 1, name: 'PhotoMaster Pro', category: 'Фото и видео', rating: 4.8, downloads: '10M+', icon: '📸', size: '85 MB' },
    { id: 2, name: 'Fitness Tracker', category: 'Здоровье', rating: 4.9, downloads: '5M+', icon: '💪', size: '65 MB' },
    { id: 3, name: 'Cloud Notes', category: 'Продуктивность', rating: 4.7, downloads: '8M+', icon: '📝', size: '40 MB' },
    { id: 4, name: 'Music Streaming', category: 'Музыка', rating: 4.9, downloads: '20M+', icon: '🎵', size: '45 MB' },
    { id: 5, name: 'Language Learning', category: 'Образование', rating: 4.8, downloads: '15M+', icon: '🌍', size: '120 MB' },
    { id: 6, name: 'Budget Manager', category: 'Финансы', rating: 4.6, downloads: '3M+', icon: '💰', size: '30 MB' },
    { id: 7, name: 'Recipe Book', category: 'Еда и напитки', rating: 4.7, downloads: '7M+', icon: '🍳', size: '55 MB' },
    { id: 8, name: 'Travel Guide', category: 'Путешествия', rating: 4.8, downloads: '12M+', icon: '✈️', size: '90 MB' },
    { id: 9, name: 'Video Editor Pro', category: 'Фото и видео', rating: 4.7, downloads: '6M+', icon: '🎬', size: '150 MB' },
    { id: 10, name: 'Meditation & Sleep', category: 'Здоровье', rating: 4.9, downloads: '9M+', icon: '🧘', size: '75 MB' },
  ];

  const filters = [
    { id: 'all', label: 'Все', icon: '🔍' },
    { id: 'popular', label: 'Популярные', icon: '🔥' },
    { id: 'new', label: 'Новые', icon: '✨' },
    { id: 'top', label: 'Топ', icon: '⭐' },
  ];

  const filteredApps = allApps.filter(app =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="search-page">
      <div className="search-content">
        {/* Search Bar */}
        <div className="search-bar-container">
          <div className="search-bar glass-card">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Поиск приложений..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="clear-button" onClick={() => setSearchQuery('')}>
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="filters">
          {filters.map((filter) => (
            <button
              key={filter.id}
              className={`filter-chip ${selectedFilter === filter.id ? 'active' : ''}`}
              onClick={() => setSelectedFilter(filter.id)}
            >
              <span>{filter.icon}</span>
              <span>{filter.label}</span>
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="search-results">
          <div className="results-header">
            <h2 className="results-title">
              {searchQuery ? `Результаты для "${searchQuery}"` : 'Все приложения'}
            </h2>
            <span className="results-count">{filteredApps.length} приложений</span>
          </div>

          <div className="apps-list">
            {filteredApps.length > 0 ? (
              filteredApps.map((app) => (
                <Link to={`/app/${app.id}`} key={app.id} className="search-app-card glass-card">
                  <div className="search-app-icon">{app.icon}</div>
                  <div className="search-app-info">
                    <h3 className="search-app-name">{app.name}</h3>
                    <p className="search-app-category">{app.category}</p>
                    <div className="search-app-meta">
                      <span>⭐ {app.rating}</span>
                      <span>•</span>
                      <span>{app.size}</span>
                      <span>•</span>
                      <span>📥 {app.downloads}</span>
                    </div>
                  </div>
                  <button className="download-btn">
                    Скачать
                  </button>
                </Link>
              ))
            ) : (
              <div className="no-results glass-card">
                <span className="no-results-icon">🔍</span>
                <h3>Ничего не найдено</h3>
                <p>Попробуйте изменить запрос</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;

