@echo off
echo ========================================
echo    P_Ker Buddy - Vercel Deployment
echo ========================================
echo.

echo Checking if Vercel CLI is installed...
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Vercel CLI not found. Installing...
    npm install -g vercel
    if %errorlevel% neq 0 (
        echo Failed to install Vercel CLI. Please install manually:
        echo npm install -g vercel
        pause
        exit /b 1
    )
)

echo.
echo Vercel CLI found. Starting deployment...
echo.

cd backend
echo Deploying from backend directory...
vercel

echo.
echo ========================================
echo Deployment completed!
echo.
echo Next steps:
echo 1. Copy the backend URL from above
echo 2. Update src/App.js with the new backend URL
echo 3. Test your application
echo ========================================
echo.
pause 