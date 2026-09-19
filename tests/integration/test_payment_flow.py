"""
Integration Tests for Approvals, Transactions, and Monitoring Endpoints.
"""

import pytest
try:
    from fastapi.testclient import TestClient
except Exception:
    from app.testing.client import InMemoryTestClient as TestClient
from app.main import app
from app.services.approval_service import ApprovalService
from app.repositories.in_memory import store


@pytest.fixture
def client():
    return TestClient(app)


def test_approval_resolution_flow(client):
    app_service = ApprovalService(store)
    created = app_service.create_approval_request(
        request_id="AF-APPROVAL-INT",
        agent_id="agent-1",
        user_id="user-1",
        amount_mon=0.15,
        provider_id="provider_demo_1",
        api_id="api_crypto_expensive_1",
        reasons=["Exceeds auto-approval threshold"]
    )

    # 1. List approvals
    res_list = client.get("/v1/approvals")
    assert res_list.status_code == 200
    ids = [a["approval_id"] for a in res_list.json()]
    assert created.approval_id in ids

    # 2. Approve via POST
    res_approve = client.post(
        f"/v1/approvals/{created.approval_id}/approve",
        json={"reason": "Approved by security manager", "decided_by": "manager_alice"}
    )
    assert res_approve.status_code == 200
    data_appr = res_approve.json()
    assert data_appr["status"] == "APPROVED"


def test_monitoring_events_endpoint(client):
    res = client.get("/v1/monitoring/events")
    assert res.status_code == 200
    events = res.json()
    assert isinstance(events, list)


def test_transactions_endpoints(client):
    # Ensure listing transactions works
    res = client.get("/v1/transactions")
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_blockchain_reconciliation_crashed_recovery():
    """
    SECTION 57 & 61: Test blockchain reconciliation recovering from a backend crash.
    Scenario: Intent was SUBMITTED, backend crashed before persistence, chain is CONFIRMED.
    Reconciler must update both Intent and Request states to CONFIRMED.
    """
    import asyncio
    from app.repositories.in_memory import InMemoryStore
    from app.blockchain.adapter import MockPaymentAdapter
    from app.blockchain.reconciliation import BlockchainReconciler
    from app.models.domain import PaymentStatus
    from app.schemas.payment import PaymentIntent

    test_store = InMemoryStore()
    gateway = MockPaymentAdapter(balance_mon=1.0)
    tx_hash = "0xreconcile_test_hash"

    intent = PaymentIntent(
        payment_intent_id="pi_reconcile_1",
        request_id="AF-RECONCILE-1",
        agent_id="agent-1",
        provider_id="prov_1",
        provider_address="0x111",
        amount_mon=0.05,
        amount_wei=50000000000000000,
        status=PaymentStatus.SUBMITTED,
        idempotency_key="payment:AF-RECONCILE-1",
        tx_hash=tx_hash
    )
    test_store.payment_intents["pi_reconcile_1"] = intent

    test_store.requests["AF-RECONCILE-1"] = {
        "request_id": "AF-RECONCILE-1",
        "payment_status": PaymentStatus.SUBMITTED.value,
        "final_status": "PAYMENT_PENDING"
    }

    gateway.transactions[tx_hash] = {
        "provider_address": "0x111",
        "amount_mon": 0.05,
        "status": PaymentStatus.CONFIRMED,
        "block_number": 100050
    }

    reconciler = BlockchainReconciler(payment_gateway=gateway, data_store=test_store)
    reconciled = asyncio.run(reconciler.reconcile_pending_payments())

    assert len(reconciled) == 1
    assert reconciled[0]["payment_intent_id"] == "pi_reconcile_1"
    assert reconciled[0]["new_status"] == PaymentStatus.CONFIRMED.value

    assert intent.status == PaymentStatus.CONFIRMED

    # Request state must be recovered to CONFIRMED
    recovered_req = test_store.requests["AF-RECONCILE-1"]
    assert recovered_req["payment_status"] == PaymentStatus.CONFIRMED.value
    assert recovered_req["final_status"] == "PAYMENT_CONFIRMED"
    assert recovered_req["blockchain_tx_hash"] == tx_hash


def test_blockchain_event_listener():
    """
    SECTION 57: Test decoding of PaymentSettled contract event log.
    """
    from app.blockchain.events import BlockchainEventListener

    listener = BlockchainEventListener()
    raw_log = {
        "provider": "0x2222222222222222222222222222222222222222",
        "amount": 20000000000000000, # 0.02 MON in wei
        "transactionHash": "0xabcdef1234567890",
        "blockNumber": 123456
    }

    event = listener.decode_log(raw_log)
    assert event is not None
    assert event.provider == "0x2222222222222222222222222222222222222222"
    assert event.amount_wei == 20000000000000000
    assert event.amount_mon == pytest.approx(0.02)
    assert event.tx_hash == "0xabcdef1234567890"
    assert event.block_number == 123456
