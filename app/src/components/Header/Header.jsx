import { useNavigate, useLocation } from 'react-router-dom';
import './Header.css';

const Header = ({ title, showBack = false }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <header className="app-header">
      <div className="header-content">
        {showBack ? (
          <button className="back-button" onClick={handleBack}>
            ← Назад
          </button>
        ) : (
          <div className="header-logo">
            <span className="logo-icon">📱</span>
            <span className="logo-text">AppStore</span>
          </div>
        )}
        <h1 className="header-title">{title}</h1>
        <div className="header-actions">
          {/* Placeholder for future actions like notifications */}
        </div>
      </div>
    </header>
  );
};

export default Header;

