"""
Integration Tests for Marketplace & Provider API Endpoints.
"""

import pytest
try:
    from fastapi.testclient import TestClient
except Exception:
    from app.testing.client import InMemoryTestClient as TestClient
from app.main import app


@pytest.fixture
def client():
    return TestClient(app)


def test_list_marketplace_apis(client):
    res = client.get("/v1/marketplace/apis")
    assert res.status_code == 200
    apis = res.json()
    assert len(apis) > 0
    categories = [a["category"] for a in apis]
    assert "crypto_price" in categories
    assert "weather" in categories


def test_filter_marketplace_by_category(client):
    res = client.get("/v1/marketplace/apis?category=weather")
    assert res.status_code == 200
    apis = res.json()
    assert len(apis) > 0
    for a in apis:
        assert a["category"] == "weather"


def test_list_providers(client):
    res = client.get("/v1/providers")
    assert res.status_code == 200
    providers = res.json()
    assert len(providers) >= 3


def test_list_all_provider_apis(client):
    """SECTION 36: Verify GET /v1/providers/apis returns all APIs across providers."""
    res = client.get("/v1/providers/apis")
    assert res.status_code == 200
    apis = res.json()
    assert isinstance(apis, list)
    assert len(apis) >= 4


def test_get_provider_apis(client):
    """Verify GET /v1/providers/{provider_id}/apis returns APIs for a specific provider."""
    res = client.get("/v1/providers/provider_crypto_1/apis")
    assert res.status_code == 200
    apis = res.json()
    assert isinstance(apis, list)
    assert len(apis) >= 2
    for a in apis:
        assert a["provider_id"] == "provider_crypto_1"
