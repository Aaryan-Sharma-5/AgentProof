"""
Verification Pipeline Schemas.
Covers deterministic checks, semantic LLM verification, and final decision.
"""

from __future__ import annotations
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from app.models.domain import VerificationStatus
from app.schemas.intent import StructuredIntent


class TransportCheckResult(BaseModel):
    passed: bool
    status_code: int
    content_type: str
    response_size_bytes: int
    elapsed_ms: float
    error: Optional[str] = None


class SchemaCheckResult(BaseModel):
    passed: bool
    is_valid_json: bool
    missing_fields: List[str] = Field(default_factory=list)
    type_mismatches: List[str] = Field(default_factory=list)
    error: Optional[str] = None


class RequirementCheckResult(BaseModel):
    passed: bool
    target_matched: bool = True
    location_matched: bool = True
    freshness_matched: bool = True
    issues: List[str] = Field(default_factory=list)


class SemanticCheckResult(BaseModel):
    verified: bool
    confidence: float = Field(ge=0.0, le=1.0)
    issues: List[str] = Field(default_factory=list)
    reason: str
    is_prompt_injection_detected: bool = False


class VerificationResult(BaseModel):
    status: VerificationStatus
    confidence: float = Field(ge=0.0, le=1.0)
    transport_check: Optional[TransportCheckResult] = None
    schema_check: Optional[SchemaCheckResult] = None
    requirement_check: Optional[RequirementCheckResult] = None
    semantic_check: Optional[SemanticCheckResult] = None
    issues: List[str] = Field(default_factory=list)
    summary: str
