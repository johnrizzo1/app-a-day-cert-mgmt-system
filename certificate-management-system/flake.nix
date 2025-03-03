{
  description = "Certificate Management System";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/release-24.11";
    flake-parts.url = "github:hercules-ci/flake-parts";
    devenv.url = "github:cachix/devenv";
    poetry2nix = {
      url = "github:nix-community/poetry2nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = inputs@{ flake-parts, poetry2nix, devenv, ... }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      systems = [ "x86_64-linux" "aarch64-linux" "x86_64-darwin" "aarch64-darwin" ];
      
      imports = [
        inputs.devenv.flakeModule
      ];
      
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
              homepage = "https://github.com/johnrizzo1/certificate-management-system";
              license = licenses.mit;
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
        };

        # Development environment using devenv
        devenv.shells.default = {
          name = "certificate-management-system";

          packages = with pkgs; [
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
          ];

          # PostgreSQL service
          # services.postgres = {
          #   enable = true;
          #   package = pkgs.postgresql;
          #   initialDatabases = [{ name = "certificate_db"; }];
          #   initialScript = "CREATE USER postgres SUPERUSER PASSWORD 'postgres';";
          #   listen_addresses = "127.0.0.1";
          #   port = 5432;
          # };

          # services.prometheus = {
          #   enable = true;
          #   globalConfig = {
          #     scrape_interval = "15s";
          #   };
          #   scrapeConfigs = [
          #     {
          #       job_name = "certificate_management_system";
          #       static_configs = [
          #         {
          #           targets = ["localhost:8889"];
          #         }
          #       ];
          #     }
          #   ];
          # };

          # services.opentelemetry-collector = {
          #   enable = true;
          #   settings = {
          #     receivers = {
          #       otlp = {
          #         protocols = {
          #           grpc = {};
          #           http = {};
          #         };
          #       };
          #     };
          #     exporters = {
          #       endpoint = {
          #         prometheus = {
          #           endpoint = "0.0.0.0:8889";
          #           namespace = "certificate_management_system";
          #         };
          #       };
          #     };
          #     extensions = {
          #       health_check = {
          #         endpoint = "localhost:13133";
          #       };
          #     };
          #     service = {
          #       extensions = ["health_check"];
          #       pipelines = {
          #         traces = {
          #           # receivers = ["otlp"];
          #           exporters = ["prometheus"];
          #         };
          #       };
          #     };
          #   };
          # };

          # Environment variables
          env = {
            PYTHONPATH = "./backend:$PYTHONPATH";
            DATABASE_URL = "postgresql+asyncpg://postgres:postgres@localhost:5432/certificate_db";
            SECRET_KEY = "your-secret-key-here";
            ALGORITHM = "HS256";
            ACCESS_TOKEN_EXPIRE_MINUTES = "30";
            APP_NAME = "Certificate Management System";
            APP_VERSION = "0.1.0";
            DEBUG = "True";
            REACT_APP_API_URL = "http://localhost:8000/api";
            PORT = "3001";
          };

          # Scripts and processes
          processes = {
            backend.exec = "cd backend && poetry run hypercorn app.main:app --reload --bind 0.0.0.0:8000";
            frontend.exec = "cd web-frontend && npm start";
          };

          # Shell hook for additional setup
          enterShell = ''
            echo 'Setting up development environment...'
            # Initialize Poetry environment if needed
            if [ ! -f "backend/poetry.lock" ]; then
              echo "Initializing Poetry environment..."
              cd backend && poetry install
              cd ..
            fi
            
            # Use Poetry for Python environment
            alias python="poetry run python"
            alias pytest="poetry run pytest"
            alias alembic="poetry run alembic"
            
            # Define helper functions
            function run-dev {
              cd backend && poetry run hypercorn app.main:app --reload --bind 0.0.0.0:8000
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
            
            # Print welcome message
            echo "Certificate Management System - Development Environment"
            echo "======================================================="
            echo "Available commands:"
            echo "  devenv up          - Start all services"
            echo "  run-dev            - Run the backend development server"
            echo "  run-tests          - Run backend tests"
            echo "  create-migration   - Create a new database migration"
            echo "  apply-migrations   - Apply database migrations"
            echo "  build-app          - Build the backend application"
            echo ""
          '';
        };
      };
    };
}