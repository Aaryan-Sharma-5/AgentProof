"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useAccount, useConnect, useDisconnect, useReadContract, useBalance } from "wagmi";
import { formatEther } from "viem";
import AgentProofLogo from "../../components/AgentProofLogo";
import { monadTestnet, explorerAddressUrl, explorerTxUrl } from "../../lib/chain";
import {
  AGENT_WALLET_ADDRESS,
  AGENT_ESCROW_ADDRESS,
  PROVIDER_ADDRESS,
  agentWalletAbi,
  agentEscrowAbi,
} from "../../lib/contracts";
import {
  listTasks,
  pollTask,
  buildLifecycle,
  isRealTxHash,
  getSystemStatus,
  ApiError,
  API_BASE_URL_CONFIGURED,
  MISSING_API_BASE_URL_MESSAGE,
} from "../../lib/api";

// sessionStorage key written by create-task right before it navigates here.
const SESSION_KEY = "agentproof_active_request_id";

// ────────────────────────────────────────────────────────────────────
// Canonical demo constants — fallback only.
// These real Monad Testnet hashes are displayed when no live run exists.
// As soon as a live request is submitted they become irrelevant: the
// dashboard always prefers live API state over these constants.
// ────────────────────────────────────────────────────────────────────
const DEMO_TASK_ID =
  process.env.NEXT_PUBLIC_DEMO_TASK_ID ||
  "0x8f01fd3dd74d67bd88241970c7123e1b701a5a78b2a6269eb7a564b4dd5b925c";
const DEMO_ESCROW_TX =
  process.env.NEXT_PUBLIC_DEMO_ESCROW_TX ||
  "0x28524c577fdb26ae291e56da7e3ef7a4d1f981572aa240b18a7763350b7f240c";
const DEMO_PROVIDER_TX =
  process.env.NEXT_PUBLIC_DEMO_PROVIDER_TX ||
  "0x37772639ffcc4144d35757634bd26a9a5348ab38eeb3d9212e7186813368ef38";
const DEMO_SETTLEMENT_TX =
  process.env.NEXT_PUBLIC_DEMO_SETTLEMENT_TX ||
  "0xefc36e3357895f59c4a9ec18fae1139ad38550d3048001a3fffce18e5e80e0a8";
const DEMO_RESULT_HASH = "0x373198e2515ba216a6f309bcda018d8380296c5060b0316f8baed9b40d129a55";
const TRUSTED_VERIFIER = "0x4c7c4d8155Fed9b9f09c6619d98773ACcA881305";

// ── Helpers ────────────────────────────────────────────────────────
function truncate(hash, lead = 10, tail = 8) {
  if (!hash) return "";
  return `${hash.slice(0, lead)}...${hash.slice(-tail)}`;
}

// ── Design primitives ──────────────────────────────────────────────
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard?.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="inline-flex items-center gap-1 text-secondary hover:text-on-surface transition-colors"
      title="Copy to clipboard"
    >
      <span className="material-symbols-outlined text-[16px]">
        {copied ? "check" : "content_copy"}
      </span>
    </button>
  );
}

function Badge({ children, tone = "neutral" }) {
  const tones = {
    neutral: "bg-surface-container text-on-surface-variant",
    success: "bg-tertiary-container text-on-tertiary-container",
    danger: "bg-error-container text-on-error-container",
    primary: "bg-primary-container text-on-primary-container",
    warning: "bg-secondary-container text-on-secondary-container",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-space-md py-1 rounded-full font-label-sm text-label-sm font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

function Card({ title, icon, children, className = "" }) {
  return (
    <div className={`bg-surface-container-lowest rounded-xl p-space-lg shadow-sm ${className}`}>
      {title && (
        <div className="flex items-center gap-space-xs mb-space-md">
          {icon && <span className="material-symbols-outlined text-[20px] text-secondary">{icon}</span>}
          <h2 className="font-label-md text-label-md uppercase tracking-wider text-secondary">{title}</h2>
        </div>
      )}
      {children}
    </div>
  );
}

function ExplorerLink({ href, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-primary hover:underline font-mono text-body-sm"
    >
      {children}
      <span className="material-symbols-outlined text-[14px]">open_in_new</span>
    </a>
  );
}

function Stat({ label, value }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">{label}</span>
      <span className="font-headline-sm text-headline-sm font-bold text-on-surface">{value}</span>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-space-md">
      <span className="font-mono text-body-sm text-secondary">{label}</span>
      <span className="font-mono text-body-sm text-on-surface">{value}</span>
    </div>
  );
}

// ── Wallet connector ───────────────────────────────────────────────
function WalletConnector() {
  const { address, isConnected, chainId } = useAccount();
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const wrongNetwork = isConnected && chainId !== monadTestnet.id;

  if (!isConnected) {
    return (
      <button
        onClick={() => connect({ connector: connectors[0] })}
        disabled={isPending}
        className="flex items-center gap-space-xs px-space-lg py-2.5 bg-primary-container text-on-primary-container rounded-full font-label-md text-label-md hover:bg-primary hover:text-on-primary transition-all disabled:opacity-50"
      >
        <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
        {isPending ? "Connecting..." : "Connect Wallet"}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-space-sm">
      {wrongNetwork && <Badge tone="danger">Wrong Network</Badge>}
      <button
        onClick={() => disconnect()}
        className="flex items-center gap-space-xs px-space-md py-1.5 rounded-full bg-surface-container-low border border-surface-container hover:bg-surface-container transition-colors cursor-pointer"
      >
        <span className="w-2 h-2 rounded-full bg-tertiary-container"></span>
        <span className="text-label-sm font-mono text-on-surface">{truncate(address, 6, 4)}</span>
      </button>
    </div>
  );
}

function Header() {
  return (
    <header className="border-b border-surface-container bg-surface-container-lowest">
      <div className="max-w-[1200px] mx-auto px-gutter h-20 flex items-center justify-between">
        <div className="flex items-center gap-space-lg">
          <Link href="/">
            <AgentProofLogo variant="compact" size="sm" theme="light" />
          </Link>
          <nav className="hidden md:flex items-center gap-space-md">
            <Link className="font-label-md text-label-md text-on-surface font-bold border-b-2 border-primary-container pb-0.5" href="/dashboard">Tasks</Link>
            <Link className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors pb-0.5" href="/marketplace">Marketplace</Link>
            <Link className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors pb-0.5" href="/create-task">Create Task</Link>
            <Link className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors pb-0.5" href="/logo">Brand Identity</Link>
            <Link className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors pb-0.5" href="/protocol">Protocol</Link>
          </nav>
        </div>
        <div className="flex items-center gap-space-md">
          <div className="hidden sm:flex items-center gap-space-xs px-space-md py-1.5 rounded-full bg-surface-container-low border border-surface-container">
            <span className="w-2 h-2 rounded-full bg-tertiary-container animate-pulse"></span>
            <span className="font-label-sm text-label-sm text-on-surface">Monad Testnet</span>
          </div>
          <WalletConnector />
        </div>
      </div>
    </header>
  );
}

// ── Static demo sections (shown when no live run) ──────────────────
const DEMO_TIMELINE_STAGES = [
  { label: "Task Created", detail: "0.05 MON escrow task created", tx: DEMO_ESCROW_TX },
  { label: "Escrow Funded", detail: "0.05 MON locked in AgentEscrow", tx: DEMO_ESCROW_TX },
  { label: "Provider Invoice", detail: "HTTP 402 — 0.01 MON requested", tx: null },
  { label: "Policy Check", detail: "AgentFlow approved: 0.00 + 0.01 ≤ 0.02", tx: null },
  { label: "Service Payment", detail: "AgentWallet paid 0.01 MON to provider", tx: DEMO_PROVIDER_TX },
  { label: "Data Received", detail: "Provider returned 10 pricing records", tx: null },
  { label: "Result Produced", detail: "Worker built the deterministic TaskResult", tx: null },
  { label: "Evaluation", detail: "10 records, 10 unique IDs — PASSED", tx: null },
  { label: "Proof Verified", detail: "Evaluator signature accepted by AgentEscrow", tx: DEMO_SETTLEMENT_TX },
  { label: "Worker Paid", detail: "0.05 MON released to worker", tx: DEMO_SETTLEMENT_TX },
];

/**
 * TaskCard — shows live record data when available, demo fallback otherwise.
 * When a live record exists, ALL fields reflect the real API values.
 */
function TaskCard({ liveRecord }) {
  const taskId = liveRecord?.task_id ?? DEMO_TASK_ID;
  const rewardMon = liveRecord?.reward_mon ?? "0.05";
  const spendingLimitMon = liveRecord?.spending_limit_mon ?? "0.02";
  const spentMon = liveRecord?.spent_mon ?? (liveRecord ? "0" : "0.01");
  const settled = liveRecord?.settled ?? (!liveRecord ? true : false);
  const finalStatus = liveRecord?.final_status ?? "COMPLETED";

  const badgeTone = settled ? "success" : finalStatus === "FAILED" ? "danger" : "warning";
  const badgeLabel = settled ? "Settled" : finalStatus === "FAILED" ? "Failed" : finalStatus;

  return (
    <Card title="Task" icon="assignment">
      <p className="font-headline-sm text-headline-sm font-semibold text-on-surface mb-space-md">
        Research three competitors and produce a pricing comparison.
      </p>
      <div className="flex items-center gap-space-xs mb-space-lg">
        <span className="font-mono text-body-sm text-secondary">{truncate(taskId)}</span>
        <CopyButton text={taskId} />
        {liveRecord && (
          <span className="font-label-sm text-label-sm text-tertiary ml-2">● live</span>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-md">
        <Stat label="Reward" value={`${rewardMon} MON`} />
        <Stat label="Spending Limit" value={`${spendingLimitMon} MON`} />
        <Stat label="Spent" value={`${spentMon} MON`} />
        <Stat label="Remaining" value={`${(parseFloat(spendingLimitMon) - parseFloat(spentMon || 0)).toFixed(4)} MON`} />
      </div>
      <div className="mt-space-lg">
        <Badge tone={badgeTone}>
          <span className="material-symbols-outlined text-[14px]">{settled ? "check_circle" : finalStatus === "FAILED" ? "cancel" : "schedule"}</span>
          {badgeLabel}
        </Badge>
      </div>
    </Card>
  );
}

function Timeline({ liveRecord }) {
  // When a live record exists, build stages from it; otherwise show the demo timeline.
  if (liveRecord) {
    const lifecycle = buildLifecycle(liveRecord);
    const mock = Boolean(liveRecord.is_mock);
    return (
      <Card title="Execution Timeline" icon="timeline">
        <div className="flex flex-col gap-space-sm">
          {lifecycle.map((step, i) => (
            <div key={step.key} className="flex items-start gap-space-md">
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                  step.failed
                    ? "bg-error-container text-on-error-container"
                    : step.done
                    ? "bg-tertiary-container text-on-tertiary-container"
                    : "bg-surface-container text-secondary"
                }`}>
                  <span className="material-symbols-outlined text-[16px]">
                    {step.failed ? "close" : step.done ? "check" : "schedule"}
                  </span>
                </div>
                {i < lifecycle.length - 1 && <div className="w-px flex-1 bg-surface-container my-1" />}
              </div>
              <div className="pb-space-md flex-1">
                <div className="flex items-center gap-space-sm flex-wrap">
                  <span className="font-label-md text-label-md font-semibold text-on-surface">{step.label}</span>
                  {step.done && !step.failed && <Badge tone="success">Complete</Badge>}
                  {step.failed && <Badge tone="danger">Failed</Badge>}
                  {!step.done && !step.failed && <Badge tone="neutral">Pending</Badge>}
                </div>
                <p className="font-body-sm text-body-sm text-secondary mt-0.5">{step.detail}</p>
                {step.tx && !mock && isRealTxHash(step.tx) && (
                  <div className="mt-1">
                    <ExplorerLink href={explorerTxUrl(step.tx)}>{truncate(step.tx)}</ExplorerLink>
                  </div>
                )}
                {step.tx && mock && (
                  <span className="font-mono text-body-sm text-secondary mt-1 block">{truncate(step.tx)} (mock)</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  // Demo fallback
  return (
    <Card title="Execution Timeline" icon="timeline">
      <p className="font-body-sm text-body-sm text-secondary mb-space-md">
        Showing last proven Testnet demo run. Submit a new task to see live data.
      </p>
      <div className="flex flex-col gap-space-sm">
        {DEMO_TIMELINE_STAGES.map((stage, i) => (
          <div key={stage.label} className="flex items-start gap-space-md">
            <div className="flex flex-col items-center">
              <div className="w-7 h-7 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[16px]">check</span>
              </div>
              {i < DEMO_TIMELINE_STAGES.length - 1 && <div className="w-px flex-1 bg-surface-container my-1" />}
            </div>
            <div className="pb-space-md flex-1">
              <div className="flex items-center gap-space-sm flex-wrap">
                <span className="font-label-md text-label-md font-semibold text-on-surface">{stage.label}</span>
                <Badge tone="success">Complete</Badge>
              </div>
              <p className="font-body-sm text-body-sm text-secondary mt-0.5">{stage.detail}</p>
              {stage.tx && isRealTxHash(stage.tx) && (
                <div className="mt-1">
                  <ExplorerLink href={explorerTxUrl(stage.tx)}>{truncate(stage.tx)}</ExplorerLink>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function PolicyPanel({ liveRecord }) {
  const limit = liveRecord?.spending_limit_mon ?? "0.02";
  const spent = liveRecord?.spent_mon ?? (liveRecord ? "0" : "0.01");
  const invoice = "0.01";
  const approved = !liveRecord || liveRecord.final_status !== "FAILED";

  return (
    <Card title="Spending Policy" icon="policy">
      <div className="grid grid-cols-3 gap-space-md mb-space-md">
        <Stat label="Limit" value={`${limit} MON`} />
        <Stat label="Current Spend" value={`${spent} MON`} />
        <Stat label="Invoice" value={`${invoice} MON`} />
      </div>
      <div className="bg-surface-container-low rounded-lg px-space-md py-space-sm font-mono text-body-sm text-on-surface mb-space-md">
        {parseFloat(spent).toFixed(2)} + {invoice} ≤ {limit}
      </div>
      <Badge tone={approved ? "success" : "danger"}>{approved ? "APPROVED" : "REJECTED"}</Badge>
      <p className="font-body-sm text-body-sm text-secondary mt-space-md">
        AgentFlow {approved ? "approved" : "rejected"} the provider payment based on the spending policy.
      </p>
    </Card>
  );
}

function ProviderPanel({ liveRecord }) {
  const providerTx = liveRecord?.provider_tx ?? DEMO_PROVIDER_TX;
  const spentMon = liveRecord?.spent_mon ?? "0.01";
  const paid = liveRecord ? Boolean(liveRecord.provider_tx) : true;

  return (
    <Card title="Provider Service" icon="cloud">
      <div className="grid grid-cols-2 gap-space-md mb-space-md">
        <Stat label="Invoice" value="0.01 MON" />
        <Stat label="HTTP" value="402 Payment Required" />
      </div>
      <div className="grid grid-cols-2 gap-space-md mb-space-md">
        <Stat label="Payment" value={`${spentMon} MON`} />
        <div className="flex flex-col gap-1">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">Status</span>
          <Badge tone={paid ? "success" : "neutral"}>{paid ? "PAID" : "PENDING"}</Badge>
        </div>
      </div>
      {paid && isRealTxHash(providerTx) && !liveRecord?.is_mock && (
        <div className="flex items-center gap-space-xs">
          <span className="font-label-sm text-label-sm text-secondary">Tx:</span>
          <ExplorerLink href={explorerTxUrl(providerTx)}>{truncate(providerTx)}</ExplorerLink>
        </div>
      )}
    </Card>
  );
}

function ProofPanel({ liveRecord }) {
  const resultHash = liveRecord?.result_hash ?? DEMO_RESULT_HASH;
  const proofValid = liveRecord ? Boolean(liveRecord.result_hash) : true;

  return (
    <Card title="Result Evaluation" icon="fact_check">
      <div className="grid grid-cols-2 gap-space-md mb-space-md">
        <Stat label="Records" value="10" />
        <Stat label="Unique IDs" value="10" />
      </div>
      <div className="mb-space-md">
        <Badge tone={proofValid ? "success" : "neutral"}>
          {proofValid ? "EVALUATION PASSED" : "AWAITING EVALUATION"}
        </Badge>
      </div>
      <div className="flex flex-col gap-1 mb-space-md">
        <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">Result Hash</span>
        <div className="flex items-center gap-space-xs">
          <span className="font-mono text-body-sm text-on-surface">{truncate(resultHash)}</span>
          <CopyButton text={resultHash} />
        </div>
      </div>
      <div className="flex flex-col gap-1 mb-space-md">
        <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">Trusted Verifier</span>
        <span className="font-mono text-body-sm text-on-surface">{truncate(TRUSTED_VERIFIER)}</span>
      </div>
      {proofValid && (
        <Badge tone="success">
          <span className="material-symbols-outlined text-[14px]">verified</span>
          PROOF VALID
        </Badge>
      )}
      <p className="font-body-sm text-body-sm text-secondary mt-space-md">
        The evaluator signed the deterministic result digest. AgentEscrow verified the signature before settlement.
      </p>
    </Card>
  );
}

function SettlementPanel({ liveRecord }) {
  const settlementTx = liveRecord?.settlement_tx ?? DEMO_SETTLEMENT_TX;
  const settled = liveRecord?.settled ?? (!liveRecord ? true : false);
  const rewardMon = liveRecord?.reward_mon ?? "0.05";

  return (
    <Card title="Settlement" icon="account_balance">
      <div className="grid grid-cols-2 gap-space-md mb-space-md">
        <Stat label="Escrow Reward" value={`${rewardMon} MON`} />
        <div className="flex flex-col gap-1">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">Settlement</span>
          <Badge tone={settled ? "success" : "neutral"}>{settled ? "SUCCESS" : "PENDING"}</Badge>
        </div>
      </div>
      <Stat label="Worker Payout" value={`${rewardMon} MON`} />
      {settled && isRealTxHash(settlementTx) && !liveRecord?.is_mock && (
        <div className="flex items-center gap-space-xs mt-space-md">
          <span className="font-label-sm text-label-sm text-secondary">Tx:</span>
          <ExplorerLink href={explorerTxUrl(settlementTx)}>{truncate(settlementTx)}</ExplorerLink>
        </div>
      )}
    </Card>
  );
}

function ResultPanel({ liveRecord }) {
  if (!liveRecord || !liveRecord.final_answer) return null;
  
  return (
    <Card title="Final Answer" icon="smart_toy">
      <div className="bg-surface-container-low rounded-xl p-space-md border border-surface-container">
        <p className="font-body-lg text-body-lg text-on-surface whitespace-pre-wrap">
          {liveRecord.final_answer}
        </p>
      </div>
    </Card>
  );
}

function FailureDemoSection() {
  return (
    <Card title="Protocol Failure Demonstrations" icon="shield">
      <p className="font-body-sm text-body-sm text-secondary mb-space-lg">
        These are demonstrated protocol tests proving the system rejects invalid behavior. Both were
        executed as real transactions during protocol testing.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
        <div className="border border-surface-container rounded-lg p-space-md">
          <div className="flex items-center gap-space-xs mb-space-sm">
            <Badge tone="danger">REJECTED</Badge>
            <span className="font-label-md text-label-md font-semibold text-on-surface">
              Spending Policy Violation
            </span>
          </div>
          <div className="grid grid-cols-2 gap-space-sm mb-space-sm">
            <Stat label="Provider Invoice" value="0.03 MON" />
            <Stat label="Spending Policy" value="0.02 MON" />
          </div>
          <p className="font-body-sm text-body-sm text-on-surface mb-1">
            AgentWallet payment: <span className="font-semibold text-error">NOT EXECUTED</span>
          </p>
          <p className="font-body-sm text-body-sm text-secondary">Reason: invoice exceeds spending policy.</p>
        </div>
        <div className="border border-surface-container rounded-lg p-space-md">
          <div className="flex items-center gap-space-xs mb-space-sm">
            <Badge tone="danger">INVALID PROOF</Badge>
            <span className="font-label-md text-label-md font-semibold text-on-surface">
              Signature Mismatch
            </span>
          </div>
          <div className="grid grid-cols-2 gap-space-sm mb-space-sm">
            <Stat label="Signed Result" value="Hash A" />
            <Stat label="Submitted Result" value="Hash B" />
          </div>
          <p className="font-body-sm text-body-sm text-on-surface mb-1">
            Settlement: <span className="font-semibold text-error">REVERTED</span>
          </p>
          <p className="font-body-sm text-body-sm text-secondary">
            Reason: evaluator signature does not match the submitted result digest.
          </p>
        </div>
      </div>
    </Card>
  );
}

// ── Identity panel ─────────────────────────────────────────────────
function IdentityPanel() {
  const { address, isConnected } = useAccount();
  const { data: agent } = useReadContract({
    address: AGENT_WALLET_ADDRESS,
    abi: agentWalletAbi,
    functionName: "agent",
    chainId: monadTestnet.id,
  });
  const { data: trustedVerifier } = useReadContract({
    address: AGENT_ESCROW_ADDRESS,
    abi: agentEscrowAbi,
    functionName: "trustedVerifier",
    chainId: monadTestnet.id,
  });

  const roles = [
    {
      name: "Your browser wallet",
      value: isConnected ? truncate(address, 8, 6) : "not connected",
      role: "Identity and read-only viewing. Signs nothing in this demo.",
      link: isConnected ? explorerAddressUrl(address) : null,
    },
    {
      name: "AgentWallet",
      value: truncate(AGENT_WALLET_ADDRESS, 8, 6),
      role: "Holds the agent's spending capital. Pays providers under an immutable per-payment cap.",
      link: explorerAddressUrl(AGENT_WALLET_ADDRESS),
    },
    {
      name: "Authorized agent",
      value: agent ? truncate(agent, 8, 6) : "…",
      role: "The only key AgentWallet accepts. Lives in the agent service, never in the browser.",
      link: agent ? explorerAddressUrl(agent) : null,
    },
    {
      name: "Trusted verifier",
      value: trustedVerifier ? truncate(trustedVerifier, 8, 6) : "…",
      role: "Signs result digests. AgentEscrow releases funds only for this signature.",
      link: trustedVerifier ? explorerAddressUrl(trustedVerifier) : null,
    },
    {
      name: "Provider",
      value: truncate(PROVIDER_ADDRESS, 8, 6),
      role: "Separate EOA that receives the 0.01 MON service payment.",
      link: explorerAddressUrl(PROVIDER_ADDRESS),
    },
  ];

  return (
    <Card title="Who Holds What" icon="badge">
      <p className="font-body-sm text-body-sm text-secondary mb-space-md">
        Connecting a wallet does not make it the spending wallet. The agent pays and earns with its
        own key, held server-side by the agent service.
      </p>
      <div className="flex flex-col gap-space-xs">
        {roles.map((r) => (
          <div key={r.name} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-space-md py-2 border-b border-surface-container last:border-0">
            <div className="sm:w-44 shrink-0">
              <span className="font-label-sm text-label-sm text-on-surface">{r.name}</span>
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              {r.link ? (
                <ExplorerLink href={r.link}>{r.value}</ExplorerLink>
              ) : (
                <span className="font-mono text-body-sm text-secondary">{r.value}</span>
              )}
              <span className="font-body-sm text-body-sm text-secondary">{r.role}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── Live chain panel ───────────────────────────────────────────────
function LiveChainPanel({ liveRecord }) {
  const taskIdArg = (liveRecord?.task_id ?? DEMO_TASK_ID);

  const { data: agent } = useReadContract({ address: AGENT_WALLET_ADDRESS, abi: agentWalletAbi, functionName: "agent", chainId: monadTestnet.id });
  const { data: maxPayment } = useReadContract({ address: AGENT_WALLET_ADDRESS, abi: agentWalletAbi, functionName: "maxPayment", chainId: monadTestnet.id });
  const { data: trustedVerifier } = useReadContract({ address: AGENT_ESCROW_ADDRESS, abi: agentEscrowAbi, functionName: "trustedVerifier", chainId: monadTestnet.id });
  const { data: task } = useReadContract({ address: AGENT_ESCROW_ADDRESS, abi: agentEscrowAbi, functionName: "tasks", args: [taskIdArg], chainId: monadTestnet.id });
  const { data: walletBalance } = useBalance({ address: AGENT_WALLET_ADDRESS, chainId: monadTestnet.id });
  const { data: escrowBalance } = useBalance({ address: AGENT_ESCROW_ADDRESS, chainId: monadTestnet.id });

  return (
    <Card title="Live Chain Data" icon="sensors">
      <p className="font-body-sm text-body-sm text-secondary mb-space-lg">
        Read directly from Monad Testnet via viem/wagmi — not hardcoded.
        {liveRecord?.task_id && <span className="text-tertiary ml-1">(reading live task)</span>}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-lg">
        <div>
          <div className="flex items-center gap-space-xs mb-space-sm">
            <span className="font-label-md text-label-md font-semibold text-on-surface">AgentWallet</span>
            <ExplorerLink href={explorerAddressUrl(AGENT_WALLET_ADDRESS)}>{truncate(AGENT_WALLET_ADDRESS, 6, 4)}</ExplorerLink>
          </div>
          <dl className="flex flex-col gap-space-xs">
            <Row label="agent()" value={agent ? truncate(agent, 6, 4) : "loading..."} />
            <Row label="maxPayment()" value={maxPayment !== undefined ? `${formatEther(maxPayment)} MON` : "loading..."} />
            <Row label="balance" value={walletBalance ? `${walletBalance.formatted} MON` : "loading..."} />
          </dl>
        </div>
        <div>
          <div className="flex items-center gap-space-xs mb-space-sm">
            <span className="font-label-md text-label-md font-semibold text-on-surface">AgentEscrow</span>
            <ExplorerLink href={explorerAddressUrl(AGENT_ESCROW_ADDRESS)}>{truncate(AGENT_ESCROW_ADDRESS, 6, 4)}</ExplorerLink>
          </div>
          <dl className="flex flex-col gap-space-xs">
            <Row label="trustedVerifier()" value={trustedVerifier ? truncate(trustedVerifier, 6, 4) : "loading..."} />
            <Row label="task.settled" value={task ? String(task[2]) : "loading..."} />
            <Row label="balance" value={escrowBalance ? `${escrowBalance.formatted} MON` : "loading..."} />
          </dl>
        </div>
      </div>
    </Card>
  );
}

// ── Primary live execution panel with real polling ─────────────────
function LiveExecutionPanelInner() {
  const searchParams = useSearchParams();

  const [record, setRecord] = useState(null);
  const [polling, setPolling] = useState(false);
  const [pollError, setPollError] = useState(null);
  const [backend, setBackend] = useState(null);
  const [configError, setConfigError] = useState(null);

  const abortRef = useRef(null);

  // Surface a missing API URL immediately — no point hitting the network.
  useEffect(() => {
    if (!API_BASE_URL_CONFIGURED && process.env.NODE_ENV !== "development") {
      setConfigError(MISSING_API_BASE_URL_MESSAGE);
    }
  }, []);

  // Probe backend status once on mount.
  useEffect(() => {
    if (configError) return;
    const ctrl = new AbortController();
    getSystemStatus({ signal: ctrl.signal })
      .then(setBackend)
      .catch((e) => { if (e?.kind !== "aborted") setBackend({ error: e.message }); });
    return () => ctrl.abort();
  }, [configError]);

  // Determine which request to poll. Priority:
  //   1. ?request= query param (set by create-task navigation)
  //   2. sessionStorage (same tab, faster than URL parse)
  //   3. most-recent request from listTasks() (page refresh recovery)
  useEffect(() => {
    if (configError) return;

    const queryId = searchParams?.get("request");
    let sessionId = null;
    try { sessionId = sessionStorage.getItem(SESSION_KEY); } catch {}

    const requestId = queryId || sessionId;

    if (requestId) {
      startPolling(requestId);
      return;
    }

    // Refresh recovery: pick up the last known request.
    const ctrl = new AbortController();
    listTasks({ signal: ctrl.signal })
      .then((rows) => {
        if (!rows?.length) return;
        // Prefer in-flight over settled so a refresh mid-run doesn't show the previous demo.
        const inFlight = rows.filter((r) => !r.settled && r.final_status !== "FAILED" && r.final_status !== "COMPLETED");
        const chosen = inFlight.length ? inFlight[inFlight.length - 1] : rows[rows.length - 1];
        if (chosen?.request_id) startPolling(chosen.request_id);
      })
      .catch(() => {});

    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configError]);

  function startPolling(requestId) {
    // Cancel any existing poll before starting a new one.
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setPolling(true);
    setPollError(null);

    pollTask(requestId, {
      intervalMs: 2000,
      timeoutMs: 300000,
      signal: ctrl.signal,
      onUpdate: (r) => setRecord(r),
      onTransientError: (e) => setPollError(`${e.message} — retrying…`),
    })
      .then((finalRecord) => {
        setRecord(finalRecord);
        setPollError(null);
        // Clear the session key once the run is terminal so a refresh doesn't resume polling it.
        try { sessionStorage.removeItem(SESSION_KEY); } catch {}
      })
      .catch((e) => {
        if (e?.kind === "aborted") return; // Intentional — do not set error.
        if (e?.kind === "timeout") {
          setPollError("Timed out watching this run. It may still be executing on the backend.");
        } else {
          setPollError(e?.message ?? "Polling failed.");
        }
      })
      .finally(() => setPolling(false));
  }

  // Cleanup on unmount to prevent state updates after the component is gone.
  useEffect(() => () => { abortRef.current?.abort(); }, []);

  const lifecycle = buildLifecycle(record);
  const mock = Boolean(record?.is_mock);

  if (configError) {
    return (
      <Card title="Live Execution" icon="play_circle">
        <div className="rounded-lg bg-error-container px-space-md py-space-md">
          <p className="font-label-sm text-label-sm text-on-error-container font-semibold mb-1">Configuration Error</p>
          <p className="font-body-sm text-body-sm text-on-error-container">{configError}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Live Execution" icon="play_circle">
      <div className="flex flex-col gap-space-md">
        {/* Backend status */}
        <div className="flex flex-wrap items-center justify-between gap-space-sm">
          <div className="flex flex-col">
            <p className="font-body-sm text-body-sm text-secondary">
              Browser → FastAPI → LangGraph → canonical agent → Monad Testnet
            </p>
            {backend && !backend.error && (
              <p className="font-body-sm text-body-sm text-secondary">
                backend chain {backend.chain_id} · agent service{" "}
                {backend.agent_service?.reachable ? "online" : "offline"} ·{" "}
                {backend.use_mock_payments ? "⚠ MOCK MODE" : "live mode"}
              </p>
            )}
            {backend?.error && (
              <p className="font-body-sm text-body-sm text-error">
                Backend unreachable: {backend.error}
              </p>
            )}
          </div>
          <Link
            href="/create-task"
            className="px-space-lg py-2.5 rounded-full bg-primary-container text-on-primary font-label-md text-label-md shadow-sm hover:bg-primary transition-colors"
          >
            + New Task
          </Link>
        </div>

        {/* Mock mode warning */}
        {mock && (
          <div className="rounded-lg border border-error px-space-md py-2">
            <p className="font-label-sm text-label-sm text-error">
              MOCK MODE — these transactions are simulated and are not linked to the explorer.
            </p>
          </div>
        )}

        {/* Transient poll error (not fatal) */}
        {pollError && (
          <div className="rounded-lg bg-surface-container px-space-md py-2">
            <p className="font-body-sm text-body-sm text-error break-all">{pollError}</p>
          </div>
        )}

        {/* Polling indicator */}
        {polling && (
          <div className="flex items-center gap-space-sm">
            <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
            <span className="font-body-sm text-body-sm text-secondary">Polling live execution…</span>
          </div>
        )}

        {/* Live stats */}
        {record && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-md">
            <Stat label="Reward" value={`${record.reward_mon ?? "-"} MON`} />
            <Stat label="Spend Cap" value={`${record.spending_limit_mon ?? "-"} MON`} />
            <Stat label="Spent" value={`${record.spent_mon ?? "0"} MON`} />
            <Stat label="Status" value={record.settled ? "SETTLED" : record.final_status} />
          </div>
        )}

        {/* Lifecycle steps */}
        {lifecycle.length > 0 && (
          <div className="flex flex-col gap-space-xs mt-space-sm">
            {lifecycle.map((step) => (
              <div key={step.key} className="flex items-center justify-between gap-space-md py-1.5 border-b border-surface-container last:border-0">
                <div className="flex items-center gap-space-sm min-w-0">
                  <span
                    className={`material-symbols-outlined text-[18px] ${
                      step.failed ? "text-error" : step.done ? "text-tertiary" : "text-secondary opacity-40"
                    }`}
                  >
                    {step.failed ? "cancel" : step.done ? "check_circle" : "radio_button_unchecked"}
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-sm text-label-sm text-on-surface">{step.label}</span>
                    <span className="font-body-sm text-body-sm text-secondary truncate">{step.detail}</span>
                  </div>
                </div>
                {/* Only render a real tx hash as an explorer link. Mock hashes are labelled. */}
                {step.tx && !mock && isRealTxHash(step.tx) ? (
                  <ExplorerLink href={explorerTxUrl(step.tx)}>{truncate(step.tx, 8, 6)}</ExplorerLink>
                ) : step.tx ? (
                  <span className="font-mono text-body-sm text-secondary">{truncate(step.tx, 8, 6)} (mock)</span>
                ) : null}
              </div>
            ))}
          </div>
        )}

        {/* Task / result hash */}
        {record?.task_id && (
          <p className="font-mono text-body-sm text-secondary break-all mt-space-sm">
            taskId {record.task_id}
            {record.result_hash ? ` · resultHash ${record.result_hash}` : ""}
          </p>
        )}

        {!record && !polling && (
          <p className="font-body-sm text-body-sm text-secondary">
            No live run yet. The panels below show the last proven Testnet demo run.{" "}
            <Link href="/create-task" className="text-primary hover:underline">
              Create a task
            </Link>{" "}
            to start a real execution.
          </p>
        )}
      </div>
    </Card>
  );
}

// Wrap in Suspense because useSearchParams() requires it in Next.js 14 App Router.
function LiveExecutionPanel() {
  return (
    <Suspense fallback={<Card title="Live Execution" icon="play_circle"><p className="font-body-sm text-body-sm text-secondary">Loading…</p></Card>}>
      <LiveExecutionPanelInner />
    </Suspense>
  );
}

// ── Page ───────────────────────────────────────────────────────────
// liveRecord is threaded from LiveExecutionPanel to the static panels so that
// TaskCard, Timeline, PolicyPanel etc. all show live values once a run exists.
// Because LiveExecutionPanel manages its own state, we lift it up here.
function DashboardContent() {
  const searchParams = useSearchParams();
  const [liveRecord, setLiveRecord] = useState(null);
  const [configError, setConfigError] = useState(null);
  const abortRef = useRef(null);

  useEffect(() => {
    if (!API_BASE_URL_CONFIGURED && process.env.NODE_ENV !== "development") {
      setConfigError(MISSING_API_BASE_URL_MESSAGE);
      return;
    }

    const queryId = searchParams?.get("request");
    let sessionId = null;
    try { sessionId = sessionStorage.getItem(SESSION_KEY); } catch {}
    const requestId = queryId || sessionId;

    function doStartPolling(id) {
      if (abortRef.current) abortRef.current.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;

      pollTask(id, {
        intervalMs: 2000,
        timeoutMs: 300000,
        signal: ctrl.signal,
        onUpdate: (r) => setLiveRecord(r),
      })
        .then((r) => {
          setLiveRecord(r);
          try { sessionStorage.removeItem(SESSION_KEY); } catch {}
        })
        .catch((e) => { if (e?.kind !== "aborted") {} });
    }

    if (requestId) {
      doStartPolling(requestId);
      return () => abortRef.current?.abort();
    }

    // Refresh recovery
    const ctrl = new AbortController();
    listTasks({ signal: ctrl.signal })
      .then((rows) => {
        if (!rows?.length) return;
        const inFlight = rows.filter((r) => !r.settled && r.final_status !== "FAILED" && r.final_status !== "COMPLETED");
        const chosen = inFlight.length ? inFlight[inFlight.length - 1] : rows[rows.length - 1];
        if (chosen?.request_id) doStartPolling(chosen.request_id);
      })
      .catch(() => {});

    return () => { ctrl.abort(); abortRef.current?.abort(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configError]);

  useEffect(() => () => { abortRef.current?.abort(); }, []);

  return (
    <>
      <Header />
      <main className="max-w-[1200px] mx-auto px-gutter py-space-xl flex flex-col gap-space-xl">
        {configError && (
          <div className="rounded-xl bg-error-container px-space-lg py-space-md">
            <p className="font-label-md text-label-md text-on-error-container font-semibold mb-1">Configuration Error</p>
            <p className="font-body-sm text-body-sm text-on-error-container">{configError}</p>
          </div>
        )}

        <TaskCard liveRecord={liveRecord} />
        <ResultPanel liveRecord={liveRecord} />
        <LiveExecutionPanel />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-xl">
          <Timeline liveRecord={liveRecord} />
          <div className="flex flex-col gap-space-xl">
            <PolicyPanel liveRecord={liveRecord} />
            <ProviderPanel liveRecord={liveRecord} />
            <ProofPanel liveRecord={liveRecord} />
            <SettlementPanel liveRecord={liveRecord} />
          </div>
        </div>

        <LiveChainPanel liveRecord={liveRecord} />
        <IdentityPanel />
        <FailureDemoSection />

        <footer className="text-center py-space-lg">
          <p className="font-body-sm text-body-sm text-secondary">
            The evaluator is a trusted oracle. AgentEscrow verifies its signature before releasing
            escrow — this is not trustless AI verification.
          </p>
        </footer>
      </main>
    </>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface flex items-center justify-center"><p className="font-body-sm text-body-sm text-secondary">Loading dashboard…</p></div>}>
      <DashboardContent />
    </Suspense>
  );
}
