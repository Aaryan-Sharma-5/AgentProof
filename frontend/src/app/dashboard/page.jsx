"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount, useConnect, useDisconnect, useReadContract, useBalance } from "wagmi";
import { formatEther } from "viem";
import { monadTestnet, explorerAddressUrl, explorerTxUrl } from "../../lib/chain";
import { AGENT_WALLET_ADDRESS, AGENT_ESCROW_ADDRESS, PROVIDER_ADDRESS, agentWalletAbi, agentEscrowAbi } from "../../lib/contracts";
import { submitTask, listTasks, buildLifecycle, isRealTxHash, getSystemStatus } from "../../lib/api";

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
const TRUSTED_VERIFIER = "0x4c7c4d8155Fed9b9f09c6619d98773ACcA881305";

function truncate(hash, lead = 10, tail = 8) {
  if (!hash) return "";
  return `${hash.slice(0, lead)}...${hash.slice(-tail)}`;
}

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
        <div className="flex flex-col">
          <span className="font-headline-sm text-headline-sm font-bold text-on-surface tracking-tight">
            AgentProof
          </span>
          <span className="font-body-sm text-body-sm text-secondary">
            Spend by policy. Work autonomously. Get paid by proof.
          </span>
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

function TaskCard() {
  return (
    <Card title="Task" icon="assignment">
      <p className="font-headline-sm text-headline-sm font-semibold text-on-surface mb-space-md">
        Research three competitors and produce a pricing comparison.
      </p>
      <div className="flex items-center gap-space-xs mb-space-lg">
        <span className="font-mono text-body-sm text-secondary">{truncate(DEMO_TASK_ID)}</span>
        <CopyButton text={DEMO_TASK_ID} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-md">
        <Stat label="Reward" value="0.05 MON" />
        <Stat label="Spending Limit" value="0.02 MON" />
        <Stat label="Spent" value="0.01 MON" />
        <Stat label="Remaining Capacity" value="0.01 MON" />
      </div>
      <div className="mt-space-lg">
        <Badge tone="success">
          <span className="material-symbols-outlined text-[14px]">check_circle</span>
          Settled
        </Badge>
      </div>
    </Card>
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

const TIMELINE_STAGES = [
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

function Timeline() {
  return (
    <Card title="Execution Timeline" icon="timeline">
      <div className="flex flex-col gap-space-sm">
        {TIMELINE_STAGES.map((stage, i) => (
          <div key={stage.label} className="flex items-start gap-space-md">
            <div className="flex flex-col items-center">
              <div className="w-7 h-7 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[16px]">check</span>
              </div>
              {i < TIMELINE_STAGES.length - 1 && <div className="w-px flex-1 bg-surface-container my-1" />}
            </div>
            <div className="pb-space-md flex-1">
              <div className="flex items-center gap-space-sm flex-wrap">
                <span className="font-label-md text-label-md font-semibold text-on-surface">{stage.label}</span>
                <Badge tone="success">Complete</Badge>
              </div>
              <p className="font-body-sm text-body-sm text-secondary mt-0.5">{stage.detail}</p>
              {stage.tx && (
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

function PolicyPanel() {
  return (
    <Card title="Spending Policy" icon="policy">
      <div className="grid grid-cols-3 gap-space-md mb-space-md">
        <Stat label="Limit" value="0.02 MON" />
        <Stat label="Current Spend" value="0.01 MON" />
        <Stat label="Invoice" value="0.01 MON" />
      </div>
      <div className="bg-surface-container-low rounded-lg px-space-md py-space-sm font-mono text-body-sm text-on-surface mb-space-md">
        0.00 + 0.01 &le; 0.02
      </div>
      <Badge tone="success">APPROVED</Badge>
      <p className="font-body-sm text-body-sm text-secondary mt-space-md">
        AgentFlow approved the provider payment because it was within the agent&apos;s spending policy.
      </p>
    </Card>
  );
}

function ProviderPanel() {
  return (
    <Card title="Provider Service" icon="cloud">
      <div className="grid grid-cols-2 gap-space-md mb-space-md">
        <Stat label="Invoice" value="0.01 MON" />
        <Stat label="HTTP" value="402 Payment Required" />
      </div>
      <div className="grid grid-cols-2 gap-space-md mb-space-md">
        <Stat label="Payment" value="0.01 MON" />
        <div className="flex flex-col gap-1">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">Status</span>
          <Badge tone="success">PAID</Badge>
        </div>
      </div>
      <div className="flex items-center gap-space-xs">
        <span className="font-label-sm text-label-sm text-secondary">Tx:</span>
        <ExplorerLink href={explorerTxUrl(DEMO_PROVIDER_TX)}>{truncate(DEMO_PROVIDER_TX)}</ExplorerLink>
      </div>
    </Card>
  );
}

const DEMO_RESULT_HASH = "0x373198e2515ba216a6f309bcda018d8380296c5060b0316f8baed9b40d129a55";

function ProofPanel() {
  const resultHash = DEMO_RESULT_HASH;
  return (
    <Card title="Result Evaluation" icon="fact_check">
      <div className="grid grid-cols-2 gap-space-md mb-space-md">
        <Stat label="Records" value="10" />
        <Stat label="Unique IDs" value="10" />
      </div>
      <div className="mb-space-md">
        <Badge tone="success">EVALUATION PASSED</Badge>
      </div>
      <div className="flex flex-col gap-1 mb-space-md">
        <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">Result Hash</span>
        <div className="flex items-center gap-space-xs">
          <span className="font-mono text-body-sm text-on-surface">{truncate(resultHash)}</span>
          <CopyButton text={resultHash} />
        </div>
      </div>
      <div className="flex flex-col gap-1 mb-space-md">
        <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">Trusted Evaluator</span>
        <span className="font-mono text-body-sm text-on-surface">{truncate(TRUSTED_VERIFIER)}</span>
      </div>
      <Badge tone="success">
        <span className="material-symbols-outlined text-[14px]">verified</span>
        PROOF VALID
      </Badge>
      <p className="font-body-sm text-body-sm text-secondary mt-space-md">
        The evaluator signed the deterministic result digest. AgentEscrow verified the signature before
        settlement.
      </p>
    </Card>
  );
}

function SettlementPanel() {
  return (
    <Card title="Settlement" icon="account_balance">
      <div className="grid grid-cols-2 gap-space-md mb-space-md">
        <Stat label="Escrow Reward" value="0.05 MON" />
        <div className="flex flex-col gap-1">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">Settlement</span>
          <Badge tone="success">SUCCESS</Badge>
        </div>
      </div>
      <Stat label="Worker Payout" value="0.05 MON" />
      <div className="flex items-center gap-space-xs mt-space-md">
        <span className="font-label-sm text-label-sm text-secondary">Tx:</span>
        <ExplorerLink href={explorerTxUrl(DEMO_SETTLEMENT_TX)}>{truncate(DEMO_SETTLEMENT_TX)}</ExplorerLink>
      </div>
    </Card>
  );
}

function FailureDemoSection() {
  return (
    <Card title="Protocol Failure Demonstrations" icon="shield">
      <p className="font-body-sm text-body-sm text-secondary mb-space-lg">
        These are demonstrated protocol tests proving the system rejects invalid behavior. They are not
        fabricated — both were executed as real transactions during protocol testing.
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


/// Live execution panel: the PRIMARY state of the dashboard.
/// Submits a task to FastAPI, which orchestrates the canonical TypeScript agent service.
/// The DEMO_* constants below are only a fallback for when no live run has been performed yet.

/// Makes the four distinct economic identities explicit.
/// The connected browser wallet is a viewer identity only - it never signs a provider payment
/// or a settlement. Those are performed by the agent service's own key.
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

function LiveExecutionPanel() {
  const [record, setRecord] = useState(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);
  const [backend, setBackend] = useState(null);

  useEffect(() => {
    getSystemStatus()
      .then(setBackend)
      .catch((e) => setBackend({ error: e.message }));
  }, []);

  // Recover the most recent run so a refresh does not lose the live narrative.
  useEffect(() => {
    listTasks()
      .then((rows) => {
        const settled = rows.filter((r) => r.settlement_tx || r.escrow_tx);
        if (settled.length) setRecord(settled[settled.length - 1]);
      })
      .catch(() => {});
  }, []);

  const run = useCallback(async () => {
    setRunning(true);
    setError(null);
    try {
      const result = await submitTask("Research three competitors and produce a pricing comparison.");
      setRecord(result);
      if (result.error_message) setError(result.error_message);
    } catch (e) {
      setError(e.message);
    } finally {
      setRunning(false);
    }
  }, []);

  const lifecycle = buildLifecycle(record);
  const mock = Boolean(record?.is_mock);

  return (
    <Card title="Live Execution" icon="play_circle">
      <div className="flex flex-col gap-space-md">
        <div className="flex flex-wrap items-center justify-between gap-space-sm">
          <div className="flex flex-col">
            <p className="font-body-sm text-body-sm text-secondary">
              Browser → FastAPI → LangGraph → canonical agent → Monad Testnet
            </p>
            {backend && !backend.error && (
              <p className="font-body-sm text-body-sm text-secondary">
                backend chain {backend.chain_id} · agent service{" "}
                {backend.agent_service?.reachable ? "online" : "offline"} ·{" "}
                {backend.use_mock_payments ? "MOCK MODE" : "live mode"}
              </p>
            )}
            {backend?.error && (
              <p className="font-body-sm text-body-sm text-error">Backend unreachable: {backend.error}</p>
            )}
          </div>
          <button
            onClick={run}
            disabled={running}
            className="px-space-lg py-2.5 rounded-full bg-primary-container text-on-primary font-label-md text-label-md shadow-sm disabled:opacity-50"
          >
            {running ? "Running on Monad Testnet…" : "Run Canonical Task"}
          </button>
        </div>

        {mock && (
          <div className="rounded-lg border border-error px-space-md py-2">
            <p className="font-label-sm text-label-sm text-error">
              MOCK MODE — these transactions are simulated and are not linked to the explorer.
            </p>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-surface-container px-space-md py-2">
            <p className="font-body-sm text-body-sm text-error break-all">{error}</p>
          </div>
        )}

        {record && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-md">
            <Stat label="Reward" value={`${record.reward_mon ?? "-"} MON`} />
            <Stat label="Spend Cap" value={`${record.spending_limit_mon ?? "-"} MON`} />
            <Stat label="Spent" value={`${record.spent_mon ?? "0"} MON`} />
            <Stat label="Status" value={record.settled ? "SETTLED" : record.final_status} />
          </div>
        )}

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
                {/* A mock hash is never rendered as an explorer link. */}
                {step.tx && !step.mock && isRealTxHash(step.tx) ? (
                  <ExplorerLink href={explorerTxUrl(step.tx)}>{truncate(step.tx, 8, 6)}</ExplorerLink>
                ) : step.tx ? (
                  <span className="font-mono text-body-sm text-secondary">{truncate(step.tx, 8, 6)} (mock)</span>
                ) : null}
              </div>
            ))}
          </div>
        )}

        {record?.task_id && (
          <p className="font-mono text-body-sm text-secondary break-all mt-space-sm">
            taskId {record.task_id}
            {record.result_hash ? ` · resultHash ${record.result_hash}` : ""}
          </p>
        )}

        {!record && (
          <p className="font-body-sm text-body-sm text-secondary">
            No live run yet. The panels below show the last proven Testnet demo run.
          </p>
        )}
      </div>
    </Card>
  );
}

function LiveChainPanel() {
  const { data: agent } = useReadContract({
    address: AGENT_WALLET_ADDRESS,
    abi: agentWalletAbi,
    functionName: "agent",
    chainId: monadTestnet.id,
  });
  const { data: maxPayment } = useReadContract({
    address: AGENT_WALLET_ADDRESS,
    abi: agentWalletAbi,
    functionName: "maxPayment",
    chainId: monadTestnet.id,
  });
  const { data: trustedVerifier } = useReadContract({
    address: AGENT_ESCROW_ADDRESS,
    abi: agentEscrowAbi,
    functionName: "trustedVerifier",
    chainId: monadTestnet.id,
  });
  const { data: task } = useReadContract({
    address: AGENT_ESCROW_ADDRESS,
    abi: agentEscrowAbi,
    functionName: "tasks",
    args: [DEMO_TASK_ID],
    chainId: monadTestnet.id,
  });
  const { data: walletBalance } = useBalance({
    address: AGENT_WALLET_ADDRESS,
    chainId: monadTestnet.id,
  });
  const { data: escrowBalance } = useBalance({
    address: AGENT_ESCROW_ADDRESS,
    chainId: monadTestnet.id,
  });

  return (
    <Card title="Live Chain Data" icon="sensors">
      <p className="font-body-sm text-body-sm text-secondary mb-space-lg">
        Read directly from Monad Testnet via viem/wagmi — not hardcoded.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-lg">
        <div>
          <div className="flex items-center gap-space-xs mb-space-sm">
            <span className="font-label-md text-label-md font-semibold text-on-surface">AgentWallet</span>
            <ExplorerLink href={explorerAddressUrl(AGENT_WALLET_ADDRESS)}>
              {truncate(AGENT_WALLET_ADDRESS, 6, 4)}
            </ExplorerLink>
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
            <ExplorerLink href={explorerAddressUrl(AGENT_ESCROW_ADDRESS)}>
              {truncate(AGENT_ESCROW_ADDRESS, 6, 4)}
            </ExplorerLink>
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

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-space-md">
      <span className="font-mono text-body-sm text-secondary">{label}</span>
      <span className="font-mono text-body-sm text-on-surface">{value}</span>
    </div>
  );
}

export default function Dashboard() {
  return (
    <>
      <Header />
      <main className="max-w-[1200px] mx-auto px-gutter py-space-xl flex flex-col gap-space-xl">
        <TaskCard />

        <LiveExecutionPanel />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-xl">
          <Timeline />
          <div className="flex flex-col gap-space-xl">
            <PolicyPanel />
            <ProviderPanel />
            <ProofPanel />
            <SettlementPanel />
          </div>
        </div>

        <LiveChainPanel />
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
