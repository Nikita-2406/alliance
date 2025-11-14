import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './Header.css';

const Header = ({ title, showBack = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeIndex, setActiveIndex] = useState(0);

  const navItems = [
    { path: '/', label: 'Главная' },
    { path: '/search', label: 'Поиск' },
    { path: '/categories', label: 'Категории' },
    { path: '/profile', label: 'Профиль' }
  ];

  useEffect(() => {
    const currentIndex = navItems.findIndex(item => item.path === location.pathname);
    if (currentIndex !== -1) {
      setActiveIndex(currentIndex);
    }
  }, [location.pathname]);

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-left">
          {showBack ? (
            <button className="back-button" onClick={handleBack}>
              ← Назад
            </button>
          ) : (
            <div className="header-logo">
              <img src="RuStore_Icon.svg" alt="logo" />
              <span className="logo-text">RuStore</span>
            </div>
          )}
        </div>

        {!showBack && (
          <nav className="header-navigation">
            <div 
              className="nav-blob-header" 
              style={{ 
                transform: `translateX(${activeIndex * 100}%)`,
              }}
            />
            {navItems.map((item, index) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item-header ${location.pathname === item.path ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="header-actions">
          {/* Placeholder for future actions */}
        </div>
      </div>
    </header>
  );
};

export default Header;

