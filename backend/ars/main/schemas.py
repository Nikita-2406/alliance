"""
Pydantic схемы для валидации API запросов и ответов
"""
from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import date


class Screenshot(BaseModel):
    """
    Схема для скриншота приложения
    """
    model_config = ConfigDict(from_attributes=True)

    id: int
    image_url: str
    app_id: int


class App(BaseModel):
    """
    Схема для приложения
    """
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

