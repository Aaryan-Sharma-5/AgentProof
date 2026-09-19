"""
Unit Tests for Policy Service.
"""

import pytest
from app.services.policy_service import PolicyService
from app.schemas.policy import PolicyCheckInput
from app.models.domain import AgentPolicy


@pytest.fixture
def policy_service():
    return PolicyService()


@pytest.fixture
def sample_policy():
    return AgentPolicy(
        agent_id="agent-1",
        max_transaction_mon=0.10,
        daily_limit_mon=1.00,
        auto_approve=True,
        allowed_categories=["crypto_price", "weather"],
        require_human_above_mon=0.08,
        blocked_providers=["provider_bad"]
    )


def test_allowed_transaction(policy_service, sample_policy):
    inp = PolicyCheckInput(
        agent_id="agent-1",
        amount_mon=0.02,
        current_daily_spend_mon=0.10,
        category="crypto_price",
        provider_id="provider_good",
        policy=sample_policy
    )
    res = policy_service.evaluate(inp)
    assert res.is_allowed is True
    assert res.auto_approved is True
    assert res.requires_approval is False
    assert len(res.violations) == 0


def test_exceeds_max_transaction_cap(policy_service, sample_policy):
    inp = PolicyCheckInput(
        agent_id="agent-1",
        amount_mon=0.15, # Exceeds 0.10 cap
        current_daily_spend_mon=0.0,
        category="crypto_price",
        provider_id="provider_good",
        policy=sample_policy
    )
    res = policy_service.evaluate(inp)
    assert res.is_allowed is False
    assert any("exceeds maximum allowed" in v for v in res.violations)


def test_exceeds_daily_limit(policy_service, sample_policy):
    inp = PolicyCheckInput(
        agent_id="agent-1",
        amount_mon=0.05,
        current_daily_spend_mon=0.98, # Total 1.03 > 1.00 daily limit
        category="crypto_price",
        provider_id="provider_good",
        policy=sample_policy
    )
    res = policy_service.evaluate(inp)
    assert res.is_allowed is False
    assert any("exceeds daily limit" in v for v in res.violations)


def test_disallowed_category(policy_service, sample_policy):
    inp = PolicyCheckInput(
        agent_id="agent-1",
        amount_mon=0.01,
        current_daily_spend_mon=0.0,
        category="gambling",
        provider_id="provider_good",
        policy=sample_policy
    )
    res = policy_service.evaluate(inp)
    assert res.is_allowed is False
    assert any("not in policy allowed categories" in v for v in res.violations)


def test_blocked_provider(policy_service, sample_policy):
    inp = PolicyCheckInput(
        agent_id="agent-1",
        amount_mon=0.01,
        current_daily_spend_mon=0.0,
        category="crypto_price",
        provider_id="provider_bad",
        policy=sample_policy
    )
    res = policy_service.evaluate(inp)
    assert res.is_allowed is False
    assert any("blocked" in v for v in res.violations)


def test_human_approval_threshold(policy_service, sample_policy):
    inp = PolicyCheckInput(
        agent_id="agent-1",
        amount_mon=0.09, # Above 0.08 require_human_above_mon, below 0.10 max cap
        current_daily_spend_mon=0.0,
        category="crypto_price",
        provider_id="provider_good",
        policy=sample_policy
    )
    res = policy_service.evaluate(inp)
    assert res.is_allowed is True
    assert res.requires_approval is True
    assert res.auto_approved is False
