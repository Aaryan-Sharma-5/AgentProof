"""
Observability and Structured Event Logging.
Emits and stores structured audit events across all workflow nodes.
"""

from __future__ import annotations
import uuid
import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from app.models.domain import EventType, AuditEvent
from app.repositories.in_memory import store, InMemoryStore

logger = logging.getLogger("agentflow.audit")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")


class AuditLogger:
    """Records observable structured events for traceability and compliance."""

    def __init__(self, data_store: Optional[InMemoryStore] = None):
        self.store = data_store or store

    def log_event(
        self,
        event_type: EventType,
        request_id: str,
        status: str,
        agent_id: Optional[str] = None,
        api_id: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
        error_code: Optional[str] = None,
    ) -> AuditEvent:
        event = AuditEvent(
            event_id=f"evt_{uuid.uuid4().hex[:12]}",
            request_id=request_id,
            event_type=event_type,
            timestamp=datetime.now(timezone.utc),
            agent_id=agent_id,
            api_id=api_id,
            status=status,
            details=details or {},
            error_code=error_code
        )
        self.store.audit_logs.append(event)
        logger.info(
            f"AUDIT_EVENT [{event_type.value}] req={request_id} status={status} "
            f"agent={agent_id} api={api_id} err={error_code}"
        )
        return event

    def get_events_for_request(self, request_id: str) -> List[AuditEvent]:
        return [e for e in self.store.audit_logs if e.request_id == request_id]


audit_logger = AuditLogger()
