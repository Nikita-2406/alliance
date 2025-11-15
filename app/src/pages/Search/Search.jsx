import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { searchApps } from '../../services/api';
import './Search.css';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [filteredApps, setFilteredApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingApps, setDownloadingApps] = useState({});
  const [completedApps, setCompletedApps] = useState({});

  const filters = [
    { id: 'all', label: 'Все' },
    { id: 'popular', label: 'Популярные' },
    { id: 'new', label: 'Новые' },
    { id: 'top', label: 'Топ' },
  ];

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

  useEffect(() => {
    const loadApps = async () => {
      const result = await searchApps('');
      if (result.success) {
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
        {/* Hero Search Section */}
        <div className="search-hero">
          <h1 className="search-hero-title">Найдите своё приложение</h1>
          <p className="search-hero-subtitle">Тысячи приложений на любой вкус</p>
          
          <div className="search-bar glass-card">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Поиск приложений..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="clear-button" onClick={() => setSearchQuery('')}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="filters">
            {filters.map((filter) => (
              <button
                key={filter.id}
                className={`filter-chip ${selectedFilter === filter.id ? 'active' : ''}`}
                onClick={() => setSelectedFilter(filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="search-results">
          <div className="results-header">
            <div className="results-info">
              <h2 className="results-title">
                {searchQuery ? `"${searchQuery}"` : 'Все приложения'}
              </h2>
              <span className="results-count">{filteredApps.length} найдено</span>
            </div>
          </div>

          {loading ? (
            <div className="loading-state glass-card">
              <p>Загрузка...</p>
            </div>
          ) : filteredApps.length > 0 ? (
            <div className="apps-grid">
              {filteredApps.map((app) => (
                <Link to={`/app/${app.id}`} key={app.id} className="app-card glass-card">
                  <div className="app-card-icon">{app.icon}</div>
                  <div className="app-card-content">
                    <h3 className="app-card-name">{app.name}</h3>
                    <p className="app-card-category">{app.category}</p>
                    <div className="app-card-stats">
                      <span className="app-card-rating">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                          <path d="M7 0l1.796 5.528h5.812l-4.702 3.416 1.796 5.528L7 11.056l-4.702 3.416 1.796-5.528L-.608 5.528h5.812z"/>
                        </svg>
                        {app.rating}
                      </span>
                      <span className="app-card-size">{app.size}</span>
                    </div>
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
                </Link>
              ))}
            </div>
          ) : (
            <div className="no-results glass-card">
              <div className="no-results-icon">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                  <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="3" opacity="0.3"/>
                  <path d="M32 20v16M32 44v.01" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                </svg>
              </div>
              <h3>Ничего не найдено</h3>
              <p>Попробуйте изменить запрос или выберите другую категорию</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;

