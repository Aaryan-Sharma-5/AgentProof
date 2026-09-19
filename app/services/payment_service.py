"""
Payment Service.
Domain service exposing payment orchestration operations.
"""

from __future__ import annotations
from typing import Optional
from app.agents.payment.orchestrator import PaymentOrchestrator
from app.blockchain.adapter import PaymentGateway
from app.schemas.payment import PaymentIntent, PaymentResult
from app.repositories.in_memory import store, InMemoryStore


class PaymentService:
    def __init__(
        self,
        gateway: PaymentGateway,
        data_store: Optional[InMemoryStore] = None,
    ):
        self.orchestrator = PaymentOrchestrator(payment_gateway=gateway, data_store=data_store or store)

    def create_intent(
        self,
        request_id: str,
        agent_id: str,
        provider_id: str,
        provider_address: str,
        amount_mon: float,
    ) -> PaymentIntent:
        return self.orchestrator.create_intent(
            request_id=request_id,
            agent_id=agent_id,
            provider_id=provider_id,
            provider_address=provider_address,
            amount_mon=amount_mon
        )

    async def execute_payment(self, payment_intent_id: str) -> PaymentResult:
        return await self.orchestrator.execute_payment(payment_intent_id)
