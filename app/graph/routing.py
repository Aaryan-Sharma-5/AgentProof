"""
LangGraph Conditional Routing Functions.
Defines edge decision points based on state transitions.
Strictly implements Section 30 of the specification.
"""

from __future__ import annotations
from typing import Literal
from app.graph.state import AgentFlowState


def route_after_requirement(state: AgentFlowState) -> Literal["clarification", "discover_apis", "finalize_request"]:
    if state.get("needs_clarification"):
        return "clarification"
    if state.get("error_code") or state.get("final_status") == "FAILED":
        return "finalize_request"
    return "discover_apis"


def route_after_discovery(state: AgentFlowState) -> Literal["rank_apis", "finalize_request"]:
    if not state.get("candidate_apis") or state.get("error_code"):
        return "finalize_request"
    return "rank_apis"


def route_after_policy(state: AgentFlowState) -> Literal["risk_check", "finalize_request"]:
    if state.get("error_code") or state.get("final_status") == "FAILED":
        return "finalize_request"
    return "risk_check"


def route_after_risk(state: AgentFlowState) -> Literal["finalize_request", "request_human_approval", "create_payment_intent"]:
    if state.get("error_code") or state.get("final_status") == "FAILED":
        return "finalize_request"

    risk_res = state.get("risk_result") or {}
    decision = risk_res.get("decision")

    if decision == "BLOCK":
        return "finalize_request"
    if decision in ("REVIEW", "HUMAN_APPROVAL") or state.get("approval_required"):
        return "request_human_approval"

    return "create_payment_intent"


def route_after_approval(state: AgentFlowState) -> Literal["create_payment_intent", "finalize_request"]:
    status = state.get("approval_status")
    if status == "APPROVED":
        return "create_payment_intent"
    return "finalize_request"


def route_after_payment(state: AgentFlowState) -> Literal["execute_api", "finalize_request"]:
    if state.get("payment_status") != "CONFIRMED" or state.get("error_code"):
        return "finalize_request"
    return "execute_api"


def route_after_response(state: AgentFlowState) -> Literal["verify_result", "finalize_request"]:
    if state.get("final_status") == "FAILED" or state.get("error_code"):
        return "finalize_request"
    return "verify_result"


def route_after_verification(state: AgentFlowState) -> Literal["deliver_result", "human_review", "handle_verification_failure"]:
    verif = state.get("verification_result") or {}
    status = verif.get("status")

    if status == "VERIFIED":
        return "deliver_result"
    if status == "REQUIRES_REVIEW":
        return "human_review"

    return "handle_verification_failure"


def route_after_failure_handler(state: AgentFlowState) -> Literal["execute_api", "finalize_request"]:
    # If a retry was scheduled and selected another api or attempt
    if state.get("final_status") == "RETRYING":
        return "execute_api"
    return "finalize_request"
