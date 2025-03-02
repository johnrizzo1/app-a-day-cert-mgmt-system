{
  description = "Certificate Management System";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";
    process-compose-flake.url = "github:Platonic-Systems/process-compose-flake";
    poetry2nix = {
      url = "github:nix-community/poetry2nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = inputs@{ flake-parts, poetry2nix, ... }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      systems = [ "x86_64-linux" "aarch64-linux" "x86_64-darwin" "aarch64-darwin" ];
      
      perSystem = { config, self', inputs', pkgs, system, ... }: {
        # Import poetry2nix
        _module.args.pkgs = import inputs.nixpkgs {
          inherit system;
          overlays = [
            poetry2nix.overlays.default
          ];
        };
        # Packages
        packages = {
          default = self'.packages.backend;
          
          backend = pkgs.poetry2nix.mkPoetryApplication {
            projectDir = ./backend;
            
            # Override dependencies if needed
            overrides = pkgs.poetry2nix.overrides.withDefaults (final: prev: {
              # Add any package overrides here if needed
            });
            
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
        
        # Development shell
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            # Python and dependencies
            python3
            poetry
            
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
          
          shellHook = ''
            # Initialize Poetry environment if needed
            if [ ! -f "backend/poetry.lock" ]; then
              echo "Initializing Poetry environment..."
              cd backend && poetry install
            fi
            
            # Set up environment variables
            export PYTHONPATH="./backend:$PYTHONPATH"
            
            # Use Poetry for Python environment
            alias python="poetry run python"
            alias pytest="poetry run pytest"
            alias uvicorn="poetry run uvicorn"
            alias alembic="poetry run alembic"
            
            # Define helper functions
            function run-dev {
              cd backend && poetry run uvicorn app.main:app --reload
            }
            
            function run-tests {
              cd backend && poetry run pytest
            }
            
            function create-migration {
              cd backend && poetry run alembic revision --autogenerate -m "$1"
            }
            
            function apply-migrations {
              cd backend && poetry run alembic upgrade head
            }
            
            function build-app {
              cd backend && poetry build
            }
            
            function run-all {
              process-compose up
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
            echo "  run-all            - Run all services with process-compose"
            echo ""
          '';
        };
      };
    };
}