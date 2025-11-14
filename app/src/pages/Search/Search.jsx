import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { searchApps } from '../../services/api';
import './Search.css';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [allApps, setAllApps] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]);
  const [loading, setLoading] = useState(true);

  const filters = [
    { id: 'all', label: 'Все', icon: '🔍' },
    { id: 'popular', label: 'Популярные', icon: '🔥' },
    { id: 'new', label: 'Новые', icon: '✨' },
    { id: 'top', label: 'Топ', icon: '⭐' },
  ];

  useEffect(() => {
    const loadApps = async () => {
      const result = await searchApps('');
      if (result.success) {
        setAllApps(result.data);
        setFilteredApps(result.data);
      }
      setLoading(false);
    };
    loadApps();
  }, []);

  useEffect(() => {
    const performSearch = async () => {
      setLoading(true);
      const result = await searchApps(searchQuery);
      if (result.success) {
        setFilteredApps(result.data);
      }
      setLoading(false);
    };
    
    const timer = setTimeout(() => {
      performSearch();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

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

