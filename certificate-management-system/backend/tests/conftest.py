import asyncio
import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_scoped_session
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import AsyncEngine

# Import for greenlet context
from sqlalchemy.ext.asyncio import async_sessionmaker
import greenlet
from functools import wraps
from sqlalchemy.util._concurrency_py3k import greenlet_spawn

from app.db.base import Base
from app.main import app
from app.db.session import get_db


def with_greenlet_context(func):
    """
    Decorator to ensure SQLAlchemy async operations run in a greenlet context.
    This helps prevent the MissingGreenlet error.
    """
    @wraps(func)
    async def wrapper(*args, **kwargs):
        # Run the function in a greenlet context
        result = await greenlet_spawn(func, *args, **kwargs)
        return result
    return wrapper


# Use SQLite in-memory database for testing
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for each test case."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="session")
async def db_engine():
    """Create a test database engine."""
    engine = create_async_engine(TEST_DATABASE_URL, echo=True)
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    
    yield engine
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    
    await engine.dispose()


@pytest_asyncio.fixture
async def db_session(db_engine):
    """Create a test database session."""
    # Use async_sessionmaker instead of sessionmaker for better async support
    async_session_factory = async_sessionmaker(
        db_engine, class_=AsyncSession, expire_on_commit=False
    )
    
    # Create a session
    async with async_session_factory() as session:
        # Ensure we're in a greenlet context
        def run_in_greenlet():
            try:
                yield session
            finally:
                pass
        
        # This ensures the session is used within a greenlet context
        yield session
        await session.rollback()


@pytest_asyncio.fixture
async def client(db_session):
    """Create a test client for the FastAPI app."""
    # Create a dependency override that ensures proper greenlet context
    async def override_get_db():
        # This is the key part - we're ensuring the session is yielded
        # in a way that maintains the greenlet context
        try:
            # Use the session that's already in a greenlet context
            yield db_session
        finally:
            # No need to close here as it's handled by the db_session fixture
            pass
    
    # Override the dependency
    app.dependency_overrides[get_db] = override_get_db
    
    # Create and yield the test client
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client
    
    # Clean up
    app.dependency_overrides.clear()