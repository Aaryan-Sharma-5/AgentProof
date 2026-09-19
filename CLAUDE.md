# AgentProof - Development Instructions

## 1. Project Overview

AgentProof is an autonomous agent economic layer built for Monad Blitz Mumbai V4.

Core thesis:

> Spend by policy. Work autonomously. Get paid by proof.

Core economic claim:

> Agents cannot spend beyond policy, and they cannot earn without proof.

AgentProof combines two complementary primitives:

1. **AgentFlow** controls what an autonomous agent is allowed to spend.
2. **ProofBounty** controls when an autonomous agent is allowed to receive payment for completed work.

The complete product loop is:

```text
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

The hackathon MVP is intentionally narrow. Reliability of this loop is more important than feature count.

---

## 2. Current Repository State

The repository contains three major layers.

### Frontend

`frontend/`

- Next.js 14
- wagmi v2
- viem
- Monad Testnet RPC reads
- wallet connection
- dashboard and supporting pages

The dashboard must evolve from a static/demo-state interface into the live client for the FastAPI request lifecycle.

### Canonical Economic Engine

`agents/`

TypeScript + viem/tsx.

This is the authoritative execution path for the economic loop.

It owns:

- HTTP 402 handling
- spending enforcement
- AgentWallet payment
- provider interaction
- deterministic result checks
- trusted evaluator signature
- AgentEscrow settlement
- receipt confirmation

This path has already been proven on Monad Testnet.

### Product / Orchestration Layer

`app/`

Python + FastAPI + LangGraph.

It owns:

- API lifecycle
- request state
- natural-language requirement parsing
- discovery
- risk analysis
- pre-flight policy checks
- approval flow
- orchestration
- audit events
- optional/advisory semantic verification
- frontend-facing status

It must NOT become the authoritative economic executor.

---

## 3. Final Integrated Architecture

The target architecture is:

```text
                         USER
                           │
                           ▼
                 ┌─────────────────┐
                 │   NEXT.JS UI    │
                 │ task + wallet   │
                 └────────┬────────┘
                          │
                 POST /v1/agent-requests
                          │
                          ▼
                 ┌─────────────────┐
                 │     FASTAPI     │
                 │ API lifecycle   │
                 └────────┬────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │    LANGGRAPH    │
                 │  orchestration  │
                 └────────┬────────┘
                          │
              requirement/discovery/
               risk/policy/approval
                          │
                          ▼
             dispatch canonical execution
                          │
                       HTTP
                          │
                          ▼
              ┌─────────────────────┐
              │   AGENT SERVICE     │
              │     TypeScript      │
              └──────────┬──────────┘
                         │
                         ▼
                    AgentFlow
                         │
                    HTTP 402
                         │
                   policy approval
                         │
                         ▼
                   AgentWallet
                         │
                      0.01 MON
                         │
                         ▼
                    PROVIDER API
                         │
                         ▼
                        DATA
                         │
                         ▼
              DETERMINISTIC EVALUATOR
                         │
                    resultHash
                         │
                  trusted signature
                         │
                         ▼
                    AgentEscrow
                         │
                      0.05 MON
                         │
                         ▼
                       WORKER
                         │
                         ▼
                     FASTAPI
                         │
                         ▼
                    NEXT.JS UI
```

The rule is:

> **Python is the brain. TypeScript is the hands. Solidity is the money enforcer.**

Python may decide that an execution should not start. Python must never directly authorize an on-chain payment or settlement.

---

## 4. On-Chain Financial Primitives

AgentProof contains two independent financial primitives.

```text
                       AGENTPROOF
                            │
             ┌──────────────┴──────────────┐
             │                             │
          SPENDING                       EARNING
             │                             │
         AgentFlow                    ProofBounty
             │                             │
        AgentWallet                 AgentEscrow
             │                             │
      "Can the agent                 "Has the agent
        spend this?"                  earned this?"
```

### AgentWallet

Purpose: control autonomous agent spending.

Responsibilities:

- hold MON
- allow only the authorized agent to initiate payments
- enforce immutable maximum payment amount
- pay service providers
- emit payment events

### AgentEscrow

Purpose: lock task rewards and release them only after evaluator authorization.

Responsibilities:

- create tasks
- lock MON rewards
- store task state
- verify evaluator signatures
- prevent double settlement
- pay the worker after successful verification

Do NOT merge these contracts into a single `AgentEconomy.sol`.

The separation is intentional.

---

## 5. Frozen MVP Scope

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

Do NOT add during the Blitz MVP:

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
- production marketplace infrastructure
- unnecessary contract abstractions

These are future extensions, not MVP requirements.

---

## 6. Currency and Canonical Demo Economics

Use MON everywhere in the MVP.

| Item | Amount |
|---|---:|
| Task reward | 0.05 MON |
| Service invoice | 0.01 MON |
| Task spending cap | 0.02 MON |
| Worker payout | 0.05 MON |
| AgentWallet max payment | 0.02 MON |

The AgentWallet maximum payment and AgentFlow task spending limit are different concepts:

- **AgentWallet**: maximum amount for one payment
- **AgentFlow**: maximum cumulative spend for the current task

The canonical AgentFlow check is:

```text
spent + invoice <= spendingLimit
```

Do not replace it with only:

```text
invoice <= spendingLimit
```

---

## 7. Canonical Demo Task

Use:

> Research three competitors and produce a pricing comparison.

Canonical execution:

```text
1. User creates task.
2. 0.05 MON is locked in AgentEscrow.
3. Task spending limit is 0.02 MON.
4. Worker starts.
5. Worker discovers the provider.
6. Provider returns HTTP 402.
7. Provider supplies 0.01 MON invoice.
8. AgentFlow checks cumulative spending policy.
9. Payment is approved.
10. AgentWallet pays 0.01 MON.
11. Provider verifies PaymentSettled.
12. Provider returns data.
13. Worker generates TaskResult.
14. Deterministic evaluator checks result.
15. Evaluator signs result digest.
16. Worker submits proof.
17. AgentEscrow verifies signature.
18. AgentEscrow releases 0.05 MON.
19. Worker receives reward.
```

---

## 8. Mandatory Failure Demonstrations

### Failure 1: Spending Policy

```text
Task spending limit: 0.02 MON
Provider invoice:     0.03 MON
```

Expected:

```text
Invoice > Spending Limit
        ↓
AgentFlow rejects
        ↓
AgentWallet never called
        ↓
0 MON spent
```

### Failure 2: Invalid Proof

Evaluator signs:

```text
resultHash A
```

Worker submits:

```text
resultHash B
```

Expected:

```text
AgentEscrow reconstructs digest
        ↓
Signature mismatch
        ↓
Transaction reverts
        ↓
0 MON paid
        ↓
0.05 MON remains locked
```

---

## 9. AgentEscrow Cryptographic Specification

This specification is FROZEN.

The evaluator and contract must use exactly the same encoding.

### Raw digest

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

### Signed-message digest

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
- AgentEscrow contract address
- task ID
- worker address
- result hash

Do not change this scheme during the hackathon.

---

## 10. Critical Worker Rule

Do NOT add a separate worker parameter to `settleTask`.

The worker is:

```solidity
msg.sender
```

The signed digest already contains `msg.sender`.

Therefore a signature created for Worker A cannot be replayed by Worker B.

Do not add:

```solidity
address worker
```

to `settleTask`.

Do not add:

```solidity
require(msg.sender == worker)
```

The worker identity is already cryptographically bound to the signature.

---

## 11. Result Schema

Use a deterministic schema:

```typescript
export type TaskResult = {
  taskId: `0x${string}`;
  records: {
    id: string;
    value: string;
  }[];
};
```

Do NOT hash arbitrary:

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

## 12. Evaluator Rules

The settlement evaluator must remain deterministic.

Minimum checks:

- `records` is an array
- `records.length === 10`
- record IDs are unique

For the demo, additional deterministic checks may include:

- required competitors are present
- pricing fields exist
- required values are populated
- result structure is valid

Do NOT introduce an LLM into settlement authorization.

An LLM may assist the worker in producing a result.

The Python semantic/LLM verifier may analyze the output as advisory metadata.

Settlement authorization remains:

```text
TaskResult
  ↓
deterministic checks
  ↓
resultHash
  ↓
trusted evaluator signature
  ↓
AgentEscrow
```

---

## 13. Trust Model

AgentProof is NOT a fully trustless verification system.

The MVP uses one trusted evaluator key.

```text
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

The evaluator determines whether the result satisfies the task.

The blockchain verifies that the configured evaluator authorized the exact:

- chain
- contract
- task
- worker
- resultHash

Do NOT describe AgentProof as:

- trustless AI verification
- fully decentralized verification
- on-chain AI evaluation
- cryptographic proof that the AI answer is objectively correct
- zero-trust AI verification

Preferred wording:

> The evaluator performs deterministic checks and signs a result digest. AgentEscrow verifies that signed authorization before releasing escrow.

---

## 14. Python Orchestration Layer

The Python layer is responsible for:

- request intake
- task interpretation
- discovery
- ranking
- risk
- pre-flight policy
- approval flow
- orchestration
- audit logging
- status delivery
- optional semantic verification metadata

Python is NOT responsible for:

- AgentWallet signing
- payment settlement
- resultHash signing
- AgentEscrow settlement
- trusted verifier signing

The intended boundary is:

```text
FastAPI
  ↓
LangGraph
  ↓
dispatch canonical execution
  ↓
HTTP
  ↓
agents/service.ts
```

Do not duplicate the economic engine in Python.

---

## 15. Python Payment Adapter Rules

The existing `Web3MonadAdapter` may remain as a compatibility/test implementation, but it must not become the live economic executor while the TypeScript canonical service exists.

The live user path must not:

```text
Python
  ↓
Web3MonadAdapter
  ↓
AgentWallet
```

The live user path must be:

```text
Python
  ↓
HTTP
  ↓
TypeScript Agent Service
  ↓
AgentFlow
  ↓
AgentWallet
```

`MockPaymentAdapter` must be explicitly opt-in.

Recommended behavior:

```text
USE_MOCK_PAYMENTS=false
```

for live/dev execution.

Mock mode may be enabled for automated tests.

Mock responses must be clearly marked:

```json
{
  "is_mock": true
}
```

A fabricated hash must never be displayed as a real explorer transaction.

---

## 16. Agent Service

The TypeScript agent service is the HTTP boundary around the existing canonical worker.

Preferred file:

```text
agents/service.ts
```

Required:

```text
GET  /health
POST /run
GET  /run/:id
```

The service must:

- invoke existing worker code
- preserve AgentFlow behavior
- preserve evaluator behavior
- preserve AgentEscrow behavior
- expose execution status
- return real transaction hashes
- wait for receipts before reporting success
- avoid duplicate signing logic
- avoid storing or exposing private keys through HTTP

The service may use an in-memory execution map for the MVP.

Do not add a production database solely for this integration.

---

## 17. Marketplace

The MVP marketplace is intentionally simple.

Preferred:

```text
agents/marketplace/registry.ts
```

The registry maps service types to:

- service name
- endpoint
- expected cost

Example:

```text
Competitor Pricing API
  endpoint: provider URL
  cost: 0.01 MON
```

Do not build:

- provider auctions
- dynamic pricing engines
- provider reputation
- marketplace governance
- database-heavy service discovery

The marketplace exists to demonstrate that an autonomous agent can discover a paid service and pay for it within policy.

---

## 18. Provider

The provider is a simple paid HTTP service.

Canonical flow:

```text
Worker
  ↓
Marketplace lookup
  ↓
GET /pricing
  ↓
HTTP 402
  ↓
0.01 MON invoice
  ↓
AgentFlow policy check
  ↓
AgentWallet payment
  ↓
retry with X-Payment-Tx
  ↓
provider validates PaymentSettled
  ↓
HTTP 200
  ↓
data
```

Provider payment verification should check:

- AgentWallet address
- provider address
- payment amount
- successful transaction
- PaymentSettled event

Avoid complex tracing for the MVP.

The current provider replay behavior is acceptable for a hackathon demo, but do not market it as a production payment protocol.

---

## 19. Frontend

The frontend must make the economic state visible.

Minimum display:

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

Successful flow:

```text
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

Failure flow:

```text
INVALID PROOF
    ↓
SETTLEMENT REVERTED
    ↓
0 MON PAID
    ↓
0.05 MON REMAINS LOCKED
```

Every important blockchain transaction should expose an explorer link.

The frontend should use:

```text
NEXT_PUBLIC_API_BASE_URL
```

for backend access.

The old `DEMO_*` values may remain as fallback state, but live API state is authoritative when available.

---

## 20. Frontend Request Lifecycle

The intended flow is:

```text
Next.js
  ↓
POST /v1/agent-requests
  ↓
FastAPI returns request_id
  ↓
poll GET /v1/agent-requests/{request_id}
  ↓
render live lifecycle
```

Do not hardcode a single past transaction as the primary dashboard state.

Do not put any private key in `NEXT_PUBLIC_*`.

---

## 21. Integration Types

Use a stable correlation model.

Conceptual types:

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

The same `taskId` correlates AgentFlow and ProofBounty off-chain.

The same agent identity is used as the worker identity for the canonical proof path.

---

## 22. Worker Rules

Worker responsibilities:

1. Start task.
2. Request provider resource.
3. Process HTTP 402.
4. Ask AgentFlow for spending authorization.
5. Pay provider through AgentWallet.
6. Retry provider request.
7. Generate TaskResult.
8. Run deterministic evaluation.
9. Receive evaluator signature.
10. Submit settlement transaction.
11. Wait for transaction receipt.
12. Only then report settlement success.

Never treat a transaction as settled merely because a transaction hash was returned.

---

## 23. Chain Configuration

Monad Testnet:

```text
Chain ID:
10143

RPC:
https://testnet-rpc.monad.xyz

Explorer:
https://testnet.monadscan.com

MonadVision:
https://testnet.monadvision.com
```

Deployed contracts:

```text
AgentWallet:
0x7263058B4040ae7410340f63d292152DE8d867FA

AgentEscrow:
0x0AEb04B6e92984EC94BbbB4aF234efD080e8e9f1
```

Do not invent new addresses.

Do not store private keys in this file.

Never hardcode the evaluator chain ID inside the evaluator.

The worker should read the actual chain ID from RPC:

```typescript
const chainId = await client.getChainId();
```

---

## 24. Secret Management

Economic signer secrets must remain exclusively inside the TypeScript agent process.

Do not put:

- `AGENT_KEY`
- `WORKER_KEY`
- `VERIFIER_KEY`

into:

- frontend
- `NEXT_PUBLIC_*`
- FastAPI request payloads
- browser code
- README
- git
- public configuration

The Python layer should orchestrate through HTTP and should not need economic private keys.

Never paste private keys into source files or chat.

---

## 25. Security Requirements

### CORS

Do not use:

```python
allow_origins=["*"]
allow_credentials=True
```

Use explicit configured origins.

### JWT

Do not use the repository's default production JWT secret.

Require a non-default secret outside development.

### SSRF

Keep hardened SSRF protection.

Allow localhost only under an explicit local-demo/test flag.

Do not permit private network targets in public deployment.

### Prompt Injection

Keep external prompt injection quarantined from privileged system instructions and economic authority.

### Payment

Mock payments must be explicit.

Real mode must produce real blockchain receipts.

### Signing

Only the TypeScript agent service may hold/use the settlement signer.

Never introduce a second active signer using the same wallet key.

---

## 26. Repository Structure

Target structure:

```text
agentproof/
├── contracts/
│   ├── src/
│   │   ├── AgentWallet.sol
│   │   └── AgentEscrow.sol
│   └── test/
│       ├── AgentWallet.t.sol
│       └── AgentEscrow.t.sol
│
├── agents/
│   ├── service.ts
│   ├── evaluator.ts
│   ├── worker.ts
│   ├── agentFlow.ts
│   ├── marketplace/
│   │   └── registry.ts
│   └── provider/
│       └── server.ts
│
├── app/
│   ├── main.py
│   ├── api/
│   ├── graph/
│   ├── agents/
│   ├── services/
│   │   └── agent_execution_client.py
│   ├── blockchain/
│   └── config/
│
├── frontend/
│   └── ...
│
├── README.md
└── CLAUDE.md
```

If the repository already has a working structure, do not restructure it unnecessarily.

---

## 27. Integration Order

The current task is integration, not rebuilding the MVP.

Use this order:

### Phase 6B.1
Agent service wrapper

### Phase 6B.2
Marketplace registry

### Phase 6B.3
Python execution client

### Phase 6B.4
LangGraph dispatch integration

### Phase 6B.5
Disable live mock payment path

### Phase 6B.6
Policy limit reconciliation

### Phase 6B.7
Frontend API integration

### Phase 6B.8
Security/config hardening

### Phase 6B.9
README runbook

### Phase 6B.10
Full local E2E

### Phase 6B.11
Real Monad Testnet E2E

### Phase 6B.12
Public deployment

Do not redesign the architecture between these steps unless a concrete blocker is discovered.

---

## 28. Testing Requirements

### AgentWallet

Required tests:

- deposit succeeds
- successful payment
- unauthorized payment reverts
- payment above cap reverts
- payment above balance reverts
- failed provider transfer reverts
- PaymentSettled event emitted

### AgentEscrow

Required tests:

- valid proof pays worker
- tampered resultHash reverts
- wrong worker signature reverts
- wrong task signature reverts
- wrong evaluator signature reverts
- double settlement reverts
- zero-value task reverts
- malformed signature reverts

### Integration

Also prove:

- `/health` works
- agent service accepts a run
- status is queryable
- FastAPI dispatches to the agent service
- frontend can submit and poll
- mock mode is explicit
- no fake live transaction hashes are emitted
- Python cannot settle
- real Testnet run returns real transaction receipts

---

## 29. Full E2E Acceptance Test

Do not call the system complete until the following is demonstrated on Monad Testnet:

```text
0.05 MON escrow
      ↓
0.01 MON provider payment
      ↓
real provider response
      ↓
deterministic evaluation
      ↓
trusted signature
      ↓
real AgentEscrow settlement
      ↓
0.05 MON worker payout
```

The frontend must show the same execution through live status updates.

Record:

- request ID
- task ID
- escrow transaction
- provider payment transaction
- result hash
- settlement transaction
- final status
- spend amount
- payout amount

Verify the transaction hashes on Monad Testnet explorer.

---

## 30. Demo Sequence

The live demo should show:

1. Create task.
2. Lock 0.05 MON.
3. Show 0.02 MON task spending limit.
4. Start worker.
5. Provider returns 402.
6. AgentFlow evaluates invoice.
7. AgentWallet pays 0.01 MON.
8. Provider releases data.
9. Worker generates result.
10. Deterministic evaluator verifies result.
11. Evaluator signs proof.
12. AgentEscrow settles.
13. Worker receives 0.05 MON.

Then:

14. Tamper the resultHash.
15. Submit old signature.
16. Settlement reverts.
17. Escrow remains locked.

Then:

18. Request service costing 0.03 MON.
19. Spending limit is 0.02 MON.
20. AgentFlow rejects the payment.

---

## 31. Claims That Are Allowed

Use:

- policy-controlled autonomous spending
- evaluator-authorized task settlement
- deterministic result verification
- signed authorization bound to task, worker, contract, chain and result
- automatic MON settlement after successful verification

Do NOT use:

- trustless AI verification
- fully decentralized verification
- on-chain AI evaluation
- cryptographic proof that the AI answer is objectively correct

Preferred description:

> AgentProof lets autonomous AI agents spend MON within predefined policies, acquire resources, complete work, and automatically get paid when their result is verified.

---

## 32. Monad Blitz Priorities

Prioritize controllable scoring requirements before bonus work.

### Basic

- public GitHub
- proper README
- Monad Testnet contracts
- publicly hosted project

### Advanced

- all announced functions working
- live on-chain transaction during demo
- verified contracts
- another person can run it from README
- public build-in-public post
- 30+ second demo video
- creative ad/video

### Bonus

Only after MVP stability:

- mainnet deployment
- custom domain
- pre-market-fit evidence
- revenue strategy
- innovation/originality presentation

Do not sacrifice the core economic loop for bonus features.

---

## 33. Development Rules

### Rule 1
Do not modify Solidity for application-layer convenience.

### Rule 2
Do not duplicate economic logic across Python and TypeScript.

### Rule 3
One active economic signer process.

### Rule 4
Python can block an execution but cannot authorize payment.

### Rule 5
Only deterministic evaluator output can produce the settlement signature.

### Rule 6
Transaction success means receipt success, not merely tx hash creation.

### Rule 7
Never fake blockchain state in live mode.

### Rule 8
Keep the MVP small.

### Rule 9
Verify every Testnet claim before documenting it.

### Rule 10
README must be sufficient for a fresh developer to run the product.

---

## 34. Final Development Milestone

The most important milestone is:

> A real autonomous agent spends 0.01 MON through AgentWallet, obtains a resource, completes the task, passes deterministic evaluation, and receives 0.05 MON through AgentEscrow on Monad Testnet.

The full product story is:

```text
UNDERSTAND
    ↓
DISCOVER
    ↓
CONTROL SPENDING
    ↓
SPEND
    ↓
WORK
    ↓
VERIFY
    ↓
PROVE
    ↓
SETTLE
    ↓
EARN
```

Do not add features at the expense of this loop.
