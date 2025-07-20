@echo off
echo 🃏 Setting up Poker AI Advisor...
echo ==================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python first.
    echo Download from: https://python.org/
    pause
    exit /b 1
)

echo ✅ Node.js and Python are installed

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
call npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)
echo ✅ Frontend dependencies installed successfully

REM Install backend dependencies
echo 🐍 Installing backend dependencies...
cd backend
call pip install -r requirements.txt

if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)
echo ✅ Backend dependencies installed successfully

cd ..

REM Create .env files
echo ⚙️ Creating environment files...

REM Frontend .env
echo REACT_APP_API_URL=http://localhost:5000 > .env

REM Backend .env
echo FLASK_ENV=development > backend\.env
echo PORT=5000 >> backend\.env

echo ✅ Environment files created

echo.
echo 🎉 Setup complete!
echo.
echo To start the application:
echo 1. Start the backend: cd backend ^&^& python app.py
echo 2. Start the frontend: npm start
echo.
echo The application will be available at:
echo - Frontend: http://localhost:3000
echo - Backend: http://localhost:5000
echo.
echo Happy poker playing! 🃏
pause 