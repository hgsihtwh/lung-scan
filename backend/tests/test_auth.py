from app.models import User
from app.core.security import get_password_hash


def create_user(db, email="test@example.com", password="TestPass123"):
    user = User(email=email, hashed_password=get_password_hash(password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def test_login_success(client, db):
    create_user(db)
    response = client.post(
        "/api/auth/login",
        data={"username": "test@example.com", "password": "TestPass123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password(client, db):
    create_user(db)
    response = client.post(
        "/api/auth/login",
        data={"username": "test@example.com", "password": "WrongPass123"},
    )
    assert response.status_code == 401


def test_login_nonexistent_user(client):
    response = client.post(
        "/api/auth/login",
        data={"username": "nobody@example.com", "password": "TestPass123"},
    )
    assert response.status_code == 401


def test_refresh_token(client, db):
    create_user(db)
    login = client.post(
        "/api/auth/login",
        data={"username": "test@example.com", "password": "TestPass123"},
    )
    refresh_token = login.json()["refresh_token"]

    response = client.post(
        "/api/auth/refresh",
        json={"refresh_token": refresh_token},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["refresh_token"] != refresh_token


def test_refresh_token_reuse(client, db):
    create_user(db)
    login = client.post(
        "/api/auth/login",
        data={"username": "test@example.com", "password": "TestPass123"},
    )
    refresh_token = login.json()["refresh_token"]

    client.post("/api/auth/refresh", json={"refresh_token": refresh_token})
    response = client.post("/api/auth/refresh", json={"refresh_token": refresh_token})
    assert response.status_code == 401


def test_logout(client, db):
    create_user(db)
    login = client.post(
        "/api/auth/login",
        data={"username": "test@example.com", "password": "TestPass123"},
    )
    refresh_token = login.json()["refresh_token"]

    response = client.post("/api/auth/logout", json={"refresh_token": refresh_token})
    assert response.status_code == 200

    response = client.post("/api/auth/refresh", json={"refresh_token": refresh_token})
    assert response.status_code == 401


def test_register_validation_weak_password(client):
    response = client.post(
        "/api/auth/register",
        json={"email": "test@example.com", "password": "weak"},
    )
    assert response.status_code == 422


def test_register_validation_invalid_email(client):
    response = client.post(
        "/api/auth/register",
        json={"email": "notanemail", "password": "TestPass123"},
    )
    assert response.status_code == 422


def test_login_rejects_json_body(client):
    # Login endpoint expects form-data, not JSON
    response = client.post(
        "/api/auth/login",
        json={"username": "test@example.com", "password": "TestPass123"},
    )
    assert response.status_code == 422
