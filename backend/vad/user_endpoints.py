from flask import jsonify, session
from app import get_db_connection

def register_user_endpoints(app):
    
    @app.route('/api/user/downloads', methods=['GET'])
    def get_user_downloads():
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'success': False, 'error': 'Not authenticated'}), 401
        
        conn = get_db_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT a.*, ud.downloaded_at 
                    FROM user_downloads ud
                    JOIN apps a ON ud.app_id = a.id
                    WHERE ud.user_id = %s
                    ORDER BY ud.downloaded_at DESC
                """, (user_id,))
                downloads = cursor.fetchall()
                return jsonify({'success': True, 'data': downloads})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500
        finally:
            conn.close()

    @app.route('/api/user/favorites', methods=['GET'])
    def get_user_favorites():
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'success': False, 'error': 'Not authenticated'}), 401
        
        conn = get_db_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT a.*, uf.added_at 
                    FROM user_favorites uf
                    JOIN apps a ON uf.app_id = a.id
                    WHERE uf.user_id = %s
                    ORDER BY uf.added_at DESC
                """, (user_id,))
                favorites = cursor.fetchall()
                return jsonify({'success': True, 'data': favorites})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500
        finally:
            conn.close()

    @app.route('/api/user/reviews', methods=['GET'])
    def get_user_reviews():
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'success': False, 'error': 'Not authenticated'}), 401
        
        conn = get_db_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT r.*, a.name as app_name, a.icon as app_icon
                    FROM reviews r
                    JOIN apps a ON r.app_id = a.id
                    WHERE r.user_id = %s
                    ORDER BY r.created_at DESC
                """, (user_id,))
                reviews = cursor.fetchall()
                
                for review in reviews:
                    review['date'] = review['created_at'].strftime('%d.%m.%Y')
                
                return jsonify({'success': True, 'data': reviews})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500
        finally:
            conn.close()