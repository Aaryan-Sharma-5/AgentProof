"""
Monitoring and Audit Events API Routes.
"""

from __future__ import annotations
from typing import List, Optional
from fastapi import APIRouter, Query
from app.models.domain import AuditEvent, EventType
from app.repositories.in_memory import store

router = APIRouter(prefix="/monitoring", tags=["Monitoring"])


@router.get("/events", response_model=List[AuditEvent])
async def list_monitoring_events(
    request_id: Optional[str] = Query(None, description="Filter by request_id"),
    event_type: Optional[EventType] = Query(None, description="Filter by event_type"),
    agent_id: Optional[str] = Query(None, description="Filter by agent_id"),
    limit: int = Query(100, ge=1, le=500)
):
    events = store.audit_logs
    filtered = []
    for ev in reversed(events):
        if request_id and ev.request_id != request_id:
            continue
        if event_type and ev.event_type != event_type:
            continue
        if agent_id and ev.agent_id != agent_id:
            continue
        filtered.append(ev)
        if len(filtered) >= limit:
            break
    return filtered
