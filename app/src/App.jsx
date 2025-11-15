import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import Header from './components/Header/Header';
import Home from './pages/Home/Home';
import Search from './pages/Search/Search';
import Categories from './pages/Categories/Categories';
import Profile from './pages/Profile/Profile';
import AppDetails from './pages/AppDetails/AppDetails';

function AppContent() {
  const location = useLocation();
  
  // Прокрутка наверх при смене страницы
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  // Определяем заголовок на основе текущего маршрута
  const getPageTitle = () => {
    if (location.pathname === '/') return 'Главная';
    if (location.pathname === '/search') return 'Поиск';
    if (location.pathname === '/categories') return 'Категории';
    if (location.pathname === '/profile') return 'Профиль';
    if (location.pathname.startsWith('/app/')) return 'Приложение';
    return 'RuStore';
  };

  const showBackButton = location.pathname.startsWith('/app/');

  return (
    <div className="app-container">
      <Header title={getPageTitle()} showBack={showBackButton} />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/app/:id" element={<AppDetails />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
