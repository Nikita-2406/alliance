"""
Настройка подключения к базе данных
"""
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from .config import DATABASE_URL, logger

# Создание engine и session
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """
    Dependency для получения сессии БД в FastAPI endpoints
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """
    Создание всех таблиц в базе данных
    """
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Database tables created")

        # Проверяем создание таблиц
        with engine.connect() as conn:
            result = conn.execute(text("SHOW TABLES"))
            tables = [row[0] for row in result]
            logger.info(f"📊 Database tables: {tables}")

    except Exception as e:
        logger.error(f"❌ Table creation failed: {e}")
        raise

