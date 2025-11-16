@echo off
REM Скрипт быстрого запуска сервера (Windows)

echo ========================================
echo Rustore API - Запуск сервера
echo ========================================
echo.

REM Активация виртуального окружения (если есть)
if exist venv\Scripts\activate.bat (
    echo Активация виртуального окружения...
    call venv\Scripts\activate.bat
) else (
    echo Виртуальное окружение не найдено.
    echo Рекомендуется создать: python -m venv venv
    echo.
)

REM Запуск сервера
echo Запуск FastAPI сервера...
echo.
uvicorn main.main:app --reload --host 0.0.0.0 --port 8000

pause

