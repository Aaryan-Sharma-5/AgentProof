"""
Blockchain Adapter & Payment Gateway Boundary.
Implements the PaymentGateway Protocol interface.
Decouples backend logic from blockchain specifics.
Provides MockPaymentAdapter (for hermetic testing) and Web3MonadAdapter (for Monad testnet).
Preserves Teammate 3's contracts without modification.
"""

from __future__ import annotations
import uuid
import hashlib
from decimal import Decimal
from typing import Protocol, Optional, Dict, Any
from app.models.domain import PaymentStatus
from app.schemas.payment import PaymentResult
from app.config.settings import settings


class PaymentGateway(Protocol):
    """Clean interface protocol for payment settlement."""

    async def pay_invoice(
        self,
        provider_address: str,
        amount_mon: float,
        idempotency_key: str,
    ) -> PaymentResult:
        """Submits a payment for a service provider invoice."""
        ...

    async def get_payment_status(self, tx_hash: str) -> PaymentStatus:
        """Retrieves verified on-chain status of a transaction."""
        ...

    async def request_refund(self, tx_hash: str) -> bool:
        """Initiates refund / dispute workflow."""
        ...


class MockPaymentAdapter:
    """
    Hermetic in-memory payment adapter. TEST-ONLY.

    Never reachable from a live request path: node wiring selects this adapter only when
    settings.use_mock_payments is explicitly true (USE_MOCK_PAYMENTS=true), which defaults to
    false. Every result it produces carries is_mock=True and a "mock:" prefixed tx hash.
    """

    def __init__(self, should_fail: bool = False, balance_mon: float = 10.0):
        self.should_fail = should_fail
        self.balance_mon = balance_mon
        self.transactions: Dict[str, Dict[str, Any]] = {}
        self.idempotency_cache: Dict[str, PaymentResult] = {}

    async def pay_invoice(
        self,
        provider_address: str,
        amount_mon: float,
        idempotency_key: str,
    ) -> PaymentResult:
        # Idempotency check: if this key was already submitted, return cached result!
        if idempotency_key in self.idempotency_cache:
            return self.idempotency_cache[idempotency_key]

        if self.should_fail:
            res = PaymentResult(
                success=False,
                status=PaymentStatus.FAILED,
                error_code="PAYMENT_FAILED",
                error_message="Simulated transaction failure in MockPaymentAdapter.",
                is_mock=True
            )
            self.idempotency_cache[idempotency_key] = res
            return res

        if self.balance_mon < amount_mon:
            res = PaymentResult(
                success=False,
                status=PaymentStatus.FAILED,
                error_code="PAYMENT_FAILED",
                error_message="Insufficient wallet balance in MockPaymentAdapter.",
                is_mock=True
            )
            self.idempotency_cache[idempotency_key] = res
            return res

        # Generate deterministic mock tx hash
        # Prefixed with "mock:" so a simulated hash is structurally impossible to confuse with a
        # real 0x-prefixed Monad transaction hash, and cannot be rendered as an explorer link.
        hash_digest = hashlib.sha256(f"{idempotency_key}:{provider_address}:{amount_mon}".encode()).hexdigest()
        tx_hash = f"mock:0x{hash_digest}"
        block_number = 1000000 + len(self.transactions)

        self.balance_mon -= amount_mon
        self.transactions[tx_hash] = {
            "provider_address": provider_address,
            "amount_mon": amount_mon,
            "status": PaymentStatus.CONFIRMED,
            "block_number": block_number,
        }

        result = PaymentResult(
            success=True,
            status=PaymentStatus.CONFIRMED,
            tx_hash=tx_hash,
            block_number=block_number,
            is_mock=True
        )
        self.idempotency_cache[idempotency_key] = result
        return result

    async def get_payment_status(self, tx_hash: str) -> PaymentStatus:
        tx = self.transactions.get(tx_hash)
        if not tx:
            return PaymentStatus.FAILED
        return tx["status"]

    async def request_refund(self, tx_hash: str) -> bool:
        tx = self.transactions.get(tx_hash)
        if tx and tx["status"] == PaymentStatus.CONFIRMED:
            self.balance_mon += tx["amount_mon"]
            tx["status"] = PaymentStatus.REVERTED
            return True
        return False


class Web3MonadAdapter:
    """
    Direct Web3 adapter for AgentWallet.payService.

    RETAINED FOR REFERENCE / OFFLINE TOOLING ONLY - NOT part of the live request path.

    The canonical TypeScript agent service (agents/service.ts) is the single process permitted to
    hold and use AGENT_KEY. Activating this adapter alongside that service would put two
    independent signers on the same key and race the account nonce. The LangGraph payment path
    dispatches to the agent service over HTTP instead; see app/services/agent_execution_client.py.
    """

    # AgentWallet ABI from Teammate 3's contracts/src/AgentWallet.sol
    AGENT_WALLET_ABI = [
        {
            "type": "function",
            "name": "payService",
            "stateMutability": "nonpayable",
            "inputs": [
                {"name": "provider", "type": "address"},
                {"name": "amount", "type": "uint256"}
            ],
            "outputs": []
        },
        {
            "type": "event",
            "name": "PaymentSettled",
            "inputs": [
                {"name": "provider", "type": "address", "indexed": True},
                {"name": "amount", "type": "uint256", "indexed": False}
            ]
        }
    ]

    def __init__(
        self,
        rpc_url: Optional[str] = None,
        agent_key: Optional[str] = None,
        wallet_address: Optional[str] = None,
    ):
        self.rpc_url = rpc_url or settings.monad_rpc
        self.agent_key = agent_key or settings.agent_key
        self.wallet_address = wallet_address or settings.agent_wallet_address

    async def pay_invoice(
        self,
        provider_address: str,
        amount_mon: float,
        idempotency_key: str,
    ) -> PaymentResult:
        """
        Executes payService on AgentWallet via Web3 / RPC.
        If web3 is not installed or network is unavailable, handles error cleanly.
        """
        if not self.agent_key or not self.wallet_address:
            return PaymentResult(
                success=False,
                status=PaymentStatus.FAILED,
                error_code="PAYMENT_FAILED",
                error_message="Web3 configuration missing AGENT_KEY or AGENT_WALLET_ADDRESS."
            )

        amount_wei = int(Decimal(str(amount_mon)) * Decimal(10**18))

        try:
            from web3 import Web3
            from eth_account import Account

            w3 = Web3(Web3.HTTPProvider(self.rpc_url))
            if not w3.is_connected():
                return PaymentResult(
                    success=False,
                    status=PaymentStatus.FAILED,
                    error_code="PAYMENT_FAILED",
                    error_message=f"Unable to connect to Monad RPC at {self.rpc_url}."
                )

            account = Account.from_key(self.agent_key)
            contract = w3.eth.contract(
                address=Web3.to_checksum_address(self.wallet_address),
                abi=self.AGENT_WALLET_ABI
            )

            nonce = w3.eth.get_transaction_count(account.address)
            gas_price = w3.eth.gas_price

            checksum_provider = Web3.to_checksum_address(provider_address)

            tx = contract.functions.payService(
                checksum_provider,
                amount_wei
            ).build_transaction({
                "from": account.address,
                "nonce": nonce,
                "gasPrice": gas_price,
                "chainId": settings.chain_id,
            })

            signed_tx = account.sign_transaction(tx)
            raw_tx = getattr(signed_tx, "raw_transaction", getattr(signed_tx, "rawTransaction", None))
            tx_hash_bytes = w3.eth.send_raw_transaction(raw_tx)
            tx_hash = w3.to_hex(tx_hash_bytes)

            # Wait for receipt
            receipt = w3.eth.wait_for_transaction_receipt(tx_hash_bytes, timeout=30)
            if receipt.status == 1:
                return PaymentResult(
                    success=True,
                    status=PaymentStatus.CONFIRMED,
                    tx_hash=tx_hash,
                    block_number=receipt.blockNumber
                )
            else:
                return PaymentResult(
                    success=False,
                    status=PaymentStatus.REVERTED,
                    tx_hash=tx_hash,
                    error_code="PAYMENT_REVERTED",
                    error_message="Contract transaction reverted on chain."
                )

        except Exception as e:
            return PaymentResult(
                success=False,
                status=PaymentStatus.FAILED,
                error_code="PAYMENT_FAILED",
                error_message=f"Web3 transaction error: {str(e)}"
            )

    async def get_payment_status(self, tx_hash: str) -> PaymentStatus:
        try:
            from web3 import Web3
            w3 = Web3(Web3.HTTPProvider(self.rpc_url))
            receipt = w3.eth.get_transaction_receipt(tx_hash)
            if receipt is None:
                return PaymentStatus.PENDING
            return PaymentStatus.CONFIRMED if receipt.status == 1 else PaymentStatus.REVERTED
        except Exception:
            return PaymentStatus.FAILED

    async def request_refund(self, tx_hash: str) -> bool:
        # Off-chain dispute / refund request
        return False
