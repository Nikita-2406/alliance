from flask import Flask, request, jsonify, session
from flask_cors import CORS
import pymysql
from config import Config
import logging
import requests

# Настройка логирования
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = 'jjUIcy5lz4MmoN6vbJ8u'  # Важно: заменить на случайный секретный ключ
CORS(app, origins=["http://localhost:5173", "http://127.0.0.1:5173"], supports_credentials=True)

def get_db_connection():
    try:
        connection = pymysql.connect(
            host=Config.MYSQL_HOST,
            user=Config.MYSQL_USER,
            password=Config.MYSQL_PASSWORD,
            database=Config.MYSQL_DB,
            port=Config.MYSQL_PORT,
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor,
            connect_timeout=30
        )
        logger.info("✅ Успешное подключение к базе данных")
        return connection
    except Exception as e:
        logger.error(f"❌ Ошибка подключения к базе данных: {str(e)}")
        raise

@app.route('/api/health', methods=['GET'])
def health_check():
    try:
        conn = get_db_connection()
        conn.close()
        return jsonify({'status': 'healthy', 'database': 'connected'})
    except Exception as e:
        return jsonify({'status': 'unhealthy', 'database': 'disconnected', 'error': str(e)}), 500

# Новые эндпоинты для каталога приложений
@app.route('/api/apps', methods=['GET'])
def get_apps():
    logger.info("Получение списка приложений")
    featured = request.args.get('featured') == 'true'
    top_week = request.args.get('topWeek') == 'true'
    search_query = request.args.get('search')
    
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            sql = "SELECT * FROM apps WHERE 1=1"
            params = []
            
            if featured:
                sql += " AND featured = TRUE"
            if top_week:
                sql += " AND top_week = TRUE"
            if search_query:
                sql += " AND (name LIKE %s OR category LIKE %s)"
                params.extend([f'%{search_query}%', f'%{search_query}%'])
            
            sql += " ORDER BY created_at DESC"
            cursor.execute(sql, params)
            apps = cursor.fetchall()
            
            logger.info(f"Найдено {len(apps)} приложений")
            return jsonify({'success': True, 'data': apps})
    except Exception as e:
        logger.error(f"Ошибка при получении приложений: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/apps/<int:app_id>', methods=['GET'])
def get_app_details(app_id):
    logger.info(f"Получение деталей приложения: {app_id}")
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM apps WHERE id = %s", (app_id,))
            app = cursor.fetchone()
            
            if app:
                # Получаем рейтинг приложения
                cursor.execute("""
                    SELECT AVG(rating) as avg_rating, COUNT(*) as review_count 
                    FROM reviews WHERE app_id = %s
                """, (app_id,))
                rating_data = cursor.fetchone()
                
                app['avg_rating'] = float(rating_data['avg_rating']) if rating_data['avg_rating'] else 0
                app['review_count'] = rating_data['review_count']
                
                return jsonify({'success': True, 'data': app})
            else:
                return jsonify({'success': False, 'error': 'App not found'}), 404
    except Exception as e:
        logger.error(f"Ошибка при получении приложения: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/categories', methods=['GET'])
def get_categories():
    logger.info("Получение списка категорий")
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT DISTINCT category as name FROM apps WHERE category IS NOT NULL")
            categories = cursor.fetchall()
            return jsonify({'success': True, 'data': categories})
    except Exception as e:
        logger.error(f"Ошибка при получении категорий: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/categories/<string:category_name>/apps', methods=['GET'])
def get_apps_by_category(category_name):
    logger.info(f"Получение приложений категории: {category_name}")
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM apps WHERE category = %s ORDER BY created_at DESC", (category_name,))
            apps = cursor.fetchall()
            return jsonify({'success': True, 'data': apps})
    except Exception as e:
        logger.error(f"Ошибка при получении приложений категории: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        conn.close()

# Аутентификация через VK
@app.route('/api/auth/vk', methods=['POST'])
def vk_auth():
    data = request.get_json()
    code = data.get('code')
    redirect_uri = data.get('redirect_uri')
    
    if not code:
        return jsonify({'success': False, 'error': 'Code is required'}), 400
    
    try:
        # Обмен кода на access token
        token_response = requests.get(
            'https://oauth.vk.com/access_token',
            params={
                'client_id': Config.VK_CLIENT_ID,
                'client_secret': Config.VK_CLIENT_SECRET,
                'redirect_uri': redirect_uri,
                'code': code
            }
        )
        
        token_data = token_response.json()
        
        if 'access_token' not in token_data:
            return jsonify({'success': False, 'error': 'Invalid authorization code'}), 400
        
        # Получение информации о пользователе
        user_response = requests.get(
            'https://api.vk.com/method/users.get',
            params={
                'access_token': token_data['access_token'],
                'v': '5.131',
                'fields': 'photo_200,first_name,last_name'
            }
        )
        
        user_data = user_response.json()
        
        if 'response' not in user_data:
            return jsonify({'success': False, 'error': 'Failed to get user info'}), 400
        
        user_info = user_data['response'][0]
        
        # Сохранение пользователя в БД
        conn = get_db_connection()
        with conn.cursor() as cursor:
            # Проверяем существующего пользователя
            cursor.execute(
                "SELECT * FROM users WHERE vk_id = %s", 
                (user_info['id'],)
            )
            existing_user = cursor.fetchone()
            
            if existing_user:
                user_id = existing_user['id']
                # Обновляем информацию
                cursor.execute(
                    "UPDATE users SET first_name = %s, last_name = %s, avatar = %s WHERE id = %s",
                    (user_info['first_name'], user_info['last_name'], user_info.get('photo_200'), user_id)
                )
            else:
                # Создаем нового пользователя
                cursor.execute(
                    "INSERT INTO users (vk_id, first_name, last_name, avatar) VALUES (%s, %s, %s, %s)",
                    (user_info['id'], user_info['first_name'], user_info['last_name'], user_info.get('photo_200'))
                )
                user_id = cursor.lastrowid
            
            conn.commit()
            
            # Получаем полную информацию о пользователе
            cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
            user = cursor.fetchone()
            
            # Сохраняем в сессии
            session['user_id'] = user_id
            session['user_vk_id'] = user_info['id']
            
            return jsonify({
                'success': True, 
                'data': user,
                'access_token': token_data['access_token']
            })
            
    except Exception as e:
        logger.error(f"Ошибка VK аутентификации: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'success': True, 'message': 'Logged out successfully'})

@app.route('/api/user/profile', methods=['GET'])
def get_user_profile():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'success': False, 'error': 'Not authenticated'}), 401
    
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
            user = cursor.fetchone()
            
            if user:
                return jsonify({'success': True, 'data': user})
            else:
                return jsonify({'success': False, 'error': 'User not found'}), 404
    except Exception as e:
        logger.error(f"Ошибка при получении профиля: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        conn.close()

# Обновленные эндпоинты для отзывов с рейтингом
@app.route('/api/apps/<int:app_id>/reviews', methods=['GET'])
def get_reviews(app_id):
    logger.info(f"Получение отзывов для app_id: {app_id}")
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT r.*, u.first_name, u.last_name, u.avatar 
                FROM reviews r 
                LEFT JOIN users u ON r.user_id = u.id 
                WHERE r.app_id = %s 
                ORDER BY r.created_at DESC
            """, (app_id,))
            reviews = cursor.fetchall()
            
            for review in reviews:
                review['date'] = review['created_at'].strftime('%d.%m.%Y')
                review['author'] = f"{review['first_name']} {review['last_name']}" if review['first_name'] else 'Аноним'
            
            logger.info(f"Найдено {len(reviews)} отзывов")
            return jsonify({'success': True, 'data': reviews})
    except Exception as e:
        logger.error(f"Ошибка при получении отзывов: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/apps/<int:app_id>/reviews', methods=['POST'])
def add_review(app_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'success': False, 'error': 'Authentication required'}), 401
    
    data = request.get_json()
    logger.info(f"Добавление отзыва для app_id: {app_id}, данные: {data}")
    
    if not data or not data.get('text'):
        return jsonify({'success': False, 'error': 'Text is required'}), 400
    
    rating = data.get('rating', 0)
    if not (1 <= rating <= 5):
        return jsonify({'success': False, 'error': 'Rating must be between 1 and 5'}), 400

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            # Проверяем, не оставлял ли пользователь уже отзыв
            cursor.execute(
                "SELECT id FROM reviews WHERE app_id = %s AND user_id = %s", 
                (app_id, user_id)
            )
            existing_review = cursor.fetchone()
            
            if existing_review:
                return jsonify({'success': False, 'error': 'You have already reviewed this app'}), 400
            
            sql = """
                INSERT INTO reviews (app_id, user_id, text, rating, likes) 
                VALUES (%s, %s, %s, %s, %s)
            """
            cursor.execute(sql, (app_id, user_id, data['text'], rating, 0))
            conn.commit()
            review_id = cursor.lastrowid
            
            # Получаем созданный отзыв с информацией о пользователе
            cursor.execute("""
                SELECT r.*, u.first_name, u.last_name, u.avatar 
                FROM reviews r 
                LEFT JOIN users u ON r.user_id = u.id 
                WHERE r.id = %s
            """, (review_id,))
            new_review = cursor.fetchone()
            new_review['date'] = new_review['created_at'].strftime('%d.%m.%Y')
            new_review['author'] = f"{new_review['first_name']} {new_review['last_name']}"
            
            logger.info(f"Отзыв успешно добавлен с ID: {review_id}")
            return jsonify({'success': True, 'data': new_review}), 201
    except Exception as e:
        conn.rollback()
        logger.error(f"Ошибка при добавлении отзыва: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/reviews/<int:review_id>/like', methods=['POST'])
def like_review(review_id):
    logger.info(f"Лайк отзыва: {review_id}")
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("UPDATE reviews SET likes = likes + 1 WHERE id = %s", (review_id,))
            conn.commit()
            
            cursor.execute("SELECT likes FROM reviews WHERE id = %s", (review_id,))
            result = cursor.fetchone()
            if result:
                return jsonify({'success': True, 'data': {'likes': result['likes']}})
            else:
                return jsonify({'success': False, 'error': 'Review not found'}), 404
    except Exception as e:
        conn.rollback()
        logger.error(f"Ошибка при лайке: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/apps/<int:app_id>/rating', methods=['GET'])
def get_app_rating(app_id):
    logger.info(f"Получение рейтинга для app_id: {app_id}")
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    AVG(rating) as average_rating,
                    COUNT(*) as reviews_count,
                    SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as rating_5,
                    SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as rating_4,
                    SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as rating_3,
                    SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as rating_2,
                    SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as rating_1
                FROM reviews 
                WHERE app_id = %s
            """, (app_id,))
            rating_data = cursor.fetchone()
            
            if rating_data['reviews_count'] > 0:
                result = {
                    'average_rating': float(rating_data['average_rating']),
                    'reviews_count': rating_data['reviews_count'],
                    'rating_distribution': {
                        5: rating_data['rating_5'],
                        4: rating_data['rating_4'],
                        3: rating_data['rating_3'],
                        2: rating_data['rating_2'],
                        1: rating_data['rating_1']
                    }
                }
            else:
                result = {
                    'average_rating': 0,
                    'reviews_count': 0,
                    'rating_distribution': {5:0, 4:0, 3:0, 2:0, 1:0}
                }
            
            return jsonify({'success': True, 'data': result})
    except Exception as e:
        logger.error(f"Ошибка при получении рейтинга: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        conn.close()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)