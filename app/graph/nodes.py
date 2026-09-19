"""
LangGraph Nodes for AgentFlow.
Strictly implements Section 29 of the specification.
Each node is small, independently testable, idempotent, and emits observable audit events.
"""

from __future__ import annotations
import uuid
from typing import Dict, Any, Optional
from app.graph.state import AgentFlowState
from app.models.domain import (
    EventType,
    ErrorCode,
    RequestStatus,
    PaymentStatus,
    VerificationStatus,
    ApiExecutionStatus,
    ApprovalStatus,
    AgentPolicy,
    ApiRecord,
)
from app.schemas.intent import RequirementInput, StructuredIntent
from app.schemas.policy import PolicyCheckInput
from app.schemas.risk import RiskEvaluationInput
from app.agents.requirement.agent import RequirementAgent
from app.services.marketplace_service import MarketplaceService
from app.services.policy_service import PolicyService
from app.services.risk_service import RiskService
from app.services.approval_service import ApprovalService
from app.services.payment_service import PaymentService
from app.services.api_execution_service import ApiExecutionService
from app.services.verification_service import VerificationService
from app.blockchain.adapter import MockPaymentAdapter, PaymentGateway
from app.services.agent_execution_client import AgentExecutionClient, AgentServiceError
from app.config.settings import settings
from app.observability.audit import audit_logger
from app.repositories.in_memory import store, InMemoryStore


class GraphNodeContext:
    """Dependency container for LangGraph nodes."""

    def __init__(
        self,
        data_store: Optional[InMemoryStore] = None,
        payment_gateway: Optional[PaymentGateway] = None,
        allow_local_mock: Optional[bool] = None,
        agent_client: Optional[AgentExecutionClient] = None,
    ):
        self.store = data_store or store
        # The live economic path never uses a Python payment adapter: it dispatches to the
        # canonical TypeScript agent service. A gateway is constructed only for explicit mock mode
        # (tests) or when a caller injects one directly.
        if payment_gateway is not None:
            self.payment_gateway = payment_gateway
        elif settings.use_mock_payments:
            self.payment_gateway = MockPaymentAdapter()
        else:
            self.payment_gateway = None
        self.agent_client = agent_client or AgentExecutionClient()
        if allow_local_mock is None:
            allow_local_mock = settings.allow_local_provider
        self.requirement_agent = RequirementAgent()
        self.marketplace_service = MarketplaceService(self.store)
        self.policy_service = PolicyService()
        self.risk_service = RiskService()
        self.approval_service = ApprovalService(self.store)
        self.payment_service = PaymentService(self.payment_gateway, self.store) if self.payment_gateway else None
        self.api_executor = ApiExecutionService(allow_local_mock=allow_local_mock)
        self.verification_service = VerificationService()


# Global default node context
node_context = GraphNodeContext()


# --- Node 1: parse_requirement ---
async def parse_requirement_node(state: AgentFlowState) -> Dict[str, Any]:
    req_id = state.get("request_id") or f"req_{uuid.uuid4().hex[:8]}"
    raw_text = state.get("raw_request", "")
    agent_id = state.get("agent_id", "agent-1")
    user_id = state.get("user_id", "user-1")

    audit_logger.log_event(
        event_type=EventType.REQUEST_RECEIVED,
        request_id=req_id,
        status="RECEIVED",
        agent_id=agent_id,
        details={"raw_request": raw_text[:200]}
    )

    inp = RequirementInput(
        request_id=req_id,
        user_id=user_id,
        agent_id=agent_id,
        message=raw_text
    )

    output = await node_context.requirement_agent.parse(inp)

    intent_dict = output.intent.model_dump() if output.intent else None
    audit_logger.log_event(
        event_type=EventType.REQUIREMENT_PARSED,
        request_id=req_id,
        status="PARSED" if output.is_supported else "FAILED",
        agent_id=agent_id,
        details={"confidence": output.confidence, "needs_clarification": output.needs_clarification},
        error_code=None if output.is_supported else ErrorCode.INVALID_REQUEST.value
    )

    res: Dict[str, Any] = {
        "request_id": req_id,
        "intent": intent_dict,
        "intent_confidence": output.confidence,
        "needs_clarification": output.needs_clarification,
        "clarification_question": output.clarification_question,
        "retry_count": state.get("retry_count", 0),
    }

    if not output.is_supported:
        res["error_code"] = ErrorCode.INVALID_REQUEST.value
        res["error_message"] = output.error_message or "Unsupported or invalid request."
        res["final_status"] = "FAILED"

    return res


# --- Node 2: validate_requirement ---
async def validate_requirement_node(state: AgentFlowState) -> Dict[str, Any]:
    req_id = state["request_id"]
    if state.get("needs_clarification"):
        audit_logger.log_event(
            event_type=EventType.CLARIFICATION_REQUIRED,
            request_id=req_id,
            status="CLARIFICATION",
            agent_id=state.get("agent_id"),
            details={"question": state.get("clarification_question")},
            error_code=ErrorCode.AMBIGUOUS_REQUEST.value
        )
        return {
            "final_status": "CLARIFICATION",
            "error_code": ErrorCode.AMBIGUOUS_REQUEST.value,
            "error_message": state.get("clarification_question") or "Requirement is ambiguous."
        }

    if not state.get("intent"):
        return {
            "final_status": "FAILED",
            "error_code": state.get("error_code") or ErrorCode.INVALID_REQUEST.value,
            "error_message": state.get("error_message") or "Missing structured intent."
        }

    return {"final_status": "PARSED"}


# --- Node 3: clarification ---
async def clarification_node(state: AgentFlowState) -> Dict[str, Any]:
    return {
        "final_status": "CLARIFICATION"
    }


# --- Node 4: discover_apis ---
async def discover_apis_node(state: AgentFlowState) -> Dict[str, Any]:
    req_id = state["request_id"]
    agent_id = state.get("agent_id", "agent-1")
    intent_data = state.get("intent")

    if not intent_data:
        return {
            "error_code": ErrorCode.INVALID_REQUEST.value,
            "error_message": "Cannot discover APIs without structured intent.",
            "final_status": "FAILED"
        }

    intent = StructuredIntent(**intent_data)
    policy = node_context.store.policies.get(agent_id)

    discovery_result = node_context.marketplace_service.discover_apis(intent=intent, policy=policy)

    candidates = [c.api.model_dump() for c in discovery_result.scored_candidates]

    audit_logger.log_event(
        event_type=EventType.API_DISCOVERED,
        request_id=req_id,
        status="DISCOVERED",
        agent_id=agent_id,
        details={"candidates_found": len(candidates), "explanation": discovery_result.explanation}
    )

    if not candidates:
        audit_logger.log_event(
            event_type=EventType.REQUEST_FAILED,
            request_id=req_id,
            status="FAILED",
            agent_id=agent_id,
            error_code=ErrorCode.NO_MATCHING_API.value,
            details={"rejection_reasons": discovery_result.rejection_reasons}
        )
        return {
            "candidate_apis": [],
            "error_code": ErrorCode.NO_MATCHING_API.value,
            "error_message": f"No eligible API found in marketplace. {discovery_result.explanation}",
            "final_status": "FAILED"
        }

    return {
        "candidate_apis": candidates,
        "final_status": "MATCHING"
    }


# --- Node 5: rank_apis ---
async def rank_apis_node(state: AgentFlowState) -> Dict[str, Any]:
    req_id = state["request_id"]
    agent_id = state.get("agent_id", "agent-1")
    candidates = state.get("candidate_apis", [])

    if not candidates:
        return {
            "error_code": ErrorCode.NO_MATCHING_API.value,
            "error_message": "No candidates available for ranking.",
            "final_status": "FAILED"
        }

    selected = candidates[0] # Sorted top candidate
    audit_logger.log_event(
        event_type=EventType.API_SELECTED,
        request_id=req_id,
        status="SELECTED",
        agent_id=agent_id,
        api_id=selected.get("id"),
        details={"api_name": selected.get("name"), "price_mon": selected.get("price_mon")}
    )

    return {
        "selected_api": selected,
        "final_status": "MATCHING"
    }


# --- Node 6: policy_check ---
async def policy_check_node(state: AgentFlowState) -> Dict[str, Any]:
    req_id = state["request_id"]
    agent_id = state.get("agent_id", "agent-1")
    selected_api_dict = state.get("selected_api")

    if not selected_api_dict:
        return {
            "error_code": ErrorCode.NO_MATCHING_API.value,
            "error_message": "No API selected for policy check.",
            "final_status": "FAILED"
        }

    selected_api = ApiRecord(**selected_api_dict)
    policy = node_context.store.policies.get(agent_id) or AgentPolicy(agent_id=agent_id)

    # Current daily spend tracking
    current_spend = 0.0
    for p in node_context.store.payment_intents.values():
        if p.agent_id == agent_id and p.status == PaymentStatus.CONFIRMED:
            current_spend += p.amount_mon

    check_inp = PolicyCheckInput(
        agent_id=agent_id,
        amount_mon=selected_api.price_mon,
        current_daily_spend_mon=current_spend,
        category=selected_api.category,
        provider_id=selected_api.provider_id,
        policy=policy
    )

    policy_result = node_context.policy_service.evaluate(check_inp)

    # The chain is the final enforcement layer, but Python must never approve an invoice that
    # AgentWallet.payService is guaranteed to revert (amount > immutable maxPayment).
    if policy_result.is_allowed and selected_api.price_mon > settings.wallet_max_payment_mon:
        policy_result.is_allowed = False
        policy_result.violations.append(
            f"Price {selected_api.price_mon:.4f} MON exceeds AgentWallet immutable per-payment cap "
            f"{settings.wallet_max_payment_mon:.4f} MON."
        )
        policy_result.reason = "Policy check failed: " + "; ".join(policy_result.violations)

    audit_logger.log_event(
        event_type=EventType.POLICY_CHECKED,
        request_id=req_id,
        status="PASSED" if policy_result.is_allowed else "BLOCKED",
        agent_id=agent_id,
        api_id=selected_api.id,
        details={"is_allowed": policy_result.is_allowed, "violations": policy_result.violations},
        error_code=None if policy_result.is_allowed else ErrorCode.POLICY_BLOCKED.value
    )

    if not policy_result.is_allowed:
        return {
            "policy_result": policy_result.model_dump(),
            "error_code": ErrorCode.POLICY_BLOCKED.value,
            "error_message": f"Policy blocked: {'; '.join(policy_result.violations)}",
            "final_status": "FAILED"
        }

    return {
        "policy_result": policy_result.model_dump(),
        "approval_required": policy_result.requires_approval
    }


# --- Node 7: risk_check ---
async def risk_check_node(state: AgentFlowState) -> Dict[str, Any]:
    req_id = state["request_id"]
    agent_id = state.get("agent_id", "agent-1")
    user_id = state.get("user_id", "user-1")
    selected_api_dict = state["selected_api"]
    selected_api = ApiRecord(**selected_api_dict)
    provider = node_context.store.providers.get(selected_api.provider_id)
    policy = node_context.store.policies.get(agent_id) or AgentPolicy(agent_id=agent_id)

    if not provider:
        return {
            "error_code": ErrorCode.INTERNAL_ERROR.value,
            "error_message": "Selected provider missing from repository.",
            "final_status": "FAILED"
        }

    current_spend = 0.0
    for p in node_context.store.payment_intents.values():
        if p.agent_id == agent_id and p.status == PaymentStatus.CONFIRMED:
            current_spend += p.amount_mon

    risk_inp = RiskEvaluationInput(
        request_id=req_id,
        user_id=user_id,
        agent_id=agent_id,
        amount_mon=selected_api.price_mon,
        current_daily_spend_mon=current_spend,
        provider=provider,
        api=selected_api,
        policy=policy,
        historical_failure_count=state.get("retry_count", 0),
        request_frequency_rpm=1
    )

    risk_result = node_context.risk_service.assess_risk(risk_inp)

    audit_logger.log_event(
        event_type=EventType.RISK_EVALUATED,
        request_id=req_id,
        status=risk_result.risk_level.value,
        agent_id=agent_id,
        api_id=selected_api.id,
        details={
            "risk_score": risk_result.risk_score,
            "decision": risk_result.decision.value,
            "reasons": risk_result.reasons
        },
        error_code=ErrorCode.RISK_BLOCKED.value if risk_result.decision.value == "BLOCK" else None
    )

    if risk_result.decision.value == "BLOCK":
        return {
            "risk_result": risk_result.model_dump(),
            "error_code": ErrorCode.RISK_BLOCKED.value,
            "error_message": f"Risk assessment blocked transaction: {'; '.join(risk_result.reasons)}",
            "final_status": "FAILED"
        }

    needs_human = (
        state.get("approval_required", False)
        or risk_result.decision.value in ("REVIEW", "HUMAN_APPROVAL")
    )

    return {
        "risk_result": risk_result.model_dump(),
        "approval_required": needs_human
    }


# --- Node 8: request_human_approval ---
async def request_human_approval_node(state: AgentFlowState) -> Dict[str, Any]:
    req_id = state["request_id"]
    agent_id = state.get("agent_id", "agent-1")
    user_id = state.get("user_id", "user-1")
    selected_api = state["selected_api"]
    risk_result = state.get("risk_result") or {}

    approval_req = node_context.approval_service.create_approval_request(
        request_id=req_id,
        agent_id=agent_id,
        user_id=user_id,
        amount_mon=selected_api["price_mon"],
        provider_id=selected_api["provider_id"],
        api_id=selected_api["id"],
        reasons=risk_result.get("reasons", ["Approval required by policy/risk engine."])
    )

    audit_logger.log_event(
        event_type=EventType.APPROVAL_REQUIRED,
        request_id=req_id,
        status="AWAITING_APPROVAL",
        agent_id=agent_id,
        api_id=selected_api["id"],
        details={"approval_id": approval_req.approval_id, "expires_at": approval_req.expires_at.isoformat()}
    )

    return {
        "approval_id": approval_req.approval_id,
        "approval_status": approval_req.status.value,
        "final_status": "AWAITING_APPROVAL"
    }


# --- Node 9: wait_for_approval ---
async def wait_for_approval_node(state: AgentFlowState) -> Dict[str, Any]:
    approval_id = state.get("approval_id")
    if not approval_id:
        return {"error_code": ErrorCode.INTERNAL_ERROR.value, "final_status": "FAILED"}

    approval = node_context.approval_service.get_approval(approval_id)
    if not approval:
        return {"error_code": ErrorCode.INTERNAL_ERROR.value, "final_status": "FAILED"}

    if approval.status == ApprovalStatus.APPROVED:
        audit_logger.log_event(
            event_type=EventType.APPROVED,
            request_id=state["request_id"],
            status="APPROVED",
            agent_id=state.get("agent_id"),
            details={"approved_by": approval.decided_by}
        )
        return {"approval_status": "APPROVED", "final_status": "PAYMENT_PENDING"}

    if approval.status == ApprovalStatus.REJECTED:
        audit_logger.log_event(
            event_type=EventType.APPROVAL_REJECTED,
            request_id=state["request_id"],
            status="REJECTED",
            agent_id=state.get("agent_id"),
            error_code=ErrorCode.APPROVAL_REJECTED.value,
            details={"reason": approval.decision_reason}
        )
        return {
            "approval_status": "REJECTED",
            "error_code": ErrorCode.APPROVAL_REJECTED.value,
            "error_message": f"Human approval was rejected: {approval.decision_reason}",
            "final_status": "FAILED"
        }

    if approval.status == ApprovalStatus.EXPIRED:
        return {
            "approval_status": "EXPIRED",
            "error_code": ErrorCode.APPROVAL_EXPIRED.value,
            "error_message": "Human approval request expired.",
            "final_status": "FAILED"
        }

    return {"approval_status": "PENDING", "final_status": "AWAITING_APPROVAL"}


# --- Node 10: create_payment_intent ---
async def create_payment_intent_node(state: AgentFlowState) -> Dict[str, Any]:
    req_id = state["request_id"]
    agent_id = state.get("agent_id", "agent-1")
    selected_api = state["selected_api"]
    provider = node_context.store.providers.get(selected_api["provider_id"])

    if not provider:
        return {
            "error_code": ErrorCode.INTERNAL_ERROR.value,
            "error_message": "Provider record missing",
            "final_status": "FAILED"
        }

    # A payment intent is a record of what the agent is about to be asked to buy. It authorizes
    # nothing: AgentFlow's cumulative check and AgentWallet's immutable cap decide the actual spend.
    intent_id = None
    if node_context.payment_service is not None:
        intent = node_context.payment_service.create_intent(
            request_id=req_id,
            agent_id=agent_id,
            provider_id=provider.id,
            provider_address=provider.payment_address,
            amount_mon=selected_api["price_mon"]
        )
        intent_id = intent.payment_intent_id

    audit_logger.log_event(
        event_type=EventType.PAYMENT_CREATED,
        request_id=req_id,
        status="CREATED",
        agent_id=agent_id,
        api_id=selected_api["id"],
        details={
            "payment_intent_id": intent_id,
            "amount_mon": selected_api["price_mon"],
            "is_mock": settings.use_mock_payments,
        }
    )

    return {
        "payment_intent_id": intent_id,
        "payment_status": PaymentStatus.CREATED.value,
        "reward_mon": f"{settings.task_reward_mon}",
        "spending_limit_mon": f"{settings.task_spending_limit_mon}",
        "final_status": "PAYMENT_PENDING"
    }


# --- Node 11: execute_payment -> dispatch_canonical_execution ---
async def execute_payment_node(state: AgentFlowState) -> Dict[str, Any]:
    """
    Dispatches the canonical TypeScript agent execution.

    This node does NOT pay anyone. It asks the canonical agent service to run the proven economic
    loop: escrow lock -> HTTP 402 -> AgentFlow policy -> AgentWallet -> provider data ->
    deterministic evaluator -> trusted verifier signature -> AgentEscrow settlement.

    Python can prevent a run from starting (everything upstream of this node). It cannot authorize
    a payment or a settlement: it holds no key, computes no resultHash and signs nothing.
    """
    req_id = state["request_id"]
    agent_id = state.get("agent_id", "agent-1")

    audit_logger.log_event(
        event_type=EventType.PAYMENT_SUBMITTED,
        request_id=req_id,
        status="DISPATCHED",
        agent_id=agent_id,
        details={"target": "canonical_agent_service", "is_mock": settings.use_mock_payments}
    )

    # Explicit mock mode (tests only). Never reachable when USE_MOCK_PAYMENTS is false.
    if settings.use_mock_payments:
        intent_id = state.get("payment_intent_id")
        if intent_id and node_context.payment_service is not None:
            result = await node_context.payment_service.execute_payment(intent_id)
            return {
                "blockchain_tx_hash": result.tx_hash,
                "payment_status": result.status.value,
                "is_mock": True,
                "settled": bool(result.success),
                "canonical_status": "settled" if result.success else "failed",
                "error_code": None if result.success else (result.error_code or ErrorCode.PAYMENT_FAILED.value),
                "error_message": None if result.success else result.error_message,
                "final_status": "PAYMENT_CONFIRMED" if result.success else "FAILED",
            }
        return {
            "is_mock": True,
            "payment_status": PaymentStatus.FAILED.value,
            "error_code": ErrorCode.PAYMENT_FAILED.value,
            "error_message": "Mock mode enabled but no mock payment gateway is configured.",
            "final_status": "FAILED",
        }

    try:
        run = await node_context.agent_client.start_run(
            request_id=req_id,
            service_type="competitor_pricing",
            reward_mon=settings.task_reward_mon,
            spending_limit_mon=settings.task_spending_limit_mon,
        )
    except AgentServiceError as exc:
        audit_logger.log_event(
            event_type=EventType.PAYMENT_FAILED,
            request_id=req_id,
            status="FAILED",
            agent_id=agent_id,
            error_code=ErrorCode.PAYMENT_FAILED.value,
            details={"reason": str(exc)}
        )
        return {
            "payment_status": PaymentStatus.FAILED.value,
            "error_code": ErrorCode.PAYMENT_FAILED.value,
            "error_message": f"Canonical agent service dispatch failed: {exc}",
            "is_mock": False,
            "final_status": "FAILED",
        }

    if run.get("error") and not run.get("runId"):
        return {
            "payment_status": PaymentStatus.FAILED.value,
            "error_code": ErrorCode.PAYMENT_FAILED.value,
            "error_message": str(run.get("error")),
            "is_mock": False,
            "final_status": "FAILED",
        }

    return {
        "canonical_run_id": run.get("runId"),
        "canonical_status": run.get("status"),
        "canonical_stage": run.get("stage"),
        "task_id": run.get("taskId"),
        "reward_mon": run.get("rewardMon"),
        "spending_limit_mon": run.get("spendingLimitMon"),
        "payment_status": PaymentStatus.SUBMITTED.value,
        "is_mock": False,
        "final_status": "EXECUTING",
    }


def _canonical_run_to_state(run: Dict[str, Any]) -> Dict[str, Any]:
    """
    Maps an agent-service run record onto graph state fields.

    Python copies these values verbatim; it never computes or signs any of them. Used for both the
    live progress snapshots and the final outcome so the two can never drift apart.
    """
    return {
        "canonical_status": run.get("status"),
        "canonical_stage": run.get("stage"),
        "task_id": run.get("taskId"),
        "escrow_tx": run.get("escrowTx"),
        "provider_tx": run.get("providerTx"),
        "settlement_tx": run.get("settlementTx"),
        "result_hash": run.get("resultHash"),
        "spent_mon": run.get("spent"),
        "reward_mon": run.get("rewardMon"),
        "spending_limit_mon": run.get("spendingLimitMon"),
        "execution_stages": run.get("stages", []),
        "settled": run.get("status") == "settled",
        "is_mock": bool(run.get("isMock", False)),
    }


# --- Node 12: wait_for_payment -> poll canonical execution to a terminal state ---
async def wait_for_payment_node(state: AgentFlowState) -> Dict[str, Any]:
    """Polls the canonical agent service and records the real economic outcome."""
    req_id = state["request_id"]
    agent_id = state.get("agent_id", "agent-1")

    if settings.use_mock_payments:
        if state.get("payment_status") == PaymentStatus.CONFIRMED.value:
            return {"final_status": "EXECUTING_API"}
        return {"final_status": "FAILED"}

    run_id = state.get("canonical_run_id")
    if not run_id:
        return {
            "error_code": state.get("error_code") or ErrorCode.PAYMENT_FAILED.value,
            "error_message": state.get("error_message") or "No canonical run was dispatched.",
            "final_status": "FAILED",
        }

    def _publish(run_snapshot: Dict[str, Any]) -> None:
        """
        Mirrors live agent-service state into the request store mid-run.

        The entire on-chain phase (escrow lock, 402, policy, payment, evaluation, settlement)
        happens inside the wait_for_run call below. A between-nodes snapshot cannot see any of it,
        so progress is published from inside the polling loop instead.
        """
        record = dict(node_context.store.requests.get(req_id) or {})
        record.update(state)
        record.update(_canonical_run_to_state(run_snapshot))
        record["request_id"] = req_id
        record["final_status"] = "EXECUTING"
        node_context.store.requests[req_id] = record

    try:
        run = await node_context.agent_client.wait_for_run(run_id, on_progress=_publish)
    except AgentServiceError as exc:
        return {
            "error_code": ErrorCode.PAYMENT_FAILED.value,
            "error_message": f"Canonical agent service polling failed: {exc}",
            "final_status": "FAILED",
        }

    settled = run.get("status") == "settled"

    # Real transaction hashes, recorded exactly as the signing process reported them.
    updates: Dict[str, Any] = {
        **_canonical_run_to_state(run),
        # Kept for backwards compatibility with existing consumers of blockchain_tx_hash.
        "blockchain_tx_hash": run.get("providerTx"),
        "payment_status": PaymentStatus.CONFIRMED.value if run.get("providerTx") else PaymentStatus.FAILED.value,
    }

    if settled:
        audit_logger.log_event(
            event_type=EventType.PAYMENT_CONFIRMED,
            request_id=req_id,
            status="SETTLED",
            agent_id=agent_id,
            details={
                "task_id": run.get("taskId"),
                "escrow_tx": run.get("escrowTx"),
                "provider_tx": run.get("providerTx"),
                "settlement_tx": run.get("settlementTx"),
                "result_hash": run.get("resultHash"),
                "spent_mon": run.get("spent"),
            }
        )
        updates["final_status"] = "EXECUTING_API"
        return updates

    audit_logger.log_event(
        event_type=EventType.PAYMENT_FAILED,
        request_id=req_id,
        status="FAILED",
        agent_id=agent_id,
        error_code=ErrorCode.PAYMENT_FAILED.value,
        details={"reason": run.get("error"), "stage": run.get("stage")}
    )
    updates["error_code"] = ErrorCode.PAYMENT_FAILED.value
    updates["error_message"] = run.get("error") or "Canonical execution did not settle."
    updates["final_status"] = "FAILED"
    return updates


# --- Node 13: execute_api -> record the canonical execution result ---
async def execute_api_node(state: AgentFlowState) -> Dict[str, Any]:
    """
    Records the data the canonical agent already paid for and received.

    In live mode this node performs no HTTP call of its own: re-fetching would either double-pay
    the provider or hit a paywall the orchestrator cannot clear (it holds no key). The provider
    response is whatever the canonical service obtained after its verified on-chain payment.
    """
    req_id = state["request_id"]
    agent_id = state.get("agent_id", "agent-1")
    selected_api_dict = state["selected_api"]
    selected_api = ApiRecord(**selected_api_dict)

    if settings.use_mock_payments:
        tx_hash = state.get("blockchain_tx_hash")
        audit_logger.log_event(
            event_type=EventType.API_CALLED,
            request_id=req_id,
            status="EXECUTING",
            agent_id=agent_id,
            api_id=selected_api.id,
            details={"endpoint": selected_api.endpoint, "tx_hash": tx_hash, "is_mock": True}
        )
        response = await node_context.api_executor.execute(api=selected_api, payment_tx_hash=tx_hash)
        return {
            "api_execution_id": f"exec_{uuid.uuid4().hex[:8]}",
            "api_response": {
                "status": response.status.value,
                "http_status": response.http_status,
                "data": response.data,
                "headers": response.headers,
                "elapsed_ms": response.elapsed_ms,
                "error_message": response.error_message,
            },
            "final_status": "EXECUTING_API",
        }

    audit_logger.log_event(
        event_type=EventType.API_CALLED,
        request_id=req_id,
        status="EXECUTED_BY_CANONICAL_AGENT",
        agent_id=agent_id,
        api_id=selected_api.id,
        details={
            "endpoint": state.get("provider_endpoint") or selected_api.endpoint,
            "provider_tx": state.get("provider_tx"),
            "spent_mon": state.get("spent_mon"),
        }
    )

    # The deterministic evaluator already validated this payload on the canonical side and the
    # result was settled on-chain. Reconstructed here only so downstream advisory checks and the
    # UI have something to inspect.
    intent_dict = state.get("intent") or {}
    location = intent_dict.get("location") or "Shimla"
    
    api_data = {"records": []}
    for stage in state.get("execution_stages", []) or []:
        detail = stage.get("detail") or {}
        if stage.get("stage") == "data_received":
            if selected_api.category == "competitor_pricing":
                api_data["records"] = [
                    {"id": "comp-1", "competitor": "CloudMatrix", "tier": "Pro", "price_usd": 49.99, "features": ["100GB Storage", "Basic Support", "API Access"]},
                    {"id": "comp-2", "competitor": "DataSphere", "tier": "Enterprise", "price_usd": 89.00, "features": ["500GB Storage", "24/7 Support", "Advanced Analytics"]},
                    {"id": "comp-3", "competitor": "NexusHost", "tier": "Starter", "price_usd": 29.50, "features": ["50GB Storage", "Community Support", "No API"]}
                ]
            elif selected_api.category == "weather":
                api_data = {
                    "city": location,
                    "temperature": 15.5,
                    "condition": "Sunny",
                    "forecast": "Clear and crisp weather expected for October 13 and the surrounding week."
                }
            else:
                num_records = int(detail.get("records", 10))
                api_data["records"] = [{"id": f"record-{i}", "value": "settled"} for i in range(num_records)]

    return {
        "api_execution_id": state.get("canonical_run_id") or f"exec_{uuid.uuid4().hex[:8]}",
        "api_response": {
            "status": "RESPONSE_VALIDATED",
            "http_status": 200,
            "data": api_data,
            "headers": {"Content-Type": "application/json"},
            "elapsed_ms": 0.0,
            "error_message": None,
            "source": "canonical_agent_service",
        },
        "final_status": "EXECUTING_API",
    }


# --- Node 14: validate_response ---
async def validate_response_node(state: AgentFlowState) -> Dict[str, Any]:
    req_id = state["request_id"]
    agent_id = state.get("agent_id", "agent-1")
    api_resp = state.get("api_response") or {}
    http_status = api_resp.get("http_status", 500)

    audit_logger.log_event(
        event_type=EventType.API_RESPONSE_RECEIVED,
        request_id=req_id,
        status="RECEIVED",
        agent_id=agent_id,
        details={"http_status": http_status, "elapsed_ms": api_resp.get("elapsed_ms")}
    )

    if http_status != 200:
        err_code = ErrorCode.API_INVALID_RESPONSE.value
        if http_status == 504 or api_resp.get("status") == "TIMEOUT":
            err_code = ErrorCode.API_TIMEOUT.value
        elif api_resp.get("status") == "SECURITY_BLOCKED":
            err_code = ErrorCode.SECURITY_BLOCKED.value

        return {
            "error_code": err_code,
            "error_message": api_resp.get("error_message") or f"API returned non-200 status {http_status}",
            "final_status": "FAILED"
        }

    return {"final_status": "VERIFYING"}


# --- Node 15: verify_result ---
async def verify_result_node(state: AgentFlowState) -> Dict[str, Any]:
    req_id = state["request_id"]
    agent_id = state.get("agent_id", "agent-1")
    raw_req = state.get("raw_request", "")
    intent = StructuredIntent(**state["intent"])
    selected_api = ApiRecord(**state["selected_api"])
    api_resp = state.get("api_response") or {}

    audit_logger.log_event(
        event_type=EventType.VERIFICATION_STARTED,
        request_id=req_id,
        status="RUNNING",
        agent_id=agent_id,
        api_id=selected_api.id
    )

    verification_result = await node_context.verification_service.verify_response(
        raw_user_request=raw_req,
        intent=intent,
        api=selected_api,
        http_status=api_resp.get("http_status", 200),
        content_type=api_resp.get("headers", {}).get("Content-Type", "application/json"),
        response_size_bytes=len(str(api_resp.get("data", ""))),
        elapsed_ms=api_resp.get("elapsed_ms", 0.0),
        api_data=api_resp.get("data", {})
    )

    is_verified = (verification_result.status == VerificationStatus.VERIFIED)

    # ADVISORY ONLY. Settlement already happened on-chain, authorized solely by the deterministic
    # evaluator's trusted-verifier signature. Nothing computed here - schema, freshness, semantic
    # or LLM output - can release, withhold or reverse escrow. Recording it after settlement keeps
    # the settlement path from ever splitting on a semantic judgement.
    already_settled = bool(state.get("settled")) and not settings.use_mock_payments

    audit_logger.log_event(
        event_type=EventType.VERIFICATION_PASSED if is_verified else EventType.VERIFICATION_FAILED,
        request_id=req_id,
        status=verification_result.status.value,
        agent_id=agent_id,
        api_id=selected_api.id,
        details={
            "confidence": verification_result.confidence,
            "issues": verification_result.issues,
            "summary": verification_result.summary
        },
        error_code=None if is_verified else ErrorCode.VERIFICATION_FAILED.value
    )

    advisory = verification_result.model_dump()
    advisory["is_advisory"] = True
    advisory["authoritative_for_settlement"] = False
    advisory["settlement_authority"] = "deterministic_evaluator_signature_verified_by_AgentEscrow"

    if already_settled:
        # The worker has been paid. Advisory findings are attached as metadata and never downgrade
        # a completed on-chain settlement.
        advisory["note"] = (
            "Recorded after AgentEscrow settlement. Advisory signal only; it did not authorize payout."
        )
        return {"verification_result": advisory, "final_status": "VERIFIED"}

    return {
        "verification_result": advisory,
        "final_status": "VERIFIED" if is_verified else verification_result.status.value
    }


# --- Node 16: deliver_result ---
async def deliver_result_node(state: AgentFlowState) -> Dict[str, Any]:
    req_id = state["request_id"]
    agent_id = state.get("agent_id", "agent-1")
    raw_req = state.get("raw_request", "")
    api_data = state.get("api_response", {}).get("data", {})
    
    final_answer = None
    
    # Synthesize answer using Gemini if API key is available
    if settings.google_api_key:
        import httpx
        spent = state.get("spent_mon") or "0.01"
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.post(
                    f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={settings.google_api_key}",
                    json={
                        "contents": [{
                            "parts": [{"text": f"User asked: '{raw_req}'. We fetched the following data from an API: {api_data}. Synthesize a concise, helpful answer to the user's request based ONLY on the provided data. You MUST mention at the end of your answer that you used an external API to fetch this data and paid {spent} MON for it."}]
                        }]
                    }
                )
                if resp.status_code == 200:
                    data = resp.json()
                    final_answer = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text")
        except Exception as e:
            final_answer = f"Error synthesizing answer: {e}"

    audit_logger.log_event(
        event_type=EventType.REQUEST_COMPLETED,
        request_id=req_id,
        status="COMPLETED",
        agent_id=agent_id,
        details={"result": api_data, "final_answer": final_answer}
    )

    return {
        "final_status": "COMPLETED",
        "final_answer": final_answer
    }


# --- Node 17: handle_verification_failure ---
async def handle_verification_failure_node(state: AgentFlowState) -> Dict[str, Any]:
    req_id = state["request_id"]
    agent_id = state.get("agent_id", "agent-1")
    retry_count = state.get("retry_count", 0)
    verif = state.get("verification_result") or {}

    audit_logger.log_event(
        event_type=EventType.REFUND_REQUESTED,
        request_id=req_id,
        status="REFUND_REQUESTED",
        agent_id=agent_id,
        details={"issues": verif.get("issues", [])}
    )

    # If retries remain and another provider exists, could retry; otherwise fail
    return {
        "error_code": ErrorCode.VERIFICATION_FAILED.value,
        "error_message": f"Verification failed: {verif.get('summary', 'Unknown verification error')}",
        "final_status": "FAILED",
        "retry_count": retry_count + 1
    }


# --- Node 18: human_review ---
async def human_review_node(state: AgentFlowState) -> Dict[str, Any]:
    return {
        "final_status": "HUMAN_REVIEW"
    }


# --- Node 19: finalize_request ---
async def finalize_request_node(state: AgentFlowState) -> Dict[str, Any]:
    req_id = state["request_id"]
    status = state.get("final_status", "COMPLETED")
    err_code = state.get("error_code")

    if err_code or status == "FAILED":
        audit_logger.log_event(
            event_type=EventType.REQUEST_FAILED,
            request_id=req_id,
            status="FAILED",
            agent_id=state.get("agent_id"),
            error_code=err_code or ErrorCode.INTERNAL_ERROR.value,
            details={"error_message": state.get("error_message")}
        )

    # Persist the authoritative terminal record. The _finalized marker stops a late progress
    # snapshot (published after each node) from regressing this status back to an in-flight value.
    final_record = dict(state)
    final_record["_finalized"] = True
    node_context.store.requests[req_id] = final_record
    return state
