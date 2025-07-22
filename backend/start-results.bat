@echo off
echo 🏆 Starting Poker Results Tracker...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python not found. Please install Python first.
    pause
    exit /b 1
)

echo ✅ Python found
echo.

REM Check if requirements are installed
echo 📦 Checking dependencies...
pip show flask >nul 2>&1
if errorlevel 1 (
    echo 📦 Installing dependencies...
    pip install -r results_requirements.txt
    if errorlevel 1 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
)

echo ✅ Dependencies ready
echo.

REM Start the server
echo 🚀 Starting server on http://localhost:5001
echo 📊 Results will be saved to data/poker_results.csv
echo 🔍 View results at: http://localhost:5001/reveal
echo 🔑 API token: SECRET123
echo.
echo Press Ctrl+C to stop the server
echo.

python results_app.py

pause 