/// Client for the AgentProof FastAPI backend.
/// The backend orchestrates; the canonical TypeScript agent service performs every on-chain action.
/// No private key or signing capability exists on this side of the boundary.

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

/// A fabricated (mock) transaction hash is prefixed "mock:" by MockPaymentAdapter and must never
/// be linked to a block explorer. Real Monad hashes are 0x + 64 hex characters.
export function isRealTxHash(hash) {
  return typeof hash === "string" && /^0x[0-9a-fA-F]{64}$/.test(hash);
}

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    let detail = `${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      detail = body.detail || body.error_message || detail;
    } catch {
      // non-JSON error body; keep the status line
    }
    throw new Error(detail);
  }

  return res.json();
}

/// GET /health - basic liveness plus whether the backend is in mock mode.
export function getHealth() {
  return request("/health");
}

/// GET /v1/system/status - reports whether the canonical agent service (the only signer) is up.
export function getSystemStatus() {
  return request("/v1/system/status");
}

/// POST /v1/agent-requests - submits a natural-language task.
/// Resolves once the canonical execution reaches a terminal state, returning the full record.
export function submitTask(message, { agentId = "agent-1", userId = "user-1" } = {}) {
  return request("/v1/agent-requests", {
    method: "POST",
    body: JSON.stringify({ message, agent_id: agentId, user_id: userId }),
  });
}

/// GET /v1/agent-requests/{id} - current state of a submitted request.
export function getTask(requestId) {
  return request(`/v1/agent-requests/${requestId}`);
}

/// GET /v1/agent-requests - all requests this backend process has handled.
export function listTasks() {
  return request("/v1/agent-requests");
}

/// Polls a request until it reaches a terminal state or the budget expires.
export async function pollTask(requestId, { intervalMs = 2000, timeoutMs = 240000, onUpdate } = {}) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const record = await getTask(requestId);
    if (onUpdate) onUpdate(record);

    const terminal =
      record.settled ||
      record.final_status === "COMPLETED" ||
      record.final_status === "FAILED" ||
      record.canonical_status === "settled" ||
      record.canonical_status === "failed";

    if (terminal) return record;
    await new Promise((r) => setTimeout(r, intervalMs));
  }

  throw new Error(`Timed out waiting for request ${requestId}`);
}

/// The canonical economic narrative, derived from a request record.
/// Each step reports whether it has happened and which real transaction proves it.
export function buildLifecycle(record) {
  if (!record) return [];

  const stages = record.execution_stages || [];
  const reached = (name) => stages.some((s) => s.stage === name);
  const mock = Boolean(record.is_mock);

  return [
    {
      key: "task_created",
      label: "TASK CREATED",
      detail: `Task ${record.task_id ? record.task_id.slice(0, 10) + "…" : "pending"}`,
      done: Boolean(record.task_id),
      tx: record.escrow_tx,
    },
    {
      key: "escrow_locked",
      label: `${record.reward_mon || "0.05"} MON LOCKED`,
      detail: "Reward locked in AgentEscrow",
      done: Boolean(record.escrow_tx),
      tx: record.escrow_tx,
    },
    {
      key: "agent_working",
      label: "AGENT WORKING",
      detail: "Canonical agent discovering paid resource",
      done: reached("service_discovered") || Boolean(record.provider_tx),
      tx: null,
    },
    {
      key: "http_402",
      label: "HTTP 402",
      detail: "Provider issued a payment-required invoice",
      done: reached("provider_invoice") || Boolean(record.provider_tx),
      tx: null,
    },
    {
      key: "policy",
      label: reached("policy_rejected") ? "POLICY REJECTED" : "POLICY APPROVED",
      detail: `AgentFlow checked spend against ${record.spending_limit_mon || "0.02"} MON cap`,
      done: reached("policy_approved") || reached("policy_rejected") || Boolean(record.provider_tx),
      failed: reached("policy_rejected"),
      tx: null,
    },
    {
      key: "provider_paid",
      label: `${record.spent_mon || "0.01"} MON PAID`,
      detail: "AgentWallet paid the provider",
      done: Boolean(record.provider_tx),
      tx: record.provider_tx,
    },
    {
      key: "data_received",
      label: "DATA RECEIVED",
      detail: "Provider verified payment on-chain and released data",
      done: reached("data_received") || Boolean(record.result_hash),
      tx: null,
    },
    {
      key: "result_verified",
      label: "RESULT VERIFIED",
      detail: "Deterministic evaluator checks passed",
      done: reached("evaluated") || Boolean(record.result_hash),
      tx: null,
    },
    {
      key: "proof_signed",
      label: "PROOF SIGNED",
      detail: record.result_hash ? `resultHash ${record.result_hash.slice(0, 10)}…` : "Trusted verifier signature",
      done: Boolean(record.result_hash),
      tx: null,
    },
    {
      key: "settled",
      label: `${record.reward_mon || "0.05"} MON SETTLED`,
      detail: "AgentEscrow released the reward to the worker",
      done: Boolean(record.settlement_tx) && Boolean(record.settled),
      tx: record.settlement_tx,
    },
  ].map((step) => ({ ...step, mock }));
}
