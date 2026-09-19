/// Client for the AgentProof FastAPI backend.
/// The backend orchestrates; the canonical TypeScript agent service performs every on-chain action.
/// No private key or signing capability exists on this side of the boundary.
///
/// This is the ONLY place in the frontend that talks to the API. Pages import these helpers rather
/// than calling fetch() directly, so URL resolution, error classification and retry live in one
/// place. The frontend knows exactly one backend address and never learns AGENT_SERVICE_URL or
/// AGENT_SERVICE_TOKEN: reaching the signer is FastAPI's job, server-side.

/// NEXT_PUBLIC_* values are inlined at BUILD time, not read at runtime. A build performed without
/// NEXT_PUBLIC_API_BASE_URL therefore bakes whatever the fallback is into the public bundle
/// permanently. A localhost fallback in a production build points every visitor's browser at its
/// own machine, which is why production refuses to fall back and fails loudly instead.
const RAW_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

/// Trailing slashes are stripped so `${base}${path}` can never produce `https://host//v1/...`,
/// which some ASGI/proxy stacks treat as a distinct (404) route.
function normalizeBaseUrl(raw) {
  return raw.trim().replace(/\/+$/, "");
}

export const API_BASE_URL = normalizeBaseUrl(RAW_API_BASE_URL);

/// True only in a local `next dev` build on a developer machine.
const IS_DEVELOPMENT = process.env.NODE_ENV === "development";

/// Development convenience only. Never used in a production build.
const DEV_FALLBACK_API_BASE_URL = "http://localhost:8000";

export const API_BASE_URL_CONFIGURED = API_BASE_URL.length > 0;

export const MISSING_API_BASE_URL_MESSAGE =
  "Backend API URL is not configured. This deployment was built without " +
  "NEXT_PUBLIC_API_BASE_URL, so it has no backend to talk to. Set it in the hosting project's " +
  "environment variables and redeploy (it is a build-time value).";

/// Carries a machine-readable classification so the UI can render the right message for each
/// failure mode instead of dumping one opaque string. `kind` is what callers should branch on.
export class ApiError extends Error {
  constructor(message, { kind = "server", status = null, retryable = false } = {}) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
    this.retryable = retryable;
  }
}

/// Resolves the base URL or throws a configuration error.
/// Production never silently substitutes localhost: a misconfigured deploy must be obvious rather
/// than producing confusing connection failures against the visitor's own machine.
export function resolveApiBaseUrl() {
  if (API_BASE_URL_CONFIGURED) return API_BASE_URL;
  if (IS_DEVELOPMENT) return DEV_FALLBACK_API_BASE_URL;
  throw new ApiError(MISSING_API_BASE_URL_MESSAGE, { kind: "config" });
}

/// A fabricated (mock) transaction hash is prefixed "mock:" by MockPaymentAdapter and must never
/// be linked to a block explorer. Real Monad hashes are 0x + 64 hex characters.
export function isRealTxHash(hash) {
  return typeof hash === "string" && /^0x[0-9a-fA-F]{64}$/.test(hash);
}

/// Maps a status code to a user-facing message and a retry decision.
/// Server-supplied detail is used only for 4xx, where it describes the client's own request.
/// A 5xx detail may carry internal state, so those get a fixed generic line.
function classifyStatus(status, detail) {
  if (status === 401 || status === 403) {
    return { kind: "auth", message: "Request authorization failed.", retryable: false };
  }
  if (status === 404) {
    return { kind: "not_found", message: "Execution not found.", retryable: false };
  }
  if (status === 409) {
    return {
      kind: "conflict",
      message: "Execution cannot be started in its current state.",
      retryable: false,
    };
  }
  if (status === 429) {
    return { kind: "server", message: "Too many requests. Retry shortly.", retryable: true };
  }
  if (status >= 500) {
    // Deliberately does not echo `detail`: a 5xx body can contain stack traces or RPC URLs.
    return { kind: "server", message: "Backend execution failed. Retry shortly.", retryable: true };
  }
  return { kind: "client", message: detail || `Request failed (${status}).`, retryable: false };
}

/// Free-tier hosts sleep when idle and take ~50s to wake, during which connections are refused or
/// answered with a gateway error. Retrying a bounded number of times turns that cold start into a
/// loading state rather than a fatal error.
const COLD_START_ATTEMPTS = 4;
const COLD_START_BASE_DELAY_MS = 1500;
const DEFAULT_REQUEST_TIMEOUT_MS = 20000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function request(path, options = {}) {
  const {
    method = "GET",
    body,
    signal,
    timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
    retries = COLD_START_ATTEMPTS,
  } = options;

  const baseUrl = resolveApiBaseUrl();
  const url = `${baseUrl}${path}`;

  let lastError = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    // A caller that aborted (e.g. an unmounted component) must not keep retrying.
    if (signal?.aborted) throw new ApiError("Request cancelled.", { kind: "aborted" });

    // Each attempt gets its own timeout, linked to the caller's signal so an unmount cancels an
    // in-flight attempt immediately rather than after the timeout expires.
    const controller = new AbortController();
    const onAbort = () => controller.abort();
    signal?.addEventListener("abort", onAbort, { once: true });
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal,
      });

      if (res.ok) {
        try {
          return await res.json();
        } catch {
          throw new ApiError("Backend returned a malformed response.", {
            kind: "server",
            status: res.status,
          });
        }
      }

      let detail = "";
      try {
        const errorBody = await res.json();
        detail = errorBody?.detail || errorBody?.error_message || "";
      } catch {
        // Non-JSON error body (e.g. a proxy's HTML error page). The status alone classifies it.
      }
      const { kind, message, retryable } = classifyStatus(res.status, detail);
      lastError = new ApiError(message, { kind, status: res.status, retryable });
      if (!retryable || attempt === retries - 1) throw lastError;
    } catch (err) {
      if (err instanceof ApiError) {
        if (!err.retryable || attempt === retries - 1) throw err;
        lastError = err;
      } else if (signal?.aborted) {
        throw new ApiError("Request cancelled.", { kind: "aborted" });
      } else {
        // fetch() rejects for DNS failure, connection refused, TLS errors and our own timeout.
        // All are indistinguishable here and all are plausibly a sleeping backend, so retry.
        lastError = new ApiError("Backend unavailable. The service may be starting up.", {
          kind: "network",
          retryable: true,
        });
        if (attempt === retries - 1) throw lastError;
      }
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener("abort", onAbort);
    }

    // Exponential backoff: 1.5s, 3s, 6s. Never a tight loop against a waking service.
    await sleep(COLD_START_BASE_DELAY_MS * 2 ** attempt);
  }

  throw lastError ?? new ApiError("Backend unavailable.", { kind: "network" });
}

/// GET /health - basic liveness plus whether the backend is in mock mode.
export function getHealth(options = {}) {
  return request("/health", options);
}

/// GET /v1/system/status - reports whether the canonical agent service (the only signer) is up.
export function getSystemStatus(options = {}) {
  return request("/v1/system/status", options);
}

/// POST /v1/agent-requests - submits a natural-language task.
/// Returns 202 with a request_id as soon as the run is accepted; the on-chain work continues in the
/// background. Callers must poll getTask(request_id) to observe the lifecycle.
export function submitTask(message, options = {}) {
  const { agentId = "agent-1", userId = "user-1", signal } = options;
  return request("/v1/agent-requests", {
    method: "POST",
    body: { message, agent_id: agentId, user_id: userId },
    signal,
    // Submitting twice would create a second escrow task and spend real MON, so a submission is
    // never retried automatically. The user retries deliberately.
    retries: 1,
    timeoutMs: 30000,
  });
}

/// GET /v1/agent-requests/{id} - current state of a submitted request.
export function getTask(requestId, options = {}) {
  return request(`/v1/agent-requests/${encodeURIComponent(requestId)}`, options);
}

/// GET /v1/agent-requests - all requests this backend process has handled.
export function listTasks(options = {}) {
  return request("/v1/agent-requests", options);
}

/// Terminal states, from the backend's own vocabulary.
///
/// Only final_status is authoritative for "the run is over". The on-chain settlement finishes
/// before the graph does: canonical_status flips to 'settled' while the orchestrator is still
/// running its advisory verification and delivery steps. Stopping on canonical_status alone would
/// end polling early and freeze the UI on a non-final status.
///
/// canonical_status === 'failed' is still terminal, because the economic loop cannot recover from
/// it and the graph will only route to its own failure handler.
/// The three states the graph can come to rest in, taken from the node implementations:
/// deliver_result -> COMPLETED, the failure paths -> FAILED, human_review -> HUMAN_REVIEW.
/// Every other value (PARSED, MATCHING, EXECUTING, VERIFYING, ...) is mid-flight.
const TERMINAL_FINAL_STATUSES = new Set(["COMPLETED", "FAILED", "HUMAN_REVIEW"]);

export function isTerminal(record) {
  if (!record) return false;
  return (
    TERMINAL_FINAL_STATUSES.has(record.final_status) || record.canonical_status === "failed"
  );
}

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 300000;

/// Polls a request until it reaches a terminal state or the budget expires.
///
/// A transient failure does not end the poll: the backend can be briefly unreachable mid-run
/// (a free-tier host under load) while the on-chain execution continues regardless. Only a
/// definitive error, cancellation or the timeout stops it.
export async function pollTask(requestId, options = {}) {
  const {
    intervalMs = POLL_INTERVAL_MS,
    timeoutMs = POLL_TIMEOUT_MS,
    onUpdate,
    onTransientError,
    signal,
  } = options;

  const deadline = Date.now() + timeoutMs;
  let consecutiveFailures = 0;

  while (Date.now() < deadline) {
    if (signal?.aborted) throw new ApiError("Polling cancelled.", { kind: "aborted" });

    try {
      const record = await getTask(requestId, { signal, retries: 1 });
      consecutiveFailures = 0;
      if (onUpdate) onUpdate(record);
      if (isTerminal(record)) return record;
    } catch (err) {
      if (err instanceof ApiError && err.kind === "aborted") throw err;

      // A 404 immediately after submission is a race: the record is written before the response is
      // sent, but a proxy may deliver them out of order. Tolerated briefly, then surfaced.
      const tolerable =
        err instanceof ApiError &&
        (err.kind === "network" || err.kind === "server" || err.kind === "not_found");

      consecutiveFailures++;
      if (!tolerable || consecutiveFailures >= 5) throw err;
      if (onTransientError) onTransientError(err);
    }

    // Backoff while the backend is unhealthy; steady interval once it is answering.
    const delay =
      consecutiveFailures > 0
        ? Math.min(intervalMs * 2 ** consecutiveFailures, 15000)
        : intervalMs;
    await sleep(delay);
  }

  throw new ApiError(
    "Timed out waiting for the execution to finish. It may still be running on the backend.",
    { kind: "timeout" }
  );
}

/// The canonical economic narrative, derived from a request record.
/// Each step reports whether it has happened and which real transaction proves it.
/// Stage names come from the agent service's own touch() calls, surfaced by FastAPI as
/// execution_stages, so this maps real backend state rather than inventing frontend statuses.
export function buildLifecycle(record) {
  if (!record) return [];

  const stages = record.execution_stages || [];
  const reached = (name) => stages.some((s) => s.stage === name);
  const mock = Boolean(record.is_mock);
  const policyRejected = reached("policy_rejected");

  return [
    {
      key: "task_created",
      label: "TASK CREATED",
      detail: `Task ${record.task_id ? record.task_id.slice(0, 10) + "…" : "pending"}`,
      done: Boolean(record.task_id),
      tx: null,
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
      label: policyRejected ? "POLICY REJECTED" : "POLICY APPROVED",
      detail: `AgentFlow checked spend against the ${record.spending_limit_mon || "0.02"} MON cap`,
      done: reached("policy_approved") || policyRejected || Boolean(record.provider_tx),
      failed: policyRejected,
      tx: null,
    },
    {
      key: "provider_paid",
      // Before payment the spend is genuinely 0; showing the expected amount early would imply
      // MON left the wallet. Only a confirmed provider_tx proves a payment happened.
      label: record.provider_tx
        ? `${record.spent_mon || "0.01"} MON PAID`
        : "PAYMENT PENDING",
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
      detail: record.result_hash
        ? `resultHash ${record.result_hash.slice(0, 10)}…`
        : "Trusted verifier signature",
      done: Boolean(record.result_hash),
      tx: null,
    },
    {
      key: "settled",
      // A settlement is only real once the agent service has confirmed the receipt, which is what
      // sets `settled`. A settlement_tx alone could be a reverted transaction.
      label: record.settled
        ? `${record.reward_mon || "0.05"} MON SETTLED`
        : Boolean(record.settlement_tx)
          ? "SETTLEMENT REJECTED"
          : `${record.reward_mon || "0.05"} MON SETTLED`,
      detail: record.settled
        ? "AgentEscrow released the reward to the worker"
        : Boolean(record.settlement_tx)
          ? "AgentEscrow rejected the proof; the reward remains locked"
          : "AgentEscrow releases the reward once the proof is accepted",
      done: Boolean(record.settled),
      failed: Boolean(record.settlement_tx) && !record.settled,
      tx: record.settlement_tx,
    },
  ].map((step) => ({ ...step, mock }));
}
