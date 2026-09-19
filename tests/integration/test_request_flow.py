"""
Integration Tests for FastAPI Agent Requests Endpoints.
"""

import pytest
try:
    from fastapi.testclient import TestClient
except Exception:
    from app.testing.client import InMemoryTestClient as TestClient
from app.main import app
from app.graph.nodes import node_context
from app.services.api_execution_service import ApiExecutionResponse
from app.models.domain import ApiExecutionStatus


@pytest.fixture(autouse=True)
def mock_api_execution():
    async def mock_exec(api, payment_tx_hash=None, custom_headers=None):
        return ApiExecutionResponse(
            status=ApiExecutionStatus.RESPONSE_VALIDATED,
            http_status=200,
            data={"asset": "BTC", "price": 69000.0, "timestamp": 1700000000},
            headers={"Content-Type": "application/json"},
            elapsed_ms=30.0
        )

    original_execute = node_context.api_executor.execute
    node_context.api_executor.execute = mock_exec
    yield
    node_context.api_executor.execute = original_execute


def test_submit_and_get_request():
    async def mock_exec(api, payment_tx_hash=None, custom_headers=None):
        return ApiExecutionResponse(
            status=ApiExecutionStatus.RESPONSE_VALIDATED,
            http_status=200,
            data={"asset": "BTC", "price": 69000.0, "timestamp": 1700000000},
            headers={"Content-Type": "application/json"},
            elapsed_ms=30.0
        )

    original_execute = node_context.api_executor.execute
    node_context.api_executor.execute = mock_exec

    try:
        client = TestClient(app)

        # 1. Health check
        res_health = client.get("/health")
        assert res_health.status_code == 200
        assert res_health.json()["status"] == "ok"

        # 2. Submit request
        payload = {
            "message": "Get the current BTC price",
            "agent_id": "agent-1",
            "user_id": "user-1",
            "request_id": "AF-INT-1"
        }
        res_post = client.post("/v1/agent-requests", json=payload)
        assert res_post.status_code == 202
        data_post = res_post.json()
        assert data_post["request_id"] == "AF-INT-1"
        assert data_post["final_status"] == "COMPLETED"
        assert data_post["blockchain_tx_hash"] is not None

        # 3. Retrieve request by ID
        res_get = client.get("/v1/agent-requests/AF-INT-1")
        assert res_get.status_code == 200
        data_get = res_get.json()
        assert data_get["request_id"] == "AF-INT-1"
        assert data_get["final_status"] == "COMPLETED"
        assert data_get["verification_result"]["status"] == "VERIFIED"
    finally:
        node_context.api_executor.execute = original_execute
