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

    return RequestStatusResponse(
        request_id=req_id,
        user_id=req.user_id,
        agent_id=req.agent_id,
        raw_request=req.message,
        final_status=final_state.get("final_status", "UNKNOWN"),
        intent=final_state.get("intent"),
        selected_api=final_state.get("selected_api"),
        blockchain_tx_hash=final_state.get("blockchain_tx_hash"),
        verification_result=final_state.get("verification_result"),
        api_response=final_state.get("api_response"),
        error_code=final_state.get("error_code"),
        error_message=final_state.get("error_message"),
        approval_id=final_state.get("approval_id")
    )


@router.get("/{request_id}", response_model=RequestStatusResponse)
async def get_agent_request(request_id: str):
    record = store.requests.get(request_id)
    if not record:
        raise HTTPException(status_code=404, detail=f"Request '{request_id}' not found.")

    return RequestStatusResponse(
        request_id=record.get("request_id", request_id),
        user_id=record.get("user_id", "user-1"),
        agent_id=record.get("agent_id", "agent-1"),
        raw_request=record.get("raw_request", ""),
        final_status=record.get("final_status", "UNKNOWN"),
        intent=record.get("intent"),
        selected_api=record.get("selected_api"),
        blockchain_tx_hash=record.get("blockchain_tx_hash"),
        verification_result=record.get("verification_result"),
        api_response=record.get("api_response"),
        error_code=record.get("error_code"),
        error_message=record.get("error_message"),
        approval_id=record.get("approval_id")
    )


@router.get("", response_model=List[RequestStatusResponse])
async def list_agent_requests():
    results = []
    for r in store.requests.values():
        results.append(
            RequestStatusResponse(
                request_id=r.get("request_id", ""),
                user_id=r.get("user_id", ""),
                agent_id=r.get("agent_id", ""),
                raw_request=r.get("raw_request", ""),
                final_status=r.get("final_status", "UNKNOWN"),
                intent=r.get("intent"),
                selected_api=r.get("selected_api"),
                blockchain_tx_hash=r.get("blockchain_tx_hash"),
                verification_result=r.get("verification_result"),
                api_response=r.get("api_response"),
                error_code=r.get("error_code"),
                error_message=r.get("error_message"),
                approval_id=r.get("approval_id")
            )
        )
    return results
