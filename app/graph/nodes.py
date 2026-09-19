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
from app.observability.audit import audit_logger
from app.repositories.in_memory import store, InMemoryStore


class GraphNodeContext:
    """Dependency container for LangGraph nodes."""

    def __init__(
        self,
        data_store: Optional[InMemoryStore] = None,
        payment_gateway: Optional[PaymentGateway] = None,
        allow_local_mock: bool = True,
    ):
        self.store = data_store or store
        self.payment_gateway = payment_gateway or MockPaymentAdapter()
        self.requirement_agent = RequirementAgent()
        self.marketplace_service = MarketplaceService(self.store)
        self.policy_service = PolicyService()
        self.risk_service = RiskService()
        self.approval_service = ApprovalService(self.store)
        self.payment_service = PaymentService(self.payment_gateway, self.store)
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

    intent = node_context.payment_service.create_intent(
        request_id=req_id,
        agent_id=agent_id,
        provider_id=provider.id,
        provider_address=provider.payment_address,
        amount_mon=selected_api["price_mon"]
    )

    audit_logger.log_event(
        event_type=EventType.PAYMENT_CREATED,
        request_id=req_id,
        status="CREATED",
        agent_id=agent_id,
        api_id=selected_api["id"],
        details={"payment_intent_id": intent.payment_intent_id, "amount_mon": intent.amount_mon}
    )

    return {
        "payment_intent_id": intent.payment_intent_id,
        "payment_status": intent.status.value,
        "final_status": "PAYMENT_PENDING"
    }


# --- Node 11: execute_payment ---
async def execute_payment_node(state: AgentFlowState) -> Dict[str, Any]:
    req_id = state["request_id"]
    agent_id = state.get("agent_id", "agent-1")
    intent_id = state["payment_intent_id"]

    audit_logger.log_event(
        event_type=EventType.PAYMENT_SUBMITTED,
        request_id=req_id,
        status="SUBMITTED",
        agent_id=agent_id,
        details={"payment_intent_id": intent_id}
    )

    result = await node_context.payment_service.execute_payment(intent_id)

    if result.success:
        audit_logger.log_event(
            event_type=EventType.PAYMENT_CONFIRMED,
            request_id=req_id,
            status="CONFIRMED",
            agent_id=agent_id,
            details={"tx_hash": result.tx_hash, "block_number": result.block_number}
        )
        return {
            "blockchain_tx_hash": result.tx_hash,
            "payment_status": PaymentStatus.CONFIRMED.value,
            "final_status": "PAYMENT_CONFIRMED"
        }
    else:
        audit_logger.log_event(
            event_type=EventType.PAYMENT_FAILED,
            request_id=req_id,
            status="FAILED",
            agent_id=agent_id,
            error_code=result.error_code or ErrorCode.PAYMENT_FAILED.value,
            details={"reason": result.error_message}
        )
        return {
            "payment_status": result.status.value,
            "error_code": result.error_code or ErrorCode.PAYMENT_FAILED.value,
            "error_message": result.error_message or "Payment settlement failed.",
            "final_status": "FAILED"
        }


# --- Node 12: wait_for_payment ---
async def wait_for_payment_node(state: AgentFlowState) -> Dict[str, Any]:
    if state.get("payment_status") == PaymentStatus.CONFIRMED.value:
        return {"final_status": "EXECUTING_API"}
    return {"final_status": "FAILED"}


# --- Node 13: execute_api ---
async def execute_api_node(state: AgentFlowState) -> Dict[str, Any]:
    req_id = state["request_id"]
    agent_id = state.get("agent_id", "agent-1")
    selected_api_dict = state["selected_api"]
    selected_api = ApiRecord(**selected_api_dict)
    tx_hash = state.get("blockchain_tx_hash")

    audit_logger.log_event(
        event_type=EventType.API_CALLED,
        request_id=req_id,
        status="EXECUTING",
        agent_id=agent_id,
        api_id=selected_api.id,
        details={"endpoint": selected_api.endpoint, "tx_hash": tx_hash}
    )

    response = await node_context.api_executor.execute(
        api=selected_api,
        payment_tx_hash=tx_hash
    )

    api_resp_dict = {
        "status": response.status.value,
        "http_status": response.http_status,
        "data": response.data,
        "headers": response.headers,
        "elapsed_ms": response.elapsed_ms,
        "error_message": response.error_message
    }

    return {
        "api_execution_id": f"exec_{uuid.uuid4().hex[:8]}",
        "api_response": api_resp_dict,
        "final_status": "EXECUTING_API"
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

    return {
        "verification_result": verification_result.model_dump(),
        "final_status": "VERIFIED" if is_verified else verification_result.status.value
    }


# --- Node 16: deliver_result ---
async def deliver_result_node(state: AgentFlowState) -> Dict[str, Any]:
    req_id = state["request_id"]
    agent_id = state.get("agent_id", "agent-1")

    audit_logger.log_event(
        event_type=EventType.REQUEST_COMPLETED,
        request_id=req_id,
        status="COMPLETED",
        agent_id=agent_id,
        details={"result": state.get("api_response", {}).get("data")}
    )

    return {
        "final_status": "COMPLETED"
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

    # Persist request state in store
    node_context.store.requests[req_id] = dict(state)
    return state
