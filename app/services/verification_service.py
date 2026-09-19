"""
Verification Service.
Domain service exposing multi-layer verification operations.
"""

from __future__ import annotations
from typing import Dict, Any, Optional
from app.schemas.intent import StructuredIntent
from app.models.domain import ApiRecord
from app.schemas.verification import VerificationResult
from app.agents.verification.agent import VerificationAgent


class VerificationService:
    def __init__(self, agent: Optional[VerificationAgent] = None):
        self.agent = agent or VerificationAgent()

    async def verify_response(
        self,
        raw_user_request: str,
        intent: StructuredIntent,
        api: ApiRecord,
        http_status: int,
        content_type: str,
        response_size_bytes: int,
        elapsed_ms: float,
        api_data: Dict[str, Any],
    ) -> VerificationResult:
        return await self.agent.verify(
            raw_user_request=raw_user_request,
            intent=intent,
            api=api,
            http_status=http_status,
            content_type=content_type,
            response_size_bytes=response_size_bytes,
            elapsed_ms=elapsed_ms,
            api_data=api_data
        )
