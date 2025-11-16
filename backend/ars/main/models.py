"""
SQLAlchemy модели для базы данных
"""
from sqlalchemy import Column, Integer, String, Float, Text, Date, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base


class AppDB(Base):
    """
    Модель приложения в базе данных
    """
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
    """
    Модель скриншота приложения в базе данных
    """
    __tablename__ = "screenshots"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    app_id = Column(Integer, ForeignKey("apps.id", ondelete="CASCADE"))
    image_url = Column(String(255), nullable=False)

    app = relationship("AppDB", back_populates="screenshots")

