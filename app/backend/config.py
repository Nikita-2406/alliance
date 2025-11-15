import os

class Config:
    MYSQL_HOST = os.getenv('MYSQL_HOST', 'db')
    MYSQL_USER = os.getenv('MYSQL_USER', 'root')
    MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD', 'password')
    MYSQL_DB = os.getenv('MYSQL_DB', 'reviews_db')
    MYSQL_PORT = int(os.getenv('MYSQL_PORT', 3306))  # Внутри Docker сети используется порт 3306