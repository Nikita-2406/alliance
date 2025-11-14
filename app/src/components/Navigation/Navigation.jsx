import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './Navigation.css';

const Navigation = () => {
  const location = useLocation();
  const [activeIndex, setActiveIndex] = useState(0);

  const navItems = [
    { path: '/', icon: '🏠', label: 'Главная' },
    { path: '/search', icon: '🔍', label: 'Поиск' },
    { path: '/categories', icon: '📱', label: 'Категории' },
    { path: '/profile', icon: '👤', label: 'Профиль' }
  ];

  useEffect(() => {
    const currentIndex = navItems.findIndex(item => item.path === location.pathname);
    if (currentIndex !== -1) {
      setActiveIndex(currentIndex);
    }
  }, [location.pathname]);

  return (
    <nav className="bottom-navigation">
      <div 
        className="nav-blob" 
        style={{ 
          transform: `translateX(${activeIndex * 100}%)`,
        }}
      />
      {navItems.map((item, index) => (
        <Link
          key={item.path}
          to={item.path}
          className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
};

export default Navigation;

