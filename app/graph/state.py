"""
LangGraph Strongly Typed Workflow State for AgentFlow.
Strictly implements the specification in Section 28.
"""

from __future__ import annotations
from typing import TypedDict, Optional, List, Dict, Any


class AgentFlowState(TypedDict, total=False):
    request_id: str
    user_id: str
    agent_id: str

    raw_request: str

    intent: Optional[Dict[str, Any]]
    intent_confidence: float
    needs_clarification: bool
    clarification_question: Optional[str]

    candidate_apis: List[Dict[str, Any]]
    selected_api: Optional[Dict[str, Any]]

    policy_result: Optional[Dict[str, Any]]
    risk_result: Optional[Dict[str, Any]]

    approval_required: bool
    approval_id: Optional[str]
    approval_status: Optional[str]

    payment_intent_id: Optional[str]
    blockchain_tx_hash: Optional[str]
    payment_status: Optional[str]

    api_execution_id: Optional[str]
    api_response: Optional[Dict[str, Any]]

    verification_result: Optional[Dict[str, Any]]

    retry_count: int

    final_status: str
    error_code: Optional[str]
    error_message: Optional[str]

    audit_events: List[Dict[str, Any]]
