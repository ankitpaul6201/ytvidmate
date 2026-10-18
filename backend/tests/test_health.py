from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "ytvidmate-backend"
    assert data["status"] == "online"


def test_health():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "ytvidmate-backend"
    assert "ytdlp_version" in data


def test_uptimerobot_health_endpoints():
    # Test GET /health
    r_get = client.get("/health")
    assert r_get.status_code == 200
    assert r_get.json()["status"] == "healthy"

    # Test HEAD /health
    r_head = client.head("/health")
    assert r_head.status_code == 200

    # Test HEAD /
    r_root_head = client.head("/")
    assert r_root_head.status_code == 200
