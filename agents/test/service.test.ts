/// Phase 6B boundary tests for the canonical agent service.
/// Run with: npm test  (node --test)
///
/// These tests exercise the HTTP contract and the marketplace registry without spending MON.
/// The full economic loop is proven end-to-end against Monad Testnet by `npm run worker`
/// and by the FastAPI integration path; it is deliberately not re-run here.

import { test } from "node:test";
import assert from "node:assert/strict";
import { findService, listServices, CANONICAL_SERVICE_TYPE } from "../marketplace/registry.js";

const BASE = process.env.AGENT_SERVICE_TEST_URL ?? "http://localhost:4100";

async function serviceIsUp(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/health`, { signal: AbortSignal.timeout(2000) });
    return res.ok;
  } catch {
    return false;
  }
}

// --- Marketplace registry (no network required) ---------------------------------

test("registry exposes the canonical competitor pricing service", () => {
  const service = findService(CANONICAL_SERVICE_TYPE);
  assert.ok(service, "canonical service must be registered");
  assert.equal(service.currency, "MON");
  assert.ok(service.endpoint.length > 0);
  assert.equal(service.expectedCostMon, process.env.PROVIDER_INVOICE_MON ?? "0.01");
});

test("registry returns undefined for an unknown service rather than inventing a URL", () => {
  assert.equal(findService("nonexistent_service"), undefined);
});

test("registry listing is a copy, so callers cannot mutate the directory", () => {
  const first = listServices();
  first[0].endpoint = "http://attacker.example";
  assert.notEqual(listServices()[0].endpoint, "http://attacker.example");
});

// --- HTTP boundary (skipped when the service is not running) --------------------

test("GET /health reports the real chain id and frozen contract addresses", async (t) => {
  if (!(await serviceIsUp())) return t.skip("agent service not running");

  const body = await (await fetch(`${BASE}/health`)).json();
  assert.equal(body.status, "ok");
  assert.equal(body.isMock, false);
  assert.equal(typeof body.chainId, "number");
  assert.match(body.agentWallet, /^0x[0-9a-fA-F]{40}$/);
  assert.match(body.agentEscrow, /^0x[0-9a-fA-F]{40}$/);
});

test("GET /run/:id returns 404 for an unknown run", async (t) => {
  if (!(await serviceIsUp())) return t.skip("agent service not running");

  const res = await fetch(`${BASE}/run/definitely-not-a-real-run`);
  assert.equal(res.status, 404);
});

test("POST /run rejects a task cap above the immutable on-chain per-payment cap", async (t) => {
  if (!(await serviceIsUp())) return t.skip("agent service not running");

  const runId = `cap-guard-${Date.now()}`;
  const created = await fetch(`${BASE}/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ requestId: runId, spendingLimitMon: "0.03" }),
  });
  assert.equal(created.status, 202);

  // The guard runs before any transaction is broadcast, so nothing is ever spent.
  await new Promise((r) => setTimeout(r, 4000));
  const run = await (await fetch(`${BASE}/run/${runId}`)).json();

  assert.equal(run.status, "failed");
  assert.match(run.error, /exceeds AgentWallet\.maxPayment/);
  assert.equal(run.escrowTx, null, "no escrow may be created when the cap check fails");
  assert.equal(run.providerTx, null, "AgentWallet must never be called");
});

test("POST /run rejects a duplicate run id instead of double-spending", async (t) => {
  if (!(await serviceIsUp())) return t.skip("agent service not running");

  const runId = `dupe-${Date.now()}`;
  const body = JSON.stringify({ requestId: runId, spendingLimitMon: "0.03" });
  const headers = { "Content-Type": "application/json" };

  const first = await fetch(`${BASE}/run`, { method: "POST", headers, body });
  assert.equal(first.status, 202);

  const second = await fetch(`${BASE}/run`, { method: "POST", headers, body });
  assert.equal(second.status, 409);
});

test("a run record never carries a fabricated transaction hash", async (t) => {
  if (!(await serviceIsUp())) return t.skip("agent service not running");

  const { runs } = await (await fetch(`${BASE}/runs`)).json();
  for (const run of runs) {
    assert.equal(run.isMock, false, "the canonical service never produces mock runs");
    for (const field of ["escrowTx", "providerTx", "settlementTx"]) {
      const value = run[field];
      if (value !== null && value !== undefined) {
        assert.match(value, /^0x[0-9a-fA-F]{64}$/, `${field} must be a real 32-byte tx hash`);
      }
    }
  }
});
