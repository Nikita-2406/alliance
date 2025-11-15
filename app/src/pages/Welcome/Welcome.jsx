import { useNavigate } from 'react-router-dom';
import RuStoreLogo from '../../components/Header/RuStore_Icon.svg';
import './Welcome.css';

const Welcome = () => {
  const navigate = useNavigate();

  const handleBrowseApps = () => {
    // Переход на главную страницу
    navigate('/home');
  };

  const handleVKAuth = () => {
    // Заглушка для авторизации через VK
    alert('Регистрация через VK');
  };

  return (
    <div className="welcome-page">
      <div className="welcome-background"></div>
      
      <div className="welcome-content">
        {/* Логотип */}
        <div className="welcome-logo">
          <img src={RuStoreLogo} alt="RuStore" className="logo-image" />
          <h1 className="logo-title">RuStore</h1>
        </div>

        {/* Приветственный текст */}
        <div className="welcome-text-block glass-card">
          <h2 className="welcome-title">Добро пожаловать!</h2>
          <p className="welcome-description">
            Откройте для себя мир качественных приложений. 
            Тысячи приложений для работы, развлечений и образования.
          </p>
        </div>

        {/* Кнопки */}
        <div className="welcome-actions">
          <button className="welcome-btn primary-btn glass-card" onClick={handleBrowseApps}>
            <span className="btn-icon">👀</span>
            <span className="btn-label">Просто посмотреть приложения</span>
          </button>
          
          <button className="welcome-btn secondary-btn glass-card" onClick={handleVKAuth}>
            <span className="btn-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.785 16.241s.288-.032.436-.193c.136-.148.132-.425.132-.425s-.019-1.298.574-1.489c.584-.188 1.333 1.254 2.128 1.809.602.42 1.06.328 1.06.328l2.127-.03s1.112-.069.585-.956c-.043-.073-.308-.658-1.588-1.861-1.34-1.259-1.16-1.056.454-3.235.982-1.327 1.375-2.135 1.252-2.483-.117-.332-.84-.244-.84-.244l-2.396.015s-.178-.024-.309.056c-.128.078-.21.261-.21.261s-.375 1.013-.875 1.873c-1.054 1.814-1.476 1.91-1.649 1.797-.402-.263-.301-1.056-.301-1.619 0-1.76.263-2.494-.513-2.684-.258-.063-.448-.105-1.107-.112-.847-.009-1.563.003-1.969.204-.27.134-.478.432-.351.449.157.021.512.097.7.357.243.336.235 1.09.235 1.09s.14 2.074-.327 2.33c-.32.176-.76-.183-1.704-1.825-.483-.844-.848-1.778-.848-1.778s-.07-.175-.196-.269c-.152-.113-.365-.149-.365-.149l-2.276.015s-.342.01-.467.161c-.112.134-.009.41-.009.41s1.761 4.182 3.757 6.289c1.832 1.934 3.911 1.806 3.911 1.806h.943z"/>
              </svg>
            </span>
            <span className="btn-label">Авторизоваться через VK</span>
          </button>
        </div>

        {/* Пользовательское соглашение */}
        <div className="welcome-terms">
          <p className="terms-text">
            Продолжая пользоваться сервисом, вы автоматически соглашаетесь с{' '}
            <a 
              href="https://www.rustore.ru/help/legal/terms-of-use" 
              target="_blank" 
              rel="noopener noreferrer"
              className="terms-link"
            >
              пользовательским соглашением
            </a>
          .</p>
        </div>
      </div>
    </div>
  );
};

export default Welcome;

