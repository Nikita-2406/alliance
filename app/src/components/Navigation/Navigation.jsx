import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: '🏠', label: 'Главная' },
    { path: '/search', icon: '🔍', label: 'Поиск' },
    { path: '/categories', icon: '📱', label: 'Категории' },
    { path: '/profile', icon: '👤', label: 'Профиль' }
  ];

  return (
    <nav className="bottom-navigation">
      {navItems.map((item) => (
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

