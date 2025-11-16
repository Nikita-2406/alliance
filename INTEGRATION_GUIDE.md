# 🔗 Руководство по интеграции Frontend ↔ Backend

## 📋 Содержание

1. [Обзор архитектуры](#обзор-архитектуры)
2. [Быстрый старт](#быстрый-старт)
3. [API Endpoints](#api-endpoints)
4. [Структура данных](#структура-данных)
5. [Переключение с Mock на Real API](#переключение-с-mock-на-real-api)
6. [CRUD операции](#crud-операции)
7. [Тестирование](#тестирование)
8. [Troubleshooting](#troubleshooting)

---

## 🏗️ Обзор архитектуры

```
┌─────────────────────────────────────────┐
│         Frontend (React)                │
│         http://localhost:5173           │
│                                         │
│  ├── src/services/api.js (Mock)        │
│  └── src/services/api-real.js (Real)   │
└──────────────┬──────────────────────────┘
               │ HTTP/REST API
               ↓
┌─────────────────────────────────────────┐
│         Backend (FastAPI)               │
│         http://localhost:8000           │
│                                         │
│  ├── GET /api/apps                     │
│  ├── GET /api/apps/{id}                │
│  ├── POST /api/apps                    │
│  ├── PUT /api/apps/{id}                │
│  ├── DELETE /api/apps/{id}             │
│  ├── GET /api/categories               │
│  ├── GET /api/search?q={query}         │
│  └── GET /api/featured                 │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│         MySQL Database                  │
│         rustore2                        │
│                                         │
│  ├── apps (приложения)                 │
│  └── screenshots (скриншоты)           │
└─────────────────────────────────────────┘
```

---

## 🚀 Быстрый старт

### 1. Запуск Backend

```bash
cd backend/ars

# Активировать виртуальное окружение
.\venv\Scripts\Activate.ps1   # Windows
source venv/bin/activate       # Linux/Mac

# Запустить сервер
python -m uvicorn main.main:app --reload --host 0.0.0.0 --port 8000

# Или используя готовый скрипт
.\start.bat   # Windows
./start.sh    # Linux/Mac
```

**Backend будет доступен:** http://localhost:8000  
**API документация:** http://localhost:8000/docs

### 2. Запуск Frontend

```bash
cd app

# Установить зависимости (если еще не установлены)
yarn install

# Запустить dev сервер
yarn dev
```

**Frontend будет доступен:** http://localhost:5173

### 3. Проверка подключения

Откройте http://localhost:8000/health - должно вернуть:
```json
{
  "status": "ok",
  "service": "appstore-api"
}
```

---

## 📡 API Endpoints

### Получение данных (GET)

| Endpoint | Метод | Описание | Параметры |
|----------|-------|----------|-----------|
| `/api/apps` | GET | Все приложения | `?category=Финансы` (опционально) |
| `/api/apps/{id}` | GET | Приложение по ID | `id` в URL |
| `/api/featured` | GET | Топ-3 по рейтингу | - |
| `/api/categories` | GET | Список категорий | - |
| `/api/search` | GET | Поиск приложений | `?q=поисковый_запрос` |

### Создание и изменение (POST/PUT/DELETE)

| Endpoint | Метод | Описание | Body |
|----------|-------|----------|------|
| `/api/apps` | POST | Создать приложение | JSON с данными приложения |
| `/api/apps/{id}` | PUT | Обновить приложение | JSON с обновляемыми полями |
| `/api/apps/{id}` | DELETE | Удалить приложение | - |

### Примеры запросов

**Получить все приложения:**
```bash
curl http://localhost:8000/api/apps
```

**Получить приложение по ID:**
```bash
curl http://localhost:8000/api/apps/1
```

**Поиск:**
```bash
curl "http://localhost:8000/api/search?q=банк"
```

**Создать приложение:**
```bash
curl -X POST http://localhost:8000/api/apps \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Новое приложение",
    "developer": "Разработчик",
    "category": "Финансы",
    "age_rating": "12+",
    "description": "Описание приложения",
    "icon_url": "/icons/app.webp",
    "rating": 4.5,
    "version": "1.0.0",
    "size": "50 МБ",
    "price": "Бесплатно",
    "screenshots": [
      "/screenshots/app_1.webp",
      "/screenshots/app_2.webp"
    ]
  }'
```

---

## 📊 Структура данных

### Backend Response (от API)

```typescript
{
  id: number;
  name: string;
  developer: string;
  category: string;
  age_rating: string;
  description: string;
  icon_url: string | null;
  rating: number;
  version: string | null;
  size: string | null;
  price: string;
  last_update: string | null;  // ISO date
  screenshots: string[];        // массив URL
}
```

### Frontend Format (после адаптации)

```typescript
{
  id: number;
  name: string;
  category: string;
  rating: number;
  reviews: number;         // Генерируется
  downloads: string;       // Генерируется
  icon: string;
  size: string;
  version: string;
  lastUpdate: string;
  ageRating: string;
  developer: string;
  color: string;           // Генерируется градиент
  screenshots: string[];
  description: string;
  price: string;
  features: string[];      // Генерируется из описания
  requirements: {          // Генерируется
    os: string;
    ram: string;
    storage: string;
    internet: string;
  }
}
```

### Адаптация данных

Файл `app/src/services/api-real.js` содержит функцию `adaptAppData()`, которая:
- Преобразует `icon_url` → `icon`
- Преобразует `age_rating` → `ageRating`
- Генерирует `reviews`, `downloads`, `color`
- Генерирует `features` из описания
- Генерирует `requirements`

---

## 🔄 Переключение с Mock на Real API

### Вариант 1: Переименовать файлы (рекомендуется)

```bash
cd app/src/services

# Сохранить старый mock API
mv api.js api-mock-backup.js

# Использовать реальный API
mv api-real.js api.js
```

### Вариант 2: Изменить импорты

В компонентах замените:
```javascript
// Было
import { getAllApps } from '../../services/api';

// Стало
import { getAllApps } from '../../services/api-real';
```

### Вариант 3: Условное подключение

Создайте `app/src/services/api-config.js`:
```javascript
// Переключатель режима
const USE_REAL_API = true;

export * from USE_REAL_API 
  ? './api-real' 
  : './api';
```

Затем в компонентах:
```javascript
import { getAllApps } from '../../services/api-config';
```

---

## ⚙️ CRUD операции

### Создание приложения

```javascript
import { createApp } from '../../services/api-real';

const newApp = {
  name: "Мое приложение",
  developer: "Компания",
  category: "Финансы",
  age_rating: "12+",
  description: "Подробное описание приложения...",
  icon_url: "/icons/myapp.webp",
  rating: 4.5,
  version: "1.0.0",
  size: "75 МБ",
  price: "Бесплатно",
  screenshots: [
    "/screenshots/myapp_1.webp",
    "/screenshots/myapp_2.webp",
    "/screenshots/myapp_3.webp"
  ]
};

const result = await createApp(newApp);
if (result.success) {
  console.log("Приложение создано:", result.data);
} else {
  console.error("Ошибка:", result.error);
}
```

### Обновление приложения

```javascript
import { updateApp } from '../../services/api-real';

const updates = {
  rating: 4.8,
  version: "1.1.0",
  description: "Новое описание"
};

const result = await updateApp(1, updates);
```

### Удаление приложения

```javascript
import { deleteApp } from '../../services/api-real';

const result = await deleteApp(1);
if (result.success) {
  console.log("Удалено:", result.message);
}
```

---

## 🧪 Тестирование

### Проверка Backend

```bash
# Health check
curl http://localhost:8000/health

# Список приложений
curl http://localhost:8000/api/apps

# API документация
open http://localhost:8000/docs
```

### Проверка Frontend

1. Откройте http://localhost:5173
2. Откройте DevTools → Network
3. Проверьте что запросы идут на http://localhost:8000
4. Проверьте что нет CORS ошибок

### Проверка CORS

CORS уже настроен в backend (`config.py`):
```python
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]
```

---

## 🐛 Troubleshooting

### Backend не запускается

**Проблема:** `Access denied for user 'root'@'localhost'`

**Решение:**
```python
# Исправьте в backend/ars/main/config.py
DATABASE_URL = "mysql+mysqlconnector://root:ВАШ_ПАРОЛЬ@127.0.0.1:3306/rustore2"
```

### CORS ошибки

**Проблема:** `Access to fetch at 'http://localhost:8000/api/apps' has been blocked by CORS`

**Решение:**
1. Убедитесь что backend запущен
2. Проверьте `CORS_ORIGINS` в `backend/ars/main/config.py`
3. Добавьте порт вашего frontend в список

### Статические файлы не загружаются

**Проблема:** 404 на `/icons/` или `/screenshots/`

**Решение:**
1. Убедитесь что файлы есть в `backend/ars/static/`
2. Проверьте пути в `backend/ars/main/config.py`
3. Перезапустите backend

### Frontend не видит данные

**Проблема:** Пустой список приложений

**Решение:**
1. Откройте DevTools → Console
2. Проверьте ошибки API
3. Проверьте что backend запущен
4. Проверьте что в БД есть данные

---

## 📝 Структура проекта после интеграции

```
alliance/
├── app/                          # Frontend
│   └── src/
│       └── services/
│           ├── api.js           # Mock API (старый)
│           └── api-real.js      # Real API (новый) ⭐
│
├── backend/ars/                  # Backend
│   ├── main/
│   │   ├── main.py              # API endpoints (расширенный) ⭐
│   │   ├── config.py            # Конфигурация
│   │   ├── database.py          # БД подключение
│   │   ├── models.py            # SQLAlchemy модели
│   │   ├── schemas.py           # Pydantic схемы (расширенный) ⭐
│   │   └── seed.py              # Заполнение БД
│   ├── static/
│   │   ├── icons/               # 9 иконок (.webp)
│   │   └── screenshots/         # 27 скриншотов (.webp)
│   └── README.md
│
└── INTEGRATION_GUIDE.md          # Эта документация ⭐
```

---

## ✅ Чеклист интеграции

- [ ] Backend запущен на http://localhost:8000
- [ ] Frontend запущен на http://localhost:5173
- [ ] MySQL база данных создана и заполнена
- [ ] CORS настроен правильно
- [ ] Файл `api-real.js` создан
- [ ] Проверены все endpoints в Swagger (http://localhost:8000/docs)
- [ ] Тестовые запросы выполняются успешно
- [ ] Статические файлы загружаются
- [ ] Frontend отображает реальные данные

---

## 🎯 Дальнейшие шаги

1. **Добавить аутентификацию:** JWT токены для защиты CRUD операций
2. **Добавить таблицу отзывов:** Реальные отзывы пользователей
3. **Добавить загрузку файлов:** Endpoint для загрузки иконок и скриншотов
4. **Добавить пагинацию:** Для больших списков приложений
5. **Добавить кэширование:** Redis для ускорения запросов
6. **Добавить админ панель:** React компонент для управления приложениями

---

## 📚 Полезные ссылки

- **Backend API Docs:** http://localhost:8000/docs
- **Backend Health:** http://localhost:8000/health
- **Frontend:** http://localhost:5173
- **MySQL:** `mysql -u root -p rustore2`

---

Made with ❤️ for Alliance Project


