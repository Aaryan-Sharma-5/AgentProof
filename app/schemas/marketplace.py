"""
Marketplace and API Discovery Schemas.
Deterministic ranking and candidate filtering models.
"""

from __future__ import annotations
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from app.models.domain import ApiRecord


class DiscoveryFilter(BaseModel):
    category: Optional[str] = None
    target: Optional[str] = None
    max_price_mon: Optional[float] = None
    min_reliability: float = 0.80
    min_reputation: float = 0.80
    active_only: bool = True


class ApiScoreBreakdown(BaseModel):
    capability_score: float = Field(ge=0.0, le=1.0)
    schema_score: float = Field(ge=0.0, le=1.0)
    reliability_score: float = Field(ge=0.0, le=1.0)
    verification_score: float = Field(ge=0.0, le=1.0)
    reputation_score: float = Field(ge=0.0, le=1.0)
    price_score: float = Field(ge=0.0, le=1.0)
    total_score: float = Field(ge=0.0, le=1.0)
    weights_applied: Dict[str, float]


class ScoredApiCandidate(BaseModel):
    api: ApiRecord
    score: float
    breakdown: ApiScoreBreakdown
    selection_reason: str


class DiscoveryResult(BaseModel):
    candidates_found: int
    selected_api: Optional[ApiRecord] = None
    scored_candidates: List[ScoredApiCandidate] = Field(default_factory=list)
    rejection_reasons: Dict[str, str] = Field(default_factory=dict)
    explanation: Optional[str] = None
