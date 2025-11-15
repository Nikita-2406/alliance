from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
from config import Config
import logging
import requests
import jwt
import datetime
from functools import wraps

# Настройка логирования
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config['SECRET_KEY'] = Config.JWT_SECRET_KEY
CORS(app, origins=["http://localhost:5173", "http://127.0.0.1:5173"], supports_credentials=True)

def get_db_connection():
    try:
        connection = psycopg2.connect(
            host=Config.POSTGRES_HOST,
            user=Config.POSTGRES_USER,
            password=Config.POSTGRES_PASSWORD,
            database=Config.POSTGRES_DB,
            port=Config.POSTGRES_PORT,
            cursor_factory=RealDictCursor
        )
        logger.info("✅ Успешное подключение к базе данных PostgreSQL")
        return connection
    except Exception as e:
        logger.error(f"❌ Ошибка подключения к базе данных: {str(e)}")
        raise

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        try:
            token = token.replace('Bearer ', '')
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            conn = get_db_connection()
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM users WHERE id = %s", (data['user_id'],))
                current_user = cursor.fetchone()
            conn.close()
        except Exception as e:
            logger.error(f"Token error: {str(e)}")
            return jsonify({'error': 'Token is invalid'}), 401
        
        return f(current_user, *args, **kwargs)
    return decorated

def update_app_rating(app_id):
    """Обновление среднего рейтинга приложения"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT AVG(rating) as avg_rating, COUNT(*) as total 
                FROM reviews 
                WHERE app_id = %s AND rating > 0
            """, (app_id,))
            result = cursor.fetchone()
            
            if result and result['avg_rating']:
                cursor.execute("""
                    INSERT INTO app_ratings (app_id, average_rating, total_reviews) 
                    VALUES (%s, %s, %s)
                    ON CONFLICT (app_id) DO UPDATE 
                    SET average_rating = EXCLUDED.average_rating, 
                        total_reviews = EXCLUDED.total_reviews, 
                        last_updated = CURRENT_TIMESTAMP
                """, (app_id, result['avg_rating'], result['total']))
                conn.commit()
                
            return result
    except Exception as e:
        logger.error(f"Ошибка обновления рейтинга: {str(e)}")
        conn.rollback()
    finally:
        conn.close()

@app.route('/api/auth/vk', methods=['POST'])
def vk_auth():
    data = request.get_json()
    vk_token = data.get('access_token')
    vk_user_id = data.get('user_id')
    
    if not vk_token or not vk_user_id:
        return jsonify({'error': 'Missing token or user_id'}), 400
    
    # Получаем информацию о пользователе из VK API
    vk_api_url = f"https://api.vk.com/method/users.get"
    params = {
        'user_ids': vk_user_id,
        'access_token': vk_token,
        'v': '5.131',
        'fields': 'photo_200,email'
    }
    
    try:
        response = requests.get(vk_api_url, params=params)
        vk_data = response.json()
        
        if 'error' in vk_data:
            return jsonify({'error': 'VK API error', 'details': vk_data['error']}), 400
        
        user_data = vk_data['response'][0]
        
        conn = get_db_connection()
        with conn.cursor() as cursor:
            # Проверяем, существует ли пользователь
            cursor.execute("SELECT * FROM users WHERE vk_id = %s", (vk_user_id,))
            user = cursor.fetchone()
            
            if not user:
                # Создаем нового пользователя
                cursor.execute("""
                    INSERT INTO users (vk_id, username, email, avatar_url) 
                    VALUES (%s, %s, %s, %s)
                    RETURNING *
                """, (
                    vk_user_id,
                    f"{user_data.get('first_name', '')} {user_data.get('last_name', '')}",
                    data.get('email'),
                    user_data.get('photo_200')
                ))
                user = cursor.fetchone()
                conn.commit()
                logger.info(f"Создан новый пользователь: {user['id']}")
            else:
                logger.info(f"Пользователь найден: {user['id']}")
            
            # Создаем JWT токен
            token = jwt.encode({
                'user_id': user['id'],
                'exp': datetime.datetime.utcnow() + datetime.timedelta(days=30)
            }, app.config['SECRET_KEY'], algorithm="HS256")
            
            return jsonify({
                'success': True,
                'token': token,
                'user': {
                    'id': user['id'],
                    'username': user['username'],
                    'email': user['email'],
                    'avatar_url': user['avatar_url'],
                    'member_since': user['member_since'].strftime('%B %Y')
                }
            })
            
    except Exception as e:
        logger.error(f"Ошибка аутентификации VK: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    """Получение данных профиля"""
    try:
        # Получаем статистику пользователя
        conn = get_db_connection()
        with conn.cursor() as cursor:
            # Количество скачанных приложений
            cursor.execute("SELECT COUNT(*) as count FROM downloads WHERE user_id = %s", (current_user['id'],))
            downloads_count = cursor.fetchone()['count']
            
            # Количество отзывов
            cursor.execute("SELECT COUNT(*) as count FROM reviews WHERE user_id = %s", (current_user['id'],))
            reviews_count = cursor.fetchone()['count']
            
            # Количество избранных
            cursor.execute("SELECT COUNT(*) as count FROM favorites WHERE user_id = %s", (current_user['id'],))
            favorites_count = cursor.fetchone()['count']
        
        return jsonify({
            'success': True,
            'user': {
                'id': current_user['id'],
                'name': current_user['username'],
                'email': current_user['email'],
                'avatar': current_user['avatar_url'] or '👤',
                'memberSince': current_user['member_since'].strftime('%B %Y')
            },
            'stats': {
                'downloads': downloads_count,
                'reviews': reviews_count,
                'favorites': favorites_count
            }
        })
        
    except Exception as e:
        logger.error(f"Ошибка получения профиля: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/profile/downloads', methods=['GET'])
@token_required
def get_user_downloads(current_user):
    """Получение скачанных приложений пользователя"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT d.*, a.name, a.icon, a.version, a.size 
                FROM downloads d 
                LEFT JOIN apps a ON d.app_id = a.id 
                WHERE d.user_id = %s 
                ORDER BY d.download_date DESC
            """, (current_user['id'],))
            downloads = cursor.fetchall()
            
            result = []
            for download in downloads:
                result.append({
                    'id': download['app_id'],
                    'name': download['name'],
                    'icon': download['icon'] or '📱',
                    'version': download['version'] or '1.0',
                    'size': download['size'] or '0 MB',
                    'downloadDate': download['download_date'].strftime('%d.%m.%Y')
                })
            
            return jsonify({'success': True, 'data': result})
    except Exception as e:
        logger.error(f"Ошибка получения загрузок: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/profile/favorites', methods=['GET'])
@token_required
def get_user_favorites(current_user):
    """Получение избранных приложений пользователя"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT f.*, a.name, a.icon, a.category, a.rating 
                FROM favorites f 
                LEFT JOIN apps a ON f.app_id = a.id 
                WHERE f.user_id = %s 
                ORDER BY f.added_date DESC
            """, (current_user['id'],))
            favorites = cursor.fetchall()
            
            result = []
            for fav in favorites:
                result.append({
                    'id': fav['app_id'],
                    'name': fav['name'],
                    'icon': fav['icon'] or '❤️',
                    'category': fav['category'] or 'App',
                    'rating': float(fav['rating']) if fav['rating'] else 0
                })
            
            return jsonify({'success': True, 'data': result})
    except Exception as e:
        logger.error(f"Ошибка получения избранного: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/profile/reviews', methods=['GET'])
@token_required
def get_user_reviews(current_user):
    """Получение отзывов пользователя"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT r.*, a.name as app_name, a.icon as app_icon 
                FROM reviews r 
                LEFT JOIN apps a ON r.app_id = a.id 
                WHERE r.user_id = %s 
                ORDER BY r.created_at DESC
            """, (current_user['id'],))
            reviews = cursor.fetchall()
            
            result = []
            for review in reviews:
                result.append({
                    'id': review['id'],
                    'appId': review['app_id'],
                    'appName': review['app_name'],
                    'appIcon': review['app_icon'] or '📱',
                    'rating': review['rating'],
                    'comment': review['text'],
                    'date': review['created_at'].strftime('%d.%m.%Y')
                })
            
            return jsonify({'success': True, 'data': result})
    except Exception as e:
        logger.error(f"Ошибка получения отзывов: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/apps/<int:app_id>/download', methods=['POST'])
@token_required
def download_app(current_user, app_id):
    """Добавление приложения в загрузки пользователя"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                INSERT INTO downloads (user_id, app_id) 
                VALUES (%s, %s)
                ON CONFLICT (user_id, app_id) DO UPDATE 
                SET download_date = CURRENT_TIMESTAMP
                RETURNING *
            """, (current_user['id'], app_id))
            conn.commit()
            
            return jsonify({'success': True, 'message': 'App downloaded'})
    except Exception as e:
        conn.rollback()
        logger.error(f"Ошибка добавления загрузки: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/apps/<int:app_id>/favorite', methods=['POST'])
@token_required
def toggle_favorite(current_user, app_id):
    """Добавление/удаление приложения из избранного"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            # Проверяем, есть ли уже в избранном
            cursor.execute("SELECT * FROM favorites WHERE user_id = %s AND app_id = %s", 
                         (current_user['id'], app_id))
            existing = cursor.fetchone()
            
            if existing:
                cursor.execute("DELETE FROM favorites WHERE user_id = %s AND app_id = %s", 
                             (current_user['id'], app_id))
                action = 'removed'
            else:
                cursor.execute("INSERT INTO favorites (user_id, app_id) VALUES (%s, %s)", 
                             (current_user['id'], app_id))
                action = 'added'
            
            conn.commit()
            return jsonify({'success': True, 'action': action})
    except Exception as e:
        conn.rollback()
        logger.error(f"Ошибка избранного: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# Обновляем существующие эндпоинты для работы с пользователями
@app.route('/api/apps/<int:app_id>/reviews', methods=['POST'])
@token_required
def add_review(current_user, app_id):
    data = request.get_json()
    logger.info(f"Добавление отзыва для app_id: {app_id}, пользователь: {current_user['id']}")
    
    if not data or not data.get('text'):
        return jsonify({'error': 'Text is required'}), 400

    rating = data.get('rating', 0)
    if not rating or rating < 1 or rating > 5:
        return jsonify({'error': 'Rating must be between 1 and 5'}), 400

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            sql = """
                INSERT INTO reviews (app_id, user_id, text, rating) 
                VALUES (%s, %s, %s, %s)
                RETURNING *
            """
            cursor.execute(sql, (app_id, current_user['id'], data['text'], rating))
            new_review = cursor.fetchone()
            conn.commit()
            
            update_app_rating(app_id)
            new_review['date'] = new_review['created_at'].strftime('%d.%m.%Y')
            
            logger.info(f"Отзыв успешно добавлен с ID: {new_review['id']}")
            return jsonify(new_review), 201
    except Exception as e:
        conn.rollback()
        logger.error(f"Ошибка при добавлении отзыва: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/health', methods=['GET'])
def health_check():
    try:
        conn = get_db_connection()
        conn.close()
        return jsonify({'status': 'healthy', 'database': 'connected'})
    except Exception as e:
        return jsonify({'status': 'unhealthy', 'database': 'disconnected', 'error': str(e)}), 500

@app.route('/api/apps/<int:app_id>/reviews', methods=['GET'])
def get_reviews(app_id):
    logger.info(f"Получение отзывов для app_id: {app_id}")
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT r.*, u.username, u.avatar_url 
                FROM reviews r 
                LEFT JOIN users u ON r.user_id = u.id 
                WHERE r.app_id = %s 
                ORDER BY r.created_at DESC
            """, (app_id,))
            reviews = cursor.fetchall()
            for review in reviews:
                review['date'] = review['created_at'].strftime('%d.%m.%Y')
                review['author'] = review['username']
            logger.info(f"Найдено {len(reviews)} отзывов")
            return jsonify(reviews)
    except Exception as e:
        logger.error(f"Ошибка при получении отзывов: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/reviews/<int:review_id>/like', methods=['POST'])
def like_review(review_id):
    logger.info(f"Лайк отзыва: {review_id}")
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("UPDATE reviews SET likes = likes + 1 WHERE id = %s RETURNING likes", (review_id,))
            result = cursor.fetchone()
            conn.commit()
            
            if result:
                return jsonify({'likes': result['likes']})
            else:
                return jsonify({'error': 'Review not found'}), 404
    except Exception as e:
        conn.rollback()
        logger.error(f"Ошибка при лайке: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/apps/<int:app_id>/rating', methods=['GET'])
def get_app_rating(app_id):
    """Получение среднего рейтинга приложения"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM app_ratings WHERE app_id = %s", (app_id,))
            rating_data = cursor.fetchone()
            
            if not rating_data:
                return jsonify({'average_rating': 0, 'total_reviews': 0})
            
            return jsonify({
                'average_rating': float(rating_data['average_rating']),
                'total_reviews': rating_data['total_reviews']
            })
    except Exception as e:
        logger.error(f"Ошибка при получении рейтинга: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/dev/token', methods=['GET'])
def dev_token():
    """Эндпоинт для разработки - создает тестового пользователя и возвращает токен"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            # Создаем тестового пользователя
            cursor.execute("""
                INSERT INTO users (vk_id, username, email, avatar_url) 
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (vk_id) DO UPDATE SET
                username = EXCLUDED.username,
                email = EXCLUDED.email,
                avatar_url = EXCLUDED.avatar_url
                RETURNING *
            """, (123456789, 'Тестовый Пользователь', 'test@example.com', 'https://example.com/avatar.jpg'))
            
            user = cursor.fetchone()
            conn.commit()
            
            # Создаем JWT токен
            token = jwt.encode({
                'user_id': user['id'],
                'exp': datetime.datetime.utcnow() + datetime.timedelta(days=30)
            }, app.config['SECRET_KEY'], algorithm="HS256")
            
            return jsonify({
                'success': True,
                'token': token,
                'user': {
                    'id': user['id'],
                    'username': user['username'],
                    'email': user['email'],
                    'avatar_url': user['avatar_url'],
                    'member_since': user['member_since'].strftime('%B %Y')
                }
            })
            
    except Exception as e:
        logger.error(f"Ошибка создания тестового токена: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)