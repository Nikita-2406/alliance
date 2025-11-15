"""
FastAPI приложение для Rustore API
"""
from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import List, Optional
from contextlib import asynccontextmanager
import os

from .config import (
    logger, 
    SCREENSHOTS_DIR, 
    ICONS_DIR, 
    CORS_ORIGINS,
    check_static_files
)
from .database import get_db, create_tables, SessionLocal
from .models import AppDB, ScreenshotDB
from .schemas import App, AppCreate, AppUpdate, MessageResponse
from .seed import seed_data


# Проверка статических файлов при запуске
check_static_files()


# Lifespan manager
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Управление жизненным циклом приложения
    """
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
    allow_origins=CORS_ORIGINS,
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
    """Корневой endpoint"""
    return {"message": "Добро пожаловать в Rustore API", "status": "ok"}


@app.get("/health")
async def health_check():
    """Health check endpoint"""
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
        "screenshots_dir": SCREENSHOTS_DIR,
        "screenshots_exists": os.path.exists(SCREENSHOTS_DIR),
        "screenshots_files": screenshots_files,
        "icons_dir": ICONS_DIR,
        "icons_exists": os.path.exists(ICONS_DIR),
        "icons_files": icons_files,
        "test_urls": {
            "sber_screenshot": "http://localhost:8000/screenshots/sber_1.webp",
            "tbank_screenshot": "http://localhost:8000/screenshots/tbank_1.webp",
            "sber_icon": "http://localhost:8000/icons/sber.webp"
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


@app.post("/api/apps", response_model=App, status_code=201)
async def create_app(app_data: AppCreate, db: Session = Depends(get_db)):
    """Создать новое приложение"""
    try:
        # Извлекаем скриншоты из входных данных
        screenshots_data = app_data.screenshots
        app_dict = app_data.model_dump(exclude={"screenshots"})
        
        # Создаем приложение
        db_app = AppDB(**app_dict)
        db.add(db_app)
        db.flush()  # Получаем ID приложения

        # Добавляем скриншоты
        for screenshot_url in screenshots_data:
            db_screenshot = ScreenshotDB(image_url=screenshot_url, app_id=db_app.id)
            db.add(db_screenshot)

        db.commit()
        db.refresh(db_app)

        # Формируем ответ
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

        logger.info(f"✅ Created new app: {db_app.name} (ID: {db_app.id})")
        return App(**app_dict)

    except Exception as e:
        db.rollback()
        logger.error(f"Error creating app: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.put("/api/apps/{app_id}", response_model=App)
async def update_app(app_id: int, app_data: AppUpdate, db: Session = Depends(get_db)):
    """Обновить существующее приложение"""
    try:
        db_app = db.query(AppDB).filter(AppDB.id == app_id).first()
        if not db_app:
            raise HTTPException(status_code=404, detail="App not found")

        # Обновляем только переданные поля
        update_data = app_data.model_dump(exclude_unset=True, exclude={"screenshots"})
        for field, value in update_data.items():
            setattr(db_app, field, value)

        # Обновляем скриншоты если переданы
        if app_data.screenshots is not None:
            # Удаляем старые скриншоты
            db.query(ScreenshotDB).filter(ScreenshotDB.app_id == app_id).delete()
            
            # Добавляем новые
            for screenshot_url in app_data.screenshots:
                db_screenshot = ScreenshotDB(image_url=screenshot_url, app_id=app_id)
                db.add(db_screenshot)

        db.commit()
        db.refresh(db_app)

        # Формируем ответ
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

        logger.info(f"✅ Updated app: {db_app.name} (ID: {db_app.id})")
        return App(**app_dict)

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating app: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.delete("/api/apps/{app_id}", response_model=MessageResponse)
async def delete_app(app_id: int, db: Session = Depends(get_db)):
    """Удалить приложение"""
    try:
        db_app = db.query(AppDB).filter(AppDB.id == app_id).first()
        if not db_app:
            raise HTTPException(status_code=404, detail="App not found")

        app_name = db_app.name
        db.delete(db_app)
        db.commit()

        logger.info(f"✅ Deleted app: {app_name} (ID: {app_id})")
        return MessageResponse(message=f"App '{app_name}' successfully deleted")

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting app: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
