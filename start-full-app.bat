@echo off
echo Starting P_Ker Buddy Full Application...
echo.
echo Starting Backend Server...
start "Backend Server" cmd /k "cd backend && python app.py"
echo Backend started on http://localhost:5000
echo.
echo Opening Frontend...
start https://benjapos.github.io/p_ker_buddy
echo.
echo Full application is now running!
echo - Backend: http://localhost:5000
echo - Frontend: https://benjapos.github.io/p_ker_buddy
echo.
pause 