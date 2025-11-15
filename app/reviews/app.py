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

def update_app_rating(app_id):
    """Обновление среднего рейтинга приложения"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            # Вычисляем средний рейтинг
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

@app.route('/api/apps/<int:app_id>/reviews', methods=['POST'])
def add_review(app_id):
    data = request.get_json()
    logger.info(f"Добавление отзыва для app_id: {app_id}, данные: {data}")
    
    if not data or not data.get('author') or not data.get('text'):
        return jsonify({'error': 'Author and text are required'}), 400

    # Валидация рейтинга
    rating = data.get('rating', 0)
    if not rating or rating < 1 or rating > 5:
        return jsonify({'error': 'Rating must be between 1 and 5'}), 400

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            sql = """
                INSERT INTO reviews (app_id, author, text, likes, rating, vk_user_id) 
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING *
            """
            cursor.execute(sql, (app_id, data['author'], data['text'], 0, 
                               rating, data.get('vk_user_id')))
            new_review = cursor.fetchone()
            conn.commit()
            
            # Обновляем средний рейтинг приложения
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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)