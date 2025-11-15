"""
Скрипт для тестирования всех API endpoints
Запуск: python test_api.py
"""
import requests
import json
from datetime import date

BASE_URL = "http://localhost:8000"

def test_health():
    """Проверка health endpoint"""
    response = requests.get(f"{BASE_URL}/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    print("✅ Health check passed")

def test_get_all_apps():
    """Получение всех приложений"""
    response = requests.get(f"{BASE_URL}/api/apps")
    assert response.status_code == 200
    apps = response.json()
    assert isinstance(apps, list)
    print(f"✅ GET /api/apps - Found {len(apps)} apps")
    return apps

def test_get_app_by_id(app_id=1):
    """Получение приложения по ID"""
    response = requests.get(f"{BASE_URL}/api/apps/{app_id}")
    assert response.status_code == 200
    app = response.json()
    assert app["id"] == app_id
    print(f"✅ GET /api/apps/{app_id} - {app['name']}")
    return app

def test_get_featured():
    """Получение топ приложений"""
    response = requests.get(f"{BASE_URL}/api/featured")
    assert response.status_code == 200
    apps = response.json()
    assert len(apps) <= 3
    print(f"✅ GET /api/featured - {len(apps)} apps")

def test_get_categories():
    """Получение категорий"""
    response = requests.get(f"{BASE_URL}/api/categories")
    assert response.status_code == 200
    categories = response.json()
    assert isinstance(categories, list)
    print(f"✅ GET /api/categories - {len(categories)} categories: {', '.join(categories)}")

def test_search():
    """Поиск приложений"""
    response = requests.get(f"{BASE_URL}/api/search?q=App")
    assert response.status_code == 200
    apps = response.json()
    print(f"✅ GET /api/search?q=App - Found {len(apps)} apps")

def test_filter_by_category():
    """Фильтрация по категории"""
    response = requests.get(f"{BASE_URL}/api/apps?category=Финансы")
    assert response.status_code == 200
    apps = response.json()
    print(f"✅ GET /api/apps?category=Финансы - Found {len(apps)} apps")

def test_create_app():
    """Создание нового приложения"""
    new_app = {
        "name": "Test Application",
        "developer": "Test Developer",
        "category": "Финансы",
        "age_rating": "12+",
        "description": "This is a test application for API testing purposes.",
        "icon_url": "/icons/sber.webp",
        "rating": 4.5,
        "version": "1.0.0",
        "size": "50 МБ",
        "price": "Бесплатно",
        "screenshots": [
            "/screenshots/sber_1.webp",
            "/screenshots/sber_2.webp"
        ]
    }
    
    response = requests.post(f"{BASE_URL}/api/apps", json=new_app)
    assert response.status_code == 201
    app = response.json()
    assert app["name"] == new_app["name"]
    print(f"✅ POST /api/apps - Created app ID: {app['id']}")
    return app["id"]

def test_update_app(app_id):
    """Обновление приложения"""
    updates = {
        "rating": 4.9,
        "version": "1.1.0"
    }
    
    response = requests.put(f"{BASE_URL}/api/apps/{app_id}", json=updates)
    assert response.status_code == 200
    app = response.json()
    assert app["rating"] == 4.9
    assert app["version"] == "1.1.0"
    print(f"✅ PUT /api/apps/{app_id} - Updated successfully")

def test_delete_app(app_id):
    """Удаление приложения"""
    response = requests.delete(f"{BASE_URL}/api/apps/{app_id}")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    print(f"✅ DELETE /api/apps/{app_id} - {data['message']}")

def run_all_tests():
    """Запуск всех тестов"""
    print("\n" + "="*60)
    print("🧪 Тестирование API Endpoints")
    print("="*60 + "\n")
    
    try:
        # Базовые проверки
        test_health()
        apps = test_get_all_apps()
        
        if apps:
            test_get_app_by_id(apps[0]["id"])
        
        test_get_featured()
        test_get_categories()
        test_search()
        test_filter_by_category()
        
        # CRUD операции
        print("\n" + "-"*60)
        print("Testing CRUD operations")
        print("-"*60 + "\n")
        
        new_app_id = test_create_app()
        test_update_app(new_app_id)
        test_delete_app(new_app_id)
        
        print("\n" + "="*60)
        print("✅ Все тесты пройдены успешно!")
        print("="*60 + "\n")
        
    except AssertionError as e:
        print(f"\n❌ Тест провален: {e}")
    except requests.exceptions.ConnectionError:
        print("\n❌ Не удалось подключиться к серверу")
        print("Убедитесь что сервер запущен на http://localhost:8000")
    except Exception as e:
        print(f"\n❌ Ошибка: {e}")

if __name__ == "__main__":
    run_all_tests()

