@echo off
echo Starting Frontend Server...
cd /d "%~dp0"
set PATH=%PATH%;"C:\Program Files\nodejs"
npm start
pause 