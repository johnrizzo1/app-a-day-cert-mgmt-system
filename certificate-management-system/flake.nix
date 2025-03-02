{
  description = "Certificate Management System";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";
    devenv.url = "github:cachix/devenv";
    process-compose-flake.url = "github:Platonic-Systems/process-compose-flake";
  };

  outputs = inputs@{ flake-parts, ... }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      imports = [
        inputs.devenv.flakeModule
      ];
      
      systems = [ "x86_64-linux" "aarch64-linux" "x86_64-darwin" "aarch64-darwin" ];
      
      perSystem = { config, self', inputs', pkgs, system, ... }: {
        # Packages
        packages = {
          default = self'.packages.backend;
          
          backend = pkgs.python3Packages.buildPythonApplication {
            pname = "certificate-management-system-backend";
            version = "0.1.0";
            
            src = ./backend;
            
            propagatedBuildInputs = with pkgs.python3Packages; [
              fastapi
              uvicorn
              sqlalchemy
              alembic
              pydantic
              asyncpg
              psycopg2
              python-jose
              passlib
              python-multipart
              pyopenssl
              cryptography
              python-dotenv
            ];
            
            checkInputs = with pkgs.python3Packages; [
              pytest
              pytest-asyncio
              httpx
            ];
            
            checkPhase = ''
              pytest
            '';
            
            meta = with pkgs.lib; {
              description = "Backend service for managing X509 certificates";
              homepage = "https://github.com/yourusername/certificate-management-system";
              license = licenses.mit;
            };
          };
          
          # Process compose configuration
          process-compose = inputs.process-compose-flake.lib.${system}.mkProcessCompose {
            name = "certificate-management-system";
            processes = {
              postgres = {
                command = "${pkgs.postgresql}/bin/postgres -D ./.postgres";
                readiness_probe = {
                  exec.command = "${pkgs.postgresql}/bin/pg_isready -h localhost -p 5432 -U postgres";
                  initial_delay_seconds = 2;
                  period_seconds = 5;
                  timeout_seconds = 2;
                  success_threshold = 1;
                  failure_threshold = 3;
                };
                environment = {
                  POSTGRES_USER = "postgres";
                  POSTGRES_PASSWORD = "postgres";
                  POSTGRES_DB = "certificate_db";
                };
                setup.command = ''
                  mkdir -p ./.postgres
                  if [ ! -f ./.postgres/PG_VERSION ]; then
                    ${pkgs.postgresql}/bin/initdb -D ./.postgres -U postgres --auth=trust
                    echo "listen_addresses = '*'" >> ./.postgres/postgresql.conf
                    echo "host all all 0.0.0.0/0 trust" >> ./.postgres/pg_hba.conf
                  fi
                '';
              };
              
              backend = {
                command = "cd backend && ${pkgs.python3}/bin/uvicorn app.main:app --reload --host 0.0.0.0 --port 8000";
                depends_on.postgres.condition = "process_healthy";
                environment = {
                  DATABASE_URL = "postgresql+asyncpg://postgres:postgres@localhost:5432/certificate_db";
                  SECRET_KEY = "your-secret-key-here";
                  ALGORITHM = "HS256";
                  ACCESS_TOKEN_EXPIRE_MINUTES = "30";
                  APP_NAME = "Certificate Management System";
                  APP_VERSION = "0.1.0";
                  DEBUG = "True";
                };
              };
              
              frontend = {
                command = "cd web-frontend && ${pkgs.nodejs}/bin/npm start";
                depends_on.backend.condition = "process_started";
                environment = {
                  PORT = "3000";
                  REACT_APP_API_URL = "http://localhost:8000/api";
                };
              };
            };
          };
        };
        
        # Apps
        apps = {
          default = self'.apps.backend;
          
          backend = {
            type = "app";
            program = "${self'.packages.backend}/bin/certificate-management-system-backend";
          };
          
          process-compose = {
            type = "app";
            program = "${self'.packages.process-compose}/bin/process-compose";
          };
        };
        
        # Development environment using devenv.sh
        devenv.shells.default = {
          name = "certificate-management-system";
          
          # Specify the path to the project root
          # This helps devenv determine the current directory
          # env.DEVENV_ROOT = "${toString ./.}";
          
          # Import packages
          packages = with pkgs; [
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
            run-all.exec = "${self'.packages.process-compose}/bin/process-compose up";
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
          '';
        };
      };
    };
}