{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = with pkgs; [
    # Python and dependencies
    python3
    python3Packages.pip
    python3Packages.virtualenv
    python3Packages.setuptools
    python3Packages.wheel
    
    # PostgreSQL
    postgresql
    
    # Development tools
    git
    gnumake
    
    # Node.js for frontend
    nodejs_23
    yarn
  ];
  
  shellHook = ''
    # Create a Python virtual environment if it doesn't exist
    if [ ! -d "venv" ]; then
      echo "Creating Python virtual environment..."
      python -m venv venv
    fi
    
    # Activate the virtual environment
    source venv/bin/activate
    
    # Install Python dependencies if needed
    if [ ! -f ".nix-deps-installed" ]; then
      echo "Installing Python dependencies..."
      pip install -r backend/requirements.txt
      touch .nix-deps-installed
    fi
    
    # Set up environment variables
    export PATH=$PWD/venv/bin:$PATH
    
    # Define helper functions
    function run-dev {
      cd backend && uvicorn app.main:app --reload
    }
    
    function run-tests {
      cd backend && pytest
    }
    
    function create-migration {
      cd backend && alembic revision --autogenerate -m "$1"
    }
    
    function apply-migrations {
      cd backend && alembic upgrade head
    }
    
    function build-app {
      cd backend && python -m build
    }
    
    # Print welcome message
    echo "Certificate Management System - Development Environment"
    echo "======================================================="
    echo "Available commands:"
    echo "  run-dev            - Run the backend development server"
    echo "  run-tests          - Run backend tests"
    echo "  create-migration   - Create a new database migration"
    echo "  apply-migrations   - Apply database migrations"
    echo "  build-app          - Build the backend application"
    echo ""
  '';
}