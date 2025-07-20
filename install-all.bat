@echo off
echo 🃏 Installing Poker AI Advisor - Complete Setup
echo ================================================

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] This script requires administrator privileges.
    echo Please right-click and "Run as administrator"
    pause
    exit /b 1
)

REM Check if we're in the right directory
if not exist "package.json" (
    echo [ERROR] package.json not found. Please run this script from the project root.
    pause
    exit /b 1
)

echo [INFO] Installing required applications...

REM Check if Chocolatey is installed
choco --version >nul 2>&1
if %errorLevel% neq 0 (
    echo [INFO] Installing Chocolatey package manager...
    echo [INFO] This may take a few minutes. Please wait...
    powershell -Command "Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))"
    
    REM Refresh environment variables
    call refreshenv
    
    if %errorLevel% neq 0 (
        echo [ERROR] Failed to install Chocolatey
        pause
        exit /b 1
    )
    echo [SUCCESS] Chocolatey installed successfully
) else (
    echo [SUCCESS] Chocolatey already installed
)

REM Install Node.js
echo [INFO] Installing Node.js...
echo [INFO] This may take a few minutes. Please wait...
node --version >nul 2>&1
if %errorLevel% neq 0 (
    echo [INFO] Downloading and installing Node.js...
    choco install nodejs -y
    if %errorLevel% neq 0 (
        echo [ERROR] Failed to install Node.js
        pause
        exit /b 1
    )
    echo [SUCCESS] Node.js installed successfully
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo [SUCCESS] Node.js already installed: %NODE_VERSION%
)

REM Install Python
echo [INFO] Installing Python...
echo [INFO] This may take a few minutes. Please wait...
python --version >nul 2>&1
if %errorLevel% neq 0 (
    echo [INFO] Downloading and installing Python...
    choco install python -y
    if %errorLevel% neq 0 (
        echo [ERROR] Failed to install Python
        pause
        exit /b 1
    )
    echo [SUCCESS] Python installed successfully
) else (
    for /f "tokens=*" %%i in ('python --version') do set PYTHON_VERSION=%%i
    echo [SUCCESS] Python already installed: %PYTHON_VERSION%
)

REM Install Git
echo [INFO] Installing Git...
git --version >nul 2>&1
if %errorLevel% neq 0 (
    choco install git -y
    if %errorLevel% neq 0 (
        echo [ERROR] Failed to install Git
        pause
        exit /b 1
    )
    echo [SUCCESS] Git installed successfully
) else (
    for /f "tokens=*" %%i in ('git --version') do set GIT_VERSION=%%i
    echo [SUCCESS] Git already installed: %GIT_VERSION%
)

REM Refresh environment variables after installations
call refreshenv

echo [INFO] Setting up Poker AI Advisor project...

REM Install frontend dependencies
echo [INFO] Installing frontend dependencies...
echo [INFO] This may take a few minutes. Please wait...
call npm install
if %errorLevel% neq 0 (
    echo [ERROR] Failed to install frontend dependencies
    pause
    exit /b 1
)
echo [SUCCESS] Frontend dependencies installed successfully

REM Install backend dependencies
echo [INFO] Installing backend dependencies...
echo [INFO] This may take a few minutes. Please wait...
cd backend
python -m pip install --upgrade pip
echo [INFO] Installing Flask and other Python packages...
python -m pip install -r requirements.txt
if %errorLevel% neq 0 (
    echo [ERROR] Failed to install backend dependencies
    pause
    exit /b 1
)
echo [SUCCESS] Backend dependencies installed successfully
cd ..

REM Create environment files
echo [INFO] Creating environment files...

REM Frontend .env
echo REACT_APP_API_URL=http://localhost:5000 > .env

REM Backend .env
echo FLASK_ENV=development > backend\.env
echo PORT=5000 >> backend\.env

echo [SUCCESS] Environment files created

REM Run tests
echo [INFO] Running initial tests...

REM Test backend
cd backend
python -c "import flask; print('Flask imported successfully')" >nul 2>&1
if %errorLevel% equ 0 (
    echo [SUCCESS] Backend dependencies test passed
) else (
    echo [WARNING] Backend dependencies test failed
)
cd ..

REM Test frontend
node --version >nul 2>&1
if %errorLevel% equ 0 (
    echo [SUCCESS] Node.js test passed
) else (
    echo [WARNING] Node.js test failed
)

echo.
echo [SUCCESS] Installation completed!
echo.
echo 🎉 Poker AI Advisor is ready to use!
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