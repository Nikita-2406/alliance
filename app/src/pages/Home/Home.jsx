import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getFeaturedApps, getTopWeekApps, getCategories } from '../../services/api';
import './Home.css';

// SVG иконка звезды
const StarIcon = ({ filled = true, className = "" }) => (
  <svg 
    className={`star-icon ${className}`}
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

// Компонент карточки топового приложения
const TopAppCard = ({ app }) => {
  const scrollContainerRef = useRef(null);
  
  const handleScrollLeft = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -120,
        behavior: 'smooth'
      });
    }
  };
  
  const handleScrollRight = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 120,
        behavior: 'smooth'
      });
    }
  };
  
  return (
    <Link to={`/app/${app.id}`} className="top-app-card glass-card">
      <div className="top-app-content">
        <img src={app.icon} alt={app.name} className="top-app-icon" />
        <div className="top-app-info">
          <h4 className="top-app-name">{app.name}</h4>
          <p className="top-app-category">{app.category}</p>
          <div className="top-app-rating">
            <StarIcon />
            <span>{app.rating}</span>
          </div>
        </div>
      </div>
      
      {/* Desktop и Mobile - горизонтальный scroll со стрелками */}
      <div className="top-app-screenshots-wrapper">
        <button 
          className="screenshot-arrow screenshot-arrow-left"
          onClick={handleScrollLeft}
          aria-label="Пролистать влево"
        >
          ‹
        </button>
        <div 
          ref={scrollContainerRef}
          className="top-app-screenshots-scroll"
        >
          {app.screenshots.map((screenshot, sIdx) => (
            <div key={sIdx} className="top-screenshot-item">
              <img 
                src={screenshot} 
                alt={`${app.name} скриншот ${sIdx + 1}`} 
                className="top-screenshot-image" 
              />
            </div>
          ))}
        </div>
        <button 
          className="screenshot-arrow screenshot-arrow-right"
          onClick={handleScrollRight}
          aria-label="Пролистать вправо"
        >
          ›
        </button>
      </div>
    </Link>
  );
};

const Home = () => {
  const [featuredApps, setFeaturedApps] = useState([]);
  const [topWeek, setTopWeek] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const autoplayIntervalRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [featured, top, cats] = await Promise.all([
          getFeaturedApps(5),
          getTopWeekApps(5),
          getCategories()
        ]);

        if (featured.success) setFeaturedApps(featured.data);
        if (top.success) setTopWeek(top.data);
        if (cats.success) setCategories(cats.data.slice(0, 5));
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleNextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev >= featuredApps.length - 1 ? 0 : prev + 1));
  }, [featuredApps.length]);

  // Функция для сброса и перезапуска таймера автопрокрутки
  const resetAutoplayTimer = useCallback(() => {
    if (autoplayIntervalRef.current) {
      clearInterval(autoplayIntervalRef.current);
    }
    
    if (featuredApps.length > 0) {
      autoplayIntervalRef.current = setInterval(() => {
        handleNextSlide();
      }, 5000);
    }
  }, [featuredApps.length, handleNextSlide]);

  // Обработчики с сбросом таймера
  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev <= 0 ? featuredApps.length - 1 : prev - 1));
    resetAutoplayTimer();
  };

  const handleNextSlideManual = () => {
    handleNextSlide();
    resetAutoplayTimer();
  };

  const handleDotClick = (index) => {
    setCurrentSlide(index);
    resetAutoplayTimer();
  };

  const handleSlideClick = (index) => {
    setCurrentSlide(index);
    resetAutoplayTimer();
  };

  // Автопрокрутка каждые 5 секунд
  useEffect(() => {
    resetAutoplayTimer();
    
    return () => {
      if (autoplayIntervalRef.current) {
        clearInterval(autoplayIntervalRef.current);
      }
    };
  }, [resetAutoplayTimer]);

  if (loading) {
    return (
      <div className="home-page">
        <div className="home-content">
          <div className="loading-state glass-card">
            <p>Загрузка...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <div className="home-content">
        {/* Featured Apps Carousel */}
        <section className="section">
          <h2 className="section-title">Рекомендуемые</h2>
          <div className="featured-carousel">
            <button className="carousel-arrow carousel-arrow-left" onClick={handlePrevSlide}>
              ←
            </button>
            
            <div className="carousel-container">
              <div className="carousel-track">
                {featuredApps.map((app, index) => {
                  // Вычисляем позицию каждого слайда относительно текущего
                  let position = index - currentSlide;
                  
                  // Нормализуем позицию для бесконечного цикла
                  if (position < -Math.floor(featuredApps.length / 2)) {
                    position += featuredApps.length;
                  } else if (position > Math.floor(featuredApps.length / 2)) {
                    position -= featuredApps.length;
                  }
                  
                  const isActive = position === 0;
                  const isVisible = Math.abs(position) <= 1;
                  
                  return (
                    <div 
                      key={app.id}
                      className={`carousel-slide ${isActive ? 'active' : ''} position-${position} ${!isVisible ? 'hidden' : ''}`}
                      onClick={() => {
                        if (position !== 0) {
                          handleSlideClick(index);
                        }
                      }}
                    >
                      <Link 
                        to={`/app/${app.id}`} 
                        className="featured-card glass-card"
                        onClick={(e) => {
                          if (position !== 0) {
                            e.preventDefault();
                          }
                        }}
                      >
                        <div className="featured-header" style={{ background: app.color }}>
                          <img src={app.icon} alt={app.name} className="featured-icon" />
                        </div>
                        <div className="featured-body">
                          <h3 className="app-name">{app.name}</h3>
                          <p className="app-category">{app.category}</p>
                          <div className="app-stats">
                            <span className="stat"><StarIcon /> {app.rating}</span>
                            <span className="stat">📥 {app.downloads}</span>
                          </div>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <button className="carousel-arrow carousel-arrow-right" onClick={handleNextSlideManual}>
              →
            </button>
          </div>
          
          <div className="carousel-dots">
            {featuredApps.map((_, index) => (
              <button
                key={index}
                className={`carousel-dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => handleDotClick(index)}
              />
            ))}
          </div>
        </section>

        {/* Quick Categories */}
        <section className="section">
          <h2 className="section-title">Категории</h2>
          <div className="categories-quick">
            {categories.map((cat) => (
              <Link to="/categories" key={cat.id} className="category-quick glass-card">
                <span className="category-icon" style={{ color: cat.color }}>{cat.icon}</span>
                <span className="category-name">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Top This Week */}
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Топ недели</h2>
            <Link to="/search" className="see-all">Посмотреть все →</Link>
          </div>
          <div className="top-list-horizontal">
            {topWeek.map((app) => (
              <TopAppCard key={app.id} app={app} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;

