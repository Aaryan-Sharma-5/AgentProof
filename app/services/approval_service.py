"""
Human Approval Service.
Manages creation, resolution, expiration, and audit of manual human approval requests.
"""

from __future__ import annotations
import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict
from app.models.domain import ApprovalStatus
from app.schemas.approval import ApprovalRequest, ApprovalResponse, ApprovalDecision
from app.repositories.in_memory import store, InMemoryStore
from app.config.settings import settings


class ApprovalService:
    """Handles lifecycle of human approval workflows."""

    def __init__(self, data_store: Optional[InMemoryStore] = None):
        self.store = data_store or store
        self.ttl_seconds = settings.approval.default_ttl_seconds

    def create_approval_request(
        self,
        request_id: str,
        agent_id: str,
        user_id: str,
        amount_mon: float,
        provider_id: str,
        api_id: str,
        reasons: List[str],
    ) -> ApprovalRequest:
        """Creates a pending human approval request."""
        # Check if one already exists for this request (idempotency)
        for existing in self.store.approvals.values():
            if existing.request_id == request_id and existing.status == ApprovalStatus.PENDING:
                return existing

        now = datetime.now(timezone.utc)
        expires_at = now + timedelta(seconds=self.ttl_seconds)
        approval_id = f"appr_{uuid.uuid4().hex[:12]}"

        approval = ApprovalRequest(
            approval_id=approval_id,
            request_id=request_id,
            agent_id=agent_id,
            user_id=user_id,
            amount_mon=amount_mon,
            provider_id=provider_id,
            api_id=api_id,
            reasons=reasons,
            status=ApprovalStatus.PENDING,
            created_at=now,
            expires_at=expires_at
        )
        self.store.approvals[approval_id] = approval
        return approval

    def get_approval(self, approval_id: str) -> Optional[ApprovalRequest]:
        approval = self.store.approvals.get(approval_id)
        if not approval:
            return None

        # Check for expiry
        if approval.status == ApprovalStatus.PENDING:
            if datetime.now(timezone.utc) > approval.expires_at:
                approval.status = ApprovalStatus.EXPIRED
        return approval

    def resolve_approval(
        self,
        approval_id: str,
        decision: ApprovalDecision,
    ) -> ApprovalResponse:
        """Approves or rejects a pending human approval request."""
        approval = self.get_approval(approval_id)
        if not approval:
            return ApprovalResponse(
                approval_id=approval_id,
                request_id="",
                status=ApprovalStatus.REJECTED,
                message=f"Approval request '{approval_id}' not found."
            )

        if approval.status == ApprovalStatus.EXPIRED:
            return ApprovalResponse(
                approval_id=approval_id,
                request_id=approval.request_id,
                status=ApprovalStatus.EXPIRED,
                message="Approval request has expired."
            )

        if approval.status != ApprovalStatus.PENDING:
            return ApprovalResponse(
                approval_id=approval_id,
                request_id=approval.request_id,
                status=approval.status,
                message=f"Approval request is already resolved as '{approval.status}'."
            )

        # Update decision
        dec_upper = decision.decision.upper()
        approval.decided_by = decision.decided_by
        approval.decision_reason = decision.reason
        approval.decided_at = datetime.now(timezone.utc)

        if dec_upper == "APPROVE":
            approval.status = ApprovalStatus.APPROVED
            msg = "Approval granted by operator."
        else:
            approval.status = ApprovalStatus.REJECTED
            msg = f"Approval rejected by operator. Reason: {decision.reason or 'None'}"

        return ApprovalResponse(
            approval_id=approval_id,
            request_id=approval.request_id,
            status=approval.status,
            message=msg
        )
