import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    POSTGRES_HOST = os.getenv('POSTGRES_HOST', 'db')
    POSTGRES_USER = os.getenv('POSTGRES_USER', 'postgres')
    POSTGRES_PASSWORD = os.getenv('POSTGRES_PASSWORD', 'password')
    POSTGRES_DB = os.getenv('POSTGRES_DB', 'reviews_db')
    POSTGRES_PORT = int(os.getenv('POSTGRES_PORT', 5432))
    VK_APP_ID = os.getenv('VK_APP_ID', '')
    VK_SECRET_KEY = os.getenv('VK_SECRET_KEY', '')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your-secret-key-here')