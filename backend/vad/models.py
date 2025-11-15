from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ReviewBase(BaseModel):
    app_id: int = Field(..., description="ID приложения")
    nickname: str = Field(..., max_length=100, description="Никнейм пользователя")
    description: str = Field(..., description="Текст отзыва")
    stars: int = Field(..., ge=1, le=5, description="Количество звезд (1-5)")

class ReviewCreate(ReviewBase):
    vk_id: int = Field(..., description="VK ID пользователя")

class Review(BaseModel):
    id: int
    vk_id: int
    created_at: datetime

    class Config:
        orm_mode = True

class ReviewUpdate(BaseModel):
    nickname: Optional[str] = None
    description: Optional[str] = None
    stars: Optional[int] = Field(None, ge=1, le=5)