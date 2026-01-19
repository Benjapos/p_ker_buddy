@echo off
title Poker Trainer Buddy Launcher
echo ===========================================
echo   POKER TRAINER BUDDY - LAUNCHER
echo ===========================================
echo.

:: Check if node_modules exists, if not run npm install
if not exist node_modules (
    echo [INFO] First time setup: Installing dependencies...
    call npm install
)

echo [INFO] Starting development server...
echo [INFO] The trainer will open in your browser automatically.
echo.
echo Press Ctrl+C to stop the server when you are done.
echo.

:: Open browser after a short delay
start "" http://localhost:5173

:: Start the dev server
npm run dev

pause

