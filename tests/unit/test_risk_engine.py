"""
Unit Tests for Risk Engine.
"""

import pytest
from app.agents.risk.engine import RiskEngine
from app.schemas.risk import RiskEvaluationInput
from app.models.domain import Provider, ApiRecord, AgentPolicy, RiskLevel, RiskDecision


@pytest.fixture
def risk_engine():
    return RiskEngine()


@pytest.fixture
def base_provider():
    return Provider(
        id="prov_1",
        name="Reliable Oracle",
        description="Trusted data provider",
        payment_address="0x123",
        is_active=True,
        is_suspended=False,
        reputation_score=0.98,
        verification_success_rate=0.99
    )


@pytest.fixture
def base_api():
    return ApiRecord(
        id="api_1",
        provider_id="prov_1",
        name="Price Feed",
        category="crypto_price",
        price_mon=0.01,
        endpoint="https://oracle.io/price"
    )


@pytest.fixture
def base_policy():
    return AgentPolicy(
        agent_id="agent-1",
        max_transaction_mon=0.10,
        daily_limit_mon=1.00
    )


def test_low_risk_auto_approve(risk_engine, base_provider, base_api, base_policy):
    inp = RiskEvaluationInput(
        request_id="r1",
        user_id="u1",
        agent_id="a1",
        amount_mon=0.01,
        current_daily_spend_mon=0.0,
        provider=base_provider,
        api=base_api,
        policy=base_policy
    )
    res = risk_engine.evaluate_risk(inp)
    assert res.risk_level == RiskLevel.LOW
    assert res.decision == RiskDecision.AUTO_APPROVE
    assert res.risk_score <= 29


def test_suspended_provider_critical_block(risk_engine, base_provider, base_api, base_policy):
    base_provider.is_suspended = True
    inp = RiskEvaluationInput(
        request_id="r2",
        user_id="u1",
        agent_id="a1",
        amount_mon=0.01,
        current_daily_spend_mon=0.0,
        provider=base_provider,
        api=base_api,
        policy=base_policy
    )
    res = risk_engine.evaluate_risk(inp)
    assert res.risk_level == RiskLevel.CRITICAL
    assert res.decision == RiskDecision.BLOCK
    assert res.risk_score == 100


def test_high_value_triggers_human_approval(risk_engine, base_provider, base_api, base_policy):
    # Set high max limit in policy to allow 0.12 MON through policy check
    base_policy.max_transaction_mon = 0.50
    base_api.price_mon = 0.12 # >= 0.10 high value threshold

    inp = RiskEvaluationInput(
        request_id="r3",
        user_id="u1",
        agent_id="a1",
        amount_mon=0.12,
        current_daily_spend_mon=0.0,
        provider=base_provider,
        api=base_api,
        policy=base_policy
    )
    res = risk_engine.evaluate_risk(inp)
    assert res.decision == RiskDecision.HUMAN_APPROVAL


def test_low_reputation_triggers_review(risk_engine, base_provider, base_api, base_policy):
    base_provider.reputation_score = 0.65 # Low reputation
    inp = RiskEvaluationInput(
        request_id="r4",
        user_id="u1",
        agent_id="a1",
        amount_mon=0.02,
        current_daily_spend_mon=0.0,
        provider=base_provider,
        api=base_api,
        policy=base_policy
    )
    res = risk_engine.evaluate_risk(inp)
    assert res.decision in (RiskDecision.REVIEW, RiskDecision.BLOCK)
    assert res.risk_score >= 30
