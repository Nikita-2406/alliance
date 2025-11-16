@echo off
chcp 65001 >nul
echo ================================================
echo   🚀 Запуск приложения Alliance RuStore
echo ================================================
echo.

REM Проверка наличия Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python не найден! Установите Python 3.12 или выше.
    pause
    exit /b 1
)

REM Проверка наличия Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js не найден! Установите Node.js 18 или выше.
    pause
    exit /b 1
)

echo ✅ Python найден
echo ✅ Node.js найден
echo.

REM Проверка виртуального окружения Python
if not exist "backend\ars\venv\Scripts\activate.bat" (
    echo ⚠️  Виртуальное окружение не найдено!
    echo 📦 Создание виртуального окружения...
    cd backend\ars
    python -m venv venv
    call venv\Scripts\activate.bat
    echo 📥 Установка зависимостей Python...
    pip install -r requirements.txt
    cd ..\..
    echo ✅ Виртуальное окружение создано
    echo.
)

REM Проверка node_modules для фронтенда
if not exist "app\node_modules" (
    echo ⚠️  Зависимости Node.js не установлены!
    echo 📥 Установка зависимостей для фронтенда...
    cd app
    call npm install
    cd ..
    echo ✅ Зависимости установлены
    echo.
)

echo ================================================
echo   🔧 Запуск сервисов...
echo ================================================
echo.

REM Запуск бэкенда в новом окне
echo 🐍 Запуск Backend (FastAPI)...
start "Alliance Backend - FastAPI" cmd /k "cd /d %~dp0backend\ars && call venv\Scripts\activate.bat && python -m main.main"

REM Небольшая задержка перед запуском фронтенда
timeout /t 3 /nobreak >nul

REM Запуск фронтенда в новом окне
echo ⚛️  Запуск Frontend (Vite + React)...
start "Alliance Frontend - Vite" cmd /k "cd /d %~dp0app && npm run dev"

echo.
echo ================================================
echo   ✅ Приложение запущено!
echo ================================================
echo.
echo 🌐 Backend API:  http://localhost:8000
echo 🌐 Frontend:     http://localhost:5173
echo 📚 API Docs:     http://localhost:8000/docs
echo.
echo 💡 Два окна терминала были открыты:
echo    - Backend (FastAPI на порту 8000)
echo    - Frontend (Vite на порту 5173)
echo.
echo ⚠️  Для остановки приложения закройте оба окна терминала
echo    или нажмите Ctrl+C в каждом окне.
echo.
echo 🔄 Для повторного запуска используйте: start-app.bat
echo.

pause

