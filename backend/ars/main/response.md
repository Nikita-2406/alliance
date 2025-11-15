Базовый url:

http://localhost:8000

Список всех Endpoints:

Главная страница:

GET /

{
  "message": "Добро пожаловать в Rustore API",
  "status": "ok"
}

GET /health

{
  "status": "ok",
  "service": "appstore-api"
}

ПОЛУЧИТЬ ПРИЛОЖЕНИЯ:

GET /api/apps

Query params: category (для выбора категорий)

Пример:

GET /api/apps
GET /api/apps?category=Финансы
GET /api/apps?category=Игры

Response:

[
  {
    "id": 1,
    "name": "Сбербанк Онлайн",
    "developer": "ПАО Сбербанк",
    "category": "Финансы",
    "age_rating": "6+",
    "description": "Банковское приложение для управления счетами",
    "icon_url": "/icons/sber.png",
    "rating": 4.5,
    "version": "12.24.0",
    "size": "185 МБ",
    "price": "Бесплатно",
    "last_update": "2024-01-15",
    "screenshots": [
      "/screenshots/sber_1.jpg",
      "/screenshots/sber_2.jpg",
      "/screenshots/sber_3.jpg"
    ]
  }
]


GET /api/apps/{id}
Возвращает детальную информацию о конкретном приложении


GET /api/categories

Response:

[
  "Финансы",
  "Игры", 
  "Государственные",
  "Транспорт",
  "Инструменты"
]

GET /api/search

Всегда используется query params 'q'

Пример:
GET /api/search?q=банк
GET /api/search?q=такси
GET /api/search?q=игра



GET /api/featured

(Возвращает 3 приложения с высоким рейтингом) ( да , пока что 3)


(я хз, вроде с ними все норм)
Скриншоты:

GET /screenshots/{filename}

Иконки:

GET /icons/{filename}  




React компонент для загрузки приложений

// Загрузка всех приложений
const response = await fetch('http://localhost:8000/api/apps');
const apps = await response.json();

// Загрузка с фильтром по категории
const response = await fetch('http://localhost:8000/api/apps?category=Финансы');
const financeApps = await response.json();

// Поиск приложений
const response = await fetch('http://localhost:8000/api/search?q=банк');
const searchResults = await response.json();

// Загрузка изображения
<img src="http://localhost:8000/screenshots/sber_1.jpg" alt="Сбербанк" />


Получение категорий:

const response = await fetch('http://localhost:8000/api/categories');
const categories = await response.json();
// ['Финансы', 'Игры', 'Государственные', ...]



прочее:
документация (swagger) -- http://localhost:8000/docs


