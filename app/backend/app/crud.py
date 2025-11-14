from sqlalchemy.orm import Session
from . import models

from sqlalchemy import select
from .schemas import ReviewCreate


def get_reviews_for_app(db: Session, app_id: str):
    stmt = select(models.Review).where(models.Review.app_id == app_id).order_by(models.Review.created_at.desc())
    result = db.execute(stmt).scalars().all()
    return result

def create_review(db: Session, app_id: str, review: ReviewCreate):
    db_review = models.Review(app_id=app_id, author=review.author, text=review.text)
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review

def increment_like(db: Session, review_id: int):
    stmt = select(models.Review).where(models.Review.id == review_id)
    review = db.execute(stmt).scalar_one_or_none()
    if not review:
        return None
    review.likes = review.likes + 1
    db.add(review)
    db.commit()
    db.refresh(review)
    return review
