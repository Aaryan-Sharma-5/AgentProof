"""
Supervisor / Orchestrator Agent.
Controls and runs the LangGraph workflow execution.
Decides state progression while delegating business logic to specialized agents.
"""

from __future__ import annotations
import uuid
from typing import Dict, Any, Optional
from app.graph.state import AgentFlowState


class SupervisorAgent:
    """Coordinates execution of the end-to-end AgentFlow state machine."""

    def __init__(self, graph: Optional[Any] = None):
        if graph is None:
            from app.graph.graph import workflow_graph
            graph = workflow_graph
        self.graph = graph

    async def run(
        self,
        raw_request: str,
        user_id: str = "user-1",
        agent_id: str = "agent-1",
        request_id: Optional[str] = None,
    ) -> AgentFlowState:
        req_id = request_id or f"req_{uuid.uuid4().hex[:10]}"
        initial_state: AgentFlowState = {
            "request_id": req_id,
            "user_id": user_id,
            "agent_id": agent_id,
            "raw_request": raw_request,
            "retry_count": 0,
            "candidate_apis": [],
            "audit_events": [],
            "final_status": "RECEIVED"
        }

        final_state = await self.graph.ainvoke(initial_state)
        return final_state
