"""
Unit Tests for Payment Service & Mock Payment Adapter.
"""

import pytest
import asyncio
from app.services.payment_service import PaymentService
from app.blockchain.adapter import MockPaymentAdapter
from app.repositories.in_memory import InMemoryStore
from app.models.domain import PaymentStatus


@pytest.fixture
def fresh_store():
    return InMemoryStore()


@pytest.fixture
def mock_gateway():
    return MockPaymentAdapter(balance_mon=1.0)


@pytest.fixture
def payment_service(mock_gateway, fresh_store):
    return PaymentService(gateway=mock_gateway, data_store=fresh_store)


def test_idempotent_intent_creation(payment_service):
    intent1 = payment_service.create_intent(
        request_id="req_100",
        agent_id="agent-1",
        provider_id="prov_1",
        provider_address="0x111",
        amount_mon=0.02
    )
    intent2 = payment_service.create_intent(
        request_id="req_100",
        agent_id="agent-1",
        provider_id="prov_1",
        provider_address="0x111",
        amount_mon=0.02
    )
    assert intent1.payment_intent_id == intent2.payment_intent_id
    assert intent1.idempotency_key == intent2.idempotency_key


def test_payment_execution_success(payment_service, mock_gateway):
    intent = payment_service.create_intent(
        request_id="req_101",
        agent_id="agent-1",
        provider_id="prov_1",
        provider_address="0x111",
        amount_mon=0.02
    )
    res = asyncio.run(payment_service.execute_payment(intent.payment_intent_id))
    assert res.success is True
    assert res.status == PaymentStatus.CONFIRMED
    assert res.tx_hash is not None
    assert res.tx_hash.startswith("0x")
    assert mock_gateway.balance_mon == pytest.approx(0.98)


def test_insufficient_balance_failure(mock_gateway, fresh_store):
    low_balance_gateway = MockPaymentAdapter(balance_mon=0.01)
    service = PaymentService(gateway=low_balance_gateway, data_store=fresh_store)
    intent = service.create_intent(
        request_id="req_102",
        agent_id="agent-1",
        provider_id="prov_1",
        provider_address="0x111",
        amount_mon=0.05
    )
    res = asyncio.run(service.execute_payment(intent.payment_intent_id))
    assert res.success is False
    assert res.status == PaymentStatus.FAILED
    assert "insufficient" in res.error_message.lower()
