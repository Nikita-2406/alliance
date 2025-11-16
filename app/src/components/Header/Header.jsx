import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useEffect, useState, useRef, useMemo } from 'react';
import './Header.css';
import RuStoreLogo from './RuStore_Icon.svg';

const Header = ({ showBack = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [blobStyle, setBlobStyle] = useState({ width: 0, left: 0 });
  const navItemsRef = useRef([]);
  const navContainerRef = useRef(null);

  const navItems = useMemo(() => [
    { path: '/home', label: 'Главная' },
    { path: '/search', label: 'Поиск' },
    { path: '/categories', label: 'Категории' },
    { path: '/profile', label: 'Профиль' }
  ], []);

  // Вычисляем активный индекс на основе текущего пути
  const activeIndex = useMemo(() => {
    const index = navItems.findIndex(item => item.path === location.pathname);
    return index !== -1 ? index : 0;
  }, [location.pathname, navItems]);

  useEffect(() => {
    const updateBlobPosition = () => {
      const activeElement = navItemsRef.current[activeIndex];
      const container = navContainerRef.current;
      
      if (activeElement && container) {
        const containerRect = container.getBoundingClientRect();
        const elementRect = activeElement.getBoundingClientRect();
        
        // Вычисляем позицию относительно контейнера
        const left = elementRect.left - containerRect.left;
        const width = elementRect.width;
        
        setBlobStyle({
          width: width,
          left: left
        });
      }
    };

    updateBlobPosition();
    window.addEventListener('resize', updateBlobPosition);
    
    // Небольшая задержка для корректного расчета после рендера
    const timer = setTimeout(updateBlobPosition, 50);

    return () => {
      window.removeEventListener('resize', updateBlobPosition);
      clearTimeout(timer);
    };
  }, [activeIndex]);

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
            <Link to="/home" className="header-logo">
              <img src={RuStoreLogo} alt="RuStore" className="logo-icon" />
              <span className="logo-text">RuStore</span>
            </Link>
          )}
        </div>

        {!showBack && (
          <nav className="header-navigation" ref={navContainerRef}>
            <div 
              className="nav-blob-header" 
              style={{ 
                width: `${blobStyle.width}px`,
                transform: `translateX(${blobStyle.left}px)`
              }}
            />
            {navItems.map((item, index) => (
              <Link
                key={item.path}
                to={item.path}
                ref={(el) => (navItemsRef.current[index] = el)}
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

