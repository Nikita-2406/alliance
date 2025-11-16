@echo off
chcp 65001 >nul
echo ================================================
echo   🛑 Остановка приложения Alliance RuStore
echo ================================================
echo.

echo 🔍 Поиск запущенных процессов...
echo.

REM Остановка процессов uvicorn (Backend FastAPI)
tasklist /FI "IMAGENAME eq python.exe" 2>NUL | find /I /N "python.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo 🐍 Остановка Backend (Python/FastAPI)...
    taskkill /F /IM python.exe /T >nul 2>&1
    echo ✅ Backend остановлен
) else (
    echo ℹ️  Backend не запущен
)

echo.

REM Остановка процессов node (Frontend Vite)
tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I /N "node.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo ⚛️  Остановка Frontend (Node.js/Vite)...
    taskkill /F /IM node.exe /T >nul 2>&1
    echo ✅ Frontend остановлен
) else (
    echo ℹ️  Frontend не запущен
)

echo.
echo ================================================
echo   ✅ Все процессы остановлены!
echo ================================================
echo.
echo 💡 Для запуска приложения используйте: start-app.bat
echo.

pause



