Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   P_Ker Buddy - Vercel Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Checking if Vercel CLI is installed..." -ForegroundColor Yellow
try {
    $vercelVersion = vercel --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Vercel CLI found: $vercelVersion" -ForegroundColor Green
    } else {
        throw "Vercel CLI not found"
    }
} catch {
    Write-Host "Vercel CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g vercel
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to install Vercel CLI. Please install manually:" -ForegroundColor Red
        Write-Host "npm install -g vercel" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

Write-Host ""
Write-Host "Vercel CLI found. Starting deployment..." -ForegroundColor Green
Write-Host ""

Set-Location backend
Write-Host "Deploying from backend directory..." -ForegroundColor Yellow
vercel

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deployment completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Copy the backend URL from above" -ForegroundColor White
Write-Host "2. Update src/App.js with the new backend URL" -ForegroundColor White
Write-Host "3. Test your application" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to continue" 