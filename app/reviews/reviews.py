from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Конфигурация базы данных
db_config = {
    'host': 'localhost',
    'user': 'your_username',
    'password': 'your_password',
    'database': 'app_reviews_db'
}

def get_db_connection():
    return mysql.connector.connect(**db_config)

# Создание таблиц при запуске
def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS apps (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS reviews (
            id INT AUTO_INCREMENT PRIMARY KEY,
            app_id INT NOT NULL,
            author VARCHAR(255) NOT NULL,
            text TEXT NOT NULL,
            likes INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (app_id) REFERENCES apps(id)
        )
    ''')
    
    # Добавляем тестовые данные
    cursor.execute("SELECT COUNT(*) FROM apps")
    if cursor.fetchone()[0] == 0:
        cursor.execute('''
            INSERT INTO apps (name, description) VALUES 
            ('PhotoMaster Pro', 'Профессиональное приложение для редактирования фотографий'),
            ('VideoEditor Plus', 'Мощный видеоредактор для профессионалов')
        ''')
    
    conn.commit()
    cursor.close()
    conn.close()

# API для получения отзывов
@app.route('/api/apps/<int:app_id>/reviews', methods=['GET'])
def get_reviews(app_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute('''
            SELECT id, author, text, likes, created_at 
            FROM reviews 
            WHERE app_id = %s 
            ORDER BY created_at DESC
        ''', (app_id,))
        
        reviews = cursor.fetchall()
        
        # Форматируем дату для фронтенда
        for review in reviews:
            review['date'] = format_date(review['created_at'])
        
        cursor.close()
        conn.close()
        
        return jsonify(reviews)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# API для добавления отзыва
@app.route('/api/apps/<int:app_id>/reviews', methods=['POST'])
def add_review(app_id):
    try:
        data = request.get_json()
        author = data.get('author')
        text = data.get('text')
        
        if not author or not text:
            return jsonify({'error': 'Автор и текст обязательны'}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO reviews (app_id, author, text, likes) 
            VALUES (%s, %s, %s, %s)
        ''', (app_id, author, text, 0))
        
        conn.commit()
        review_id = cursor.lastrowid
        
        # Получаем созданный отзыв
        cursor.execute('''
            SELECT id, author, text, likes, created_at 
            FROM reviews 
            WHERE id = %s
        ''', (review_id,))
        
        new_review = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'id': new_review[0],
            'author': new_review[1],
            'text': new_review[2],
            'likes': new_review[3],
            'date': 'Только что'
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# API для лайков
@app.route('/api/reviews/<int:review_id>/like', methods=['POST'])
def like_review(review_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE reviews 
            SET likes = likes + 1 
            WHERE id = %s
        ''', (review_id,))
        
        conn.commit()
        
        cursor.execute('SELECT likes FROM reviews WHERE id = %s', (review_id,))
        new_likes = cursor.fetchone()[0]
        
        cursor.close()
        conn.close()
        
        return jsonify({'likes': new_likes})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Вспомогательная функция для форматирования даты
def format_date(db_date):
    if isinstance(db_date, str):
        db_date = datetime.fromisoformat(db_date.replace('Z', '+00:00'))
    
    now = datetime.now()
    diff = now - db_date
    
    if diff.days == 0:
        return "Сегодня"
    elif diff.days == 1:
        return "Вчера"
    elif diff.days < 7:
        return f"{diff.days} дня назад"
    elif diff.days < 30:
        weeks = diff.days // 7
        return f"{weeks} неделю назад" if weeks == 1 else f"{weeks} недель назад"
    else:
        return db_date.strftime("%d.%m.%Y")

if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000)