#!/bin/bash

echo "🧪 Running Poker AI Advisor Tests..."
echo "====================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Create test results directory
mkdir -p test-results

print_status "Installing dependencies..."
npm install

print_status "Running frontend tests..."
npm run test:ci > test-results/frontend-tests.txt 2>&1
FRONTEND_TEST_EXIT=$?

if [ $FRONTEND_TEST_EXIT -eq 0 ]; then
    print_success "Frontend tests passed!"
else
    print_error "Frontend tests failed. Check test-results/frontend-tests.txt"
fi

print_status "Running backend tests..."
cd backend
python -m pytest test_app.py -v --cov=app --cov-report=html:../test-results/backend-coverage > ../test-results/backend-tests.txt 2>&1
BACKEND_TEST_EXIT=$?
cd ..

if [ $BACKEND_TEST_EXIT -eq 0 ]; then
    print_success "Backend tests passed!"
else
    print_error "Backend tests failed. Check test-results/backend-tests.txt"
fi

print_status "Running integration tests..."
# Test the API endpoints
curl -s http://localhost:5000/api/health > test-results/api-health.txt 2>&1
if [ $? -eq 0 ]; then
    print_success "API health check passed!"
else
    print_warning "API health check failed (backend might not be running)"
fi

print_status "Running performance tests..."
# Test response times for different scenarios
echo "Performance Test Results:" > test-results/performance.txt
echo "========================" >> test-results/performance.txt

# Test 1: Simple hand analysis
start_time=$(date +%s%N)
curl -s -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"holeCards":["A♠","A♥"],"flop":[],"numPlayers":6,"position":"button","potSize":100,"betSize":0}' > /dev/null
end_time=$(date +%s%N)
duration=$(( (end_time - start_time) / 1000000 ))
echo "Simple hand analysis: ${duration}ms" >> test-results/performance.txt

# Test 2: Complex hand analysis
start_time=$(date +%s%N)
curl -s -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"holeCards":["A♠","A♥"],"flop":["K♦","Q♣","J♠"],"turn":"10♠","river":"9♠","numPlayers":6,"position":"button","potSize":100,"betSize":0}' > /dev/null
end_time=$(date +%s%N)
duration=$(( (end_time - start_time) / 1000000 ))
echo "Complex hand analysis: ${duration}ms" >> test-results/performance.txt

print_success "Performance tests completed!"

print_status "Generating test report..."
cat > test-results/test-report.html << EOF
<!DOCTYPE html>
<html>
<head>
    <title>Poker AI Advisor - Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #1e3c72; color: white; padding: 20px; border-radius: 10px; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .success { background: #d4edda; border-color: #c3e6cb; }
        .error { background: #f8d7da; border-color: #f5c6cb; }
        .warning { background: #fff3cd; border-color: #ffeaa7; }
        pre { background: #f8f9fa; padding: 10px; border-radius: 5px; overflow-x: auto; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🃏 Poker AI Advisor - Test Report</h1>
        <p>Generated on: $(date)</p>
    </div>
    
    <div class="section">
        <h2>Test Summary</h2>
        <p><strong>Frontend Tests:</strong> $([ $FRONTEND_TEST_EXIT -eq 0 ] && echo "✅ PASSED" || echo "❌ FAILED")</p>
        <p><strong>Backend Tests:</strong> $([ $BACKEND_TEST_EXIT -eq 0 ] && echo "✅ PASSED" || echo "❌ FAILED")</p>
    </div>
    
    <div class="section">
        <h2>Frontend Test Results</h2>
        <pre>$(cat test-results/frontend-tests.txt)</pre>
    </div>
    
    <div class="section">
        <h2>Backend Test Results</h2>
        <pre>$(cat test-results/backend-tests.txt)</pre>
    </div>
    
    <div class="section">
        <h2>Performance Test Results</h2>
        <pre>$(cat test-results/performance.txt)</pre>
    </div>
    
    <div class="section">
        <h2>API Health Check</h2>
        <pre>$(cat test-results/api-health.txt)</pre>
    </div>
</body>
</html>
EOF

print_success "Test report generated: test-results/test-report.html"

# Summary
echo ""
echo "📊 Test Summary:"
echo "================"
echo "Frontend Tests: $([ $FRONTEND_TEST_EXIT -eq 0 ] && echo "✅ PASSED" || echo "❌ FAILED")"
echo "Backend Tests: $([ $BACKEND_TEST_EXIT -eq 0 ] && echo "✅ PASSED" || echo "❌ FAILED")"
echo ""
echo "📁 Test results saved in: test-results/"
echo "📄 Full report: test-results/test-report.html"
echo "📊 Backend coverage: test-results/backend-coverage/index.html"

# Exit with error if any tests failed
if [ $FRONTEND_TEST_EXIT -ne 0 ] || [ $BACKEND_TEST_EXIT -ne 0 ]; then
    print_error "Some tests failed. Check the test results above."
    exit 1
else
    print_success "All tests passed! 🎉"
    exit 0
fi 