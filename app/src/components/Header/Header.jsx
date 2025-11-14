import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import './Header.css';
import RuStoreLogo from './RuStore_Icon.svg';

const Header = ({ title, showBack = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [blobStyle, setBlobStyle] = useState({ width: 0, left: 0 });
  const navItemsRef = useRef([]);
  const navContainerRef = useRef(null);

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

  useEffect(() => {
    let resizeTimer;
    
    const updateBlobPosition = () => {
      const activeElement = navItemsRef.current[activeIndex];
      const container = navContainerRef.current;
      
      if (activeElement && container) {
        const containerRect = container.getBoundingClientRect();
        const elementRect = activeElement.getBoundingClientRect();
        
        // Вычисляем позицию относительно контейнера
        let left = elementRect.left - containerRect.left;
        let width = elementRect.width;
        
        // Проверка границ - не даем выйти за пределы контейнера
        if (left < 0) left = 0;
        if (left + width > containerRect.width) {
          width = containerRect.width - left;
        }
        
        setBlobStyle({
          width: Math.max(0, width),
          left: Math.max(0, left)
        });
      }
    };

    // Debounce для resize
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateBlobPosition, 100);
    };

    updateBlobPosition();
    window.addEventListener('resize', handleResize);
    
    // Небольшая задержка для корректного расчета после рендера
    const timer = setTimeout(updateBlobPosition, 50);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
      clearTimeout(resizeTimer);
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
            <div className="header-logo">
              <img src={RuStoreLogo} alt="RuStore" className="logo-icon" />
              <span className="logo-text">RuStore</span>
            </div>
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

