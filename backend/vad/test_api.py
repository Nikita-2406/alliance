import requests
import json

BASE_URL = "http://localhost:5000"
SESSION = requests.Session()

def print_response(response, test_name):
    print(f"\n{'='*50}")
    print(f"📋 {test_name}")
    print(f"{'='*50}")
    print(f"Status: {response.status_code}")
    try:
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2, ensure_ascii=False)}")
    except:
        print(f"Response: {response.text}")
    return data if response.status_code == 200 else None

def test_health():
    response = SESSION.get(f"{BASE_URL}/api/health")
    print_response(response, "Health Check")

def test_get_apps():
    # Все приложения
    response = SESSION.get(f"{BASE_URL}/api/apps")
    print_response(response, "Get All Apps")
    
    # Рекомендованные
    response = SESSION.get(f"{BASE_URL}/api/apps?featured=true")
    print_response(response, "Get Featured Apps")
    
    # Топ недели
    response = SESSION.get(f"{BASE_URL}/api/apps?topWeek=true")
    print_response(response, "Get Top Week Apps")
    
    # Поиск
    response = SESSION.get(f"{BASE_URL}/api/apps?search=Telegram")
    print_response(response, "Search Apps")

def test_get_app_details():
    response = SESSION.get(f"{BASE_URL}/api/apps/1")
    print_response(response, "Get App Details")

def test_categories():
    # Все категории
    response = SESSION.get(f"{BASE_URL}/api/categories")
    print_response(response, "Get Categories")
    
    # Приложения по категории
    response = SESSION.get(f"{BASE_URL}/api/categories/Communication/apps")
    print_response(response, "Get Apps by Category")

def test_reviews():
    # Получить отзывы
    response = SESSION.get(f"{BASE_URL}/api/apps/1/reviews")
    print_response(response, "Get Reviews")
    
    # Получить рейтинг
    response = SESSION.get(f"{BASE_URL}/api/apps/1/rating")
    print_response(response, "Get App Rating")

def test_vk_auth_mock():
    # Тестовый VK auth (без реального VK)
    test_data = {
        "code": "test_code",
        "redirect_uri": "http://localhost:5173/auth/callback"
    }
    response = SESSION.post(f"{BASE_URL}/api/auth/vk", json=test_data)
    print_response(response, "VK Auth (Mock)")

def test_review_operations():
    # Сначала получим список приложений
    apps_response = SESSION.get(f"{BASE_URL}/api/apps")
    if apps_response.status_code == 200:
        apps = apps_response.json().get('data', [])
        if apps:
            app_id = apps[0]['id']
            
            # Добавление отзыва (должно вернуть ошибку без авторизации)
            review_data = {
                "text": "Отличное приложение!",
                "rating": 5
            }
            response = SESSION.post(f"{BASE_URL}/api/apps/{app_id}/reviews", json=review_data)
            print_response(response, "Add Review (Unauthorized)")
            
            # Лайк отзыва
            response = SESSION.post(f"{BASE_URL}/api/reviews/1/like")
            print_response(response, "Like Review")

def test_user_endpoints():
    # Эти эндпоинты требуют авторизации
    endpoints = [
        "/api/user/downloads",
        "/api/user/favorites", 
        "/api/user/reviews",
        "/api/user/profile"
    ]
    
    for endpoint in endpoints:
        response = SESSION.get(f"{BASE_URL}{endpoint}")
        print_response(response, f"User Endpoint: {endpoint}")

def run_all_tests():
    print("🚀 Starting API Tests...")
    
    # Базовые тесты (без авторизации)
    test_health()
    test_get_apps()
    test_get_app_details()
    test_categories()
    test_reviews()
    test_review_operations()
    test_user_endpoints()
    
    # VK auth тест
    test_vk_auth_mock()

if __name__ == '__main__':
    run_all_tests()