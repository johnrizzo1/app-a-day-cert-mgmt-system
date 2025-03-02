{ pkgs, ... }:

{
  # Import packages
  packages = with pkgs; [
    # Python and dependencies
    python3
    python3Packages.pip
    python3Packages.virtualenv
    python3Packages.setuptools
    python3Packages.wheel
    
    # Development tools
    git
    gnumake
    
    # Node.js for frontend
    nodejs
    yarn
    
    # Process compose
    process-compose
  ];
  
  # Environment variables
  env = {
    PYTHONPATH = "./backend";
  };
  
  # Languages
  languages = {
    python = {
      enable = true;
      package = pkgs.python3;
      venv = {
        enable = true;
        requirements = "./backend/requirements.txt";
      };
    };
    
    javascript = {
      enable = true;
      package = pkgs.nodejs;
    };
  };
  
  # Services
  services = {
    postgres = {
      enable = true;
      package = pkgs.postgresql;
      initialDatabases = [{ name = "certificate_db"; }];
      initialScript = "CREATE USER postgres WITH SUPERUSER PASSWORD 'postgres';";
      listen_addresses = "127.0.0.1";
      port = 5432;
    };
  };
  
  # Scripts
  scripts = {
    run-dev.exec = "cd backend && uvicorn app.main:app --reload";
    run-tests.exec = "cd backend && pytest";
    create-migration.exec = "cd backend && alembic revision --autogenerate -m \"$1\"";
    apply-migrations.exec = "cd backend && alembic upgrade head";
    build-app.exec = "cd backend && python -m build";
    run-all.exec = "process-compose up";
  };
  
  # Enter message
  enterShell = ''
    echo "Certificate Management System - Development Environment"
    echo "======================================================="
    echo "Available commands:"
    echo "  run-dev            - Run the backend development server"
    echo "  run-tests          - Run backend tests"
    echo "  create-migration   - Create a new database migration"
    echo "  apply-migrations   - Apply database migrations"
    echo "  build-app          - Build the backend application"
    echo "  run-all            - Run all services with process-compose"
    echo ""
    echo "To start PostgreSQL service:"
    echo "  devenv up"
    echo ""
  '';
}