import os
from dotenv import load_dotenv

# Загружаем переменные из .env файла
load_dotenv()

class Config:
    MYSQL_HOST = os.getenv('MYSQL_HOST', 'localhost')
    MYSQL_USER = os.getenv('MYSQL_USER', 'root')
    MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD', '')
    MYSQL_DB = os.getenv('MYSQL_DB', 'reviews_db')
    MYSQL_PORT = int(os.getenv('MYSQL_PORT', 3306))
    
    # VK OAuth configuration
    VK_CLIENT_ID = os.getenv('VK_CLIENT_ID', 'your_vk_app_id')
    VK_CLIENT_SECRET = os.getenv('VK_CLIENT_SECRET', 'your_vk_secure_key')
    VK_REDIRECT_URI = os.getenv('VK_REDIRECT_URI', 'http://localhost:5173/auth/callback')