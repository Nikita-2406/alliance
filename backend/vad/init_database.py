import pymysql
from config import Config

def init_database():
    connection = pymysql.connect(
        host=Config.MYSQL_HOST,
        user=Config.MYSQL_USER,
        password=Config.MYSQL_PASSWORD,
        port=Config.MYSQL_PORT,
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor
    )

    try:
        with connection.cursor() as cursor:
            # Создаем базу данных если не существует
            cursor.execute("CREATE DATABASE IF NOT EXISTS reviews_db")
            cursor.execute("USE reviews_db")
            
            # Создаем таблицу отзывов
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS reviews (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    app_id INT NOT NULL,
                    author VARCHAR(100) NOT NULL,
                    text TEXT NOT NULL,
                    likes INT DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX app_id_index (app_id)
                )
            """)
        connection.commit()
        print("✅ База данных и таблицы успешно созданы")
    finally:
        connection.close()

if __name__ == '__main__':
    init_database()