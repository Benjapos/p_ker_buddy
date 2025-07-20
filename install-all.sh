#!/bin/bash

echo "🃏 Installing Poker AI Advisor - Complete Setup"
echo "================================================"

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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to detect OS
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if command_exists apt-get; then
            echo "ubuntu"
        elif command_exists yum; then
            echo "centos"
        elif command_exists dnf; then
            echo "fedora"
        else
            echo "linux"
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macos"
    else
        echo "unknown"
    fi
}

# Function to install Node.js
install_nodejs() {
    print_status "Installing Node.js..."
    
    if command_exists node; then
        NODE_VERSION=$(node --version)
        print_success "Node.js already installed: $NODE_VERSION"
        return 0
    fi
    
    OS=$(detect_os)
    
    case $OS in
        "ubuntu"|"linux")
            # Install Node.js using NodeSource repository
            curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
            sudo apt-get install -y nodejs
            ;;
        "centos"|"fedora")
            # Install Node.js using NodeSource repository
            curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
            sudo yum install -y nodejs
            ;;
        "macos")
            if command_exists brew; then
                brew install node
            else
                print_error "Homebrew not found. Please install Homebrew first: https://brew.sh/"
                return 1
            fi
            ;;
        *)
            print_error "Unsupported OS. Please install Node.js manually from https://nodejs.org/"
            return 1
            ;;
    esac
    
    if command_exists node; then
        NODE_VERSION=$(node --version)
        print_success "Node.js installed successfully: $NODE_VERSION"
    else
        print_error "Failed to install Node.js"
        return 1
    fi
}

# Function to install Python
install_python() {
    print_status "Installing Python..."
    
    if command_exists python3; then
        PYTHON_VERSION=$(python3 --version)
        print_success "Python already installed: $PYTHON_VERSION"
        return 0
    fi
    
    OS=$(detect_os)
    
    case $OS in
        "ubuntu"|"linux")
            sudo apt-get update
            sudo apt-get install -y python3 python3-pip python3-venv
            ;;
        "centos"|"fedora")
            sudo yum install -y python3 python3-pip
            ;;
        "macos")
            if command_exists brew; then
                brew install python
            else
                print_error "Homebrew not found. Please install Homebrew first: https://brew.sh/"
                return 1
            fi
            ;;
        *)
            print_error "Unsupported OS. Please install Python manually from https://python.org/"
            return 1
            ;;
    esac
    
    if command_exists python3; then
        PYTHON_VERSION=$(python3 --version)
        print_success "Python installed successfully: $PYTHON_VERSION"
    else
        print_error "Failed to install Python"
        return 1
    fi
}

# Function to install Git
install_git() {
    print_status "Installing Git..."
    
    if command_exists git; then
        GIT_VERSION=$(git --version)
        print_success "Git already installed: $GIT_VERSION"
        return 0
    fi
    
    OS=$(detect_os)
    
    case $OS in
        "ubuntu"|"linux")
            sudo apt-get update
            sudo apt-get install -y git
            ;;
        "centos"|"fedora")
            sudo yum install -y git
            ;;
        "macos")
            if command_exists brew; then
                brew install git
            else
                print_error "Homebrew not found. Please install Homebrew first: https://brew.sh/"
                return 1
            fi
            ;;
        *)
            print_error "Unsupported OS. Please install Git manually from https://git-scm.com/"
            return 1
            ;;
    esac
    
    if command_exists git; then
        GIT_VERSION=$(git --version)
        print_success "Git installed successfully: $GIT_VERSION"
    else
        print_error "Failed to install Git"
        return 1
    fi
}

# Function to install curl
install_curl() {
    print_status "Installing curl..."
    
    if command_exists curl; then
        print_success "curl already installed"
        return 0
    fi
    
    OS=$(detect_os)
    
    case $OS in
        "ubuntu"|"linux")
            sudo apt-get update
            sudo apt-get install -y curl
            ;;
        "centos"|"fedora")
            sudo yum install -y curl
            ;;
        "macos")
            if command_exists brew; then
                brew install curl
            else
                print_error "Homebrew not found. Please install Homebrew first: https://brew.sh/"
                return 1
            fi
            ;;
        *)
            print_error "Unsupported OS. Please install curl manually"
            return 1
            ;;
    esac
    
    if command_exists curl; then
        print_success "curl installed successfully"
    else
        print_error "Failed to install curl"
        return 1
    fi
}

# Function to install Homebrew (macOS)
install_homebrew() {
    if [[ "$(detect_os)" == "macos" ]]; then
        if ! command_exists brew; then
            print_status "Installing Homebrew..."
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
            
            # Add Homebrew to PATH
            if [[ -f "/opt/homebrew/bin/brew" ]]; then
                echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
                eval "$(/opt/homebrew/bin/brew shellenv)"
            elif [[ -f "/usr/local/bin/brew" ]]; then
                echo 'eval "$(/usr/local/bin/brew shellenv)"' >> ~/.zprofile
                eval "$(/usr/local/bin/brew shellenv)"
            fi
            
            if command_exists brew; then
                print_success "Homebrew installed successfully"
            else
                print_error "Failed to install Homebrew"
                return 1
            fi
        else
            print_success "Homebrew already installed"
        fi
    fi
}

# Function to setup the project
setup_project() {
    print_status "Setting up Poker AI Advisor project..."
    
    # Install frontend dependencies
    print_status "Installing frontend dependencies..."
    npm install
    
    if [ $? -eq 0 ]; then
        print_success "Frontend dependencies installed successfully"
    else
        print_error "Failed to install frontend dependencies"
        return 1
    fi
    
    # Install backend dependencies
    print_status "Installing backend dependencies..."
    cd backend
    python3 -m pip install --upgrade pip
    python3 -m pip install -r requirements.txt
    
    if [ $? -eq 0 ]; then
        print_success "Backend dependencies installed successfully"
    else
        print_error "Failed to install backend dependencies"
        return 1
    fi
    cd ..
    
    # Create environment files
    print_status "Creating environment files..."
    
    # Frontend .env
    cat > .env << EOF
REACT_APP_API_URL=http://localhost:5000
EOF
    
    # Backend .env
    cat > backend/.env << EOF
FLASK_ENV=development
PORT=5000
EOF
    
    print_success "Environment files created"
}

# Function to run tests
run_tests() {
    print_status "Running initial tests..."
    
    # Test backend
    cd backend
    python3 -c "import flask; print('Flask imported successfully')" 2>/dev/null
    if [ $? -eq 0 ]; then
        print_success "Backend dependencies test passed"
    else
        print_warning "Backend dependencies test failed"
    fi
    cd ..
    
    # Test frontend
    node --version >/dev/null 2>&1
    if [ $? -eq 0 ]; then
        print_success "Node.js test passed"
    else
        print_warning "Node.js test failed"
    fi
}

# Main installation process
main() {
    print_status "Detecting operating system..."
    OS=$(detect_os)
    print_success "Detected OS: $OS"
    
    # Install system dependencies
    install_curl
    install_git
    
    # Install Homebrew for macOS
    install_homebrew
    
    # Install Node.js and Python
    install_nodejs
    install_python
    
    # Setup the project
    setup_project
    
    # Run tests
    run_tests
    
    print_success "Installation completed!"
    echo ""
    echo "🎉 Poker AI Advisor is ready to use!"
    echo ""
    echo "To start the application:"
    echo "1. Start the backend: cd backend && python3 app.py"
    echo "2. Start the frontend: npm start"
    echo ""
    echo "The application will be available at:"
    echo "- Frontend: http://localhost:3000"
    echo "- Backend: http://localhost:5000"
    echo ""
    echo "Happy poker playing! 🃏"
}

# Run the main function
main "$@" 