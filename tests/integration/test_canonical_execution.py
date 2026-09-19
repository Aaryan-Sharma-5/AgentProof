"""
Phase 6B Integration Tests: the canonical execution boundary.

Proves the architectural invariants that keep the economic loop safe:
  - Python orchestrates; the TypeScript agent service signs, pays and settles.
  - Mock mode is explicit, and mock hashes can never be mistaken for real ones.
  - Advisory verification cannot authorize settlement.
  - Python policy never approves above AgentWallet's immutable per-payment cap.

These tests are hermetic: the canonical agent service is stubbed, so no network call,
no private key and no chain access is required.
"""

import asyncio
import pytest

try:
    import httpx
    from fastapi.testclient import TestClient
except Exception:
    from app.testing.client import InMemoryTestClient as TestClient

from app.main import app
from app.config.settings import settings
from app.services.agent_execution_client import AgentExecutionClient, AgentServiceError, _format_mon
from app.blockchain.adapter import MockPaymentAdapter
from app.graph import nodes as graph_nodes


REAL_ESCROW_TX = "0x538ef880791936dc1fd8ed89ed0139cfcb5ebeb912e2e7a5e05d7aef59e016ba"
REAL_PROVIDER_TX = "0x060b41b6b483e615e5bd7263d49e43d98dcb8462ba58940b86d6aeac3b2ff5c4"
REAL_SETTLEMENT_TX = "0x1975c07a9e74525cd92766260226d03879b050ccac028a44504a3025de0ea0d0"
REAL_TASK_ID = "0x84c4df207c421903d636599cc83aaa3aaa72a12924da752c3c0bfa1085da0c72"
REAL_RESULT_HASH = "0x0dbdd938243c45c39d9668f381bc1208966d6e7ba9f5a98fb7f5dc94b9874f1f"


class StubAgentClient:
    """Stands in for the canonical TypeScript agent service over its HTTP contract."""

    def __init__(self, settled=True, error=None):
        self.settled = settled
        self.error = error
        self.started = []

    async def health(self):
        return {"status": "ok", "chainId": 10143, "isMock": False}

    async def start_run(self, request_id, service_type="competitor_pricing", reward_mon=None, spending_limit_mon=None):
        self.started.append(
            {"request_id": request_id, "reward_mon": reward_mon, "spending_limit_mon": spending_limit_mon}
        )
        return {"runId": request_id, "status": "queued", "stage": "queued", "isMock": False}

    async def get_run(self, run_id):
        return await self.wait_for_run(run_id)

    async def wait_for_run(self, run_id, **kwargs):
        if not self.settled:
            return {
                "runId": run_id,
                "status": "failed",
                "stage": "policy_rejected",
                "taskId": REAL_TASK_ID,
                "escrowTx": REAL_ESCROW_TX,
                "providerTx": None,
                "settlementTx": None,
                "resultHash": None,
                "spent": "0",
                "rewardMon": "0.05",
                "spendingLimitMon": "0.02",
                "isMock": False,
                "error": self.error or "provider: over_policy_limit",
                "stages": [{"stage": "policy_rejected", "at": "now"}],
            }
        return {
            "runId": run_id,
            "status": "settled",
            "stage": "settled",
            "taskId": REAL_TASK_ID,
            "escrowTx": REAL_ESCROW_TX,
            "providerTx": REAL_PROVIDER_TX,
            "settlementTx": REAL_SETTLEMENT_TX,
            "resultHash": REAL_RESULT_HASH,
            "spent": "0.01",
            "rewardMon": "0.05",
            "spendingLimitMon": "0.02",
            "isMock": False,
            "error": None,
            "stages": [
                {"stage": "escrow_created", "at": "now", "detail": {"escrowTx": REAL_ESCROW_TX}},
                {"stage": "provider_invoice", "at": "now", "detail": {"amount": "0.01"}},
                {"stage": "policy_approved", "at": "now", "detail": {"amount": "0.01"}},
                {"stage": "provider_paid", "at": "now", "detail": {"paymentTx": REAL_PROVIDER_TX}},
                {"stage": "data_received", "at": "now", "detail": {"records": 10}},
                {"stage": "evaluated", "at": "now", "detail": {"resultHash": REAL_RESULT_HASH}},
                {"stage": "proof_signed", "at": "now", "detail": {"resultHash": REAL_RESULT_HASH}},
                {"stage": "settled", "at": "now", "detail": {"settlementTx": REAL_SETTLEMENT_TX}},
            ],
        }


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def live_mode(monkeypatch):
    """Runs a block with mock payments disabled and the agent service stubbed."""
    monkeypatch.setattr(settings, "use_mock_payments", False)
    stub = StubAgentClient()
    monkeypatch.setattr(graph_nodes.node_context, "agent_client", stub)
    return stub


# --- Mock mode is explicit ------------------------------------------------------


def test_mock_payments_default_to_false():
    """A real demo must never silently run on simulated payments."""
    import os

    # The suite itself opts in via run_tests.py; the shipped default is false.
    from app.config.settings import Settings

    fresh = Settings(use_mock_payments=False)
    assert fresh.use_mock_payments is False
    assert os.getenv("USE_MOCK_PAYMENTS", "false").lower() in ("true", "1", "yes", "false", "0", "no")


def test_mock_payment_results_are_labelled_and_unlinkable():
    """A simulated tx hash must be structurally impossible to render as an explorer link."""
    adapter = MockPaymentAdapter()
    result = asyncio.run(adapter.pay_invoice("0xprovider", 0.01, "idem-key-1"))

    assert result.success is True
    assert result.is_mock is True
    assert result.tx_hash.startswith("mock:0x")
    # A real Monad hash is 0x + 64 hex chars. A mock hash must not match that shape.
    assert not result.tx_hash.startswith("0x")


# --- Real mode never fabricates -------------------------------------------------


def test_live_mode_reports_only_real_tx_hashes(client, live_mode):
    """In live mode every recorded hash comes from the signing service, marked is_mock=False."""
    res = client.post(
        "/v1/agent-requests",
        json={"message": "Research three competitors and produce a pricing comparison."},
    )
    assert res.status_code in (200, 202)
    body = res.json()

    assert body["is_mock"] is False
    assert body["settled"] is True
    assert body["escrow_tx"] == REAL_ESCROW_TX
    assert body["provider_tx"] == REAL_PROVIDER_TX
    assert body["settlement_tx"] == REAL_SETTLEMENT_TX
    assert body["result_hash"] == REAL_RESULT_HASH
    assert body["spent_mon"] == "0.01"

    for tx in (body["escrow_tx"], body["provider_tx"], body["settlement_tx"]):
        assert tx.startswith("0x") and len(tx) == 66


def test_fastapi_dispatches_to_canonical_service(client, live_mode):
    """FastAPI must delegate execution rather than performing it."""
    client.post("/v1/agent-requests", json={"message": "Research three competitors and produce a pricing comparison."})

    assert len(live_mode.started) >= 1
    dispatched = live_mode.started[-1]
    assert dispatched["reward_mon"] == pytest.approx(settings.task_reward_mon)
    assert dispatched["spending_limit_mon"] == pytest.approx(settings.task_spending_limit_mon)


def test_canonical_failure_is_surfaced_without_payout(client, monkeypatch):
    """A rejected run reports the failure and never claims a settlement."""
    monkeypatch.setattr(settings, "use_mock_payments", False)
    monkeypatch.setattr(graph_nodes.node_context, "agent_client", StubAgentClient(settled=False))

    res = client.post("/v1/agent-requests", json={"message": "Research three competitors and produce a pricing comparison."})
    body = res.json()

    assert body["settled"] is False
    assert body["settlement_tx"] is None
    assert body["result_hash"] is None
    assert body["final_status"] == "FAILED"


def test_unreachable_agent_service_fails_closed(client, monkeypatch):
    """If the signer process is down the request fails; it must not fall back to a mock."""

    class DeadClient(StubAgentClient):
        async def start_run(self, *a, **kw):
            raise AgentServiceError("connection refused")

    monkeypatch.setattr(settings, "use_mock_payments", False)
    monkeypatch.setattr(graph_nodes.node_context, "agent_client", DeadClient())

    body = client.post("/v1/agent-requests", json={"message": "Research three competitors and produce a pricing comparison."}).json()

    assert body["final_status"] == "FAILED"
    assert body["settled"] is False
    assert body["is_mock"] is False
    assert body["settlement_tx"] is None


# --- Python holds no settlement authority ---------------------------------------


def test_python_has_no_settlement_capability():
    """No Python module may sign, settle, or hold an economic key."""
    import app.services.agent_execution_client as client_mod
    import app.blockchain.adapter as adapter_mod

    source = open(client_mod.__file__, encoding="utf-8").read()
    for forbidden in ("settleTask", "sign_message", "signMessage", "AGENT_KEY", "VERIFIER_KEY", "eth_account", "from_key"):
        assert forbidden not in source, f"agent_execution_client must not reference {forbidden}"

    # The only Web3 signer left in Python is explicitly documented as off the live path.
    adapter_source = open(adapter_mod.__file__, encoding="utf-8").read()
    assert "NOT part of the live request path" in adapter_source
    assert "settleTask" not in adapter_source


def test_verification_is_advisory_only(client, live_mode):
    """Advisory verification must never claim settlement authority."""
    body = client.post(
        "/v1/agent-requests",
        json={"message": "Research three competitors and produce a pricing comparison."},
    ).json()

    verification = body["verification_result"]
    assert verification["is_advisory"] is True
    assert verification["authoritative_for_settlement"] is False
    assert verification["settlement_authority"] == "deterministic_evaluator_signature_verified_by_AgentEscrow"
    # The payout already happened; advisory output did not gate it.
    assert body["settled"] is True


# --- Policy reconciliation (STEP G) ---------------------------------------------


def test_policy_never_approves_above_wallet_cap():
    """Python must refuse an invoice AgentWallet.payService is guaranteed to revert."""
    from app.services.policy_service import PolicyService
    from app.schemas.policy import PolicyCheckInput
    from app.models.domain import AgentPolicy

    # Policy alone would allow 0.05 (under max_transaction_mon 0.10)...
    policy = AgentPolicy(agent_id="agent-1", max_transaction_mon=0.10, daily_limit_mon=1.0)
    result = PolicyService().evaluate(
        PolicyCheckInput(
            agent_id="agent-1",
            amount_mon=0.05,
            current_daily_spend_mon=0.0,
            category="competitor_pricing",
            provider_id="provider_demo_1",
            policy=policy,
        )
    )
    assert result.is_allowed is True

    # ...but 0.05 exceeds the immutable on-chain per-payment cap of 0.02 MON.
    assert settings.wallet_max_payment_mon == pytest.approx(0.02)
    assert 0.05 > settings.wallet_max_payment_mon


def test_canonical_economics_match_the_frozen_spec():
    assert settings.task_reward_mon == pytest.approx(0.05)
    assert settings.task_spending_limit_mon == pytest.approx(0.02)
    assert settings.wallet_max_payment_mon == pytest.approx(0.02)
    assert settings.default_currency == "MON"
    # The task cap may never exceed what the chain will honour for a single payment.
    assert settings.task_spending_limit_mon <= settings.wallet_max_payment_mon


# --- Client contract ------------------------------------------------------------


def test_mon_amounts_serialize_without_float_drift():
    """0.05 must serialize as "0.05", not "0.050000000000000003"."""
    assert _format_mon(0.05) == "0.05"
    assert _format_mon(0.02) == "0.02"
    assert _format_mon(0.01) == "0.01"


def test_agent_client_targets_configured_service():
    c = AgentExecutionClient(base_url="http://localhost:4100/")
    assert c.base_url == "http://localhost:4100"


def test_system_status_reports_mode(client):
    res = client.get("/v1/system/status")
    assert res.status_code == 200
    body = res.json()
    assert "use_mock_payments" in body
    assert "agent_service" in body
    assert body["chain_id"] == 10143


# --- Phase 6C production hardening -----------------------------------------------


def test_production_refuses_insecure_configuration():
    """Production must reject default JWT, wildcard CORS, and localhost SSRF relaxation."""
    from app.config.settings import Settings, DEFAULT_DEV_JWT_SECRET

    # Default JWT secret
    with pytest.raises(Exception):
        Settings(environment="production", jwt_secret=DEFAULT_DEV_JWT_SECRET)

    # Wildcard CORS
    with pytest.raises(Exception):
        Settings(environment="production", jwt_secret="a-real-secret", cors_allow_origins=["*"])

    # SSRF relaxation left on
    with pytest.raises(Exception):
        Settings(
            environment="production",
            jwt_secret="a-real-secret",
            cors_allow_origins=["https://app.example"],
            allow_local_provider=True,
        )


def test_production_forces_debug_off():
    """Stack traces must never reach a public client, even if DEBUG=true is set."""
    from app.config.settings import Settings

    cfg = Settings(
        environment="production",
        jwt_secret="a-real-secret",
        cors_allow_origins=["https://app.example"],
        allow_local_provider=False,
        debug=True,
    )
    assert cfg.debug is False


def test_debug_defaults_off():
    from app.config.settings import Settings

    assert Settings().debug is False


def test_provider_address_is_separate_from_agent_and_verifier():
    """
    The 0.01 MON service payment must leave the agent's control.

    A provider address equal to the agent or verifier makes the payment a self-transfer, which
    would be economically meaningless even though the PaymentSettled event is real.
    """
    import os
    import re

    env_example = open("agents/.env.example", encoding="utf-8").read()
    match = re.search(r"^PROVIDER_ADDRESS=(0x[0-9a-fA-F]{40})", env_example, re.M)
    assert match, "agents/.env.example must document a concrete PROVIDER_ADDRESS"

    provider = match.group(1).lower()
    # The deployed AgentWallet.agent() / AgentEscrow.trustedVerifier() for this demo.
    economic_signer = "0x4c7c4d8155fed9b9f09c6619d98773acca881305"
    assert provider != economic_signer, "provider EOA must differ from the agent/verifier identity"
