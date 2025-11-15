from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from models import ReviewCreate, ReviewUpdate
from reviews_repository import ReviewsRepository

app = FastAPI(title="App Store Reviews API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_reviews_repository():
    return ReviewsRepository()

@app.post("/reviews/", response_model=dict)
async def create_review(
    review: ReviewCreate,
    repo: ReviewsRepository = Depends(get_reviews_repository)
):
    try:
        review_id = repo.create_review(review)
        return {"id": review_id, "message": "Review created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/reviews/app/{app_id}")
async def get_reviews_by_app(
    app_id: int,
    repo: ReviewsRepository = Depends(get_reviews_repository)
):
    try:
        reviews = repo.get_reviews_by_app(app_id)
        return {"app_id": app_id, "reviews": reviews}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/reviews/user/{vk_id}")
async def get_reviews_by_user(
    vk_id: int,
    repo: ReviewsRepository = Depends(get_reviews_repository)
):
    try:
        reviews = repo.get_reviews_by_vk_id(vk_id)
        return {"vk_id": vk_id, "reviews": reviews}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/reviews/{review_id}")
async def update_review(
    review_id: int,
    vk_id: int,
    review_update: ReviewUpdate,
    repo: ReviewsRepository = Depends(get_reviews_repository)
):
    try:
        success = repo.update_review(review_id, vk_id, review_update)
        if not success:
            raise HTTPException(status_code=404, detail="Review not found or access denied")
        return {"message": "Review updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/reviews/{review_id}")
async def delete_review(
    review_id: int,
    vk_id: int,
    repo: ReviewsRepository = Depends(get_reviews_repository)
):
    try:
        success = repo.delete_review(review_id, vk_id)
        if not success:
            raise HTTPException(status_code=404, detail="Review not found or access denied")
        return {"message": "Review deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/reviews/stats/{app_id}")
async def get_review_stats(
    app_id: int,
    repo: ReviewsRepository = Depends(get_reviews_repository)
):
    try:
        stats = repo.get_review_stats(app_id)
        return {"app_id": app_id, "stats": stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "App Store Reviews API"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)