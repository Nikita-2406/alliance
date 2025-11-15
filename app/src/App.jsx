import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import Header from './components/Header/Header';
import Welcome from './pages/Welcome/Welcome';
import Home from './pages/Home/Home';
import Search from './pages/Search/Search';
import Categories from './pages/Categories/Categories';
import CategoryApps from './pages/CategoryApps/CategoryApps';
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
    if (location.pathname === '/home') return 'Главная';
    if (location.pathname === '/search') return 'Поиск';
    if (location.pathname === '/categories') return 'Категории';
    if (location.pathname.startsWith('/category/')) return 'Категория';
    if (location.pathname === '/profile') return 'Профиль';
    if (location.pathname.startsWith('/app/')) return 'Приложение';
    return 'RuStore';
  };

  const showBackButton = location.pathname.startsWith('/app/') || location.pathname.startsWith('/category/');
  
  // Скрываем Header на Welcome странице
  const showHeader = location.pathname !== '/';

  return (
    <div className="app-container">
      {showHeader && <Header title={getPageTitle()} showBack={showBackButton} />}
      <main className={showHeader ? "app-main" : "app-main-full"}>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/home" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/category/:categoryName" element={<CategoryApps />} />
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
