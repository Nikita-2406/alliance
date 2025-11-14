CREATE DATABASE IF NOT EXISTS reviews_db;
USE reviews_db;

CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    app_id INT NOT NULL,
    author VARCHAR(100) NOT NULL,
    text TEXT NOT NULL,
    likes INT DEFAULT 0,
    rating INT DEFAULT 0,
    vk_user_id BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX app_id_index (app_id),
    INDEX vk_user_index (vk_user_id)
);

CREATE TABLE IF NOT EXISTS app_ratings (
    app_id INT PRIMARY KEY,
    average_rating DECIMAL(3,2) NOT NULL,
    total_reviews INT NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);