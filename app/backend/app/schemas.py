from pydantic import BaseModel


class ReviewCreate(BaseModel):
    author: str
    text: str

class ReviewOut(BaseModel):
    id: int
    app_id: str
    author: str
    text: str
    likes: int
    date: str  # formatted date for frontend

    class Config:
        orm_mode = True
