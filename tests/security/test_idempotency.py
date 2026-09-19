"""
Security Tests: Idempotency & Replay Protection.
Verifies that side-effecting operations (payments, approvals) cannot be double-executed.
"""

import pytest
import asyncio
from app.blockchain.adapter import MockPaymentAdapter
from app.services.payment_service import PaymentService
from app.repositories.in_memory import InMemoryStore


def test_payment_idempotency_prevents_double_spend():
    store = InMemoryStore()
    gateway = MockPaymentAdapter(balance_mon=1.0)
    service = PaymentService(gateway=gateway, data_store=store)

    # First execution
    intent1 = service.create_intent(
        request_id="req-unique-1",
        agent_id="agent-1",
        provider_id="provider_demo_1",
        provider_address="0x444",
        amount_mon=0.05
    )
    res1 = asyncio.run(service.execute_payment(intent1.payment_intent_id))
    assert res1.success is True
    assert gateway.balance_mon == pytest.approx(0.95)

    # Second execution with exact same intent (simulating network retry / re-submission)
    res2 = asyncio.run(service.execute_payment(intent1.payment_intent_id))
    assert res2.success is True
    # Crucial assertion: Balance is STILL 0.95, no second deduction occurred!
    assert gateway.balance_mon == pytest.approx(0.95)
    assert res1.tx_hash == res2.tx_hash
