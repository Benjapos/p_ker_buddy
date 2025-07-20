# 🚀 Installation Guide - Poker AI Advisor

This guide provides multiple ways to install the Poker AI Advisor with all required dependencies automatically.

## 🎯 **Quick Start (Recommended)**

### **Windows Users:**
```bash
# Option 1: Run as Administrator (easiest)
Right-click install-all.bat → "Run as administrator"

# Option 2: PowerShell (more control)
Right-click install-all.ps1 → "Run with PowerShell"
```

### **Mac/Linux Users:**
```bash
# Make executable and run
chmod +x install-all.sh
./install-all.sh
```

## 📋 **What Gets Installed Automatically**

### **System Applications:**
- ✅ **Node.js** (v18+) - JavaScript runtime
- ✅ **Python** (3.8+) - Python interpreter
- ✅ **Git** - Version control
- ✅ **Package Managers** - Chocolatey (Windows), Homebrew (macOS), apt/yum (Linux)

### **Project Dependencies:**
- ✅ **Frontend**: React, Styled Components, Testing libraries
- ✅ **Backend**: Flask, CORS, Testing frameworks
- ✅ **Environment Files**: Configuration for local development

## 🔧 **Installation Methods**

### **Method 1: All-in-One Scripts (Easiest)**

#### **Windows - Batch File**
```bash
# Run as Administrator
install-all.bat
```

**What it does:**
- Installs Chocolatey package manager
- Downloads and installs Node.js, Python, Git
- Sets up project dependencies
- Creates environment files
- Runs initial tests

#### **Windows - PowerShell**
```bash
# Run as Administrator
install-all.ps1

# Or with custom options:
install-all.ps1 -SkipChocolatey -SkipGit
```

**PowerShell Options:**
- `-SkipChocolatey`: Skip Chocolatey installation
- `-SkipNodeJS`: Skip Node.js installation
- `-SkipPython`: Skip Python installation
- `-SkipGit`: Skip Git installation

#### **Mac/Linux - Bash Script**
```bash
# Make executable and run
chmod +x install-all.sh
./install-all.sh
```

**What it does:**
- Detects your OS (Ubuntu, CentOS, macOS, etc.)
- Installs appropriate package manager
- Downloads and installs all dependencies
- Sets up the project

### **Method 2: Manual Installation**

If you prefer to install dependencies manually:

#### **Windows Manual:**
1. **Install Chocolatey:**
   ```powershell
   Set-ExecutionPolicy Bypass -Scope Process -Force
   [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
   iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
   ```

2. **Install Applications:**
   ```powershell
   choco install nodejs python git -y
   ```

3. **Setup Project:**
   ```bash
   npm install
   cd backend
   pip install -r requirements.txt
   cd ..
   ```

#### **macOS Manual:**
1. **Install Homebrew:**
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. **Install Applications:**
   ```bash
   brew install node python git
   ```

3. **Setup Project:**
   ```bash
   npm install
   cd backend
   pip3 install -r requirements.txt
   cd ..
   ```

#### **Linux Manual:**
1. **Ubuntu/Debian:**
   ```bash
   sudo apt update
   sudo apt install nodejs npm python3 python3-pip git
   ```

2. **CentOS/RHEL:**
   ```bash
   sudo yum install nodejs npm python3 python3-pip git
   ```

3. **Setup Project:**
   ```bash
   npm install
   cd backend
   pip3 install -r requirements.txt
   cd ..
   ```

## 🧪 **Testing the Installation**

### **Quick Test:**
```bash
# Test Node.js
node --version

# Test Python
python --version

# Test Git
git --version

# Test Backend
cd backend
python -c "import flask; print('Flask works!')"
cd ..

# Test Frontend
npm test -- --watchAll=false
```

### **Run All Tests:**
```bash
# Windows
test-scripts.bat

# Mac/Linux
./test-scripts.sh
```

## 🚨 **Troubleshooting**

### **Common Issues:**

#### **Windows - "choco is not recognized"**
```powershell
# Refresh environment variables
refreshenv

# Or restart your terminal/PowerShell
```

#### **Windows - "Execution Policy" Error**
```powershell
# Run as Administrator
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### **macOS - "Homebrew not found"**
```bash
# Install Homebrew first
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

#### **Linux - "Permission denied"**
```bash
# Make script executable
chmod +x install-all.sh
```

#### **Port Already in Use:**
```bash
# Check what's using the port
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # Mac/Linux

# Kill the process or change ports in .env files
```

### **Network Issues:**
```bash
# If downloads fail, try:
# Windows
choco install nodejs --source https://chocolatey.org/api/v2/

# Mac
brew install node --verbose

# Linux
sudo apt update && sudo apt install nodejs
```

### **Python Issues:**
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Mac/Linux
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r backend/requirements.txt
```

## ✅ **Verification Checklist**

After installation, verify:

- [ ] Node.js installed (`node --version`)
- [ ] Python installed (`python --version`)
- [ ] Git installed (`git --version`)
- [ ] Frontend dependencies installed (`npm list`)
- [ ] Backend dependencies installed (`pip list`)
- [ ] Environment files created (`.env`, `backend/.env`)
- [ ] Backend starts (`cd backend && python app.py`)
- [ ] Frontend starts (`npm start`)
- [ ] Application accessible at `http://localhost:3000`

## 🎉 **Success!**

Once installation is complete:

1. **Start Backend:**
   ```bash
   cd backend
   python app.py
   ```

2. **Start Frontend:**
   ```bash
   npm start
   ```

3. **Open Browser:**
   Navigate to `http://localhost:3000`

4. **Test the App:**
   - Select hole cards (A♠, A♥)
   - Set position to Button
   - Click "Get AI Recommendation"
   - Should see "RAISE" recommendation

## 📞 **Need Help?**

If you encounter issues:

1. **Check the troubleshooting section above**
2. **Run the test scripts** to identify problems
3. **Check system requirements** (Windows 10+, macOS 10.14+, Ubuntu 18.04+)
4. **Ensure you have administrator privileges** (Windows)
5. **Check your internet connection** for downloads

The installation scripts are designed to handle most common scenarios automatically, but manual intervention may be needed for custom setups or corporate environments with restricted access. 