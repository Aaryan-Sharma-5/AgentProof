# AgentProof — Public Deployment Runbook

Everything here has been **built and container-tested locally**, but the public deploy itself has
**not been executed** — it is blocked on account setup (see Prerequisites). Run these commands in
order and the stack comes up.

## Topology

```
Browser
  → Vercel        agentproof.vercel.app          Next.js frontend
  → Fly.io        agentproof-api.fly.dev         FastAPI + LangGraph   (NO keys)
  → Fly.io        agentproof-agent.fly.dev       Agent service         (SOLE SIGNER, 1 machine)
  → Fly.io        agentproof-provider.fly.dev    HTTP 402 provider     (NO keys)
  → Monad Testnet 10143                          AgentWallet + AgentEscrow
```

Only `agentproof-agent` holds private keys. It must never run more than one machine.

## Prerequisites (blockers as of this writing)

1. **Fly.io billing** — `fly apps create` currently fails with
   *"We need your payment information to continue"*. Add a card at
   <https://fly.io/dashboard/> → Billing. The free allowance covers these three small apps.
2. **Vercel auth** — the stored token is invalid. Run `vercel login`.
3. A funded Monad Testnet account for `AGENT_KEY` (needs ≥ ~1 MON for escrow + gas).

## Step 1 — Provider service

```bash
fly apps create agentproof-provider --org personal
fly deploy -c deploy/fly.provider.toml
curl https://agentproof-provider.fly.dev/pricing      # expect HTTP 402 + 0.01 MON invoice
```

No secrets required — the provider only reads on-chain events and knows its own public address.

## Step 2 — Agent service (the only signer)

```bash
fly apps create agentproof-agent --org personal

# Secrets. Never commit these; never pass them to the API or frontend apps.
fly secrets set \
  AGENT_KEY=0x<agent private key> \
  VERIFIER_KEY=0x<verifier private key> \
  PROVIDER_URL=https://agentproof-provider.fly.dev/pricing \
  -a agentproof-agent

fly deploy -c deploy/fly.agent-service.toml

# CRITICAL: exactly one signer machine.
fly scale count 1 -a agentproof-agent
fly status -a agentproof-agent                        # confirm 1 machine running

curl https://agentproof-agent.fly.dev/health          # expect chainId 10143, isMock false
```

> **Never run `fly scale count 2` or enable autoscaling on this app.** Two machines would sign from
> the same account concurrently, race the nonce, and drop transactions.

## Step 3 — FastAPI

```bash
fly apps create agentproof-api --org personal

fly secrets set \
  JWT_SECRET="$(openssl rand -hex 32)" \
  AGENT_SERVICE_URL=https://agentproof-agent.fly.dev \
  CORS_ALLOW_ORIGINS=https://agentproof.vercel.app \
  -a agentproof-api

fly deploy -c deploy/fly.api.toml

curl https://agentproof-api.fly.dev/health            # use_mock_payments must be false
curl https://agentproof-api.fly.dev/v1/system/status  # agent_service.reachable must be true
```

The API app receives **no** economic key. `ENVIRONMENT=production` is baked into `fly.api.toml`, so
the app refuses to boot with a default `JWT_SECRET`, a wildcard CORS origin, or
`ALLOW_LOCAL_PROVIDER=true`, and forces `debug=false`.

## Step 4 — Frontend

```bash
cd frontend
vercel login
vercel link
vercel env add NEXT_PUBLIC_API_BASE_URL production     # https://agentproof-api.fly.dev
vercel env add NEXT_PUBLIC_MONAD_RPC production        # https://testnet-rpc.monad.xyz
vercel --prod
```

Then point CORS at the real deployed origin:

```bash
fly secrets set CORS_ALLOW_ORIGINS=https://<your-vercel-domain> -a agentproof-api
```

Only public values ever go into `NEXT_PUBLIC_*`. A private key there would be compiled into the
browser bundle.

## Step 5 — Fund AgentWallet

Each run spends 0.01 MON from the wallet's own balance:

```bash
cast send 0x7263058B4040ae7410340f63d292152DE8d867FA "deposit()" \
  --value 0.5ether --rpc-url https://testnet-rpc.monad.xyz --private-key $AGENT_KEY
```

The agent account separately needs MON to fund escrow (0.05/run) and gas.

## Step 6 — Public end-to-end verification

```bash
curl -X POST https://agentproof-api.fly.dev/v1/agent-requests \
  -H "Content-Type: application/json" \
  -H "Origin: https://<your-vercel-domain>" \
  -d '{"message":"Research three competitors and produce a pricing comparison."}'
```

Expected: `settled: true`, `is_mock: false`, `reward_mon "0.05"`, `spent_mon "0.01"`, and three real
hashes. Verify each on <https://testnet.monadscan.com>, and confirm the provider EOA
`0x322BE7De3f74e57B87F24Bb68199e89d97652697` gained 0.01 MON.

## Secrets matrix

| Secret | Set on | Never on |
|---|---|---|
| `AGENT_KEY` | `agentproof-agent` only | api, provider, frontend, git |
| `VERIFIER_KEY` | `agentproof-agent` only | api, provider, frontend, git |
| `JWT_SECRET` | `agentproof-api` only | frontend, git |
| provider private key | **nowhere** — receive-only address | everywhere |

## Rollback

```bash
fly releases -a agentproof-agent
fly deploy --image <previous-image> -a agentproof-agent
```

## Local equivalent

See the main [README](../README.md) for the four-terminal local stack. The only differences in
production are `ENVIRONMENT=production`, `ALLOW_LOCAL_PROVIDER=false`, and public URLs replacing
`localhost`.
