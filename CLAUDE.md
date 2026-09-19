# AgentProof - Development Instructions

## 1. Project Overview

AgentProof is an autonomous agent economic layer built for Monad Blitz Mumbai V4.

Core thesis:

> Spend by policy. Work autonomously. Get paid by proof.

AgentProof combines two complementary primitives:

1. **AgentFlow** controls what an autonomous agent is allowed to spend.
2. **ProofBounty** controls when an autonomous agent is allowed to receive payment for completed work.

The complete loop is:

```
USER
  ↓
TASK + REWARD + SPENDING LIMIT
  ↓
AI AGENT
  ↓
BUY SERVICES
  ↓
DO WORK
  ↓
PROVE RESULT
  ↓
GET PAID
```

The core economic claim is:

> Agents cannot spend beyond policy, and they cannot earn without proof.

---

## 2. Architecture

AgentProof consists of two independent on-chain financial primitives.

```
                         AGENTPROOF
                              │
              ┌───────────────┴───────────────┐
              │                                │
          SPENDING                          EARNING
              │                                │
          AgentFlow                       ProofBounty
              │                                │
          AgentWallet                    AgentEscrow
              │                                │
       "Can the agent                   "Has the agent
        spend this?"                     earned this?"
```

### AgentWallet

**Purpose:** Control autonomous agent spending.

**Responsibilities:**
- Hold MON.
- Allow only the authorized agent to initiate payments.
- Enforce an immutable maximum payment amount.
- Pay service providers.
- Emit payment events.

### AgentEscrow

**Purpose:** Lock task rewards and release them only after evaluator authorization.

**Responsibilities:**
- Create tasks.
- Lock MON rewards.
- Store task state.
- Verify evaluator signatures.
- Prevent double settlement.
- Pay the worker after successful verification.

> **Do NOT merge these contracts into a single `AgentEconomy.sol`.**

The separation is intentional:

| Contract | Question it answers |
|---|---|
| `AgentWallet` | "Can the agent spend?" |
| `AgentEscrow` | "Can the agent earn?" |

---

## 3. Frozen MVP Scope

Do not expand the architecture during the hackathon unless a concrete blocking issue requires it.

The MVP contains:

- ONE `AgentWallet`
- ONE `AgentEscrow`
- ONE trusted evaluator
- ONE mandatory worker
- ONE deterministic result schema
- ONE signature scheme
- ONE settlement function
- ONE Monad Testnet deployment
- MON as the only currency

**Do NOT add:**

- USDC
- arbitrary ERC-20 support
- ERC-4337
- account abstraction
- smart accounts
- DAO governance
- reputation systems
- dispute systems
- multiple evaluator consensus
- multiple workers
- complex permission frameworks
- unnecessary contract abstractions

These may be future extensions. They are **not** part of the Blitz MVP.

---

## 4. Currency

Use MON everywhere in the MVP.

Canonical demo economics:

| Item | Amount |
|---|---|
| Task reward | 0.05 MON |
| Service invoice | 0.01 MON |
| Task spending cap | 0.02 MON |
| Worker payout | 0.05 MON |

Do not introduce USDC or another ERC-20 token during the MVP.

---

## 5. Canonical Demo

The canonical task is:

> Research three competitors and produce a pricing comparison.

**Execution:**

1. User creates task.
2. User locks 0.05 MON in `AgentEscrow`.
3. User specifies a 0.02 MON spending limit.
4. Worker agent starts execution.
5. Worker queries Service Marketplace to discover provider endpoint.
6. Worker requests data from discovered provider.
7. Provider returns HTTP 402.
8. Provider supplies a 0.01 MON invoice.
9. AgentFlow checks the spending policy.
10. Policy approves the payment.
11. `AgentWallet` pays 0.01 MON.
12. Provider verifies payment.
13. Provider returns data.
14. Worker generates `TaskResult`.
15. Evaluator performs deterministic checks.
16. Evaluator passes the result.
17. Evaluator signs the result digest.
18. Worker submits the proof to `AgentEscrow`.
19. `AgentEscrow` verifies the signature.
20. `AgentEscrow` releases 0.05 MON.
21. Worker receives the reward.

---

## 6. Failure Demonstrations

Two failure cases are mandatory for the final demo.

### Failure 1: Spending Policy

Example:

- Task spending limit: 0.02 MON
- Provider invoice: 0.03 MON

Expected behavior:

```
Invoice > Spending Limit
        ↓
AgentFlow rejects payment
        ↓
AgentWallet is never called
        ↓
0 MON spent
```

### Failure 2: Invalid Proof

Example:

- Evaluator signs: `resultHash A`
- Worker submits: `resultHash B`

Expected behavior:

```
AgentEscrow recomputes digest
        ↓
Signature does not match
        ↓
Transaction reverts
        ↓
0 MON paid
        ↓
Escrow remains locked
```

---

## 7. AgentEscrow Cryptographic Specification

This specification is **FROZEN**.

The evaluator and contract must use exactly the same encoding.

**Raw digest**

```solidity
raw = keccak256(
    abi.encode(
        block.chainid,
        address(this),
        taskId,
        msg.sender,
        resultHash
    )
);
```

**Ethereum signed-message digest**

```solidity
digest = keccak256(
    abi.encodePacked(
        "\x19Ethereum Signed Message:\n32",
        raw
    )
);
```

The evaluator signs `raw` using viem:

```typescript
const signature = await verifier.signMessage({
  message: { raw }
});
```

The contract recovers the signer using:

```solidity
ecrecover(digest, v, r, s)
```

The signature is bound to:

- chain ID
- `AgentEscrow` contract address
- task ID
- worker address
- result hash

---

## 8. Critical Worker Rule

**DO NOT** add a separate worker parameter to `settleTask`.

The worker is:

```solidity
msg.sender
```

The signed digest already contains `msg.sender`. Therefore a signature created for Worker A cannot be replayed by Worker B.

**Do NOT add:**

```solidity
address worker
```

to `settleTask`.

**Do NOT add:**

```solidity
require(msg.sender == worker)
```

The worker identity is already cryptographically bound to the signature.

---

## 9. AgentEscrow Interface

Expected interface:

```solidity
function createTask(bytes32 taskId) external payable;

function settleTask(
    bytes32 taskId,
    bytes32 resultHash,
    uint8 v,
    bytes32 r,
    bytes32 s
) external;
```

Task structure:

```solidity
struct Task {
    address creator;
    uint256 reward;
    bool settled;
}
```

Storage:

```solidity
mapping(bytes32 => Task) public tasks;
```

Verifier:

```solidity
address public immutable trustedVerifier;
```

---

## 10. AgentEscrow Invariants

The contract must guarantee:

- A task cannot be created twice.
- A task must have a non-zero reward.
- A nonexistent task cannot be settled.
- A settled task cannot be settled again.
- An invalid signature cannot release funds.
- A signature for another task cannot release funds.
- A signature for another result cannot release funds.
- A signature for another worker cannot release funds.
- A signature from another evaluator cannot release funds.
- The worker receives the task reward.
- Settlement state is updated before the external transfer.
- Failed transfers revert the transaction.
- The contract never inspects AI output.
- The contract never makes semantic judgments about task correctness.

---

## 11. Trust Model

AgentProof is **NOT** a fully trustless verification system.

The MVP uses one trusted evaluator key.

The architecture is:

```
Worker
  ↓
Result
  ↓
Trusted Evaluator
  ↓
Signed Authorization
  ↓
AgentEscrow
```

The evaluator determines whether the result satisfies the task. The blockchain verifies that the configured evaluator authorized the exact:

- chain
- contract
- task
- worker
- resultHash

**Do NOT describe AgentProof as:**

- trustless AI verification
- decentralized verification
- on-chain AI judgment
- semantic correctness proof
- zero-trust AI verification

**Preferred wording:**

> The evaluator performs deterministic checks and signs a result digest. AgentEscrow verifies that signed authorization before releasing escrow.

---

## 12. Result Schema

The worker result must use a deterministic schema.

```typescript
export type TaskResult = {
  taskId: `0x${string}`;
  records: {
    id: string;
    value: string;
  }[];
};
```

The result must **NOT** be hashed using arbitrary:

```typescript
JSON.stringify(result)
```

Use deterministic ABI encoding:

```typescript
encodeAbiParameters(
  parseAbiParameters("(string id, string value)[] records"),
  [result.records.map((r) => [r.id, r.value] as const)]
);
```

Then:

```typescript
const resultHash = keccak256(serializedResult);
```

---

## 13. Evaluator

The evaluator must be deterministic.

**Minimum checks:**

- `records` is an array
- `records.length === 10`
- record IDs are unique

For the demo task, additional deterministic checks may include:

- required competitors are present
- pricing fields exist
- required values are populated
- result structure is valid

**Do NOT** introduce an LLM into the settlement authorization path.

An LLM can assist the worker in producing the result, but settlement must depend on deterministic evaluator checks.

---

## 14. Chain ID

Never hardcode the chain ID.

The worker must retrieve it from the connected RPC:

```typescript
const chainId = await client.getChainId();
```

The worker passes:

- `chainId`
- `contractAddress`
- `worker`
- `result`

to the evaluator.

The evaluator must not independently fetch or hardcode the chain ID.

---

## 15. Signature Format

Use viem's personal-sign flow.

**Do NOT** switch to EIP-712 during the MVP.

Signing:

```typescript
const signature = await verifier.signMessage({
  message: { raw }
});
```

Signature layout:

| Bytes | Field |
|---|---|
| 0..31 | `r` |
| 32..63 | `s` |
| 64 | `v` |

Pass `v`, `r`, `s` to `settleTask`.

---

## 16. AgentWallet

`AgentWallet` must remain minimal.

Expected interface:

```solidity
function deposit() external payable;

function payService(
    address payable provider,
    uint256 amount
) external;
```

Expected behavior:

```
Agent
  ↓
payService(provider, amount)
  ↓
Authorized agent?
  ↓
Amount > 0?
  ↓
Amount <= immutable maxPayment?
  ↓
Sufficient wallet balance?
  ↓
Transfer MON
  ↓
PaymentSettled event
```

`AgentWallet` should contain:

- authorized agent
- immutable maximum payment amount
- MON balance
- agent-only payment access
- `PaymentSettled` event

Do not add unnecessary abstractions.

---

## 17. Spending Policy

`AgentWallet`'s payment cap and `AgentFlow`'s task spending limit are different concepts.

| Component | Concept |
|---|---|
| `AgentWallet` | Maximum amount for one payment |
| `AgentFlow` | Maximum amount the current task may spend |

Example:

- `AgentWallet` maximum payment: 0.02 MON
- Task spending limit: 0.02 MON
- Provider invoice: 0.01 MON

`AgentFlow` should track cumulative spending:

```
spent + invoice <= spendingLimit
```

not only:

```
invoice <= spendingLimit
```

---

## 18. Provider & Service Marketplace

The provider is a simple HTTP service demonstrating machine-to-machine payments, and it registers itself in the **Service Marketplace**.

### Service Marketplace Implementation
The MVP marketplace should be implemented as a simple registry (e.g., an in-memory directory or static list in `agents/marketplace/registry.ts`) that maps service types to provider endpoints and expected pricing.
- **Service Name:** e.g., "Weather Data API" or "Competitor Pricing API"
- **Endpoint:** URL to the provider
- **Cost:** Expected cost (e.g., `0.01 MON`)

Before calling the provider, the Worker agent queries this registry to discover the correct endpoint for the task.

Canonical flow:

```
Worker
  ↓
Query Service Marketplace for required service
  ↓
GET /pricing on discovered Provider endpoint
  ↓
HTTP 402
  ↓
0.01 MON invoice
  ↓
AgentFlow policy check
  ↓
AgentWallet payment
  ↓
Retry request
  ↓
Provider validates payment
  ↓
HTTP 200
  ↓
Data
```

The provider and marketplace registry should remain intentionally simple. Do not build a production-grade payment protocol or complex DB for the registry.

The purpose is to demonstrate:

> An autonomous agent can discover a paid resource via the marketplace and pay for it within policy.

---

## 19. Provider Payment Verification

The preferred MVP mechanism is to use the `PaymentSettled` event emitted by `AgentWallet`.

The provider may verify:

- `AgentWallet` address
- provider address
- payment amount
- successful transaction

The worker can supply the payment transaction hash when retrying the request.

Avoid requiring complex transaction tracing for the MVP.

---

## 20. Integration Types

Use these boundaries:

```typescript
type Task = {
  taskId: `0x${string}`;
  reward: bigint;
  spendingLimit: bigint;
};

type AgentExecution = {
  taskId: `0x${string}`;
  agent: Address;
  serviceSpend: bigint;
  result: TaskResult;
};

type Evaluation = {
  taskId: `0x${string}`;
  worker: Address;
  resultHash: Hex;
  passed: boolean;
  signature?: Hex;
};
```

The same `taskId` correlates `AgentFlow` and `ProofBounty` off-chain.

The same agent identity is used as:

```
AgentFlow agent = Worker
```

Do not merge the contracts.

---

## 21. Worker

Worker responsibilities:

1. Start task.
2. Request provider resource.
3. Process HTTP 402 invoice.
4. Ask `AgentFlow` for spending authorization.
5. Pay provider through `AgentWallet`.
6. Retry provider request.
7. Generate `TaskResult`.
8. Send result to evaluator.
9. Receive evaluator signature.
10. Submit settlement transaction.
11. Wait for transaction receipt.
12. Only then report settlement success.

> Never treat a transaction as settled merely because a transaction hash was returned. Wait for the receipt.

---

## 22. Frontend

The frontend must make the economic state visible.

**Display at minimum:**

- Task
- Reward
- Spending Limit
- Amount Spent
- Agent Status
- Provider Invoice
- Policy Decision
- Provider Payment Transaction
- Evaluation Status
- Result Hash
- Settlement Transaction
- Worker Payout

**Successful flow:**

```
TASK CREATED
     ↓
0.05 MON LOCKED
     ↓
AGENT WORKING
     ↓
HTTP 402
     ↓
POLICY APPROVED
     ↓
0.01 MON PAID
     ↓
DATA RECEIVED
     ↓
RESULT VERIFIED
     ↓
PROOF SIGNED
     ↓
0.05 MON SETTLED
```

**Failure flow:**

```
INVALID PROOF
     ↓
SETTLEMENT REVERTED
     ↓
0 MON PAID
     ↓
0.05 MON REMAINS LOCKED
```

Every important blockchain transaction should expose an explorer link.

---

## 23. Contract Security

Use:

```solidity
(bool success, ) = payable(recipient).call{value: amount}("");
if (!success) revert TransferFailed();
```

For `AgentEscrow`:

1. Load task.
2. Check task state.
3. Reconstruct digest.
4. Verify signature.
5. Mark task settled.
6. Transfer payout.
7. Revert if transfer fails.

The MVP does not require a full low-s ECDSA malleability implementation. Do not expand cryptographic scope without a concrete requirement.

---

## 24. Testing

### AgentWallet

Required tests:

- deposit succeeds
- successful payment
- unauthorized payment reverts
- payment above cap reverts
- payment above balance reverts
- failed provider transfer reverts
- `PaymentSettled` event emitted

### AgentEscrow

Required tests:

- valid proof pays worker
- tampered `resultHash` reverts
- wrong worker signature reverts
- wrong task signature reverts
- wrong evaluator signature reverts
- double settlement reverts
- zero-value task reverts
- malformed signature reverts

---

## 25. Repository Structure

Target structure:

```
agentproof/
│
├── contracts/
│   ├── src/
│   │   ├── AgentWallet.sol
│   │   └── AgentEscrow.sol
│   │
│   └── test/
│       ├── AgentWallet.t.sol
│       └── AgentEscrow.t.sol
│
├── agents/
│   ├── evaluator.ts
│   ├── worker.ts
│   ├── agentFlow.ts
│   ├── marketplace/
│   │   └── registry.ts
│   └── provider/
│       └── server.ts
│
├── frontend/
│   └── ...
│
├── README.md
└── CLAUDE.md
```

If the existing repository already has a working structure, do not restructure it unnecessarily.

---

## 26. Build Order

Follow this order.

### Phase 1: AgentWallet

Implement:
- `AgentWallet.sol`
- `AgentWallet.t.sol`

### Phase 2: Provider & Marketplace

Implement `provider/server.ts` with:
- `GET /pricing`

Implement `agents/marketplace/registry.ts` with:
- Static directory of available services and endpoints

### Phase 3: AgentFlow

Implement `agentFlow.ts` with:

```
query marketplace
→ find provider endpoint
→ request provider
→ receive 402
→ parse invoice
→ check spending policy
→ pay through AgentWallet
→ wait for receipt
→ retry provider
→ receive data
```

### Phase 4: Worker Integration

Connect:

```
Provider data
    ↓
TaskResult
    ↓
Evaluator
    ↓
resultHash
    ↓
signature
    ↓
AgentEscrow
    ↓
settlement
```

### Phase 5: End-to-End Test

Prove:

```
0.05 MON escrow
        ↓
0.01 MON service payment
        ↓
real provider response
        ↓
deterministic evaluation
        ↓
real 0.05 MON worker payout
```

### Phase 6: Frontend

Build the dashboard after the backend flow works.

### Phase 7: Deployment

Deploy to Monad Testnet.

### Phase 8: Verification

Verify both contracts on the explorer.

### Phase 9: Submission Assets

Prepare:
- GitHub
- README
- Live URL
- Contract addresses
- Demo video
- Social posts
- Creative ad

---

## 27. Monad Blitz Priorities

The Monad Blitz rubric has three major areas:

| Area | Points |
|---|---|
| Basic Points | 100 |
| Advanced Points | 200 |
| Bonus Points | 100 |

The implementation should prioritize the controllable requirements.

### Basic

Must have:
- Public GitHub
- Proper README
- Monad Testnet contracts
- Publicly hosted project

### Advanced: Working Product

Must have:
- All announced functions working
- Live transaction during demo
- Verified contracts
- README allows another person to run it

### Advanced: Build in Public

Must prepare:
- X/LinkedIn project post
- 30+ second demo video
- Creative product advertisement
- 5K+ collective views target

### Bonus

Only after the MVP is stable:
- Mainnet deployment
- Custom domain
- Pre-market-fit evidence
- Revenue strategy
- Innovation/originality presentation

Do not sacrifice core functionality for bonus features.

---

## 28. Demo Requirements

The live demo should show:

1. Create task
2. Lock 0.05 MON
3. Show 0.02 MON spending limit
4. Start worker
5. Provider returns 402
6. AgentFlow evaluates invoice
7. AgentWallet pays 0.01 MON
8. Provider releases data
9. Worker generates result
10. Evaluator verifies result
11. Evaluator signs proof
12. AgentEscrow settles
13. Worker receives 0.05 MON

Then:

14. Modify resultHash
15. Submit old signature
16. Settlement reverts
17. Escrow remains locked

Then:

18. Request service costing 0.03 MON
19. Spending limit is 0.02 MON
20. AgentFlow rejects the payment

---

## 29. Messaging

**Project name:** AgentProof

**Tagline:**

> Spend by policy. Work autonomously. Get paid by proof.

**One-line description:**

> AgentProof lets autonomous AI agents spend MON within predefined policies, acquire resources, complete work, and automatically get paid when their result is verified.

**Short pitch:**

> AI agents need money to operate, but unrestricted spending is dangerous and manual payment approval defeats autonomy. AgentProof solves both sides of the loop. AgentFlow controls what an agent can spend, while ProofBounty verifies completed work and releases payment automatically. The result is an agent that can buy services, perform work, prove the result, and get paid without manual approval.

---

## 30. Claims That Are Allowed

**Use:**
- Policy-controlled autonomous spending.
- Evaluator-authorized task settlement.
- Deterministic result verification.
- Signed authorization bound to task, worker, contract, chain and result.
- Automatic MON settlement after successful verification.

**Do NOT use:**
- Trustless AI verification.
- Fully decentralized verification.
- On-chain AI evaluation.
- Cryptographic proof that the AI answer is objectively correct.

---

## 31. Final Development Rule

The most important milestone is **NOT** the frontend.

The most important milestone is:

> A real autonomous agent spends 0.01 MON through AgentWallet, obtains a resource, completes the task, passes deterministic evaluation, and receives 0.05 MON through AgentEscrow on Monad Testnet.

Build the smallest reliable system that demonstrates:

```
SPEND
  ↓
WORK
  ↓
PROVE
  ↓
EARN
```

Do not add features at the expense of this loop.