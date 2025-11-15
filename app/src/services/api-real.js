/**
 * API Service для работы с реальным бэкендом
 * 
 * Backend: FastAPI на http://localhost:8000
 * Database: MySQL с приложениями и скриншотами
 */

// Конфигурация API
const API_BASE_URL = 'http://localhost:8000';

/**
 * Утилита для выполнения fetch запросов с обработкой ошибок
 */
const fetchAPI = async (url, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error [${url}]:`, error);
    throw error;
  }
};

/**
 * Адаптер для преобразования данных бэкенда в формат фронтенда
 */
const adaptAppData = (backendApp) => {
  return {
    id: backendApp.id,
    name: backendApp.name,
    category: backendApp.category,
    rating: backendApp.rating || 0,
    reviews: Math.floor(Math.random() * 50000) + 1000, // Mock, т.к. нет в БД
    downloads: `${Math.floor(Math.random() * 20) + 1}M+`, // Mock
    icon: backendApp.icon_url,
    size: backendApp.size || 'Н/Д',
    version: backendApp.version || '1.0.0',
    lastUpdate: backendApp.last_update || new Date().toISOString().split('T')[0],
    ageRating: backendApp.age_rating,
    developer: backendApp.developer,
    color: generateColorGradient(backendApp.category), // Генерируем градиент
    screenshots: backendApp.screenshots || [],
    description: backendApp.description,
    price: backendApp.price || 'Бесплатно',
    // Дополнительные поля для совместимости
    features: generateFeatures(backendApp), // Генерируем features на основе описания
    requirements: {
      os: 'Все платформы',
      ram: '2 GB',
      storage: backendApp.size || '50 MB',
      internet: 'Требуется'
    }
  };
};

/**
 * Генерация градиента по категории
 */
const generateColorGradient = (category) => {
  const gradients = {
    'Финансы': 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
    'Инструменты': 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
    'Игры': 'linear-gradient(135deg, #F44336 0%, #D32F2F 100%)',
    'Государственные': 'linear-gradient(135deg, #607D8B 0%, #455A64 100%)',
    'Транспорт': 'linear-gradient(135deg, #FFEB3B 0%, #FBC02D 100%)',
    'Покупки': 'linear-gradient(135deg, #E91E63 0%, #C2185B 100%)',
    'Навигация': 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
    'Общение': 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
    'Фото и видео': 'linear-gradient(135deg, #A5668B 0%, #69306D 100%)',
    'Здоровье': 'linear-gradient(135deg, #D3BCC0 0%, #A5668B 100%)',
    'Продуктивность': 'linear-gradient(135deg, #69306D 0%, #0E103D 100%)',
    'Музыка': 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
    'Образование': 'linear-gradient(135deg, #00BCD4 0%, #0097A7 100%)',
    'Еда и напитки': 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
    'Путешествия': 'linear-gradient(135deg, #FF5722 0%, #E64A19 100%)'
  };
  return gradients[category] || 'linear-gradient(135deg, #A5668B 0%, #69306D 100%)';
};

/**
 * Генерация features на основе описания
 */
const generateFeatures = (app) => {
  const features = [];
  if (app.description) {
    const sentences = app.description.split('.').filter(s => s.trim().length > 10);
    sentences.slice(0, 6).forEach(sentence => {
      features.push(`✨ ${sentence.trim()}`);
    });
  }
  return features.length > 0 ? features : [
    `✨ ${app.name}`,
    '📱 Удобный интерфейс',
    '🔄 Регулярные обновления',
    '🔒 Безопасность данных',
    '📊 Детальная статистика',
    '💾 Облачная синхронизация'
  ];
};

/**
 * Адаптер для категорий
 */
const adaptCategoryData = (categories) => {
  const categoryIcons = {
    'Финансы': '💰',
    'Инструменты': '🔧',
    'Игры': '🎮',
    'Государственные': '🏛️',
    'Транспорт': '🚗',
    'Покупки': '🛍️',
    'Навигация': '🗺️',
    'Общение': '💬',
    'Фото и видео': '📸',
    'Здоровье': '💪',
    'Продуктивность': '✅',
    'Музыка': '🎵',
    'Образование': '🎓',
    'Еда и напитки': '🍳',
    'Путешествия': '✈️'
  };

  return categories.map((cat, index) => ({
    id: cat.toLowerCase().replace(/\s+/g, '_'),
    name: cat,
    icon: categoryIcons[cat] || '📦',
    color: index % 2 === 0 ? '#2196F3' : '#64B5F6',
    count: Math.floor(Math.random() * 500) + 50 // Mock
  }));
};

/**
 * API методы
 */

// Получить все приложения
export const getAllApps = async () => {
  try {
    const apps = await fetchAPI('/api/apps');
    return {
      success: true,
      data: apps.map(adaptAppData)
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Получить приложение по ID
export const getAppById = async (id) => {
  try {
    const app = await fetchAPI(`/api/apps/${id}`);
    return {
      success: true,
      data: adaptAppData(app)
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Получить популярные приложения (топ по рейтингу)
export const getFeaturedApps = async (limit = 3) => {
  try {
    const apps = await fetchAPI('/api/featured');
    return {
      success: true,
      data: apps.slice(0, limit).map(adaptAppData)
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Получить топ недели (случайная выборка из топовых)
export const getTopWeekApps = async (limit = 5) => {
  try {
    const apps = await fetchAPI('/api/apps');
    const topApps = apps
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
    return {
      success: true,
      data: topApps.map(adaptAppData)
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Поиск приложений
export const searchApps = async (query) => {
  try {
    const apps = await fetchAPI(`/api/search?q=${encodeURIComponent(query)}`);
    return {
      success: true,
      data: apps.map(adaptAppData)
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Получить все категории
export const getCategories = async () => {
  try {
    const categories = await fetchAPI('/api/categories');
    return {
      success: true,
      data: adaptCategoryData(categories)
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Получить приложения по категории
export const getAppsByCategory = async (categoryId) => {
  try {
    // Преобразуем ID обратно в название категории
    const categoryName = categoryId.replace(/_/g, ' ');
    const capitalizedName = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
    
    const apps = await fetchAPI(`/api/apps?category=${encodeURIComponent(capitalizedName)}`);
    return {
      success: true,
      data: apps.map(adaptAppData)
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Получить отзывы для приложения (mock - в БД нет отзывов)
export const getReviewsForApp = async (appId) => {
  // Mock данные, так как в текущей БД нет таблицы отзывов
  return {
    success: true,
    data: [
      {
        id: 1,
        appId: parseInt(appId),
        author: 'Александр',
        rating: 5,
        date: '2 дня назад',
        comment: 'Отличное приложение! Очень доволен функционалом.'
      },
      {
        id: 2,
        appId: parseInt(appId),
        author: 'Мария',
        rating: 4,
        date: '1 неделя назад',
        comment: 'Хорошее приложение, рекомендую!'
      }
    ]
  };
};

// Получить скачанные приложения пользователя (mock)
export const getUserDownloads = async () => {
  try {
    const apps = await fetchAPI('/api/apps');
    const randomApps = apps.slice(0, 4).map((app, index) => ({
      ...adaptAppData(app),
      downloadDate: `${index + 1} ${index === 0 ? 'день' : 'дня'} назад`
    }));
    return {
      success: true,
      data: randomApps
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Получить избранные приложения пользователя (mock)
export const getUserFavorites = async () => {
  try {
    const apps = await fetchAPI('/api/featured');
    return {
      success: true,
      data: apps.map(adaptAppData)
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Получить отзывы пользователя (mock)
export const getUserReviews = async () => {
  try {
    const apps = await fetchAPI('/api/apps');
    const topApps = apps.slice(0, 3);
    return {
      success: true,
      data: topApps.map((app, index) => ({
        id: index + 1,
        appName: app.name,
        appIcon: app.icon_url,
        rating: 5 - index,
        comment: `Отличное приложение! ${app.description.split('.')[0]}.`,
        date: `${index + 1} ${index === 0 ? 'неделя' : 'недели'} назад`
      }))
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * ===== CRUD операции для администрирования =====
 */

// Создать новое приложение
export const createApp = async (appData) => {
  try {
    const app = await fetchAPI('/api/apps', {
      method: 'POST',
      body: JSON.stringify(appData)
    });
    return {
      success: true,
      data: adaptAppData(app)
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Обновить приложение
export const updateApp = async (appId, appData) => {
  try {
    const app = await fetchAPI(`/api/apps/${appId}`, {
      method: 'PUT',
      body: JSON.stringify(appData)
    });
    return {
      success: true,
      data: adaptAppData(app)
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Удалить приложение
export const deleteApp = async (appId) => {
  try {
    const response = await fetchAPI(`/api/apps/${appId}`, {
      method: 'DELETE'
    });
    return {
      success: true,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Экспорт конфигурации
 */
export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  ENDPOINTS: {
    APPS: '/api/apps',
    APPS_BY_ID: '/api/apps/:id',
    FEATURED: '/api/featured',
    CATEGORIES: '/api/categories',
    SEARCH: '/api/search',
  }
};


