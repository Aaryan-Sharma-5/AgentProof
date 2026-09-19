"""
Agent Requests API Routes.
Submits natural language requirements to the LangGraph orchestration engine
and queries request execution status and verified results.
"""

from __future__ import annotations
import logging
import uuid
from decimal import Decimal
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, BackgroundTasks, status
from pydantic import BaseModel, Field
from app.config.settings import settings
from app.graph.state import AgentFlowState
from app.agents.supervisor.supervisor import SupervisorAgent
from app.repositories.in_memory import store

logger = logging.getLogger(__name__)


def _format_mon(value: float) -> str:
    """
    Formats a MON amount as an exact plain decimal string.

    Goes via Decimal(str(value)) because f"{0.05:.18f}" yields "0.050000000000000003", which would
    display a wrong reward. These are display values only; the agent service owns the real amounts.
    """
    return format(Decimal(str(value)).normalize(), "f")

router = APIRouter(prefix="/agent-requests", tags=["Agent Requests"])
supervisor = SupervisorAgent()


class CreateAgentRequest(BaseModel):
    message: str = Field(description="Natural language task or data requirement")
    agent_id: str = "agent-1"
    user_id: str = "user-1"
    request_id: Optional[str] = None


class RequestStatusResponse(BaseModel):
    request_id: str
    user_id: str
    agent_id: str
    raw_request: str
    final_status: str
    final_answer: Optional[str] = None
    intent: Optional[Dict[str, Any]] = None
    selected_api: Optional[Dict[str, Any]] = None
    blockchain_tx_hash: Optional[str] = None
    verification_result: Optional[Dict[str, Any]] = None
    api_response: Optional[Dict[str, Any]] = None
    error_code: Optional[str] = None
    error_message: Optional[str] = None
    approval_id: Optional[str] = None

    # Canonical on-chain execution. These come from the TypeScript agent service; Python only
    # records them. is_mock marks simulated runs whose hashes must not be linked to an explorer.
    canonical_run_id: Optional[str] = None
    canonical_status: Optional[str] = None
    canonical_stage: Optional[str] = None
    task_id: Optional[str] = None
    escrow_tx: Optional[str] = None
    provider_tx: Optional[str] = None
    settlement_tx: Optional[str] = None
    result_hash: Optional[str] = None
    spent_mon: Optional[str] = None
    reward_mon: Optional[str] = None
    spending_limit_mon: Optional[str] = None
    settled: bool = False
    is_mock: bool = False
    execution_stages: List[Dict[str, Any]] = []


def _to_response(source: Dict[str, Any], **overrides: Any) -> "RequestStatusResponse":
    """Builds a response from graph state or a stored record, carrying canonical execution fields."""
    data: Dict[str, Any] = {
        "request_id": source.get("request_id", ""),
        "user_id": source.get("user_id", "user-1"),
        "agent_id": source.get("agent_id", "agent-1"),
        "raw_request": source.get("raw_request", ""),
        "final_status": source.get("final_status", "UNKNOWN"),
        "final_answer": source.get("final_answer"),
        "intent": source.get("intent"),
        "selected_api": source.get("selected_api"),
        "blockchain_tx_hash": source.get("blockchain_tx_hash"),
        "verification_result": source.get("verification_result"),
        "api_response": source.get("api_response"),
        "error_code": source.get("error_code"),
        "error_message": source.get("error_message"),
        "approval_id": source.get("approval_id"),
        "canonical_run_id": source.get("canonical_run_id"),
        "canonical_status": source.get("canonical_status"),
        "canonical_stage": source.get("canonical_stage"),
        "task_id": source.get("task_id"),
        "escrow_tx": source.get("escrow_tx"),
        "provider_tx": source.get("provider_tx"),
        "settlement_tx": source.get("settlement_tx"),
        "result_hash": source.get("result_hash"),
        "spent_mon": source.get("spent_mon"),
        "reward_mon": source.get("reward_mon"),
        "spending_limit_mon": source.get("spending_limit_mon"),
        "settled": bool(source.get("settled", False)),
        "is_mock": bool(source.get("is_mock", False)),
        "execution_stages": source.get("execution_stages") or [],
    }
    data.update(overrides)
    return RequestStatusResponse(**data)


async def _execute_request(req: CreateAgentRequest, req_id: str) -> None:
    """
    Runs the orchestration graph to completion in the background.

    A canonical execution takes minutes: it waits on real Monad Testnet receipts for createTask,
    payService and settleTask. Awaiting that inside the HTTP handler would hold the connection open
    for the whole run, so a proxy timeout or a closed browser tab would abandon a run that is
    already spending real MON. Running it detached lets the request return immediately while the
    graph publishes progress to the store after every node.

    Python still cannot authorize a payment here: the graph dispatches to the canonical TypeScript
    agent service over HTTP and holds no key, computes no resultHash and signs nothing.
    """
    try:
        await supervisor.run(
            raw_request=req.message,
            user_id=req.user_id,
            agent_id=req.agent_id,
            request_id=req_id,
        )
    except Exception as exc:  # noqa: BLE001 - a background task must never die silently
        # The run is unobservable if this is swallowed, so the failure is recorded on the request
        # itself. The message is deliberately generic: the detail goes to the server log only.
        logger.exception("Background execution failed for request %s", req_id)
        record = store.requests.get(req_id) or {}
        record.update(
            {
                "request_id": req_id,
                "final_status": "FAILED",
                "error_code": "INTERNAL_ERROR",
                "error_message": "Orchestration failed. See server logs for detail.",
                "_finalized": True,
            }
        )
        store.requests[req_id] = record


@router.post("", response_model=RequestStatusResponse, status_code=status.HTTP_202_ACCEPTED)
async def submit_agent_request(req: CreateAgentRequest, background_tasks: BackgroundTasks):
    """
    Accepts a task and returns 202 immediately with the request_id.

    The caller polls GET /v1/agent-requests/{request_id} to follow the lifecycle. The record is
    seeded into the store before this returns, so that poll can never 404 on a request the client
    was just told to poll.
    """
    req_id = req.request_id or f"AF-{uuid.uuid4().hex[:8]}"

    if req_id in store.requests:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Request '{req_id}' already exists.",
        )

    seed: Dict[str, Any] = {
        "request_id": req_id,
        "user_id": req.user_id,
        "agent_id": req.agent_id,
        "raw_request": req.message,
        "final_status": "RECEIVED",
        "canonical_status": "queued",
        "canonical_stage": "queued",
        "reward_mon": _format_mon(settings.task_reward_mon),
        "spending_limit_mon": _format_mon(settings.task_spending_limit_mon),
        "is_mock": settings.use_mock_payments,
        "execution_stages": [],
    }
    # Written before the response so the client's first poll always finds the request.
    store.requests[req_id] = seed

    background_tasks.add_task(_execute_request, req, req_id)

    return _to_response(seed)


@router.get("/{request_id}", response_model=RequestStatusResponse)
async def get_agent_request(request_id: str):
    record = store.requests.get(request_id)
    if not record:
        raise HTTPException(status_code=404, detail=f"Request '{request_id}' not found.")

    return _to_response(record, request_id=record.get("request_id", request_id))


@router.get("", response_model=List[RequestStatusResponse])
async def list_agent_requests():
    return [_to_response(r) for r in store.requests.values()]
