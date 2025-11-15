from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import create_engine, Column, Integer, String, Float, Text, Date, ForeignKey, text
from sqlalchemy.orm import sessionmaker, Session, relationship, declarative_base
from sqlalchemy.exc import SQLAlchemyError
from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import date
import logging
import os
from contextlib import asynccontextmanager

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Получаем абсолютные пути
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SCREENSHOTS_DIR = os.path.join(BASE_DIR, "static", "screenshots")
ICONS_DIR = os.path.join(BASE_DIR, "static", "icons")

# Создаем папки если их нет
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)
os.makedirs(ICONS_DIR, exist_ok=True)


def create_test_files():
    """Только проверяет существование файлов, НЕ создает ничего"""

    # Проверяем иконки (только логируем)
    icon_files = ["sber.png", "tinkoff.png", "clash_royale.png", "gosuslugi.png", "yandex_go.png", "calculator.png"]
    existing_icons = []

    for filename in icon_files:
        file_path = os.path.join(ICONS_DIR, filename)
        if os.path.exists(file_path):
            existing_icons.append(filename)

    if existing_icons:
        logger.info(f"🎯 Found {len(existing_icons)} icon files: {existing_icons}")
    else:
        logger.warning("⚠️ No icon files found (recommended to add real icons)")

    # Проверяем скриншоты (только логируем)
    if os.path.exists(SCREENSHOTS_DIR):
        files = os.listdir(SCREENSHOTS_DIR)
        jpg_files = [f for f in files if f.endswith('.jpg')]
        logger.info(f"📸 Found {len(jpg_files)} screenshot files in directory")

        # Проверяем нужные файлы
        required_files = [
            "sber_1.jpg", "sber_2.jpg", "sber_3.jpg",
            "tinkoff_1.jpg", "tinkoff_2.jpg", "tinkoff_3.jpg",
            "clash_1.jpg", "clash_2.jpg", "clash_3.jpg",
            "gosuslugi_1.jpg", "gosuslugi_2.jpg", "gosuslugi_3.jpg",
            "yandex_go_1.jpg", "yandex_go_2.jpg", "yandex_go_3.jpg",
            "calculator_1.jpg", "calculator_2.jpg", "calculator_3.jpg"
        ]

        existing_files = [f for f in required_files if f in files]
        missing_files = [f for f in required_files if f not in files]

        if existing_files:
            logger.info(f"✅ Found {len(existing_files)} required screenshot files")
        if missing_files:
            logger.warning(f"⚠️ Missing {len(missing_files)} files: {missing_files}")

    logger.info("✅ File check completed")


create_test_files()

# Логируем пути
logger.info(f"📁 BASE_DIR: {BASE_DIR}")
logger.info(f"📁 SCREENSHOTS_DIR: {SCREENSHOTS_DIR}")
logger.info(f"📁 SCREENSHOTS_DIR exists: {os.path.exists(SCREENSHOTS_DIR)}")

if os.path.exists(SCREENSHOTS_DIR):
    files = os.listdir(SCREENSHOTS_DIR)
    logger.info(f"📸 Found {len(files)} files in screenshots directory")

# MySQL connection string
DATABASE_URL = "mysql+mysqlconnector://root:SQLpassforCon5@127.0.0.1:3306/rustore2"

# Создание движка и сессии
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# Модели базы данных
class AppDB(Base):
    __tablename__ = "apps"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    developer = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False)
    age_rating = Column(String(10), nullable=False)
    description = Column(Text, nullable=False)
    icon_url = Column(String(255))
    rating = Column(Float, default=0.0)
    version = Column(String(20))
    size = Column(String(20))
    price = Column(String(50), default='Бесплатно')
    last_update = Column(Date)

    screenshots = relationship("ScreenshotDB", back_populates="app", cascade="all, delete-orphan")


class ScreenshotDB(Base):
    __tablename__ = "screenshots"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    app_id = Column(Integer, ForeignKey("apps.id", ondelete="CASCADE"))
    image_url = Column(String(255), nullable=False)

    app = relationship("AppDB", back_populates="screenshots")


# Pydantic модели
class Screenshot(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    image_url: str
    app_id: int


class App(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    developer: str
    category: str
    age_rating: str
    description: str
    icon_url: Optional[str] = None
    rating: Optional[float] = 0.0
    version: Optional[str] = None
    size: Optional[str] = None
    price: Optional[str] = 'Бесплатно'
    last_update: Optional[date] = None
    screenshots: List[str] = []


# Создание таблиц
def create_tables():
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Database tables created")

        # Проверяем создание таблиц (исправленный синтаксис)
        with engine.connect() as conn:
            result = conn.execute(text("SHOW TABLES"))
            tables = [row[0] for row in result]
            logger.info(f"📊 Database tables: {tables}")

    except Exception as e:
        logger.error(f"❌ Table creation failed: {e}")
        raise


# Зависимость для получения сессии БД
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Функции для работы с БД
def seed_data(db: Session):
    """Заполнение базы данных тестовыми данными"""
    try:
        # Проверяем, есть ли уже данные
        count = db.query(AppDB).count()
        if count > 0:
            logger.info("✅ Database already has data")
            return

        # Тестовые приложения
        sample_apps = [
            {
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
                "last_update": date.today()
            },
            {
                "name": "Тинькофф",
                "developer": "Тинькофф Банк",
                "category": "Финансы",
                "age_rating": "6+",
                "description": "Мобильный банк для платежей и переводов",
                "icon_url": "/icons/tinkoff.png",
                "rating": 4.7,
                "version": "5.31.0",
                "size": "210 МБ",
                "price": "Бесплатно",
                "last_update": date.today()
            },
            {
                "name": "Clash Royale",
                "developer": "Supercell",
                "category": "Игры",
                "age_rating": "0+",
                "description": "Карточная стратегия в реальном времени",
                "icon_url": "/icons/clash_royale.png",
                "rating": 4.8,
                "version": "1.5.3",
                "size": "285 МБ",
                "price": "Бесплатно",
                "last_update": date.today()
            },
            {
                "name": "Госуслуги",
                "developer": "Энвижн Груп",
                "category": "Государственные",
                "age_rating": "16+",
                "description": "Портал государственных услуг",
                "icon_url": "/icons/gosuslugi.png",
                "rating": 4.3,
                "version": "4.15.2",
                "size": "320 МБ",
                "price": "Бесплатно",
                "last_update": date.today()
            },
            {
                "name": "Яндекс Go",
                "developer": "Яндекс",
                "category": "Транспорт",
                "age_rating": "6+",
                "description": "Заказ такси и доставки еды",
                "icon_url": "/icons/yandex_go.png",
                "rating": 4.6,
                "version": "7.45.0",
                "size": "275 МБ",
                "price": "Бесплатно",
                "last_update": date.today()
            },
            {
                "name": "Калькулятор+",
                "developer": "Tools Pro",
                "category": "Инструменты",
                "age_rating": "0+",
                "description": "Научный калькулятор",
                "icon_url": "/icons/calculator.png",
                "rating": 4.4,
                "version": "3.2.1",
                "size": "35 МБ",
                "price": "Бесплатно",
                "last_update": date.today()
            }
        ]

        # Добавляем приложения
        for app_data in sample_apps:
            db_app = AppDB(**app_data)
            db.add(db_app)
            db.flush()  # Получаем ID без коммита

            # Добавляем скриншоты
            app_name_lower = app_data["name"].lower().replace(" ", "_").replace("+", "plus").replace("-", "_")
            screenshots = [
                f"/screenshots/{app_name_lower}_1.jpg",
                f"/screenshots/{app_name_lower}_2.jpg",
                f"/screenshots/{app_name_lower}_3.jpg"
            ]

            for screenshot_url in screenshots:
                db_screenshot = ScreenshotDB(image_url=screenshot_url, app_id=db_app.id)
                db.add(db_screenshot)

        db.commit()
        logger.info("✅ Sample data inserted")

    except Exception as e:
        db.rollback()
        logger.error(f"❌ Data seeding failed: {e}")
        raise


# Lifespan manager
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    try:
        create_tables()
        db = SessionLocal()
        seed_data(db)
        db.close()

        logger.info("🚀 Server started on http://localhost:8000")
        logger.info("📱 API available:")
        logger.info("   GET /api/apps - list all apps")
        logger.info("   GET /api/apps/{id} - get app details")
        logger.info("   GET /api/categories - list categories")
        logger.info("   GET /api/apps?category=Финансы - filter by category")
        logger.info("   GET /api/search?q=банк - search apps")
        logger.info("   GET /api/featured - featured apps")
        logger.info("   GET /health - health check")
        logger.info("   GET /debug/files - debug static files")
        logger.info("🌐 React frontend can connect from: http://localhost:3000")

        # Информация о статических файлах
        logger.info("📁 Static files info:")
        logger.info(f"   Screenshots: http://localhost:8000/screenshots/")
        logger.info(f"   Icons: http://localhost:8000/icons/")

        if os.path.exists(SCREENSHOTS_DIR):
            files = os.listdir(SCREENSHOTS_DIR)
            logger.info(f"   Found {len(files)} screenshot files")

        if os.path.exists(ICONS_DIR):
            files = os.listdir(ICONS_DIR)
            logger.info(f"   Found {len(files)} icon files")

    except Exception as e:
        logger.error(f"❌ Startup failed: {e}")
        raise

    yield  # Здесь приложение работает

    # Shutdown
    logger.info("🛑 Server shutting down...")


# Инициализация приложения с lifespan
app = FastAPI(
    title="Rustore API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",    # дефолт реакт
        "http://localhost:5273",    #никита реакт
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5273",
        "http://localhost:*",       # Любой порт localhost
        "http://127.0.0.1:*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Статические файлы с абсолютными путями
app.mount("/screenshots", StaticFiles(directory=SCREENSHOTS_DIR), name="screenshots")
app.mount("/icons", StaticFiles(directory=ICONS_DIR), name="icons")

logger.info("✅ Static files mounted successfully")


# API endpoints
@app.get("/")
async def root():
    return {"message": "Добро пожаловать в Rustore API", "status": "ok"}


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "appstore-api"}


@app.get("/debug/files")
async def debug_files():
    """Диагностика статических файлов"""
    screenshots_files = []
    icons_files = []

    if os.path.exists(SCREENSHOTS_DIR):
        screenshots_files = os.listdir(SCREENSHOTS_DIR)

    if os.path.exists(ICONS_DIR):
        icons_files = os.listdir(ICONS_DIR)

    return {
        "base_dir": BASE_DIR,
        "screenshots_dir": SCREENSHOTS_DIR,
        "screenshots_exists": os.path.exists(SCREENSHOTS_DIR),
        "screenshots_files": screenshots_files,
        "icons_dir": ICONS_DIR,
        "icons_exists": os.path.exists(ICONS_DIR),
        "icons_files": icons_files,
        "test_urls": {
            "sber_screenshot": "http://localhost:8000/screenshots/sber_1.jpg",
            "tinkoff_screenshot": "http://localhost:8000/screenshots/tinkoff_1.jpg",
            "sber_icon": "http://localhost:8000/icons/sber.png"
        }
    }


@app.get("/api/apps", response_model=List[App])
async def get_apps(
        category: Optional[str] = Query(None),
        db: Session = Depends(get_db)
):
    """Получить список приложений с возможностью фильтрации по категории"""
    try:
        query = db.query(AppDB)
        if category:
            query = query.filter(AppDB.category == category)

        db_apps = query.all()
        apps = []

        for db_app in db_apps:
            app_dict = {
                "id": db_app.id,
                "name": db_app.name,
                "developer": db_app.developer,
                "category": db_app.category,
                "age_rating": db_app.age_rating,
                "description": db_app.description,
                "icon_url": db_app.icon_url,
                "rating": db_app.rating,
                "version": db_app.version,
                "size": db_app.size,
                "price": db_app.price,
                "last_update": db_app.last_update,
                "screenshots": [s.image_url for s in db_app.screenshots]
            }
            apps.append(App(**app_dict))

        return apps

    except Exception as e:
        logger.error(f"Error getting apps: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.get("/api/apps/{app_id}", response_model=App)
async def get_app_by_id(app_id: int, db: Session = Depends(get_db)):
    """Получить приложение по ID"""
    try:
        db_app = db.query(AppDB).filter(AppDB.id == app_id).first()
        if not db_app:
            raise HTTPException(status_code=404, detail="App not found")

        app_dict = {
            "id": db_app.id,
            "name": db_app.name,
            "developer": db_app.developer,
            "category": db_app.category,
            "age_rating": db_app.age_rating,
            "description": db_app.description,
            "icon_url": db_app.icon_url,
            "rating": db_app.rating,
            "version": db_app.version,
            "size": db_app.size,
            "price": db_app.price,
            "last_update": db_app.last_update,
            "screenshots": [s.image_url for s in db_app.screenshots]
        }

        return App(**app_dict)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting app by ID: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.get("/api/categories")
async def get_categories(db: Session = Depends(get_db)):
    """Получить список всех категорий"""
    try:
        categories = db.query(AppDB.category).distinct().all()
        return [category[0] for category in categories]

    except Exception as e:
        logger.error(f"Error getting categories: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.get("/api/search", response_model=List[App])
async def search_apps(
        q: str = Query(..., description="Поисковый запрос"),
        db: Session = Depends(get_db)
):
    """Поиск приложений по названию и описанию"""
    try:
        if not q:
            return []

        search_query = f"%{q.lower()}%"
        db_apps = db.query(AppDB).filter(
            AppDB.name.ilike(search_query) |
            AppDB.description.ilike(search_query)
        ).all()

        apps = []
        for db_app in db_apps:
            app_dict = {
                "id": db_app.id,
                "name": db_app.name,
                "developer": db_app.developer,
                "category": db_app.category,
                "age_rating": db_app.age_rating,
                "description": db_app.description,
                "icon_url": db_app.icon_url,
                "rating": db_app.rating,
                "version": db_app.version,
                "size": db_app.size,
                "price": db_app.price,
                "last_update": db_app.last_update,
                "screenshots": [s.image_url for s in db_app.screenshots]
            }
            apps.append(App(**app_dict))

        return apps

    except Exception as e:
        logger.error(f"Error searching apps: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.get("/api/featured", response_model=List[App])
async def get_featured_apps(db: Session = Depends(get_db)):
    """Получить избранные приложения (с наивысшим рейтингом)"""
    try:
        db_apps = db.query(AppDB).order_by(AppDB.rating.desc()).limit(3).all()

        apps = []
        for db_app in db_apps:
            app_dict = {
                "id": db_app.id,
                "name": db_app.name,
                "developer": db_app.developer,
                "category": db_app.category,
                "age_rating": db_app.age_rating,
                "description": db_app.description,
                "icon_url": db_app.icon_url,
                "rating": db_app.rating,
                "version": db_app.version,
                "size": db_app.size,
                "price": db_app.price,
                "last_update": db_app.last_update,
                "screenshots": [s.image_url for s in db_app.screenshots]
            }
            apps.append(App(**app_dict))

        return apps

    except Exception as e:
        logger.error(f"Error getting featured apps: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)