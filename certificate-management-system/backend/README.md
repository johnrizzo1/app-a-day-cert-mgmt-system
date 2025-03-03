# Certificate Management System - Backend

This is the backend service for the Certificate Management System, built with FastAPI and PostgreSQL.

## Features

- RESTful API for managing X509 certificates
- PostgreSQL database for storing certificate data
- Asynchronous API with SQLAlchemy
- JWT authentication
- Alembic migrations
- Comprehensive test suite

## Requirements

- Python 3.9+
- PostgreSQL 13+

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/certificate-management-system.git
cd certificate-management-system/backend
```

2. Install Poetry (if not already installed):

```bash
curl -sSL https://install.python-poetry.org | python3 -
```

3. Install dependencies:

```bash
poetry install
```

4. Set up the database:

```bash
# Create the database
createdb certificate_db

# Run migrations
alembic upgrade head
```

## Configuration

The application is configured using environment variables. You can set these in the `.env` file:

```bash
# Database settings
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/certificate_db

# Security settings
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Application settings
APP_NAME="Certificate Management System"
APP_VERSION=0.1.0
DEBUG=True
```

## Running the Application

To run the application locally:

```bash
poetry run hypercorn app.main:app --reload --bind 0.0.0.0:8000
```

Or, if you've activated the Poetry shell:

```bash
poetry shell
hypercorn app.main:app --reload --bind 0.0.0.0:8000
```

The API will be available at http://localhost:8000.

API documentation is available at:
- Swagger UI: http://localhost:8000/api/docs
- ReDoc: http://localhost:8000/api/redoc

## API Endpoints

- `GET /api/certificates` - List all certificates
- `GET /api/certificates/{id}` - Get certificate details
- `POST /api/certificates` - Create new certificate
- `PUT /api/certificates/{id}` - Update certificate
- `DELETE /api/certificates/{id}` - Delete certificate
- `POST /api/certificates/{id}/generate` - Generate certificate from stored data
- `GET /api/certificates/{id}/private-key` - Get certificate with private key

## Testing

To run the tests:

```bash
# Create test database
createdb test_certificate_db

# Run tests
poetry run pytest
```

## Database Migrations

To create a new migration:

```bash
poetry run alembic revision --autogenerate -m "Description of changes"
```

To apply migrations:

```bash
poetry run alembic upgrade head
```

## License

[MIT License](LICENSE)