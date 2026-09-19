# AgentProof — Deployment Runbook (Vercel + Render)

**Status: deployment-ready, not yet deployed.** Every image here has been built and run locally,
and a full Monad Testnet settlement has been executed through the containerised stack. The public
deploy itself is a manual process; follow the steps below in order.

## Topology

```
Browser
  → Vercel    Next.js frontend                 no secrets
  → Render    FastAPI + LangGraph  (web)       no economic keys, public
  → Render    Agent service        (pserv)     AGENT_KEY + VERIFIER_KEY, PRIVATE, 1 instance
  → Render    HTTP 402 provider    (web)       no keys, public, read-only
  → Monad Testnet 10143                        AgentWallet + AgentEscrow
```

All Render services use the **Singapore** region. FastAPI and the agent service must share a region
so private networking works between them.

> [!WARNING]
> **The agent service must run as exactly one instance.** It signs `createTask`, `payService` and
> `settleTask` from a single EOA, serialised through an in-process queue. A second replica would
> race the account nonce and drop transactions. `numInstances: 1` is pinned in `render.yaml` and
> must never be raised, and autoscaling must stay off. This is an intentional MVP constraint.

## Prerequisites

- A Render account (free tier works; the agent service and API are set to `starter`)
- A Vercel account — run `vercel login` if the CLI token has expired
- A funded Monad Testnet agent account (≥ ~1 MON for escrow + gas)
- `AgentWallet` funded with MON (each run spends 0.01)

## Deployment order

The order matters: each service needs a URL produced by the previous one.

```
1. Provider        → produces PROVIDER_URL
2. Agent service   → consumes PROVIDER_URL, is reached privately by the API
3. FastAPI         → consumes AGENT_SERVICE_URL (private hostname)
4. Vercel frontend → consumes NEXT_PUBLIC_API_BASE_URL
5. Back to FastAPI → set CORS_ALLOW_ORIGINS to the Vercel origin
```

---

## Step 1 — Provider (Render Web Service)

Render Dashboard → **New → Blueprint**, select this repository, and apply `render.yaml`. It creates
all three services. Alternatively create each by hand with the settings below.

| Setting | Value |
|---|---|
| Type | Web Service (public) |
| Runtime | Docker |
| Dockerfile path | `./agents/Dockerfile` |
| Docker context | `./agents` |
| Docker command | `npx tsx provider/server.ts` |
| Region | Singapore |
| Health check path | `/health` |

Environment (all non-secret):

```
MONAD_RPC=https://testnet-rpc.monad.xyz
AGENT_WALLET_ADDRESS=0x7263058B4040ae7410340f63d292152DE8d867FA
PROVIDER_ADDRESS=0x322BE7De3f74e57B87F24Bb68199e89d97652697
PROVIDER_INVOICE_MON=0.01
```

The provider holds **no private key**. It only reads `PaymentSettled` events and compares them
against its own public payout address.

Verify:

```bash
curl https://agentproof-provider.onrender.com/health    # 200
curl -i https://agentproof-provider.onrender.com/pricing # 402 + invoice
```

> `/pricing` answers **402 by design**, so it must not be used as the health check path — Render
> would mark the service unhealthy. That is why a dedicated `/health` exists.

**Copy the service URL.** You need it in step 2 as `PROVIDER_URL`.

---

## Step 2 — Agent service (Render **Private** Service)

| Setting | Value |
|---|---|
| Type | **Private Service** (`pserv`) — not a web service |
| Runtime | Docker |
| Dockerfile path | `./agents/Dockerfile` |
| Docker context | `./agents` |
| Docker command | `npx tsx service.ts` |
| Region | Singapore (same as FastAPI) |
| Instances | **1 — never raise this** |

Environment:

```
PORT=4100
MONAD_RPC=https://testnet-rpc.monad.xyz
AGENT_WALLET_ADDRESS=0x7263058B4040ae7410340f63d292152DE8d867FA
ESCROW_ADDRESS=0x0AEb04B6e92984EC94BbbB4aF234efD080e8e9f1
PROVIDER_ADDRESS=0x322BE7De3f74e57B87F24Bb68199e89d97652697
PROVIDER_INVOICE_MON=0.01
TASK_REWARD_MON=0.05
TASK_SPENDING_LIMIT_MON=0.02
PROVIDER_URL=https://<provider-from-step-1>.onrender.com/pricing
```

Secrets — enter in the Render dashboard, never in a file:

```
AGENT_KEY       must match AgentWallet.agent()
VERIFIER_KEY    must match AgentEscrow.trustedVerifier()
```

This is the **only** service that receives either key.

It stays private deliberately: the API reaches it over Render's internal network, so it is never
exposed to the internet. Its internal address is `http://agentproof-agent:4100`.

---

## Step 3 — FastAPI (Render Web Service)

| Setting | Value |
|---|---|
| Type | Web Service (public) |
| Runtime | Docker |
| Dockerfile path | `./Dockerfile` |
| Docker context | `.` (repository root) |
| Region | Singapore (same as the agent service) |
| Health check path | `/health` |

Environment:

```
ENVIRONMENT=production
USE_MOCK_PAYMENTS=false
ALLOW_LOCAL_PROVIDER=false
DEBUG=false
CHAIN_ID=10143
MONAD_RPC=https://testnet-rpc.monad.xyz
AGENT_WALLET_ADDRESS=0x7263058B4040ae7410340f63d292152DE8d867FA
ESCROW_ADDRESS=0x0AEb04B6e92984EC94BbbB4aF234efD080e8e9f1
TASK_REWARD_MON=0.05
TASK_SPENDING_LIMIT_MON=0.02
WALLET_MAX_PAYMENT_MON=0.02
AGENT_SERVICE_URL=http://agentproof-agent:4100
CORS_ALLOW_ORIGINS=<set in step 5>
JWT_SECRET=<generate: openssl rand -hex 32>
```

`AGENT_SERVICE_URL` is plain `http://` on purpose — Render private networking does not use TLS and
never leaves their network. This service receives **no** economic private key.

With `ENVIRONMENT=production` the app refuses to boot if `JWT_SECRET` is the development default,
`CORS_ALLOW_ORIGINS` contains `*`, or `ALLOW_LOCAL_PROVIDER` is true, and it forces `debug=false`.

Verify:

```bash
curl https://agentproof-api.onrender.com/health              # use_mock_payments false
curl https://agentproof-api.onrender.com/v1/system/status    # agent_service.reachable true
```

**Copy the API URL.** You need it in step 4.

---

## Step 4 — Frontend (Vercel)

| Setting | Value |
|---|---|
| Root directory | `frontend` |
| Framework | Next.js (auto-detected) |
| Build command | `npm run build` |
| Install command | `npm install` |

Environment variables (Production scope) — **all public, no secrets**:

```
NEXT_PUBLIC_API_BASE_URL=https://agentproof-api.onrender.com
NEXT_PUBLIC_MONAD_RPC=https://testnet-rpc.monad.xyz
NEXT_PUBLIC_AGENT_WALLET_ADDRESS=0x7263058B4040ae7410340f63d292152DE8d867FA
NEXT_PUBLIC_ESCROW_ADDRESS=0x0AEb04B6e92984EC94BbbB4aF234efD080e8e9f1
NEXT_PUBLIC_PROVIDER_ADDRESS=0x322BE7De3f74e57B87F24Bb68199e89d97652697
```

```bash
cd frontend
vercel login
vercel link
vercel --prod
```

Never set `AGENT_KEY`, `VERIFIER_KEY`, `DEPLOYER_KEY` or `JWT_SECRET` on Vercel — every
`NEXT_PUBLIC_*` value is compiled into the browser bundle.

---

## Step 5 — Close the CORS loop

```
Render → agentproof-api → Environment:
  CORS_ALLOW_ORIGINS = https://<your-vercel-domain>
```

Redeploy the API service. Until this is set, the browser cannot call the API.

---

## Step 6 — Fund AgentWallet

```bash
cast send 0x7263058B4040ae7410340f63d292152DE8d867FA "deposit()" \
  --value 0.5ether --rpc-url https://testnet-rpc.monad.xyz --private-key $AGENT_KEY
```

The agent account separately needs MON for escrow (0.05/run) and gas.

---

## Step 7 — Verify the public deployment

```bash
curl -X POST https://agentproof-api.onrender.com/v1/agent-requests \
  -H "Content-Type: application/json" \
  -H "Origin: https://<your-vercel-domain>" \
  -d '{"message":"Research three competitors and produce a pricing comparison."}'
```

Expect `settled: true`, `is_mock: false`, `reward_mon "0.05"`, `spent_mon "0.01"` and three real
hashes. Verify each on <https://testnet.monadscan.com>, and confirm the provider EOA
`0x322BE7De3f74e57B87F24Bb68199e89d97652697` gained 0.01 MON.

> Render free-tier services sleep when idle and can take ~50s to wake. The first request after a
> quiet period may time out; retry once. For a live demo, warm all three services beforehand or
> use a paid instance type.

## Secrets matrix

| Secret | Set on | Never on |
|---|---|---|
| `AGENT_KEY` | agent service only | api, provider, Vercel, git |
| `VERIFIER_KEY` | agent service only | api, provider, Vercel, git |
| `JWT_SECRET` | FastAPI only | Vercel, git |
| provider private key | **nowhere** — receive-only address | everywhere |

## Rollback

Render keeps previous deploys: service → **Deploys** → *Redeploy* on an earlier commit.
Vercel: **Deployments** → *Promote to Production* on a previous build.

## Historical configuration

`deploy/deprecated-fly/` holds unused Fly.io configs from an earlier plan. They are **not** the
deployment path and were never used for a live deployment.
