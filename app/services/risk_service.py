"""
Risk Service.
Wraps the RiskEngine to provide domain risk evaluation operations.
"""

from __future__ import annotations
from typing import Optional
from app.agents.risk.engine import RiskEngine
from app.schemas.risk import RiskEvaluationInput, RiskEvaluationResult


class RiskService:
    def __init__(self, engine: Optional[RiskEngine] = None):
        self.engine = engine or RiskEngine()

    def assess_risk(self, inp: RiskEvaluationInput) -> RiskEvaluationResult:
        return self.engine.evaluate_risk(inp)
