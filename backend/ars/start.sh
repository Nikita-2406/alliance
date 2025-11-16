#!/bin/bash
# Скрипт быстрого запуска сервера (Linux/Mac)

echo "========================================"
echo "Rustore API - Запуск сервера"
echo "========================================"
echo ""

# Активация виртуального окружения (если есть)
if [ -d "venv" ]; then
    echo "Активация виртуального окружения..."
    source venv/bin/activate
else
    echo "Виртуальное окружение не найдено."
    echo "Рекомендуется создать: python -m venv venv"
    echo ""
fi

# Запуск сервера
echo "Запуск FastAPI сервера..."
echo ""
uvicorn main.main:app --reload --host 0.0.0.0 --port 8000

