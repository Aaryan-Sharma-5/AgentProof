"""
Structured Requirement Intent Schemas.
Enforces Pydantic structured output for requirement understanding agent.
Never trusts raw LLM output.
"""

from __future__ import annotations
from typing import Optional, List, Any
from pydantic import BaseModel, Field, field_validator


class StructuredIntent(BaseModel):
    task: str = Field(description="Action to perform, e.g. retrieve_data, compare_data, summarize")
    category: str = Field(description="Domain category, e.g. crypto_price, weather, finance, competitor_pricing")
    target: Optional[str] = Field(default=None, description="Primary asset, subject, or ticker, e.g. BTC, ETH")
    location: Optional[str] = Field(default=None, description="Geographic location if applicable, e.g. Mumbai, New York")
    freshness: str = Field(default="current", description="Timeframe requirement, e.g. current, historical, realtime")
    required_fields: List[str] = Field(default_factory=lambda: ["price"], description="Required fields in the result")
    max_budget: Optional[float] = Field(default=None, description="Maximum budget in MON if specified by user")

    @field_validator("task")
    @classmethod
    def validate_task(cls, v: str) -> str:
        v = v.strip().lower()
        if not v:
            raise ValueError("Task cannot be empty")
        return v

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: str) -> str:
        v = v.strip().lower()
        if not v:
            raise ValueError("Category cannot be empty")
        return v


class RequirementInput(BaseModel):
    request_id: str
    user_id: str
    agent_id: str
    message: str


class RequirementOutput(BaseModel):
    intent: Optional[StructuredIntent] = None
    confidence: float = Field(ge=0.0, le=1.0, description="Confidence score from 0.0 to 1.0")
    needs_clarification: bool = False
    clarification_question: Optional[str] = None
    reasoning: Optional[str] = None
    is_supported: bool = True
    error_message: Optional[str] = None
