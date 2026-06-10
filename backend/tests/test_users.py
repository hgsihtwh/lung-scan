from app.models import User
from app.core.security import get_password_hash


def create_user(db, email="test@example.com", password="TestPass123"):
    user = User(email=email, hashed_password=get_password_hash(password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_token(client, email="test@example.com", password="TestPass123"):
    response = client.post(
        "/api/auth/login",
        data={"username": email, "password": password},
    )
    return response.json()["access_token"]


def test_get_profile(client, db):
    create_user(db)
    token = get_token(client)
    response = client.get(
        "/api/users/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert "id" in data
    assert "created_at" in data


def test_get_profile_unauthorized(client):
    response = client.get("/api/users/me")
    assert response.status_code == 401


def test_update_profile_email(client, db):
    create_user(db)
    token = get_token(client)
    response = client.put(
        "/api/users/me",
        json={"email": "new@example.com"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert response.json()["email"] == "new@example.com"


def test_update_profile_duplicate_email(client, db):
    create_user(db, email="user1@example.com")
    create_user(db, email="user2@example.com", password="TestPass456")
    token = get_token(client, email="user1@example.com")
    response = client.put(
        "/api/users/me",
        json={"email": "user2@example.com"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 400


def test_change_password_success(client, db):
    create_user(db)
    token = get_token(client)
    response = client.put(
        "/api/users/me/password",
        json={"current_password": "TestPass123", "new_password": "NewPass456"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Password changed successfully"


def test_change_password_wrong_current(client, db):
    create_user(db)
    token = get_token(client)
    response = client.put(
        "/api/users/me/password",
        json={"current_password": "WrongPass123", "new_password": "NewPass456"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 400


def test_change_password_same_as_current(client, db):
    create_user(db)
    token = get_token(client)
    response = client.put(
        "/api/users/me/password",
        json={"current_password": "TestPass123", "new_password": "TestPass123"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 400


def test_change_password_weak_new_password(client, db):
    create_user(db)
    token = get_token(client)
    response = client.put(
        "/api/users/me/password",
        json={"current_password": "TestPass123", "new_password": "weak"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 422
