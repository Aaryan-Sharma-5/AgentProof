"""
Payment Orchestration Schemas.
Models for payment intents, provider 402 invoices, and settlement receipts.
"""

from __future__ import annotations
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
from app.models.domain import PaymentStatus


class ProviderInvoice(BaseModel):
    amount: str = Field(description="Amount in MON string format, e.g. '0.01'")
    currency: str = "MON"
    paymentAddress: str = Field(description="0x-prefixed provider wallet address")
    error: Optional[str] = None


class PaymentIntentCreate(BaseModel):
    request_id: str
    agent_id: str
    provider_id: str
    provider_address: str
    amount_mon: float
    currency: str = "MON"
    idempotency_key: str


class PaymentIntent(BaseModel):
    payment_intent_id: str
    request_id: str
    agent_id: str
    provider_id: str
    provider_address: str
    amount_mon: float
    amount_wei: int
    currency: str = "MON"
    status: PaymentStatus = PaymentStatus.CREATED
    idempotency_key: str
    tx_hash: Optional[str] = None
    block_number: Optional[int] = None
    failure_reason: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


class PaymentResult(BaseModel):
    success: bool
    status: PaymentStatus
    tx_hash: Optional[str] = None
    block_number: Optional[int] = None
    error_code: Optional[str] = None
    error_message: Optional[str] = None
