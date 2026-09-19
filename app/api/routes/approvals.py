"""
Human Approvals API Routes.
"""

from __future__ import annotations
from typing import List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.models.domain import ApprovalStatus
from app.schemas.approval import ApprovalRequest, ApprovalDecision, ApprovalResponse
from app.services.approval_service import ApprovalService
from app.repositories.in_memory import store

router = APIRouter(prefix="/approvals", tags=["Approvals"])
approval_service = ApprovalService(store)


class DecisionBody(BaseModel):
    reason: Optional[str] = None
    decided_by: str = "operator_alice"


@router.get("", response_model=List[ApprovalRequest])
async def list_approvals(status_filter: Optional[ApprovalStatus] = None):
    results = []
    for app in store.approvals.values():
        current = approval_service.get_approval(app.approval_id)
        if current:
            if status_filter and current.status != status_filter:
                continue
            results.append(current)
    return results


@router.get("/{approval_id}", response_model=ApprovalRequest)
async def get_approval(approval_id: str):
    app = approval_service.get_approval(approval_id)
    if not app:
        raise HTTPException(status_code=404, detail="Approval request not found.")
    return app


@router.post("/{approval_id}/approve", response_model=ApprovalResponse)
async def approve_request(approval_id: str, body: DecisionBody):
    decision = ApprovalDecision(
        decision="APPROVE",
        reason=body.reason,
        decided_by=body.decided_by
    )
    resp = approval_service.resolve_approval(approval_id, decision)
    if resp.status == ApprovalStatus.EXPIRED:
        raise HTTPException(status_code=410, detail=resp.message)

    # Resume the paused workflow for this request
    if resp.status == ApprovalStatus.APPROVED and resp.request_id:
        saved_state = store.requests.get(resp.request_id)
        if saved_state:
            saved_state["approval_status"] = "APPROVED"
            saved_state["resume_from"] = "create_payment_intent"
            from app.graph.graph import workflow_graph
            await workflow_graph.ainvoke(saved_state)

    return resp


@router.post("/{approval_id}/reject", response_model=ApprovalResponse)
async def reject_request(approval_id: str, body: DecisionBody):
    decision = ApprovalDecision(
        decision="REJECT",
        reason=body.reason,
        decided_by=body.decided_by
    )
    resp = approval_service.resolve_approval(approval_id, decision)

    if resp.request_id:
        saved_state = store.requests.get(resp.request_id)
        if saved_state:
            saved_state["approval_status"] = "REJECTED"
            saved_state["final_status"] = "FAILED"
            saved_state["error_code"] = "APPROVAL_REJECTED"
            saved_state["error_message"] = f"Human approval rejected: {body.reason or 'None'}"

    return resp
