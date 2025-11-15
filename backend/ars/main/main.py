from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import create_engine, Column, Integer, String, Float, Text, Date, ForeignKey
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

# Создаем папки если их нет
os.makedirs("static/screenshots", exist_ok=True)
os.makedirs("static/icons", exist_ok=True)

# MySQL connection string
DATABASE_URL = "mysql+mysqlconnector://root:SQLpassforCon5@127.0.0.1:3306/rustore"

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
            screenshots = ["/screenshots/screenshot1.jpg", "/screenshots/screenshot2.jpg",
                           "/screenshots/screenshot3.jpg"]
            for screenshot_url in screenshots:
                db_screenshot = ScreenshotDB(image_url=screenshot_url, app_id=db_app.id)
                db.add(db_screenshot)

        db.commit()
        logger.info("✅ Sample data inserted")

        # Исправляем пути скриншотов
        fix_screenshot_paths(db)

    except Exception as e:
        db.rollback()
        logger.error(f"❌ Data seeding failed: {e}")
        raise

def fix_screenshot_paths(db: Session):
    """Исправление путей скриншотов для уникальности"""
    try:
        # Удаляем все текущие скриншоты
        db.query(ScreenshotDB).delete()

        # Уникальные пути для каждого приложения
        screenshot_paths = {
            1: ["/screenshots/sber_1.jpg", "/screenshots/sber_2.jpg", "/screenshots/sber_3.jpg"],
            2: ["/screenshots/tinkoff_1.jpg", "/screenshots/tinkoff_2.jpg", "/screenshots/tinkoff_3.jpg"],
            3: ["/screenshots/clash_1.jpg", "/screenshots/clash_2.jpg", "/screenshots/clash_3.jpg"],
            4: ["/screenshots/gosuslugi_1.jpg", "/screenshots/gosuslugi_2.jpg", "/screenshots/gosuslugi_3.jpg"],
            5: ["/screenshots/yandex_go_1.jpg", "/screenshots/yandex_go_2.jpg", "/screenshots/yandex_go_3.jpg"],
            6: ["/screenshots/calculator_1.jpg", "/screenshots/calculator_2.jpg", "/screenshots/calculator_3.jpg"],
        }

        for app_id, paths in screenshot_paths.items():
            for path in paths:
                db_screenshot = ScreenshotDB(image_url=path, app_id=app_id)
                db.add(db_screenshot)

        db.commit()
        logger.info("✅ Screenshot paths fixed in database")

    except Exception as e:
        db.rollback()
        logger.error(f"❌ Screenshot paths fix failed: {e}")
        raise

# Lifespan manager вместо on_event
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
        logger.info("🌐 React frontend can connect from: http://localhost:3000")

    except Exception as e:
        logger.error(f"❌ Startup failed: {e}")
        raise

    yield  # Здесь приложение работает

    # Shutdown (если нужно)
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
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Статические файлы (только если папки существуют)
if os.path.exists("static/screenshots"):
    app.mount("/screenshots", StaticFiles(directory="static/screenshots"), name="screenshots")
if os.path.exists("static/icons"):
    app.mount("/icons", StaticFiles(directory="static/icons"), name="icons")

# API endpoints
@app.get("/")
async def root():
    return {"message": "Добро пожаловать в Rustore API", "status": "ok"}

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "appstore-api"}

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
