"""
Graph Tests for AgentFlow State Machine.
Verifies Section 45 Golden End-to-End Workflow.
"""

import pytest
import asyncio
from unittest.mock import AsyncMock
from app.graph.state import AgentFlowState
from app.graph.graph import workflow_graph
from app.graph.nodes import node_context
from app.services.api_execution_service import ApiExecutionResponse
from app.models.domain import ApiExecutionStatus, PaymentStatus, VerificationStatus


@pytest.fixture(autouse=True)
def mock_api_execution():
    """Mocks external HTTP network call to return a verified API payload."""
    original_execute = node_context.api_executor.execute

    async def mock_exec(api, payment_tx_hash=None, custom_headers=None):
        data = {
            "asset": "BTC",
            "price": 68500.0,
            "timestamp": 1700000000
        }
        return ApiExecutionResponse(
            status=ApiExecutionStatus.RESPONSE_VALIDATED,
            http_status=200,
            data=data,
            headers={"Content-Type": "application/json"},
            elapsed_ms=45.0
        )

    node_context.api_executor.execute = mock_exec
    yield
    node_context.api_executor.execute = original_execute


def test_golden_end_to_end_flow():
    """
    SECTION 45 GOLDEN FLOW TEST:
    User: 'Get the current BTC price'
    -> Requirement
    -> Discovery (CryptoPrice API 0.02 MON)
    -> Policy (agent limit 0.10 MON)
    -> Risk (LOW)
    -> Payment (Mock adapter settled)
    -> API Execution
    -> Multi-layer Verification (PASS)
    -> Delivered & Audit logged
    """
    async def mock_exec(api, payment_tx_hash=None, custom_headers=None):
        data = {
            "asset": "BTC",
            "price": 68500.0,
            "timestamp": 1700000000
        }
        return ApiExecutionResponse(
            status=ApiExecutionStatus.RESPONSE_VALIDATED,
            http_status=200,
            data=data,
            headers={"Content-Type": "application/json"},
            elapsed_ms=45.0
        )

    original_execute = node_context.api_executor.execute
    node_context.api_executor.execute = mock_exec

    try:
        initial_state: AgentFlowState = {
            "request_id": "AF-GOLDEN-1",
            "user_id": "user-1",
            "agent_id": "agent-1",
            "raw_request": "Get the current BTC price",
            "retry_count": 0,
            "final_status": "RECEIVED"
        }

        final_state = asyncio.run(workflow_graph.ainvoke(initial_state))

        assert final_state["final_status"] == "COMPLETED"
        assert final_state["intent"]["category"] == "crypto_price"
        assert final_state["intent"]["target"] == "BTC"
        assert final_state["selected_api"]["id"] == "api_crypto_btc_1"
        assert final_state["payment_status"] == PaymentStatus.CONFIRMED.value
        assert final_state["blockchain_tx_hash"] is not None
        assert final_state["verification_result"]["status"] == VerificationStatus.VERIFIED.value
        assert final_state.get("error_code") is None
    finally:
        node_context.api_executor.execute = original_execute

