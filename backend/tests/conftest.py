import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from unittest.mock import AsyncMock, patch

from app.main import app
from app.database import Base, get_db
from app.core.rate_limiter import RateLimitMiddleware

TEST_DATABASE_URL = "sqlite:///./test_temp.db"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db

    # Отключаем rate limiter в тестах
    with patch.object(RateLimitMiddleware, "_check_rate_limit", new_callable=AsyncMock, return_value=(True, 0)):
        with TestClient(app) as c:
            yield c

    app.dependency_overrides.clear()
