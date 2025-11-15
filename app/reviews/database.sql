CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    app_id INTEGER NOT NULL,
    author VARCHAR(100) NOT NULL,
    text TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    rating INTEGER DEFAULT 0,
    vk_user_id BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reviews_app_id ON reviews(app_id);
CREATE INDEX IF NOT EXISTS idx_reviews_vk_user_id ON reviews(vk_user_id);

CREATE TABLE IF NOT EXISTS app_ratings (
    app_id INTEGER PRIMARY KEY,
    average_rating DECIMAL(3,2) NOT NULL,
    total_reviews INTEGER NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);