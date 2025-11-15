import os

class Config:
    POSTGRES_HOST = os.getenv('POSTGRES_HOST', 'db')
    POSTGRES_USER = os.getenv('POSTGRES_USER', 'postgres')
    POSTGRES_PASSWORD = os.getenv('POSTGRES_PASSWORD', 'password')
    POSTGRES_DB = os.getenv('POSTGRES_DB', 'reviews_db')
    POSTGRES_PORT = int(os.getenv('POSTGRES_PORT', 5432))