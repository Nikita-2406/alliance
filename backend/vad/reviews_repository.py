from database import Database
from models import ReviewCreate, ReviewUpdate
from typing import List

class ReviewsRepository:
    def __init__(self):
        self.db = Database()

    def create_review(self, review: ReviewCreate) -> int:
        connection = self.db.get_connection()
        cursor = connection.cursor()
        
        try:
            query = """
            INSERT INTO reviews (app_id, vk_id, nickname, description, stars)
            VALUES (%s, %s, %s, %s, %s)
            """
            values = (review.app_id, review.vk_id, review.nickname, 
                     review.description, review.stars)
            
            cursor.execute(query, values)
            connection.commit()
            return cursor.lastrowid
        except Exception as e:
            connection.rollback()
            raise e
        finally:
            cursor.close()

    def get_reviews_by_app(self, app_id: int) -> List[dict]:
        connection = self.db.get_connection()
        cursor = connection.cursor(dictionary=True)
        
        try:
            query = """
            SELECT id, app_id, vk_id, nickname, description, stars, created_at
            FROM reviews 
            WHERE app_id = %s
            ORDER BY created_at DESC
            """
            cursor.execute(query, (app_id,))
            return cursor.fetchall()
        finally:
            cursor.close()

    def get_reviews_by_vk_id(self, vk_id: int) -> List[dict]:
        connection = self.db.get_connection()
        cursor = connection.cursor(dictionary=True)
        
        try:
            query = """
            SELECT id, app_id, vk_id, nickname, description, stars, created_at
            FROM reviews 
            WHERE vk_id = %s
            ORDER BY created_at DESC
            """
            cursor.execute(query, (vk_id,))
            return cursor.fetchall()
        finally:
            cursor.close()

    def update_review(self, review_id: int, vk_id: int, review_update: ReviewUpdate) -> bool:
        connection = self.db.get_connection()
        cursor = connection.cursor()
        
        try:
            # Проверяем, что отзыв принадлежит пользователю
            check_query = "SELECT id FROM reviews WHERE id = %s AND vk_id = %s"
            cursor.execute(check_query, (review_id, vk_id))
            if not cursor.fetchone():
                return False

            # Формируем запрос для обновления
            update_fields = []
            values = []
            
            if review_update.nickname is not None:
                update_fields.append("nickname = %s")
                values.append(review_update.nickname)
            if review_update.description is not None:
                update_fields.append("description = %s")
                values.append(review_update.description)
            if review_update.stars is not None:
                update_fields.append("stars = %s")
                values.append(review_update.stars)
            
            if not update_fields:
                return True
                
            values.extend([review_id, vk_id])
            query = f"""
            UPDATE reviews 
            SET {', '.join(update_fields)}
            WHERE id = %s AND vk_id = %s
            """
            
            cursor.execute(query, values)
            connection.commit()
            return cursor.rowcount > 0
        except Exception as e:
            connection.rollback()
            raise e
        finally:
            cursor.close()

    def delete_review(self, review_id: int, vk_id: int) -> bool:
        connection = self.db.get_connection()
        cursor = connection.cursor()
        
        try:
            query = "DELETE FROM reviews WHERE id = %s AND vk_id = %s"
            cursor.execute(query, (review_id, vk_id))
            connection.commit()
            return cursor.rowcount > 0
        except Exception as e:
            connection.rollback()
            raise e
        finally:
            cursor.close()

    def get_review_stats(self, app_id: int) -> dict:
        connection = self.db.get_connection()
        cursor = connection.cursor(dictionary=True)
        
        try:
            query = """
            SELECT 
                COUNT(*) as total_reviews,
                AVG(stars) as average_rating,
                COUNT(CASE WHEN stars = 5 THEN 1 END) as five_stars,
                COUNT(CASE WHEN stars = 4 THEN 1 END) as four_stars,
                COUNT(CASE WHEN stars = 3 THEN 1 END) as three_stars,
                COUNT(CASE WHEN stars = 2 THEN 1 END) as two_stars,
                COUNT(CASE WHEN stars = 1 THEN 1 END) as one_star
            FROM reviews 
            WHERE app_id = %s
            """
            cursor.execute(query, (app_id,))
            result = cursor.fetchone()
            
            if result and result['average_rating']:
                result['average_rating'] = round(float(result['average_rating']), 2)
            
            return result
        finally:
            cursor.close()