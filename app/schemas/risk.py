"""
Risk Engine Schemas.
Deterministic risk evaluation inputs, score breakdowns, and decisions.
"""

from __future__ import annotations
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from app.models.domain import RiskLevel, RiskDecision, Provider, ApiRecord, AgentPolicy


class RiskEvaluationInput(BaseModel):
    request_id: str
    user_id: str
    agent_id: str
    amount_mon: float
    current_daily_spend_mon: float
    provider: Provider
    api: ApiRecord
    policy: AgentPolicy
    historical_failure_count: int = 0
    request_frequency_rpm: int = 1


class RiskEvaluationResult(BaseModel):
    risk_score: int = Field(ge=0, le=100, description="Risk score 0-100")
    risk_level: RiskLevel
    decision: RiskDecision
    reasons: List[str] = Field(default_factory=list)
    factors: Dict[str, Any] = Field(default_factory=dict)
