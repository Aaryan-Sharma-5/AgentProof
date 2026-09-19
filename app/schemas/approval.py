"""
Human Approval Schemas.
Models for creating and resolving human approval requests.
"""

from __future__ import annotations
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from pydantic import BaseModel, Field
from app.models.domain import ApprovalStatus


class ApprovalRequest(BaseModel):
    approval_id: str
    request_id: str
    agent_id: str
    user_id: str
    amount_mon: float
    provider_id: str
    api_id: str
    reasons: List[str]
    status: ApprovalStatus = ApprovalStatus.PENDING
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    expires_at: datetime
    decision_reason: Optional[str] = None
    decided_by: Optional[str] = None
    decided_at: Optional[datetime] = None


class ApprovalDecision(BaseModel):
    decision: str = Field(description="'APPROVE' or 'REJECT'")
    reason: Optional[str] = None
    decided_by: str = "human_operator"


class ApprovalResponse(BaseModel):
    approval_id: str
    request_id: str
    status: ApprovalStatus
    message: str
