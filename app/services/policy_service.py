"""
Deterministic Policy Service.
Enforces spending caps, daily limits, category whitelists, and provider blocks.
LLMs cannot override these policy rules.
"""

from __future__ import annotations
from typing import List
from app.schemas.policy import PolicyCheckInput, PolicyCheckResult


class PolicyService:
    """Evaluates agent actions against strict deterministic policy constraints."""

    def evaluate(self, check: PolicyCheckInput) -> PolicyCheckResult:
        violations: List[str] = []
        policy = check.policy

        # 1. Blocked Provider Check
        if check.provider_id in policy.blocked_providers:
            violations.append(f"Provider '{check.provider_id}' is in agent blocked list.")

        # 2. Category Whitelist Check
        cat_lower = check.category.lower()
        allowed = [c.lower() for c in policy.allowed_categories]
        if cat_lower not in allowed:
            violations.append(f"Category '{check.category}' is not in policy allowed categories: {policy.allowed_categories}")

        # 3. Per-Transaction Limit Check
        if check.amount_mon > policy.max_transaction_mon:
            violations.append(
                f"Transaction amount {check.amount_mon:.4f} MON exceeds maximum allowed {policy.max_transaction_mon:.4f} MON."
            )

        # 4. Daily Spending Limit Check
        projected_spend = check.current_daily_spend_mon + check.amount_mon
        remaining_budget = max(0.0, policy.daily_limit_mon - check.current_daily_spend_mon)
        if projected_spend > policy.daily_limit_mon:
            violations.append(
                f"Projected daily spend {projected_spend:.4f} MON exceeds daily limit {policy.daily_limit_mon:.4f} MON."
            )

        # 5. Human Approval Threshold
        requires_approval = False
        if check.amount_mon > policy.require_human_above_mon:
            requires_approval = True

        if not policy.auto_approve:
            requires_approval = True

        is_allowed = len(violations) == 0
        auto_approved = is_allowed and not requires_approval

        if not is_allowed:
            reason = "Policy check failed: " + "; ".join(violations)
        elif requires_approval:
            reason = "Policy check passed, but transaction exceeds auto-approval threshold."
        else:
            reason = "Policy check passed with auto-approval."

        return PolicyCheckResult(
            is_allowed=is_allowed,
            requires_approval=requires_approval,
            violations=violations,
            effective_limit_mon=policy.max_transaction_mon,
            remaining_daily_budget_mon=remaining_budget,
            auto_approved=auto_approved,
            reason=reason
        )
