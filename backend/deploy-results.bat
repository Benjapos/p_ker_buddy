@echo off
echo 🏆 Deploying Poker Results Tracker to Vercel...
echo.

REM Check if Vercel CLI is installed
vercel --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Vercel CLI not found. Installing...
    npm install -g vercel
    if errorlevel 1 (
        echo ❌ Failed to install Vercel CLI
        pause
        exit /b 1
    )
)

echo ✅ Vercel CLI found
echo.

REM Deploy to Vercel
echo 🚀 Deploying to Vercel...
vercel --prod

if errorlevel 1 (
    echo ❌ Deployment failed
    pause
    exit /b 1
)

echo.
echo ✅ Deployment successful!
echo.
echo 📱 Next steps:
echo 1. Set your POKER_SECRET environment variable:
echo    vercel env add POKER_SECRET
echo.
echo 2. Test the API with the test script:
echo    python test_results_api.py
echo.
echo 3. View results at: https://your-domain.vercel.app/reveal
echo.
pause 