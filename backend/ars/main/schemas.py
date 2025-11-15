"""
Pydantic схемы для валидации API запросов и ответов
"""
from pydantic import BaseModel, ConfigDict, Field
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


class AppCreate(BaseModel):
    """
    Схема для создания приложения
    """
    name: str = Field(..., min_length=1, max_length=100)
    developer: str = Field(..., min_length=1, max_length=100)
    category: str = Field(..., min_length=1, max_length=50)
    age_rating: str = Field(..., min_length=1, max_length=10)
    description: str = Field(..., min_length=10)
    icon_url: Optional[str] = None
    rating: Optional[float] = Field(default=0.0, ge=0, le=5)
    version: Optional[str] = None
    size: Optional[str] = None
    price: Optional[str] = 'Бесплатно'
    last_update: Optional[date] = None
    screenshots: List[str] = []


class AppUpdate(BaseModel):
    """
    Схема для обновления приложения
    """
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    developer: Optional[str] = Field(None, min_length=1, max_length=100)
    category: Optional[str] = Field(None, min_length=1, max_length=50)
    age_rating: Optional[str] = Field(None, min_length=1, max_length=10)
    description: Optional[str] = Field(None, min_length=10)
    icon_url: Optional[str] = None
    rating: Optional[float] = Field(None, ge=0, le=5)
    version: Optional[str] = None
    size: Optional[str] = None
    price: Optional[str] = None
    last_update: Optional[date] = None
    screenshots: Optional[List[str]] = None


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


class MessageResponse(BaseModel):
    """
    Схема для простых ответов с сообщением
    """
    message: str

