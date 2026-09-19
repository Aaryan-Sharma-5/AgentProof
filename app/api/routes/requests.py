"""
Agent Requests API Routes.
Submits natural language requirements to the LangGraph orchestration engine
and queries request execution status and verified results.
"""

from __future__ import annotations
import uuid
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, BackgroundTasks, status
from pydantic import BaseModel, Field
from app.graph.state import AgentFlowState
from app.agents.supervisor.supervisor import SupervisorAgent
from app.repositories.in_memory import store

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


@router.post("", response_model=RequestStatusResponse, status_code=status.HTTP_202_ACCEPTED)
async def submit_agent_request(req: CreateAgentRequest):
    req_id = req.request_id or f"AF-{uuid.uuid4().hex[:8]}"

    # Execute workflow graph asynchronously
    final_state = await supervisor.run(
        raw_request=req.message,
        user_id=req.user_id,
        agent_id=req.agent_id,
        request_id=req_id
    )

    return _to_response(
        final_state,
        request_id=req_id,
        user_id=req.user_id,
        agent_id=req.agent_id,
        raw_request=req.message,
    )


@router.get("/{request_id}", response_model=RequestStatusResponse)
async def get_agent_request(request_id: str):
    record = store.requests.get(request_id)
    if not record:
        raise HTTPException(status_code=404, detail=f"Request '{request_id}' not found.")

    return _to_response(record, request_id=record.get("request_id", request_id))


@router.get("", response_model=List[RequestStatusResponse])
async def list_agent_requests():
    return [_to_response(r) for r in store.requests.values()]
