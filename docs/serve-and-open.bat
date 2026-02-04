@echo off
cd /d "%~dp0"
echo Starting server at http://127.0.0.1:8080
echo Leaderboard: http://127.0.0.1:8080/results.html
echo.
start "Poker leaderboard server" python -m http.server 8080
timeout /t 2 /nobreak >nul
start "" "http://127.0.0.1:8080/results.html"
echo Browser should open. Close the "Poker leaderboard server" window to stop.
