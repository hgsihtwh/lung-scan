from app.models import User, Scan
from app.core.security import get_password_hash


def create_user(db, email="test@example.com", password="TestPass123"):
    user = User(email=email, hashed_password=get_password_hash(password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def create_scan(db, user_id, patient_name="Test Patient"):
    scan = Scan(
        file_id=f"test_batch_{patient_name}",
        file_hash=f"hash_{patient_name}",
        patient_name=patient_name,
        status="completed",
        slice_count=10,
        user_id=user_id,
    )
    db.add(scan)
    db.commit()
    db.refresh(scan)
    return scan


def get_token(client, email="test@example.com", password="TestPass123"):
    response = client.post(
        "/api/auth/login",
        data={"username": email, "password": password},
    )
    return response.json()["access_token"]


def test_get_scans_empty(client, db):
    create_user(db)
    token = get_token(client)
    response = client.get(
        "/api/scans/",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["items"] == []
    assert data["total"] == 0
    assert data["page"] == 1


def test_get_scans_pagination(client, db):
    user = create_user(db)
    for i in range(5):
        create_scan(db, user.id, patient_name=f"Patient {i}")
    token = get_token(client)

    response = client.get(
        "/api/scans/?page=1&size=3",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) == 3
    assert data["total"] == 5
    assert data["pages"] == 2


def test_get_scans_page_2(client, db):
    user = create_user(db)
    for i in range(5):
        create_scan(db, user.id, patient_name=f"Patient {i}")
    token = get_token(client)

    response = client.get(
        "/api/scans/?page=2&size=3",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) == 2
    assert data["page"] == 2


def test_get_scans_unauthorized(client):
    response = client.get("/api/scans/")
    assert response.status_code == 401


def test_get_scan_by_id(client, db):
    user = create_user(db)
    scan = create_scan(db, user.id)
    token = get_token(client)

    response = client.get(
        f"/api/scans/{scan.id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert response.json()["id"] == scan.id


def test_get_scan_not_found(client, db):
    create_user(db)
    token = get_token(client)

    response = client.get(
        "/api/scans/99999",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 404


def test_get_scans_isolation(client, db):
    """Пользователь видит только свои сканы."""
    user1 = create_user(db, email="user1@example.com")
    create_user(db, email="user2@example.com", password="TestPass456")
    create_scan(db, user1.id)

    token2 = get_token(client, email="user2@example.com", password="TestPass456")
    response = client.get(
        "/api/scans/",
        headers={"Authorization": f"Bearer {token2}"},
    )
    assert response.status_code == 200
    assert response.json()["total"] == 0
