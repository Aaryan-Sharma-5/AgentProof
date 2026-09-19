"""
Graph Failure Recovery and Terminal Failure Path Tests.
"""

import pytest
import asyncio
from app.graph.state import AgentFlowState
from app.graph.graph import workflow_graph
from app.graph.nodes import node_context
from app.services.api_execution_service import ApiExecutionResponse
from app.models.domain import ApiExecutionStatus, ErrorCode, PaymentStatus


def test_verification_failure_path():
    """Mocks API response with mismatched location (Mumbai requested, Delhi returned)."""
    async def mock_mismatched_api(api, payment_tx_hash=None, custom_headers=None):
        return ApiExecutionResponse(
            status=ApiExecutionStatus.RESPONSE_VALIDATED,
            http_status=200,
            data={"city": "Delhi", "temperature": 32, "condition": "Haze"},
            headers={"Content-Type": "application/json"},
            elapsed_ms=50.0
        )

    original_exec = node_context.api_executor.execute
    node_context.api_executor.execute = mock_mismatched_api

    try:
        initial_state: AgentFlowState = {
            "request_id": "AF-FAIL-VERIF",
            "user_id": "user-1",
            "agent_id": "agent-1",
            "raw_request": "Get current weather in Mumbai",
            "retry_count": 0,
            "final_status": "RECEIVED"
        }

        final_state = asyncio.run(workflow_graph.ainvoke(initial_state))

        assert final_state["final_status"] == "FAILED"
        assert final_state.get("error_code") == ErrorCode.VERIFICATION_FAILED.value
        assert "Delhi" in final_state.get("error_message", "")
    finally:
        node_context.api_executor.execute = original_exec


def test_payment_failure_path():
    """Simulates payment gateway rejection in the graph."""
    # Temporarily set mock gateway to fail
    original_gateway = node_context.payment_service.orchestrator.gateway
    failing_gateway = original_gateway.__class__(should_fail=True)
    node_context.payment_service.orchestrator.gateway = failing_gateway

    try:
        initial_state: AgentFlowState = {
            "request_id": "AF-FAIL-PAY",
            "user_id": "user-1",
            "agent_id": "agent-1",
            "raw_request": "Get current BTC price",
            "retry_count": 0,
            "final_status": "RECEIVED"
        }

        final_state = asyncio.run(workflow_graph.ainvoke(initial_state))

        assert final_state["final_status"] == "FAILED"
        assert final_state.get("error_code") == ErrorCode.PAYMENT_FAILED.value
    finally:
        node_context.payment_service.orchestrator.gateway = original_gateway
