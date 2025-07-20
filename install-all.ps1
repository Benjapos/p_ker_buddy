# PowerShell script for installing Poker AI Advisor with all dependencies
# Run this script as Administrator

param(
    [switch]$SkipChocolatey,
    [switch]$SkipNodeJS,
    [switch]$SkipPython,
    [switch]$SkipGit
)

Write-Host "🃏 Installing Poker AI Advisor - Complete Setup" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# Function to write colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if running as administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Error "This script requires administrator privileges."
    Write-Host "Please right-click PowerShell and 'Run as administrator'" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Error "package.json not found. Please run this script from the project root."
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Status "Installing required applications..."

# Install Chocolatey if not skipped
if (-not $SkipChocolatey) {
    Write-Status "Checking for Chocolatey package manager..."
    if (-not (Get-Command choco -ErrorAction SilentlyContinue)) {
        Write-Status "Installing Chocolatey..."
        Write-Status "This may take a few minutes. Please wait..."
        Set-ExecutionPolicy Bypass -Scope Process -Force
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
        Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
        
        # Refresh environment variables
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        
        if (Get-Command choco -ErrorAction SilentlyContinue) {
            Write-Success "Chocolatey installed successfully"
        } else {
            Write-Error "Failed to install Chocolatey"
            Read-Host "Press Enter to exit"
            exit 1
        }
    } else {
        Write-Success "Chocolatey already installed"
    }
}

# Install Node.js if not skipped
if (-not $SkipNodeJS) {
    Write-Status "Installing Node.js..."
    Write-Status "This may take a few minutes. Please wait..."
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        if (Get-Command choco -ErrorAction SilentlyContinue) {
            Write-Status "Downloading and installing Node.js..."
            choco install nodejs -y
            if ($LASTEXITCODE -eq 0) {
                Write-Success "Node.js installed successfully"
            } else {
                Write-Error "Failed to install Node.js"
                Read-Host "Press Enter to exit"
                exit 1
            }
        } else {
            Write-Error "Chocolatey not available. Please install Node.js manually from https://nodejs.org/"
            Read-Host "Press Enter to exit"
            exit 1
        }
    } else {
        $nodeVersion = node --version
        Write-Success "Node.js already installed: $nodeVersion"
    }
}

# Install Python if not skipped
if (-not $SkipPython) {
    Write-Status "Installing Python..."
    Write-Status "This may take a few minutes. Please wait..."
    if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
        if (Get-Command choco -ErrorAction SilentlyContinue) {
            Write-Status "Downloading and installing Python..."
            choco install python -y
            if ($LASTEXITCODE -eq 0) {
                Write-Success "Python installed successfully"
            } else {
                Write-Error "Failed to install Python"
                Read-Host "Press Enter to exit"
                exit 1
            }
        } else {
            Write-Error "Chocolatey not available. Please install Python manually from https://python.org/"
            Read-Host "Press Enter to exit"
            exit 1
        }
    } else {
        $pythonVersion = python --version
        Write-Success "Python already installed: $pythonVersion"
    }
}

# Install Git if not skipped
if (-not $SkipGit) {
    Write-Status "Installing Git..."
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
        if (Get-Command choco -ErrorAction SilentlyContinue) {
            choco install git -y
            if ($LASTEXITCODE -eq 0) {
                Write-Success "Git installed successfully"
            } else {
                Write-Error "Failed to install Git"
                Read-Host "Press Enter to exit"
                exit 1
            }
        } else {
            Write-Error "Chocolatey not available. Please install Git manually from https://git-scm.com/"
            Read-Host "Press Enter to exit"
            exit 1
        }
    } else {
        $gitVersion = git --version
        Write-Success "Git already installed: $gitVersion"
    }
}

# Refresh environment variables
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

Write-Status "Setting up Poker AI Advisor project..."

# Install frontend dependencies
Write-Status "Installing frontend dependencies..."
Write-Status "This may take a few minutes. Please wait..."
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Success "Frontend dependencies installed successfully"
} else {
    Write-Error "Failed to install frontend dependencies"
    Read-Host "Press Enter to exit"
    exit 1
}

# Install backend dependencies
Write-Status "Installing backend dependencies..."
Write-Status "This may take a few minutes. Please wait..."
Set-Location backend
python -m pip install --upgrade pip
Write-Status "Installing Flask and other Python packages..."
python -m pip install -r requirements.txt
if ($LASTEXITCODE -eq 0) {
    Write-Success "Backend dependencies installed successfully"
} else {
    Write-Error "Failed to install backend dependencies"
    Read-Host "Press Enter to exit"
    exit 1
}
Set-Location ..

# Create environment files
Write-Status "Creating environment files..."

# Frontend .env
"REACT_APP_API_URL=http://localhost:5000" | Out-File -FilePath ".env" -Encoding UTF8

# Backend .env
@"
FLASK_ENV=development
PORT=5000
"@ | Out-File -FilePath "backend\.env" -Encoding UTF8

Write-Success "Environment files created"

# Run tests
Write-Status "Running initial tests..."

# Test backend
Set-Location backend
try {
    python -c "import flask; print('Flask imported successfully')" | Out-Null
    Write-Success "Backend dependencies test passed"
} catch {
    Write-Warning "Backend dependencies test failed"
}
Set-Location ..

# Test frontend
try {
    $nodeVersion = node --version
    Write-Success "Node.js test passed: $nodeVersion"
} catch {
    Write-Warning "Node.js test failed"
}

Write-Host ""
Write-Success "Installation completed!"
Write-Host ""
Write-Host "🎉 Poker AI Advisor is ready to use!" -ForegroundColor Green
Write-Host ""
Write-Host "To start the application:" -ForegroundColor Yellow
Write-Host "1. Start the backend: cd backend && python app.py" -ForegroundColor White
Write-Host "2. Start the frontend: npm start" -ForegroundColor White
Write-Host ""
Write-Host "The application will be available at:" -ForegroundColor Yellow
Write-Host "- Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "- Backend: http://localhost:5000" -ForegroundColor White
Write-Host ""
Write-Host "Happy poker playing! 🃏" -ForegroundColor Green
Read-Host "Press Enter to exit" 