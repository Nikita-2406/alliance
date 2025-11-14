from sqlalchemy import Column, Integer, String, Text, DateTime, func
from .database import Base

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    app_id = Column(String(100), index=True)  # хранить id приложения (как строку)
    author = Column(String(100), nullable=False)
    text = Column(Text, nullable=False)
    likes = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
