"""
Policy Validation Schemas.
Deterministic policy inputs and evaluation outputs.
"""

from __future__ import annotations
from typing import Optional, List
from pydantic import BaseModel, Field
from app.models.domain import AgentPolicy, ApiRecord


class PolicyCheckInput(BaseModel):
    agent_id: str
    amount_mon: float
    current_daily_spend_mon: float
    category: str
    provider_id: str
    policy: AgentPolicy


class PolicyCheckResult(BaseModel):
    is_allowed: bool
    requires_approval: bool = False
    violations: List[str] = Field(default_factory=list)
    effective_limit_mon: float
    remaining_daily_budget_mon: float
    auto_approved: bool = False
    reason: str
