"""
Blockchain Event Definitions and Event Listener.
Tracks PaymentSettled events emitted by AgentWallet.
"""

from __future__ import annotations
from typing import Optional, List, Dict, Any
from pydantic import BaseModel


class PaymentSettledEvent(BaseModel):
    provider: str
    amount_wei: int
    amount_mon: float
    tx_hash: str
    block_number: int


class BlockchainEventListener:
    """Listens for and decodes PaymentSettled events from Monad."""

    def __init__(self, adapter: Any = None):
        self.adapter = adapter

    def decode_log(self, log: Dict[str, Any]) -> Optional[PaymentSettledEvent]:
        # Utility to parse raw event log dictionary
        try:
            return PaymentSettledEvent(
                provider=log.get("provider", ""),
                amount_wei=int(log.get("amount", 0)),
                amount_mon=int(log.get("amount", 0)) / 10**18,
                tx_hash=log.get("transactionHash", ""),
                block_number=int(log.get("blockNumber", 0))
            )
        except Exception:
            return None
