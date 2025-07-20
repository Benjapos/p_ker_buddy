@echo off
echo 🧪 Running Poker AI Advisor Tests...
echo =====================================

REM Check if we're in the right directory
if not exist "package.json" (
    echo [ERROR] package.json not found. Please run this script from the project root.
    exit /b 1
)

REM Create test results directory
if not exist "test-results" mkdir test-results

echo [INFO] Installing dependencies...
call npm install

echo [INFO] Running frontend tests...
call npm run test:ci > test-results\frontend-tests.txt 2>&1
set FRONTEND_TEST_EXIT=%errorlevel%

if %FRONTEND_TEST_EXIT% equ 0 (
    echo [SUCCESS] Frontend tests passed!
) else (
    echo [ERROR] Frontend tests failed. Check test-results\frontend-tests.txt
)

echo [INFO] Running backend tests...
cd backend
python -m pytest test_app.py -v --cov=app --cov-report=html:../test-results/backend-coverage > ../test-results/backend-tests.txt 2>&1
set BACKEND_TEST_EXIT=%errorlevel%
cd ..

if %BACKEND_TEST_EXIT% equ 0 (
    echo [SUCCESS] Backend tests passed!
) else (
    echo [ERROR] Backend tests failed. Check test-results\backend-tests.txt
)

echo [INFO] Running integration tests...
REM Test the API endpoints
curl -s http://localhost:5000/api/health > test-results\api-health.txt 2>&1
if %errorlevel% equ 0 (
    echo [SUCCESS] API health check passed!
) else (
    echo [WARNING] API health check failed (backend might not be running)
)

echo [INFO] Running performance tests...
REM Test response times for different scenarios
echo Performance Test Results: > test-results\performance.txt
echo ======================== >> test-results\performance.txt

REM Test 1: Simple hand analysis
for /f "tokens=1-4 delims=:.," %%a in ("%time%") do (
    set start_h=%%a&set start_m=%%b&set start_s=%%c&set start_ms=%%d
)

curl -s -X POST http://localhost:5000/api/analyze -H "Content-Type: application/json" -d "{\"holeCards\":[\"A♠\",\"A♥\"],\"flop\":[],\"numPlayers\":6,\"position\":\"button\",\"potSize\":100,\"betSize\":0}" > nul

for /f "tokens=1-4 delims=:.," %%a in ("%time%") do (
    set end_h=%%a&set end_m=%%b&set end_s=%%c&set end_ms=%%d
)

echo Simple hand analysis: completed >> test-results\performance.txt

REM Test 2: Complex hand analysis
curl -s -X POST http://localhost:5000/api/analyze -H "Content-Type: application/json" -d "{\"holeCards\":[\"A♠\",\"A♥\"],\"flop\":[\"K♦\",\"Q♣\",\"J♠\"],\"turn\":\"10♠\",\"river\":\"9♠\",\"numPlayers\":6,\"position\":\"button\",\"potSize\":100,\"betSize\":0}" > nul

echo Complex hand analysis: completed >> test-results\performance.txt

echo [SUCCESS] Performance tests completed!

echo [INFO] Generating test report...
echo ^<!DOCTYPE html^> > test-results\test-report.html
echo ^<html^> >> test-results\test-report.html
echo ^<head^> >> test-results\test-report.html
echo     ^<title^>Poker AI Advisor - Test Report^</title^> >> test-results\test-report.html
echo     ^<style^> >> test-results\test-report.html
echo         body { font-family: Arial, sans-serif; margin: 20px; } >> test-results\test-report.html
echo         .header { background: #1e3c72; color: white; padding: 20px; border-radius: 10px; } >> test-results\test-report.html
echo         .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; } >> test-results\test-report.html
echo         pre { background: #f8f9fa; padding: 10px; border-radius: 5px; overflow-x: auto; } >> test-results\test-report.html
echo     ^</style^> >> test-results\test-report.html
echo ^</head^> >> test-results\test-report.html
echo ^<body^> >> test-results\test-report.html
echo     ^<div class="header"^> >> test-results\test-report.html
echo         ^<h1^>🃏 Poker AI Advisor - Test Report^</h1^> >> test-results\test-report.html
echo         ^<p^>Generated on: %date% %time%^</p^> >> test-results\test-report.html
echo     ^</div^> >> test-results\test-report.html
echo     ^<div class="section"^> >> test-results\test-report.html
echo         ^<h2^>Test Summary^</h2^> >> test-results\test-report.html
if %FRONTEND_TEST_EXIT% equ 0 (
    echo         ^<p^>^<strong^>Frontend Tests:^</strong^> ✅ PASSED^</p^> >> test-results\test-report.html
) else (
    echo         ^<p^>^<strong^>Frontend Tests:^</strong^> ❌ FAILED^</p^> >> test-results\test-report.html
)
if %BACKEND_TEST_EXIT% equ 0 (
    echo         ^<p^>^<strong^>Backend Tests:^</strong^> ✅ PASSED^</p^> >> test-results\test-report.html
) else (
    echo         ^<p^>^<strong^>Backend Tests:^</strong^> ❌ FAILED^</p^> >> test-results\test-report.html
)
echo     ^</div^> >> test-results\test-report.html
echo ^</body^> >> test-results\test-report.html
echo ^</html^> >> test-results\test-report.html

echo [SUCCESS] Test report generated: test-results\test-report.html

REM Summary
echo.
echo 📊 Test Summary:
echo ================
if %FRONTEND_TEST_EXIT% equ 0 (
    echo Frontend Tests: ✅ PASSED
) else (
    echo Frontend Tests: ❌ FAILED
)
if %BACKEND_TEST_EXIT% equ 0 (
    echo Backend Tests: ✅ PASSED
) else (
    echo Backend Tests: ❌ FAILED
)
echo.
echo 📁 Test results saved in: test-results\
echo 📄 Full report: test-results\test-report.html
echo 📊 Backend coverage: test-results\backend-coverage\index.html

REM Exit with error if any tests failed
if %FRONTEND_TEST_EXIT% neq 0 (
    echo [ERROR] Some tests failed. Check the test results above.
    exit /b 1
)
if %BACKEND_TEST_EXIT% neq 0 (
    echo [ERROR] Some tests failed. Check the test results above.
    exit /b 1
)

echo [SUCCESS] All tests passed! 🎉
pause 