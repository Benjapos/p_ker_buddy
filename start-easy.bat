@echo off
echo 🃏 Starting Poker AI Advisor...
echo ================================

echo [INFO] Starting backend server...
start "Backend Server" cmd /k "cd /d %~dp0backend && python app.py"

echo [INFO] Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak >nul

echo [INFO] Starting frontend application...
start "Frontend App" cmd /k "cd /d %~dp0 && set PATH=%PATH%;C:\Program Files\nodejs && npm start"

echo.
echo [SUCCESS] Both applications are starting!
echo.
echo The application will be available at:
echo - Frontend: http://localhost:3000
echo - Backend: http://localhost:5000
echo.
echo Press any key to close this window...
pause >nul 