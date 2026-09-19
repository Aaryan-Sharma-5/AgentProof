"""
Transactions and Payment Intents API Routes.
"""

from __future__ import annotations
from typing import List, Optional
from fastapi import APIRouter, HTTPException
from app.schemas.payment import PaymentIntent
from app.repositories.in_memory import store

router = APIRouter(prefix="/transactions", tags=["Transactions"])


@router.get("", response_model=List[PaymentIntent])
async def list_transactions():
    return list(store.payment_intents.values())


@router.get("/{transaction_id}", response_model=PaymentIntent)
async def get_transaction(transaction_id: str):
    # Match on payment_intent_id or tx_hash
    for p in store.payment_intents.values():
        if p.payment_intent_id == transaction_id or p.tx_hash == transaction_id:
            return p
    raise HTTPException(status_code=404, detail=f"Transaction '{transaction_id}' not found.")
