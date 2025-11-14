# 📡 API Сервис - Руководство

## 🎯 Быстрый старт

Все данные в приложении загружаются через API сервис в `src/services/api.js`.  
Сейчас используются **mock данные** (заглушки), но структура готова для реального API.

---

## 📦 Доступные функции

### Приложения

```javascript
import { 
  getAllApps, 
  getAppById, 
  getFeaturedApps, 
  getTopWeekApps,
  searchApps 
} from './services/api';

// Получить все приложения
const result = await getAllApps();
// result = { success: true, data: [...] }

// Получить приложение по ID
const app = await getAppById(1);
// app = { success: true, data: {...} }

// Рекомендуемые (3 шт)
const featured = await getFeaturedApps(3);

// Топ недели (5 шт)
const top = await getTopWeekApps(5);

// Поиск по названию или категории
const results = await searchApps('Photo');
```

### Категории

```javascript
import { getCategories, getAppsByCategory } from './services/api';

// Все категории
const cats = await getCategories();
// cats = { success: true, data: [{id, name, icon, color, count},...] }

// Приложения по категории
const apps = await getAppsByCategory('games');
```

### Пользователь

```javascript
import { 
  getUserDownloads, 
  getUserFavorites, 
  getUserReviews 
} from './services/api';

// Скачанные приложения
const downloads = await getUserDownloads();

// Избранное
const favorites = await getUserFavorites();

// Отзывы пользователя
const reviews = await getUserReviews();
```

### Отзывы

```javascript
import { getReviewsForApp } from './services/api';

// Отзывы для приложения
const reviews = await getReviewsForApp(1);
```

---

## 🔄 Замена на реальное API

### Шаг 1: Откройте `src/services/api.js`

### Шаг 2: Замените функцию

**Было (mock):**
```javascript
export const getAllApps = async () => {
  await delay(300);
  return { success: true, data: MOCK_APPS };
};
```

**Станет (реальное API):**
```javascript
export const getAllApps = async () => {
  try {
    const response = await fetch('https://your-api.com/api/apps');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching apps:', error);
    return { success: false, error: error.message };
  }
};
```

### Шаг 3: Добавьте авторизацию (если нужно)

```javascript
const API_URL = 'https://your-api.com/api';
const API_KEY = 'your-api-key';

export const getAllApps = async () => {
  try {
    const response = await fetch(`${API_URL}/apps`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
```

### Шаг 4: POST запросы (например, для отзывов)

```javascript
export const submitReview = async (appId, reviewData) => {
  try {
    const response = await fetch(`${API_URL}/apps/${appId}/reviews`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(reviewData)
    });
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
```

---

## 📊 Структура ответов API

### Успешный ответ:
```javascript
{
  success: true,
  data: [...]  // или {...} для одного объекта
}
```

### Ошибка:
```javascript
{
  success: false,
  error: 'Error message'
}
```

---

## 🔍 Примеры использования в компонентах

### Home.jsx
```javascript
import { getFeaturedApps, getTopWeekApps } from '../../services/api';

const Home = () => {
  const [featuredApps, setFeaturedApps] = useState([]);
  
  useEffect(() => {
    const loadData = async () => {
      const result = await getFeaturedApps(3);
      if (result.success) {
        setFeaturedApps(result.data);
      }
    };
    loadData();
  }, []);
  
  return (
    <div>
      {featuredApps.map(app => (
        <AppCard key={app.id} app={app} />
      ))}
    </div>
  );
};
```

### Search.jsx
```javascript
import { searchApps } from '../../services/api';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  
  useEffect(() => {
    const search = async () => {
      const result = await searchApps(query);
      if (result.success) {
        setResults(result.data);
      }
    };
    
    const timer = setTimeout(search, 300);
    return () => clearTimeout(timer);
  }, [query]);
  
  return (
    <input 
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
};
```

---

## 🛡️ Обработка ошибок

Все функции возвращают объект с полем `success`:

```javascript
const result = await getAllApps();

if (result.success) {
  // Данные загружены успешно
  console.log(result.data);
} else {
  // Произошла ошибка
  console.error(result.error);
  // Показать уведомление пользователю
}
```

---

## ⏱️ Задержки

Mock функции имитируют сетевую задержку:

```javascript
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));
```

Это помогает протестировать состояния загрузки в UI.  
В реальном API эти задержки не нужны.

---

## 📝 Mock данные

В файле `api.js` есть:
- `MOCK_APPS` - 10 полных приложений
- `MOCK_CATEGORIES` - 8 категорий
- `MOCK_REVIEWS` - отзывы

Все данные структурированы и готовы для использования.

---

## 🔧 Расширение API

Чтобы добавить новую функцию:

```javascript
// 1. Добавьте mock данные (если нужно)
const MOCK_NEW_DATA = [...];

// 2. Создайте функцию
export const getNewData = async () => {
  await delay(300);
  return { success: true, data: MOCK_NEW_DATA };
};

// 3. Используйте в компонентах
import { getNewData } from './services/api';
```

---

## 📚 Полный список endpoints (для реального API)

| Функция | Endpoint | Метод |
|---------|----------|-------|
| getAllApps | `/api/apps` | GET |
| getAppById | `/api/apps/:id` | GET |
| getFeaturedApps | `/api/apps?featured=true` | GET |
| getTopWeekApps | `/api/apps?topWeek=true` | GET |
| searchApps | `/api/apps?search=:query` | GET |
| getCategories | `/api/categories` | GET |
| getAppsByCategory | `/api/categories/:id/apps` | GET |
| getUserDownloads | `/api/user/downloads` | GET |
| getUserFavorites | `/api/user/favorites` | GET |
| getUserReviews | `/api/user/reviews` | GET |
| getReviewsForApp | `/api/apps/:id/reviews` | GET |

---

## ✅ Готово к использованию!

Mock API полностью функционален и готов к замене на реальное.  
Все компоненты уже используют API сервис! 🚀

