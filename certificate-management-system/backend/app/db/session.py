from typing import Generator
from contextlib import contextmanager

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from app.core.config import settings

# Convert async URL to sync URL (remove +asyncpg if present)
sync_url = str(settings.DATABASE_URL)
if '+asyncpg' in sync_url:
    sync_url = sync_url.replace('+asyncpg', '')

# Create synchronous engine and session
engine = create_engine(
    sync_url,
    echo=settings.DEBUG,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Synchronous session dependency
def get_db() -> Generator[Session, None, None]:
    """
    Dependency for getting DB session
    """
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()