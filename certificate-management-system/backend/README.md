# Certificate Management System Backend

## Running the Application

The backend application uses OpenTelemetry for instrumentation and requires running within the Poetry environment to access all dependencies.

### Option 1: Using the run script (Recommended)

```bash
# Make the script executable (if not already)
chmod +x run.sh

# Run the application
./run.sh
```

### Option 2: Using Poetry directly

```bash
# Run with Poetry
poetry run hypercorn app.main:app --reload --bind 0.0.0.0:8000
```

### Option 3: Using devenv

```bash
# Run with devenv
devenv run-dev
```

## Troubleshooting

If you encounter a `ModuleNotFoundError: No module named 'opentelemetry'` error, it means you're trying to run the application outside of the Poetry environment. Use one of the methods above to run the application properly.

## Development Environment

This project uses:

- Poetry for dependency management
- devenv (Nix-based) for development environment setup
- FastAPI as the web framework
- OpenTelemetry for instrumentation and monitoring
- Hypercorn as the ASGI server

## Available Commands

When using devenv, the following commands are available:
- `devenv up` - Start all services
- `run-dev` - Run the backend development server
- `run-tests` - Run backend tests
- `create-migration` - Create a new database migration
- `apply-migrations` - Apply database migrations
- `build-app` - Build the backend application