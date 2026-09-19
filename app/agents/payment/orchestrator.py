"""
Payment Orchestrator Agent.
Coordinates payment intents, policy enforcement, and execution via PaymentGateway.
Guarantees idempotency and isolates signing keys from the AI layer.
"""

from __future__ import annotations
import uuid
from decimal import Decimal
from typing import Optional, Tuple
from app.models.domain import PaymentStatus, ApiRecord, AgentPolicy
from app.schemas.payment import (
    PaymentIntent,
    PaymentResult,
)
from app.blockchain.adapter import PaymentGateway
from app.repositories.in_memory import store, InMemoryStore


class PaymentOrchestrator:
    """Orchestrates payment lifecycle against the external Web3 adapter boundary."""

    def __init__(
        self,
        payment_gateway: PaymentGateway,
        data_store: Optional[InMemoryStore] = None,
    ):
        self.gateway = payment_gateway
        self.store = data_store or store

    def create_intent(
        self,
        request_id: str,
        agent_id: str,
        provider_id: str,
        provider_address: str,
        amount_mon: float,
    ) -> PaymentIntent:
        """Creates or returns an idempotent payment intent for this request."""
        # Check if already exists for this request
        for existing in self.store.payment_intents.values():
            if existing.request_id == request_id:
                return existing

        intent_id = f"pi_{uuid.uuid4().hex[:12]}"
        idempotency_key = f"payment:{request_id}"
        amount_wei = int(Decimal(str(amount_mon)) * Decimal(10**18))

        intent = PaymentIntent(
            payment_intent_id=intent_id,
            request_id=request_id,
            agent_id=agent_id,
            provider_id=provider_id,
            provider_address=provider_address,
            amount_mon=amount_mon,
            amount_wei=amount_wei,
            status=PaymentStatus.CREATED,
            idempotency_key=idempotency_key
        )
        self.store.payment_intents[intent_id] = intent
        return intent

    async def execute_payment(
        self,
        payment_intent_id: str,
    ) -> PaymentResult:
        """Submits payment to the PaymentGateway adapter."""
        intent = self.store.payment_intents.get(payment_intent_id)
        if not intent:
            return PaymentResult(
                success=False,
                status=PaymentStatus.FAILED,
                error_code="PAYMENT_FAILED",
                error_message=f"Payment intent '{payment_intent_id}' not found."
            )

        if intent.status == PaymentStatus.CONFIRMED:
            return PaymentResult(
                success=True,
                status=PaymentStatus.CONFIRMED,
                tx_hash=intent.tx_hash,
                block_number=intent.block_number
            )

        intent.status = PaymentStatus.SUBMITTED

        # Call adapter boundary
        result = await self.gateway.pay_invoice(
            provider_address=intent.provider_address,
            amount_mon=intent.amount_mon,
            idempotency_key=intent.idempotency_key
        )

        intent.status = result.status
        intent.tx_hash = result.tx_hash
        intent.block_number = result.block_number
        if not result.success:
            intent.failure_reason = result.error_message

        return result
