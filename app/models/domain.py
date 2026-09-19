"""
AgentFlow Domain Models, Enums, and Standardized Error Codes.
Defines entity representations, state machines, and lifecycle models.
"""

from __future__ import annotations
from enum import Enum
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from pydantic import BaseModel, Field


# --- Error Codes ---
class ErrorCode(str, Enum):
    INVALID_REQUEST = "INVALID_REQUEST"
    AMBIGUOUS_REQUEST = "AMBIGUOUS_REQUEST"
    NO_MATCHING_API = "NO_MATCHING_API"
    API_UNAVAILABLE = "API_UNAVAILABLE"
    API_TIMEOUT = "API_TIMEOUT"
    API_INVALID_RESPONSE = "API_INVALID_RESPONSE"
    POLICY_BLOCKED = "POLICY_BLOCKED"
    RISK_BLOCKED = "RISK_BLOCKED"
    APPROVAL_REQUIRED = "APPROVAL_REQUIRED"
    APPROVAL_EXPIRED = "APPROVAL_EXPIRED"
    APPROVAL_REJECTED = "APPROVAL_REJECTED"
    PAYMENT_FAILED = "PAYMENT_FAILED"
    PAYMENT_PENDING = "PAYMENT_PENDING"
    PAYMENT_REVERTED = "PAYMENT_REVERTED"
    VERIFICATION_FAILED = "VERIFICATION_FAILED"
    REFUND_FAILED = "REFUND_FAILED"
    SECURITY_BLOCKED = "SECURITY_BLOCKED"
    INTERNAL_ERROR = "INTERNAL_ERROR"


# --- Workflow & State Enums ---
class RequestStatus(str, Enum):
    RECEIVED = "RECEIVED"
    PARSED = "PARSED"
    CLARIFICATION = "CLARIFICATION"
    MATCHING = "MATCHING"
    POLICY_CHECK = "POLICY_CHECK"
    RISK_CHECK = "RISK_CHECK"
    AWAITING_APPROVAL = "AWAITING_APPROVAL"
    PAYMENT_PENDING = "PAYMENT_PENDING"
    PAYMENT_CONFIRMED = "PAYMENT_CONFIRMED"
    EXECUTING_API = "EXECUTING_API"
    VERIFYING = "VERIFYING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    HUMAN_REVIEW = "HUMAN_REVIEW"


class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class RiskDecision(str, Enum):
    AUTO_APPROVE = "AUTO_APPROVE"
    REVIEW = "REVIEW"
    BLOCK = "BLOCK"
    HUMAN_APPROVAL = "HUMAN_APPROVAL"


class ApprovalStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    EXPIRED = "EXPIRED"


class PaymentStatus(str, Enum):
    CREATED = "CREATED"
    POLICY_CHECKED = "POLICY_CHECKED"
    APPROVED = "APPROVED"
    SUBMITTED = "SUBMITTED"
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    FAILED = "FAILED"
    REVERTED = "REVERTED"
    CANCELLED = "CANCELLED"
    EXPIRED = "EXPIRED"


class VerificationStatus(str, Enum):
    VERIFIED = "VERIFIED"
    PARTIALLY_VERIFIED = "PARTIALLY_VERIFIED"
    FAILED = "FAILED"
    REQUIRES_REVIEW = "REQUIRES_REVIEW"


class ApiExecutionStatus(str, Enum):
    READY = "READY"
    EXECUTING = "EXECUTING"
    RESPONSE_RECEIVED = "RESPONSE_RECEIVED"
    RESPONSE_VALIDATED = "RESPONSE_VALIDATED"
    TIMEOUT = "TIMEOUT"
    HTTP_ERROR = "HTTP_ERROR"
    RATE_LIMITED = "RATE_LIMITED"
    INVALID_RESPONSE = "INVALID_RESPONSE"
    SCHEMA_ERROR = "SCHEMA_ERROR"
    SECURITY_BLOCKED = "SECURITY_BLOCKED"


class EventType(str, Enum):
    REQUEST_RECEIVED = "REQUEST_RECEIVED"
    REQUIREMENT_PARSED = "REQUIREMENT_PARSED"
    CLARIFICATION_REQUIRED = "CLARIFICATION_REQUIRED"
    API_DISCOVERED = "API_DISCOVERED"
    API_SELECTED = "API_SELECTED"
    POLICY_CHECKED = "POLICY_CHECKED"
    RISK_EVALUATED = "RISK_EVALUATED"
    APPROVAL_REQUIRED = "APPROVAL_REQUIRED"
    APPROVED = "APPROVED"
    APPROVAL_REJECTED = "APPROVAL_REJECTED"
    PAYMENT_CREATED = "PAYMENT_CREATED"
    PAYMENT_SUBMITTED = "PAYMENT_SUBMITTED"
    PAYMENT_CONFIRMED = "PAYMENT_CONFIRMED"
    PAYMENT_FAILED = "PAYMENT_FAILED"
    API_CALLED = "API_CALLED"
    API_RESPONSE_RECEIVED = "API_RESPONSE_RECEIVED"
    VERIFICATION_STARTED = "VERIFICATION_STARTED"
    VERIFICATION_PASSED = "VERIFICATION_PASSED"
    VERIFICATION_FAILED = "VERIFICATION_FAILED"
    REFUND_REQUESTED = "REFUND_REQUESTED"
    REQUEST_COMPLETED = "REQUEST_COMPLETED"
    REQUEST_FAILED = "REQUEST_FAILED"


# --- Domain Entity Models ---
class User(BaseModel):
    id: str
    username: str
    email: str
    wallet_address: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Agent(BaseModel):
    id: str
    user_id: str
    name: str
    description: str
    is_active: bool = True
    spending_limit_mon: float = 0.10
    daily_limit_mon: float = 1.00
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class AgentPolicy(BaseModel):
    agent_id: str
    max_transaction_mon: float = 0.10
    daily_limit_mon: float = 1.00
    auto_approve: bool = True
    allowed_categories: List[str] = Field(
        default_factory=lambda: ["crypto_price", "weather", "finance", "competitor_pricing", "market_data", "general_data"]
    )
    require_human_above_mon: float = 0.10
    blocked_providers: List[str] = Field(default_factory=list)


class Provider(BaseModel):
    id: str
    name: str
    description: str
    payment_address: str
    is_active: bool = True
    is_suspended: bool = False
    reputation_score: float = 0.95 # 0.0 - 1.0
    verification_success_rate: float = 0.98 # 0.0 - 1.0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ApiRecord(BaseModel):
    id: str
    provider_id: str
    name: str
    category: str
    version: str = "1.0.0"
    method: str = "GET"
    endpoint: str
    price_mon: float
    currency: str = "MON"
    timeout_ms: int = 5000
    is_active: bool = True
    is_deprecated: bool = False
    rate_limit_rpm: int = 60
    input_schema: Dict[str, Any] = Field(default_factory=dict)
    output_schema: Dict[str, Any] = Field(default_factory=dict)
    supported_targets: List[str] = Field(default_factory=list)
    reliability_score: float = 0.95
    tags: List[str] = Field(default_factory=list)


class AuditEvent(BaseModel):
    event_id: str
    request_id: str
    event_type: EventType
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    agent_id: Optional[str] = None
    api_id: Optional[str] = None
    status: str
    details: Dict[str, Any] = Field(default_factory=dict)
    error_code: Optional[str] = None
