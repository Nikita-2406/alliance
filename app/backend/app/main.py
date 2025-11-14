from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .database import SessionLocal, engine, Base
from . import  crud, schemas
from .config import settings
from typing import List


# create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="App Reviews API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.FRONTEND_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# helper to format date similar to frontend expectation
def format_date(dt):
    if not dt:
        return ""
    return dt.strftime("%Y-%m-%d %H:%M")  # можно поменять формат

@app.get("/api/apps/{app_id}/reviews", response_model=List[schemas.ReviewOut])
def read_reviews(app_id: str, db: Session = Depends(get_db)):
    reviews = crud.get_reviews_for_app(db, app_id)
    # map to response format (date field)
    out = []
    for r in reviews:
        out.append({
            "id": r.id,
            "app_id": r.app_id,
            "author": r.author,
            "text": r.text,
            "likes": r.likes,
            "date": format_date(r.created_at)
        })
    return out

@app.post("/api/apps/{app_id}/reviews", response_model=schemas.ReviewOut)
def create_review(app_id: str, review_in: schemas.ReviewCreate, db: Session = Depends(get_db)):
    created = crud.create_review(db, app_id, review_in)
    return {
        "id": created.id,
        "app_id": created.app_id,
        "author": created.author,
        "text": created.text,
        "likes": created.likes,
        "date": format_date(created.created_at)
    }

@app.post("/api/reviews/{review_id}/like")
def like_review(review_id: int, db: Session = Depends(get_db)):
    review = crud.increment_like(db, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    return {"likes": review.likes}
