"use client";

/// Live request lifecycle hook.
///
/// Owns the single polling loop for a request and the small amount of persistence needed to survive
/// a page refresh. Both the dashboard and create-task use this, so there is exactly one poll
/// implementation and no chance of two loops racing each other.

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, getTask, isTerminal, pollTask, submitTask } from "./api";

/// A refresh must not lose an in-flight run, and the run lives on the backend, not in React state.
/// Persisting just the request id is enough to recover everything by polling again, which avoids
/// pulling in a state-management library for one string.
const ACTIVE_REQUEST_KEY = "agentproof.activeRequestId";

export function readActiveRequestId() {
  try {
    return window.sessionStorage.getItem(ACTIVE_REQUEST_KEY);
  } catch {
    // Storage throws in private mode and when site data is blocked. A missing id is recoverable:
    // the user simply starts a new run.
    return null;
  }
}

export function writeActiveRequestId(requestId) {
  try {
    if (requestId) window.sessionStorage.setItem(ACTIVE_REQUEST_KEY, requestId);
    else window.sessionStorage.removeItem(ACTIVE_REQUEST_KEY);
  } catch {
    // Non-fatal: polling still works for the current page view.
  }
}

/// Presentation phases (CLAUDE.md §28). Derived from real backend state - never invented.
/// The user should follow SPEND -> WORK -> PROVE -> EARN without needing to know service names.
export const PHASES = [
  { key: "task", label: "TASK" },
  { key: "policy", label: "POLICY" },
  { key: "spend", label: "SPEND" },
  { key: "work", label: "WORK" },
  { key: "verify", label: "VERIFY" },
  { key: "prove", label: "PROVE" },
  { key: "earn", label: "EARN" },
];

/// Maps a backend record onto the seven presentation phases.
/// Each phase is "done" only when the backend proves it happened - a confirmed transaction, a
/// recorded stage or a terminal flag. Nothing is inferred from elapsed time.
export function derivePhases(record) {
  if (!record) return PHASES.map((p) => ({ ...p, state: "pending" }));

  const stages = record.execution_stages || [];
  const reached = (name) => stages.some((s) => s.stage === name);
  const policyRejected = reached("policy_rejected");
  const failed = record.final_status === "FAILED" || record.canonical_status === "failed";
  // A settlement_tx without `settled` means AgentEscrow rejected the proof and reverted.
  const settlementRejected = Boolean(record.settlement_tx) && !record.settled;

  const status = {
    task: Boolean(record.escrow_tx) ? "done" : record.task_id ? "active" : "pending",
    policy: policyRejected ? "failed" : reached("policy_approved") || record.provider_tx ? "done" : "pending",
    spend: Boolean(record.provider_tx) ? "done" : reached("provider_invoice") ? "active" : "pending",
    work: reached("data_received") || record.result_hash ? "done" : record.provider_tx ? "active" : "pending",
    verify: reached("evaluated") || record.result_hash ? "done" : "pending",
    prove: record.result_hash ? "done" : "pending",
    earn: record.settled ? "done" : settlementRejected ? "failed" : "pending",
  };

  return PHASES.map((p) => {
    let state = status[p.key];
    // A failed run leaves later phases unreachable rather than merely pending.
    if (failed && state === "pending") state = "blocked";
    return { ...p, state };
  });
}

/// Drives one request's lifecycle.
///
/// Guarantees: at most one poll loop at a time, no state writes after unmount, polling stops on a
/// terminal state, and a bounded total duration so a stuck backend cannot poll forever.
export function useAgentRequest() {
  const [record, setRecord] = useState(null);
  const [requestId, setRequestId] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | submitting | polling | done | error
  const [error, setError] = useState(null);
  const [waking, setWaking] = useState(false);

  // Cancels in-flight fetches on unmount, so no setState runs against a dead component.
  const abortRef = useRef(null);
  const mountedRef = useRef(true);
  // Guards against two loops for the same request (e.g. a double click, or an effect re-run).
  const pollingForRef = useRef(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
    };
  }, []);

  const safeSet = useCallback((setter, value) => {
    if (mountedRef.current) setter(value);
  }, []);

  const follow = useCallback(
    async (id) => {
      if (!id || pollingForRef.current === id) return;
      pollingForRef.current = id;

      // Replace any previous loop's controller so only the newest request is followed.
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      safeSet(setRequestId, id);
      safeSet(setStatus, "polling");
      safeSet(setError, null);

      try {
        const final = await pollTask(id, {
          signal: controller.signal,
          onUpdate: (next) => {
            safeSet(setRecord, next);
            safeSet(setWaking, false);
          },
          onTransientError: () => safeSet(setWaking, true),
        });
        safeSet(setRecord, final);
        safeSet(setStatus, "done");
        // The run is over; a refresh should not resume polling a finished request.
        writeActiveRequestId(null);
      } catch (err) {
        if (err instanceof ApiError && err.kind === "aborted") return;
        safeSet(setError, err);
        safeSet(setStatus, "error");
      } finally {
        if (pollingForRef.current === id) pollingForRef.current = null;
        safeSet(setWaking, false);
      }
    },
    [safeSet]
  );

  /// Submits a task and immediately begins following it.
  const submit = useCallback(
    async (message, options = {}) => {
      safeSet(setStatus, "submitting");
      safeSet(setError, null);
      safeSet(setRecord, null);
      try {
        const accepted = await submitTask(message, options);
        safeSet(setRecord, accepted);
        // Persisted before polling starts, so even an immediate refresh can recover the run.
        writeActiveRequestId(accepted.request_id);
        await follow(accepted.request_id);
        return accepted.request_id;
      } catch (err) {
        safeSet(setError, err);
        safeSet(setStatus, "error");
        return null;
      }
    },
    [follow, safeSet]
  );

  /// Recovers a request by id: fetches it once, then follows it only if it is still running.
  const resume = useCallback(
    async (id) => {
      if (!id) return;
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const existing = await getTask(id, { signal: controller.signal });
        safeSet(setRecord, existing);
        safeSet(setRequestId, id);
        if (isTerminal(existing)) {
          safeSet(setStatus, "done");
          writeActiveRequestId(null);
        } else {
          await follow(id);
        }
      } catch (err) {
        if (err instanceof ApiError && err.kind === "aborted") return;
        // A request the backend no longer knows about (in-memory store, restarted process) is
        // cleared rather than retried, so the UI does not get stuck on a dead id.
        if (err instanceof ApiError && err.kind === "not_found") {
          writeActiveRequestId(null);
          safeSet(setStatus, "idle");
          return;
        }
        safeSet(setError, err);
        safeSet(setStatus, "error");
      }
    },
    [follow, safeSet]
  );

  return {
    record,
    requestId,
    status,
    error,
    waking,
    submit,
    resume,
    follow,
    phases: derivePhases(record),
    isRunning: status === "submitting" || status === "polling",
  };
}
