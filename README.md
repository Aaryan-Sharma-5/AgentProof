# AgentProof

> **Spend by policy. Work autonomously. Get paid by proof.**

AgentProof is an on-chain economic layer for autonomous AI agents.

It combines:

- **AgentFlow**: controls what an agent can spend.
- **ProofBounty**: controls when an agent gets paid.

The complete loop is:

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

Built for Monad Blitz Mumbai V4.

## Monad Blitz Submission

Fill these values after deployment.

| Requirement | Value |
|---|---|
| GitHub | TODO: PUBLIC_GITHUB_URL |
| Live Demo | TODO: LIVE_URL |
| Network | Monad Testnet |
| Deployment | Monad Testnet |
| Chain ID | TODO: CHAIN_ID |

### Contracts

| Contract | Address | Explorer |
|---|---|---|
| AgentWallet | TODO: AGENT_WALLET_ADDRESS | TODO: EXPLORER_URL |
| AgentEscrow | TODO: AGENT_ESCROW_ADDRESS | TODO: EXPLORER_URL |

## The Problem

Autonomous AI agents can increasingly perform useful work, but their economic loop remains fragmented.

An agent may need to:

- purchase data or APIs,
- execute a task,
- produce a result,
- prove that the result satisfies requirements,
- receive payment.

Manual approval creates a bottleneck.

Unrestricted agent spending creates a security problem.

AgentProof connects both sides into one programmable workflow.

## The Idea

AgentProof answers two questions:

- **AgentFlow**: "Can this agent spend this amount?"
- **ProofBounty**: "Has this agent earned this reward?"

Together:

```text
                 AGENTPROOF
                      │
          ┌───────────┴───────────┐
          │                       │
       SPENDING                EARNING
          │                       │
      AgentFlow              ProofBounty
          │                       │
      AgentWallet            AgentEscrow
          │                       │
     Buy services            Get paid
          │                       │
          └───────────┬───────────┘
                      │
                 AI AGENT
```

The core economic principle is:

> Agents cannot spend beyond policy, and they cannot earn without proof.

## How It Works

Our demo task is:

> Research three competitors and produce a pricing comparison.

The user defines:

```text
Task reward:       0.05 MON
Spending limit:    0.02 MON
```

### 1. Lock the Reward

The user creates the task.

AgentEscrow locks:

```text
0.05 MON
```

The reward stays locked until successful settlement.

```text
USER
  ↓
AgentEscrow
  ↓
0.05 MON LOCKED
```

### 2. Agent Needs External Data

The worker agent requests information from a provider.

The provider requires payment and responds:

```text
HTTP 402 Payment Required

Invoice:
0.01 MON
```

### 3. AgentFlow Checks the Policy

The agent has:

```text
Spending limit: 0.02 MON
```

The provider requests:

```text
0.01 MON
```

AgentFlow evaluates:

```text
0 + 0.01 <= 0.02
```

The payment is approved.

### 4. AgentWallet Pays

AgentFlow instructs the agent to pay through AgentWallet.

```text
AgentWallet
     ↓
0.01 MON
     ↓
Provider
```

The payment is recorded on-chain.

The provider then releases the requested data.

### 5. Agent Performs the Work

The worker processes the provider data and produces a structured result.

Example:

```json
{
  "taskId": "0x...",
  "records": [
    { "id": "competitor-1", "value": "..." },
    { "id": "competitor-2", "value": "..." },
    { "id": "competitor-3", "value": "..." }
  ]
}
```

### 6. Evaluator Verifies the Result

A separate evaluator performs deterministic checks.

For the MVP:

- `records` is an array
- `records.length === 10`
- record IDs are unique
- required fields exist

If the result passes, the evaluator calculates a deterministic `resultHash`.

The evaluator then signs a digest containing:

- chain ID
- contract address
- task ID
- worker address
- result hash

### 7. AgentEscrow Settles

The worker submits:

- `taskId`
- `resultHash`
- `v`
- `r`
- `s`

to AgentEscrow.

The contract reconstructs the digest and verifies the evaluator signature.

If valid:

```text
AgentEscrow
     ↓
VERIFY
     ↓
0.05 MON
     ↓
WORKER
```

The worker receives the reward automatically.

No manual payment approval is required.

### 8. Service Marketplace

AgentProof includes a built-in **Service Marketplace** where anyone can host and list their APIs and services for autonomous agents to discover and use. 

For example, if you build a localized weather monitoring service:
1. You register your service and its endpoint in the AgentProof Marketplace.
2. You define your pricing (e.g., `0.01 MON` per request).
3. AI Agents can search the directory, discover your service, call your endpoint, and automatically pay your invoice via their `AgentWallet`.
4. Your service instantly verifies the on-chain payment and delivers the data.

This creates an open ecosystem where human developers can monetize their data, and agents can dynamically discover and acquire the resources they need.

## Complete Architecture

```text
                         USER
                          │
                 Task + Reward + Limit
                          │
                          ▼
                 ┌─────────────────┐
                 │   AGENTESCROW   │
                 │                 │
                 │ Lock 0.05 MON   │
                 └────────┬────────┘
                          │
                          ▼
                    WORKER AGENT
                          │
                    Needs data
                          │
                          ▼
                 ┌─────────────────┐
                 │  PROVIDER API   │
                 │      HTTP 402   │
                 └────────┬────────┘
                          │
                      0.01 MON
                          │
                          ▼
                 ┌─────────────────┐
                 │    AGENTFLOW    │
                 │                 │
                 │ Spending Policy │
                 │   max 0.02 MON  │
                 └────────┬────────┘
                          │
                       APPROVED
                          │
                          ▼
                 ┌─────────────────┐
                 │   AGENTWALLET   │
                 │                 │
                 │   Pay 0.01 MON  │
                 └────────┬────────┘
                          │
                          ▼
                    PROVIDER DATA
                          │
                          ▼
                    WORKER AGENT
                          │
                        RESULT
                          │
                          ▼
                 ┌─────────────────┐
                 │    EVALUATOR    │
                 │  Deterministic  │
                 │     Checks      │
                 └────────┬────────┘
                          │
                         PASS
                          │
                    Signed Digest
                          │
                          ▼
                 ┌─────────────────┐
                 │   AGENTESCROW   │
                 │ Verify + Settle │
                 └────────┬────────┘
                          │
                       0.05 MON
                          │
                          ▼
                    WORKER AGENT
```

## Two-Sided Economic Safety

AgentProof separates spending authorization from earning authorization.

### Spending

```text
Provider Invoice
      ↓
AgentFlow
      ↓
Spending Policy
      ↓
AgentWallet
      ↓
Provider
```

If:

```text
invoice > spending limit
```

then:

```text
REJECT
```

and no MON is spent.

### Earning

```text
Worker Result
      ↓
Evaluator
      ↓
Signed Result Digest
      ↓
AgentEscrow
      ↓
Worker Payout
```

If the proof is invalid:

```text
REVERT
```

and the escrow remains locked.

## Failure Demonstration

### Overspending

Example:

```text
Spending limit: 0.02 MON
Provider invoice: 0.03 MON
```

AgentFlow rejects the payment.

```text
0.03 MON > 0.02 MON
        ↓
POLICY REJECTED
        ↓
AgentWallet not called
        ↓
0 MON spent
```

### Invalid Proof

Suppose the evaluator signs `resultHash A` but the worker submits `resultHash B`.

AgentEscrow computes a different digest.

Therefore:

```text
INVALID SIGNATURE
        ↓
TRANSACTION REVERTS
        ↓
0 MON PAID
        ↓
0.05 MON REMAINS LOCKED
```

This demonstrates that a worker cannot change the claimed result after receiving evaluator authorization.

## Cryptographic Settlement

AgentEscrow does not inspect AI output directly.

The evaluator signs a deterministic authorization containing:

- `chainId`
- `contractAddress`
- `taskId`
- `worker`
- `resultHash`

The contract reconstructs:

```solidity
bytes32 raw = keccak256(
    abi.encode(
        block.chainid,
        address(this),
        taskId,
        msg.sender,
        resultHash
    )
);
```

Then:

```solidity
bytes32 digest = keccak256(
    abi.encodePacked(
        "\x19Ethereum Signed Message:\n32",
        raw
    )
);
```

Finally:

```solidity
address signer = ecrecover(digest, v, r, s);
```

The recovered signer must equal the configured trusted evaluator.

## Trust Model

AgentProof's MVP uses one trusted evaluator key.

It is therefore not a fully decentralized or trustless verification system.

The evaluator is responsible for determining whether the result satisfies the task.

The blockchain enforces the evaluator's authorization.

In other words:

**OFF-CHAIN** — "Did the result pass?" → Evaluator

**ON-CHAIN** — "Did the trusted evaluator authorize this exact task, worker and result?" → AgentEscrow

This separation is intentional.

## Smart Contracts

### AgentWallet

AgentWallet controls autonomous spending.

Responsibilities:

- Hold MON.
- Authorize the agent.
- Enforce maximum payment amount.
- Pay service providers.
- Emit payment events.

Interface:

```solidity
function deposit() external payable;

function payService(
    address payable provider,
    uint256 amount
) external;
```

### AgentEscrow

AgentEscrow controls task earnings.

Responsibilities:

- Create tasks.
- Lock MON.
- Store task state.
- Verify evaluator signatures.
- Prevent double settlement.
- Pay workers.

Interface:

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

## Demo Economics

The MVP uses MON only.

```text
Task reward:        0.05 MON
Service invoice:    0.01 MON
Spending limit:     0.02 MON
Worker payout:      0.05 MON
```

## Technology Stack

| Layer | Technology |
|---|---|
| Blockchain | Monad Testnet |
| Smart Contracts | Solidity |
| Contract Framework | Foundry |
| Agent Runtime | Node.js |
| Language | TypeScript |
| Blockchain SDK | viem |
| Frontend | Next.js |
| Styling | Tailwind CSS |
| Wallet Integration | wagmi / viem |
| Provider | Node.js / Express |
| Evaluation | Deterministic TypeScript |

## Repository Structure

```text
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
│   └── provider/
│       └── server.ts
│
├── frontend/
│   └── ...
│
├── README.md
└── CLAUDE.md
```

## Quick Start

### Prerequisites

Install:

- Node.js
- npm
- Foundry
- A Monad Testnet wallet
- Monad Testnet MON

### 1. Clone

```bash
git clone TODO:GITHUB_URL
cd agentproof
```

### 2. Install Dependencies

Contracts:

```bash
cd contracts
forge build
```

Agents:

```bash
cd ../agents
npm install
```

Frontend:

```bash
cd ../frontend
npm install
```

### 3. Environment Variables

Create the required environment files.

Example:

```text
MONAD_RPC=
DEPLOYER_KEY=
VERIFIER_KEY=
WORKER_KEY=
CONTRACT_ADDRESS=
AGENT_WALLET_ADDRESS=
```

Never commit private keys.

### 4. Deploy Contracts

Build:

```bash
forge build
```

Deploy AgentEscrow:

```bash
forge create src/AgentEscrow.sol:AgentEscrow \
  --constructor-args <VERIFIER_ADDRESS> \
  --rpc-url $MONAD_RPC \
  --private-key $DEPLOYER_KEY
```

Deploy AgentWallet with:

- authorized agent
- maximum payment amount

Record both contract addresses.

### 5. Verify Contracts

Verify both contracts on the Monad explorer.

Update this README with the actual verified contract addresses and explorer links (see [Contracts](#contracts) above).

### 6. Start Provider

```bash
cd agents
npm run provider
```

The provider should expose `GET /pricing`.

The first request returns `HTTP 402` with a MON invoice.

After valid payment, the provider returns `HTTP 200` with the requested data.

### 7. Start Agent

```bash
npm run worker
```

The worker should:

```text
request provider
→ receive 402
→ check spending policy
→ pay through AgentWallet
→ retry provider
→ receive data
→ produce result
→ evaluate result
→ sign proof
→ settle AgentEscrow
```

### 8. Start Frontend

```bash
cd frontend
npm run dev
```

Open the local frontend URL.

The dashboard should display:

- Task
- Reward
- Spending Limit
- Amount Spent
- Agent Status
- Provider Invoice
- Policy Decision
- Provider Payment
- Evaluation
- Result Hash
- Settlement
- Worker Payout

## End-to-End Demo

The expected successful flow is:

```text
CREATE TASK
     ↓
LOCK 0.05 MON
     ↓
START AGENT
     ↓
PROVIDER RETURNS 402
     ↓
CHECK SPENDING POLICY
     ↓
APPROVE 0.01 MON
     ↓
AGENTWALLET PAYS
     ↓
PROVIDER RETURNS DATA
     ↓
WORKER PRODUCES RESULT
     ↓
EVALUATOR PASSES RESULT
     ↓
EVALUATOR SIGNS PROOF
     ↓
AGENTESCROW VERIFIES
     ↓
SETTLE 0.05 MON
     ↓
WORKER GETS PAID
```

## Testing

Run all contract tests:

```bash
cd contracts
forge test
```

### AgentWallet

Tests cover:

- deposit
- successful payment
- unauthorized payment
- payment above cap
- payment above balance
- failed transfer
- `PaymentSettled` event

### AgentEscrow

Tests cover:

- valid proof
- tampered resultHash
- wrong worker
- wrong task
- wrong evaluator
- double settlement
- zero-value task
- malformed signature

## Security Model

AgentProof deliberately keeps its MVP security model small and explicit.

**AgentWallet** controls:

- who can spend
- how much can be spent per payment

**AgentFlow** controls:

- how much the current task may spend

**AgentEscrow** controls:

- whether a task reward can be released

**Evaluator** controls:

- whether the result passes the deterministic checks

The evaluator is trusted in the MVP.

## Why Blockchain?

AgentProof is designed around repeated autonomous economic interactions:

```text
Agent
  ↓
Service payment
  ↓
Work
  ↓
Verification
  ↓
Settlement
```

Each completed task can result in an independent on-chain settlement.

The blockchain provides:

- programmable escrow,
- verifiable settlement authorization,
- transparent transaction history,
- automatic payout,
- no manual payment approval.

Monad provides the execution environment for the transaction-heavy autonomous workflow.

## Why Two Contracts?

The two contracts represent different economic primitives.

```text
AgentWallet
      │
      └── Controlled expenditure


AgentEscrow
      │
      └── Conditional earnings
```

This separation keeps the authorization models independent.

AgentWallet answers: "Can the agent spend?"

AgentEscrow answers: "Can the agent earn?"

## What AgentProof Is Not

The MVP does not claim to provide:

- fully trustless verification,
- decentralized evaluator consensus,
- on-chain semantic AI evaluation,
- proof that an AI answer is objectively correct,
- ERC-4337 account abstraction,
- multi-token settlement,
- DAO governance,
- reputation systems,
- dispute resolution.

These are possible future extensions.

## Future Extensions

Potential future versions could introduce:

```text
Multiple Evaluators
        ↓
Evaluator Consensus

Reputation
        ↓
Worker / Evaluator Reliability

Disputes
        ↓
Challenge + Arbitration

Stablecoins
        ↓
USDC / ERC-20 Settlement


Task Categories
        ↓
Specialized Evaluators
```

These are intentionally outside the Blitz MVP.

## Monad Blitz Goals

The project is designed to satisfy the core Monad Blitz requirements:

**Basic**

- [x] Public GitHub repository
- [x] Proper README
- [x] Monad Testnet contracts
- [x] Publicly hosted application

**Working Product**

- [x] Working contract functions
- [x] Live Monad transaction
- [x] Verified contracts
- [x] Reproducible README setup

**Build in Public**

The project will include:

- [x] X / LinkedIn build post
- [x] 30+ second working demo
- [x] Creative product advertisement
- [x] Social distribution

## Submission Checklist

Before submission, verify:

**Repository**

- [ ] GitHub repository is public
- [ ] README is complete
- [ ] Setup instructions work from a clean environment
- [ ] No private keys committed
- [ ] Source code is pushed

**Contracts**

- [ ] AgentWallet deployed
- [ ] AgentEscrow deployed
- [ ] Both contracts verified
- [ ] Addresses added to README
- [ ] Explorer links added

**Application**

- [ ] Frontend publicly hosted
- [ ] Live URL added to README
- [ ] AgentFlow works
- [ ] Provider 402 works
- [ ] AgentWallet payment works
- [ ] Evaluator works
- [ ] AgentEscrow settlement works
- [ ] Worker receives payout

**Demo**

- [ ] Real MON task creation
- [ ] Real MON service payment
- [ ] Real MON worker payout
- [ ] Overspending failure demonstrated
- [ ] Invalid proof failure demonstrated
- [ ] Explorer transactions visible

**Social**

- [ ] X / LinkedIn project post
- [ ] @monad tagged
- [ ] @monad_dev tagged
- [ ] @geeky_kartikey tagged
- [ ] 30+ second demo video
- [ ] Creative advertisement video
- [ ] Posts published before submission deadline

## Project Positioning

**One sentence**

AgentProof lets autonomous AI agents spend MON within predefined policies, acquire resources, complete work, and automatically get paid when their result is verified.

**Short pitch**

AI agents need money to operate, but unrestricted spending is dangerous and manual payment approval defeats autonomy. AgentProof solves both sides of the loop. AgentFlow controls what an agent can spend, while ProofBounty verifies completed work and releases payment automatically. The result is an agent that can buy services, perform work, prove the result, and get paid without manual approval.

**The core loop**

```text
        SPEND
          ↓
         WORK
          ↓
        PROVE
          ↓
         EARN
```

**AgentProof**

Spend by policy. Work autonomously. Get paid by proof.
