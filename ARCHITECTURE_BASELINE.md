# ARCHITECTURE BASELINE & FROZEN WEB3 SPECIFICATION

## 1. Overview & Purpose
This document establishes the architecture baseline and formal interface contract for **AgentProof / AgentFlow**, strictly adhering to the architectural specification.

As specified:
- **Teammate 3's Web3 layer (contracts and demo code) is FROZEN.**
- **No contracts will be modified, replaced, or redesigned.**
- All integration between the Python AI/Backend (FastAPI + LangGraph) and the Monad blockchain is conducted through a strict, decoupled `PaymentGateway` interface and an adapter boundary.

---

## 2. Frozen Web3 Layer Analysis

### 2.1 Contracts Summary
1. **`AgentWallet.sol`**
   - **Deployment Parameters**:
     - `_agent` (address): The authorized agent wallet address.
     - `_maxPayment` (uint256): Immutable maximum payment cap per single transaction (in wei).
   - **Public Functions**:
     - `deposit() external payable`: Accepts deposits to fund the wallet balance.
     - `payService(address payable provider, uint256 amount) external`:
       - Caller MUST be `agent`.
       - Reverts if `amount == 0` (`ZeroAmount`).
       - Reverts if `amount > maxPayment` (`AmountExceedsMaxPayment`).
       - Reverts if balance < amount (`InsufficientBalance`).
       - Reverts if ETH/MON transfer fails (`TransferFailed`).
       - Emits `PaymentSettled(address indexed provider, uint256 amount)`.
   - **Events**:
     - `PaymentSettled(address indexed provider, uint256 amount)`

2. **`AgentEscrow.sol`**
   - **Deployment Parameters**:
     - `_trustedVerifier` (address): Public address corresponding to `VERIFIER_KEY`.
   - **Public Functions**:
     - `createTask(bytes32 taskId) external payable`:
       - Creator deposits reward into escrow for `taskId`.
       - Emits `TaskCreated(bytes32 indexed taskId, address indexed creator, uint256 reward)`.
     - `settleTask(bytes32 taskId, bytes32 resultHash, uint8 v, bytes32 r, bytes32 s) external`:
       - Reverts if task not found or already settled.
       - Reverts if signature verification fails:
         - `raw = keccak256(abi.encode(block.chainid, address(this), taskId, msg.sender, resultHash))`
         - `digest = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", raw))`
         - `ecrecover(digest, v, r, s) == trustedVerifier`
       - Transfers reward to `msg.sender` (worker).
       - Emits `TaskSettled(bytes32 indexed taskId, address indexed worker, uint256 reward, bytes32 resultHash)`.

### 2.2 Environment Variables (Web3 Layer)
The following environment variables are established by Teammate 3's configuration and must be preserved:
- `MONAD_RPC`: RPC endpoint for Monad network.
- `DEPLOYER_KEY`: Private key used for contract deployments.
- `VERIFIER_KEY`: Private key of the trusted evaluator.
- `AGENT_KEY`: Private key of the agent identity (spends via AgentWallet, settles via AgentEscrow).
- `AGENT_WALLET_ADDRESS`: Deployed address of `AgentWallet`.
- `ESCROW_ADDRESS`: Deployed address of `AgentEscrow`.
- `PROVIDER_ADDRESS`: Recipient address for service provider payments.
- `PROVIDER_URL`: Endpoint for mock or real service provider API.

---

## 3. Boundary & Adapter Architecture

```
+-------------------------------------------------------------+
|                     FastAPI Backend                         |
|                 AgentFlow Core Engine                       |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|                     LangGraph Workflow                      |
|  [Requirement] -> [Discovery] -> [Policy] -> [Risk]         |
|                          |                                  |
|                          v                                  |
|                 [Payment Orchestrator]                      |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|               PaymentGateway Protocol Interface             |
|                 (Pure Python Domain Boundary)               |
+-------------------------------------------------------------+
                 |                           |
                 v                           v
+-----------------------------+ +-----------------------------+
|     MockPaymentAdapter      | |       Web3MonadAdapter      |
|  (Hermetic Unit/E2E Tests)  | |   (Production web3.py /     |
|                             | |    RPC calls to contracts)  |
+-----------------------------+ +-----------------------------+
                                             |
                                             v
                                +-----------------------------+
                                |  Monad Testnet Contracts    |
                                |  - AgentWallet              |
                                |  - AgentEscrow              |
                                +-----------------------------+
```

---

## 4. Verification & Risk Principles
1. **AI vs Deterministic Division**:
   - AI interprets natural language requirements into strict Pydantic models.
   - Deterministic policy & risk engines check caps, daily limits, categories, and provider trust.
   - LLMs NEVER hold private keys.
   - LLMs NEVER directly execute payments or override deterministic security blocks.
   - Verification combines strict transport, schema, constraint, completeness, and freshness validation with semantic LLM evaluation.
2. **SSRF & Safety Defenses**:
   - All outgoing API calls enforce HTTPS, block private IP ranges (RFC 1918, link-local, loopback), restrict redirects, and limit response payloads.
3. **Idempotency**:
   - Every operation is correlated by `request_id`.
   - Payment intents and blockchain transactions are idempotent to prevent double spending.
