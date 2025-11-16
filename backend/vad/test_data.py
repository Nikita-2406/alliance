import pymysql
from config import Config

def init_test_data():
    connection = pymysql.connect(
        host=Config.MYSQL_HOST,
        user=Config.MYSQL_USER,
        password=Config.MYSQL_PASSWORD,
        database=Config.MYSQL_DB,
        port=Config.MYSQL_PORT,
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor
    )

    try:
        with connection.cursor() as cursor:
            # Очищаем таблицы
            cursor.execute("DELETE FROM reviews")
            cursor.execute("DELETE FROM user_downloads")
            cursor.execute("DELETE FROM user_favorites")
            cursor.execute("DELETE FROM apps")
            cursor.execute("DELETE FROM users")

            # Добавляем тестовые приложения
            test_apps = [
                {
                    'name': 'Telegram Messenger',
                    'description': 'Быстрый и безопасный мессенджер',
                    'category': 'Communication',
                    'icon': '/icons/telegram.png',
                    'featured': True,
                    'top_week': True,
                    'downloads_count': 1000000
                },
                {
                    'name': 'Spotify Music',
                    'description': 'Стриминговый сервис музыки',
                    'category': 'Music',
                    'icon': '/icons/spotify.png',
                    'featured': True,
                    'top_week': False,
                    'downloads_count': 500000
                },
                {
                    'name': 'Adobe Photoshop',
                    'description': 'Редактор фотографий',
                    'category': 'Photo',
                    'icon': '/icons/photoshop.png',
                    'featured': False,
                    'top_week': True,
                    'downloads_count': 750000
                }
            ]

            for app in test_apps:
                cursor.execute("""
                    INSERT INTO apps (name, description, category, icon, featured, top_week, downloads_count)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """, (app['name'], app['description'], app['category'], app['icon'], 
                      app['featured'], app['top_week'], app['downloads_count']))

            # Добавляем тестового пользователя (для тестов без VK)
            cursor.execute("""
                INSERT INTO users (vk_id, first_name, last_name, avatar)
                VALUES (%s, %s, %s, %s)
            """, (123456, 'Иван', 'Тестовый', 'https://example.com/avatar.jpg'))

            connection.commit()
            print("✅ Тестовые данные успешно добавлены")

    except Exception as e:
        print(f"❌ Ошибка: {e}")
        connection.rollback()
    finally:
        connection.close()

if __name__ == '__main__':
    init_test_data()