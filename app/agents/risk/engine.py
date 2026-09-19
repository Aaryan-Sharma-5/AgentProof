"""
Deterministic Risk Engine.
Evaluates multi-factor risk scores and decisions based on policy, provider trust,
spending thresholds, and operational frequency.
"""

from __future__ import annotations
from typing import List, Dict, Any
from app.schemas.risk import RiskEvaluationInput, RiskEvaluationResult
from app.models.domain import RiskLevel, RiskDecision
from app.config.settings import settings


class RiskEngine:
    """Calculates deterministic risk scores and routes decisions."""

    def __init__(self):
        self.cfg = settings.risk

    def evaluate_risk(self, inp: RiskEvaluationInput) -> RiskEvaluationResult:
        score = 0
        reasons: List[str] = []
        factors: Dict[str, Any] = {}

        # Rule 1: Suspended or inactive provider (Critical Block)
        if inp.provider.is_suspended or not inp.provider.is_active:
            reasons.append("Provider is suspended or inactive.")
            return RiskEvaluationResult(
                risk_score=100,
                risk_level=RiskLevel.CRITICAL,
                decision=RiskDecision.BLOCK,
                reasons=reasons,
                factors={"provider_suspended": True}
            )

        # Rule 2: Exceeds policy max transaction limit (Block)
        if inp.amount_mon > inp.policy.max_transaction_mon:
            reasons.append(f"Amount {inp.amount_mon} MON exceeds policy max {inp.policy.max_transaction_mon} MON.")
            return RiskEvaluationResult(
                risk_score=95,
                risk_level=RiskLevel.CRITICAL,
                decision=RiskDecision.BLOCK,
                reasons=reasons,
                factors={"amount_exceeds_max": True}
            )

        # Rule 3: Exceeds daily spending limit (Block)
        if (inp.current_daily_spend_mon + inp.amount_mon) > inp.policy.daily_limit_mon:
            reasons.append("Transaction would exceed agent daily spending limit.")
            return RiskEvaluationResult(
                risk_score=90,
                risk_level=RiskLevel.CRITICAL,
                decision=RiskDecision.BLOCK,
                reasons=reasons,
                factors={"daily_limit_exceeded": True}
            )

        # Base scoring:
        # Amount factor
        if inp.amount_mon >= self.cfg.high_value_mon_threshold:
            score += 35
            reasons.append(f"High transaction value ({inp.amount_mon} MON >= {self.cfg.high_value_mon_threshold} MON).")
            factors["high_value"] = True
        elif inp.amount_mon > (inp.policy.max_transaction_mon * 0.5):
            score += 15
            factors["moderate_value"] = True

        # Provider Reputation factor (0.0 - 1.0)
        if inp.provider.reputation_score < 0.70:
            score += 40
            reasons.append(f"Low provider reputation score ({inp.provider.reputation_score:.2f}).")
            factors["low_reputation"] = True
        elif inp.provider.reputation_score < 0.90:
            score += 15
            factors["moderate_reputation"] = True

        # Provider Verification Success Rate
        if inp.provider.verification_success_rate < 0.80:
            score += 30
            reasons.append(f"High historical verification failure rate ({1.0 - inp.provider.verification_success_rate:.1%}).")
            factors["high_failure_rate"] = True
        elif inp.provider.verification_success_rate < 0.95:
            score += 10

        # Historical request failures in current session
        if inp.historical_failure_count > 2:
            score += 25
            reasons.append(f"Multiple consecutive failures ({inp.historical_failure_count}) detected.")
            factors["consecutive_failures"] = inp.historical_failure_count

        # Request frequency factor
        if inp.request_frequency_rpm > 30:
            score += 20
            reasons.append(f"Unusual high request frequency ({inp.request_frequency_rpm} RPM).")
            factors["high_frequency"] = True

        # Cap score between 0 and 100
        score = min(100, max(0, score))
        factors["raw_score"] = score

        # Determine Risk Level
        if score <= self.cfg.low_max:
            level = RiskLevel.LOW
        elif score <= self.cfg.medium_max:
            level = RiskLevel.MEDIUM
        elif score <= self.cfg.high_max:
            level = RiskLevel.HIGH
        else:
            level = RiskLevel.CRITICAL

        # Determine Decision
        if score > self.cfg.high_max:
            decision = RiskDecision.BLOCK
        elif score > self.cfg.auto_approve_max_score:
            if inp.amount_mon >= self.cfg.high_value_mon_threshold:
                decision = RiskDecision.HUMAN_APPROVAL
            else:
                decision = RiskDecision.REVIEW
        else:
            decision = RiskDecision.AUTO_APPROVE

        return RiskEvaluationResult(
            risk_score=score,
            risk_level=level,
            decision=decision,
            reasons=reasons,
            factors=factors
        )
