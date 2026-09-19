"""
AgentFlow StateGraph Assembly and Workflow Engine.
Assembles the complete orchestration graph connecting Requirement -> Discovery ->
Policy -> Risk -> Approval -> Payment -> Execution -> Verification -> Delivery.
Strictly implements Section 68 of the specification.
"""

from __future__ import annotations
import asyncio
from typing import Dict, Any, Callable, Awaitable, Optional
from app.graph.state import AgentFlowState
from app.graph.nodes import (
    parse_requirement_node,
    validate_requirement_node,
    clarification_node,
    discover_apis_node,
    rank_apis_node,
    policy_check_node,
    risk_check_node,
    request_human_approval_node,
    wait_for_approval_node,
    create_payment_intent_node,
    execute_payment_node,
    wait_for_payment_node,
    execute_api_node,
    validate_response_node,
    verify_result_node,
    deliver_result_node,
    handle_verification_failure_node,
    human_review_node,
    finalize_request_node,
)
from app.graph.routing import (
    route_after_requirement,
    route_after_discovery,
    route_after_policy,
    route_after_risk,
    route_after_approval,
    route_after_payment,
    route_after_response,
    route_after_verification,
)


# Canonical execution aliases. The graph topology is unchanged; these names document what the
# payment-stage nodes now actually do after Phase 6B:
#   execute_payment  -> dispatch_canonical_execution (POST /run on the TypeScript agent service)
#   wait_for_payment -> poll_canonical_execution     (GET /run/:id until settled/failed)
#   execute_api      -> record_canonical_result      (records data the agent already paid for)
# Python orchestrates these steps. It never signs, pays or settles.
CANONICAL_NODE_ALIASES = {
    "execute_payment": "dispatch_canonical_execution",
    "wait_for_payment": "poll_canonical_execution",
    "execute_api": "record_canonical_result",
}


def _publish_progress(state: AgentFlowState) -> None:
    """
    Snapshots in-flight graph state into the request store so the API can report live progress.

    A snapshot is a copy: the graph keeps mutating `state`, and the store must not alias it or a
    reader could observe a half-applied update. Never raises - a failure to publish progress must
    not abort a run that is already spending real MON on-chain.
    """
    req_id = state.get("request_id")
    if not req_id:
        return
    try:
        from app.graph.nodes import node_context

        existing = node_context.store.requests.get(req_id)
        # finalize_request writes the authoritative terminal record. Once that has happened, a
        # late progress write must never regress the stored status back to an in-flight one.
        if isinstance(existing, dict) and existing.get("_finalized"):
            return
        node_context.store.requests[req_id] = dict(state)
    except Exception:  # pragma: no cover - progress reporting is strictly best-effort
        pass


class DeterministicStateGraphRunner:
    """
    High-performance asynchronous workflow runner for AgentFlow.
    Executes the exact LangGraph state transitions and conditional branches.
    Guarantees deterministic, dependency-isolated graph execution.
    """

    def __init__(self):
        self.nodes: Dict[str, Callable[[AgentFlowState], Awaitable[Dict[str, Any]]]] = {
            "parse_requirement": parse_requirement_node,
            "validate_requirement": validate_requirement_node,
            "clarification": clarification_node,
            "discover_apis": discover_apis_node,
            "rank_apis": rank_apis_node,
            "policy_check": policy_check_node,
            "risk_check": risk_check_node,
            "request_human_approval": request_human_approval_node,
            "wait_for_approval": wait_for_approval_node,
            "create_payment_intent": create_payment_intent_node,
            "execute_payment": execute_payment_node,
            "wait_for_payment": wait_for_payment_node,
            "execute_api": execute_api_node,
            "validate_response": validate_response_node,
            "verify_result": verify_result_node,
            "deliver_result": deliver_result_node,
            "handle_verification_failure": handle_verification_failure_node,
            "human_review": human_review_node,
            "finalize_request": finalize_request_node,
        }

    async def ainvoke(self, initial_state: AgentFlowState) -> AgentFlowState:
        """Executes the workflow graph end-to-end starting with initial_state (or resuming from resume_from)."""
        state = AgentFlowState(dict(initial_state))

        current_node = state.pop("resume_from", "parse_requirement")
        visited_count = 0
        max_steps = 30

        while current_node and current_node != "END" and visited_count < max_steps:
            visited_count += 1
            node_fn = self.nodes.get(current_node)
            if not node_fn:
                break

            updates = await node_fn(state)
            if updates:
                state.update(updates)

            # Publish progress after every node so GET /v1/agent-requests/{id} can observe the
            # lifecycle while it is still running. Without this the record would only appear in
            # finalize_request, leaving the endpoint 404 for the whole execution and making the
            # frontend's polling structurally impossible.
            _publish_progress(state)

            # Determine next node based on workflow topology
            if current_node == "parse_requirement":
                current_node = "validate_requirement"

            elif current_node == "validate_requirement":
                next_branch = route_after_requirement(state)
                current_node = next_branch

            elif current_node == "clarification":
                current_node = "finalize_request"

            elif current_node == "discover_apis":
                next_branch = route_after_discovery(state)
                current_node = next_branch

            elif current_node == "rank_apis":
                current_node = "policy_check"

            elif current_node == "policy_check":
                next_branch = route_after_policy(state)
                current_node = next_branch

            elif current_node == "risk_check":
                next_branch = route_after_risk(state)
                current_node = next_branch

            elif current_node == "request_human_approval":
                current_node = "wait_for_approval"

            elif current_node == "wait_for_approval":
                next_branch = route_after_approval(state)
                current_node = next_branch

            elif current_node == "create_payment_intent":
                current_node = "execute_payment"

            elif current_node == "execute_payment":
                current_node = "wait_for_payment"

            elif current_node == "wait_for_payment":
                next_branch = route_after_payment(state)
                current_node = next_branch

            elif current_node == "execute_api":
                current_node = "validate_response"

            elif current_node == "validate_response":
                if state.get("final_status") == "FAILED" or state.get("error_code"):
                    current_node = "finalize_request"
                else:
                    current_node = "verify_result"

            elif current_node == "verify_result":
                next_branch = route_after_verification(state)
                current_node = next_branch

            elif current_node == "deliver_result":
                current_node = "finalize_request"

            elif current_node == "handle_verification_failure":
                current_node = "finalize_request"

            elif current_node == "human_review":
                current_node = "finalize_request"

            elif current_node == "finalize_request":
                current_node = "END"

        return state


def build_langgraph_workflow():
    """
    Constructs a compiled LangGraph StateGraph when langgraph is installed,
    or falls back cleanly to the DeterministicStateGraphRunner.
    """
    try:
        from langgraph.graph import StateGraph, START, END

        builder = StateGraph(AgentFlowState)

        # Wraps every node so in-flight state is published to the request store after each step,
        # exactly as DeterministicStateGraphRunner does. Without this the compiled-LangGraph path
        # would only become observable at finalize_request.
        def _observed(node_fn):
            async def _run(state: AgentFlowState) -> Dict[str, Any]:
                updates = await node_fn(state)
                merged = dict(state)
                if updates:
                    merged.update(updates)
                _publish_progress(merged)
                return updates

            # LangGraph derives node identity from the callable, so the original name is preserved.
            _run.__name__ = getattr(node_fn, "__name__", "node")
            return _run

        # Register nodes
        builder.add_node("parse_requirement", _observed(parse_requirement_node))
        builder.add_node("validate_requirement", _observed(validate_requirement_node))
        builder.add_node("clarification", _observed(clarification_node))
        builder.add_node("discover_apis", _observed(discover_apis_node))
        builder.add_node("rank_apis", _observed(rank_apis_node))
        builder.add_node("policy_check", _observed(policy_check_node))
        builder.add_node("risk_check", _observed(risk_check_node))
        builder.add_node("request_human_approval", _observed(request_human_approval_node))
        builder.add_node("wait_for_approval", _observed(wait_for_approval_node))
        builder.add_node("create_payment_intent", _observed(create_payment_intent_node))
        builder.add_node("execute_payment", _observed(execute_payment_node))
        builder.add_node("wait_for_payment", _observed(wait_for_payment_node))
        builder.add_node("execute_api", _observed(execute_api_node))
        builder.add_node("validate_response", _observed(validate_response_node))
        builder.add_node("verify_result", _observed(verify_result_node))
        builder.add_node("deliver_result", _observed(deliver_result_node))
        builder.add_node("handle_verification_failure", _observed(handle_verification_failure_node))
        builder.add_node("human_review", _observed(human_review_node))
        builder.add_node("finalize_request", _observed(finalize_request_node))

        # Edges
        builder.add_edge(START, "parse_requirement")
        builder.add_edge("parse_requirement", "validate_requirement")
        builder.add_conditional_edges("validate_requirement", route_after_requirement)
        builder.add_edge("clarification", "finalize_request")

        builder.add_conditional_edges("discover_apis", route_after_discovery)
        builder.add_edge("rank_apis", "policy_check")
        builder.add_conditional_edges("policy_check", route_after_policy)
        builder.add_conditional_edges("risk_check", route_after_risk)

        builder.add_edge("request_human_approval", "wait_for_approval")
        builder.add_conditional_edges("wait_for_approval", route_after_approval)

        builder.add_edge("create_payment_intent", "execute_payment")
        builder.add_edge("execute_payment", "wait_for_payment")
        builder.add_conditional_edges("wait_for_payment", route_after_payment)

        builder.add_edge("execute_api", "validate_response")
        builder.add_conditional_edges("validate_response", route_after_response)
        builder.add_conditional_edges("verify_result", route_after_verification)

        builder.add_edge("deliver_result", "finalize_request")
        builder.add_edge("handle_verification_failure", "finalize_request")
        builder.add_edge("human_review", "finalize_request")
        builder.add_edge("finalize_request", END)

        return builder.compile()
    except (ImportError, Exception):
        return DeterministicStateGraphRunner()


# Default compiled workflow singleton
workflow_graph = build_langgraph_workflow()
