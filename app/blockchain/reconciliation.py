"""
Blockchain State Reconciliation Service.
Reconciles divergent states between application database and on-chain ground truth.
Handles crashes between transaction submission and receipt persistence.
"""

from __future__ import annotations
from typing import Optional, List, Dict
from app.models.domain import PaymentStatus
from app.blockchain.adapter import PaymentGateway
from app.repositories.in_memory import store, InMemoryStore


class BlockchainReconciler:
    """Reconciles pending payments with on-chain settlement status."""

    def __init__(self, payment_gateway: PaymentGateway, data_store: Optional[InMemoryStore] = None):
        self.gateway = payment_gateway
        self.store = data_store or store

    async def reconcile_pending_payments(self) -> List[Dict[str, str]]:
        """
        Scans all payment intents in PENDING or SUBMITTED state and checks
        their true status against the blockchain gateway.
        """
        reconciled = []
        for intent_id, intent in list(self.store.payment_intents.items()):
            if intent.status in (PaymentStatus.SUBMITTED, PaymentStatus.PENDING) and intent.tx_hash:
                on_chain_status = await self.gateway.get_payment_status(intent.tx_hash)
                if on_chain_status != intent.status:
                    prev_status = intent.status
                    intent.status = on_chain_status

                    # Reconcile associated request state in application storage (Section 57)
                    if intent.request_id and intent.request_id in self.store.requests:
                        req = self.store.requests[intent.request_id]
                        req["payment_status"] = on_chain_status.value
                        req["blockchain_tx_hash"] = intent.tx_hash
                        if on_chain_status == PaymentStatus.CONFIRMED:
                            if req.get("final_status") in ("PAYMENT_PENDING", "PENDING", "SUBMITTED", "AWAITING_APPROVAL"):
                                req["final_status"] = "PAYMENT_CONFIRMED"
                        elif on_chain_status in (PaymentStatus.FAILED, PaymentStatus.REVERTED):
                            req["final_status"] = "FAILED"
                            req["error_code"] = (
                                "PAYMENT_REVERTED" if on_chain_status == PaymentStatus.REVERTED else "PAYMENT_FAILED"
                            )

                    reconciled.append({
                        "payment_intent_id": intent_id,
                        "request_id": intent.request_id,
                        "tx_hash": intent.tx_hash,
                        "previous_status": prev_status.value,
                        "new_status": on_chain_status.value,
                    })
        return reconciled
