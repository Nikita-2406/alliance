from flask import Flask, request, jsonify
from flask_cors import CORS
import pymysql
from config import Config

app = Flask(__name__)
CORS(app)  # Разрешить CORS для всех доменов

def get_db_connection():
    return pymysql.connect(
        host=Config.MYSQL_HOST,
        user=Config.MYSQL_USER,
        password=Config.MYSQL_PASSWORD,
        database=Config.MYSQL_DB,
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor
    )

# Маршрут для получения отзывов по app_id
@app.route('/api/apps/<int:app_id>/reviews', methods=['GET'])
def get_reviews(app_id):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM reviews WHERE app_id = %s ORDER BY created_at DESC", (app_id,))
            reviews = cursor.fetchall()
            # Преобразуем дату в строку для JSON
            for review in reviews:
                review['date'] = review['created_at'].strftime('%d.%m.%Y')
            return jsonify(reviews)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# Маршрут для добавления отзыва
@app.route('/api/apps/<int:app_id>/reviews', methods=['POST'])
def add_review(app_id):
    data = request.get_json()
    if not data or not data.get('author') or not data.get('text'):
        return jsonify({'error': 'Author and text are required'}), 400

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            sql = "INSERT INTO reviews (app_id, author, text, likes) VALUES (%s, %s, %s, %s)"
            cursor.execute(sql, (app_id, data['author'], data['text'], 0))
            conn.commit()
            # Получаем ID вставленной записи
            review_id = cursor.lastrowid
            # Теперь получаем полную запись
            cursor.execute("SELECT * FROM reviews WHERE id = %s", (review_id,))
            new_review = cursor.fetchone()
            new_review['date'] = new_review['created_at'].strftime('%d.%m.%Y')
            return jsonify(new_review), 201
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# Маршрут для лайка отзыва
@app.route('/api/reviews/<int:review_id>/like', methods=['POST'])
def like_review(review_id):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            # Увеличиваем количество лайков на 1
            cursor.execute("UPDATE reviews SET likes = likes + 1 WHERE id = %s", (review_id,))
            conn.commit()
            # Получаем обновленное количество лайков
            cursor.execute("SELECT likes FROM reviews WHERE id = %s", (review_id,))
            result = cursor.fetchone()
            if result:
                return jsonify({'likes': result['likes']})
            else:
                return jsonify({'error': 'Review not found'}), 404
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)