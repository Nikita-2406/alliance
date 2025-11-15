# init_database.py (исправлённый)
import os
import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv

load_dotenv()

HOST = os.getenv("DB_HOST", "localhost")
USER = os.getenv("DB_USER", "root")
PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "app_store")

def init_database():
    try:
        conn = mysql.connector.connect(host=HOST, user=USER, password=PASSWORD)
        cursor = conn.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{DB_NAME}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
        cursor.execute(f"USE `{DB_NAME}`")

        create_table_query = """
        CREATE TABLE IF NOT EXISTS reviews (
            id INT AUTO_INCREMENT PRIMARY KEY,
            app_id INT NOT NULL,
            vk_id BIGINT NOT NULL,
            nickname VARCHAR(100) NOT NULL,
            description TEXT NOT NULL,
            stars TINYINT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """
        cursor.execute(create_table_query)

        # Создаём индекс, если его ещё нет
        cursor.execute("""
            SELECT COUNT(1) index_exists
            FROM information_schema.statistics
            WHERE table_schema = %s AND table_name = 'reviews' AND index_name = 'idx_app_id'
        """, (DB_NAME,))
        if cursor.fetchone()[0] == 0:
            cursor.execute("CREATE INDEX idx_app_id ON reviews(app_id)")

        cursor.execute("""
            SELECT COUNT(1) index_exists
            FROM information_schema.statistics
            WHERE table_schema = %s AND table_name = 'reviews' AND index_name = 'idx_vk_id'
        """, (DB_NAME,))
        if cursor.fetchone()[0] == 0:
            cursor.execute("CREATE INDEX idx_vk_id ON reviews(vk_id)")

        conn.commit()
        print("Database and table created successfully!")
    except Error as e:
        print("Error:", e)
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

if __name__ == "__main__":
    init_database()
