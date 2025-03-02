# Certificate Management System

A comprehensive system for managing X509 certificates with a FastAPI backend, PostgreSQL database, React web frontend, and React Native macOS application.

## Project Overview

The Certificate Management System provides a complete solution for creating, managing, and tracking X509 certificates. It includes:

- **Backend Service**: A FastAPI-based RESTful API for certificate management
- **Web Frontend**: A responsive React application with Bootstrap for web-based certificate management
- **macOS Application**: A native macOS application built with React Native
- **Database**: PostgreSQL for reliable and scalable data storage

## Repository Structure

```
certificate-management-system/
├── architecture-plan.md     # Detailed architecture documentation
├── backend/                 # FastAPI backend service
├── web-frontend/            # React web frontend
├── macos-app/               # React Native macOS application
├── flake.nix                # Nix flake configuration with flake-parts and devenv.sh
├── devenv.nix               # Devenv configuration
├── devenv.yaml              # Devenv inputs
├── .devenv                  # Devenv root marker
├── process-compose.yaml     # Process compose configuration
├── .envrc                   # direnv configuration
└── README.md                # This file
```

## Features

- Create and manage X509 certificates
- Store certificate details including common name, organization, validity period, etc.
- Support for certificate extensions
- Generate X509 certificates from stored data
- View certificate details and private keys
- Update certificate status and information
- Responsive web interface
- Native macOS application

## Getting Started

### Prerequisites

- [Nix](https://nixos.org/download.html) package manager with flakes enabled
- [direnv](https://direnv.net/) (optional, for automatic environment activation)
- Node.js 14+ (for frontend development outside of Nix)
- Xcode 12+ (for macOS app)

### Development Environment Setup

The project uses [flake-parts](https://flake.parts/) and [devenv.sh](https://devenv.sh/) for a structured and reproducible development environment.

#### Using Nix Flake directly (recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/certificate-management-system.git
cd certificate-management-system

# Enter the development shell
nix develop
```

#### Using direnv

If you have direnv installed and configured in your shell:

```bash
# Clone the repository
git clone https://github.com/yourusername/certificate-management-system.git
cd certificate-management-system

# Allow direnv
direnv allow
```

This will automatically set up the development environment when you enter the directory.

#### Using devenv.sh directly

First, install devenv if you haven't already:

```bash
# Install devenv
nix-env -if https://install.devenv.sh/latest

# Clone the repository
git clone https://github.com/yourusername/certificate-management-system.git
cd certificate-management-system

# Enter the devenv shell
devenv shell
```

### Running the Application

#### All Services with Process Compose

The project uses [process-compose](https://github.com/Platonic-Systems/process-compose-flake) to manage all services together. This includes PostgreSQL, the backend API, and the web frontend.

To start all services at once:

```bash
# Inside the development environment
run-all
```

Or directly using the flake:

```bash
nix run .#process-compose
```

Or using process-compose directly (if installed):

```bash
process-compose up
```

This will start:
- PostgreSQL database on the default port (5432)
- Backend API server on http://localhost:8000
- Web frontend on http://localhost:3000

#### Using devenv Services

If you're using devenv directly, you can use its service management:

```bash
# Start PostgreSQL service
devenv up

# In another terminal, run the backend
run-dev

# In another terminal, start the frontend
cd web-frontend && npm start
```

#### Manual Setup

If you prefer to run services individually:

##### Backend Setup

1. Configure the database connection in `backend/.env` file.

2. Run database migrations:

```bash
# Inside the development environment
apply-migrations
```

3. Start the backend server:

```bash
# Inside the development environment
run-dev
```

The API will be available at http://localhost:8000.

##### Web Frontend Setup

1. Navigate to the web frontend directory:

```bash
cd certificate-management-system/web-frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

The web application will be available at http://localhost:3000.

##### macOS Application Setup

1. Navigate to the macOS app directory:

```bash
cd certificate-management-system/macos-app
```

2. Install dependencies:

```bash
npm install
```

3. Install CocoaPods dependencies:

```bash
cd macos
pod install
cd ..
```

4. Run the application:

```bash
npm run macos
```

## Available Commands

The development environment provides several convenient commands:

- `run-dev` - Run the backend development server
- `run-tests` - Run backend tests
- `create-migration` - Create a new database migration
- `apply-migrations` - Apply database migrations
- `build-app` - Build the backend application
- `run-all` - Run all services with process-compose

## Troubleshooting

### devenv errors

If you encounter errors with devenv, such as "devenv was not able to determine the current directory", make sure:

1. You have the `.devenv` file in the project root
2. The `devenv.nix` and `devenv.yaml` files are properly configured
3. You're running the commands from the project root directory

If you still have issues with devenv, you can always use `nix develop` directly, which should work reliably.

### direnv errors

If you encounter errors with direnv, make sure:

1. You have direnv installed: `nix-env -i direnv`
2. You have added direnv to your shell configuration
3. You have allowed the .envrc file: `direnv allow`

If you still have issues, you can always use `nix develop` directly.

## Documentation

- Backend API documentation is available at http://localhost:8000/api/docs when the backend server is running.
- Detailed architecture documentation can be found in `architecture-plan.md`.
- Each component has its own README with specific instructions.

## Development

### Backend

The backend is built with FastAPI and uses SQLAlchemy for database operations. It provides a RESTful API for certificate management.

### Web Frontend

The web frontend is built with React and Bootstrap. It provides a responsive user interface for certificate management.

### macOS Application

The macOS application is built with React Native for macOS. It provides a native macOS experience for certificate management.

## Building and Packaging

### Using Nix Flakes

```bash
# Build the default package (backend)
nix build

# Run the backend application
nix run
```

## License

[MIT License](LICENSE)