@echo off
echo Installing treys library for poker hand evaluation...
echo.

cd backend
pip install treys==0.1.8

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Treys library installed successfully!
    echo.
    echo You can now run the backend with accurate poker hand evaluation.
    echo.
) else (
    echo.
    echo ❌ Failed to install treys library.
    echo Please check your Python/pip installation.
    echo.
)

pause 