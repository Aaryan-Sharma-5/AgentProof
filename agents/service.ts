import "dotenv/config";
import express from "express";
import { createPublicClient, createWalletClient, http, defineChain, parseEther, formatEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { runWorker, taskIdFromLabel, type Stage } from "./worker.js";
import { findService, listServices, CANONICAL_SERVICE_TYPE } from "./marketplace/registry.js";

/// Canonical agent service: the ONLY process that holds the economic signer.
/// It exposes the already-proven worker path over HTTP so the Python/LangGraph layer can
/// orchestrate it without ever touching a private key, a resultHash, or a settlement signature.

const PORT = Number(process.env.AGENT_SERVICE_PORT ?? 4100);

if (!process.env.MONAD_RPC) throw new Error("MONAD_RPC is required");
if (!process.env.ESCROW_ADDRESS) throw new Error("ESCROW_ADDRESS is required");
if (!process.env.AGENT_KEY) throw new Error("AGENT_KEY is required");
if (!process.env.AGENT_WALLET_ADDRESS) throw new Error("AGENT_WALLET_ADDRESS is required");

const DEFAULT_REWARD = process.env.TASK_REWARD_MON ?? "0.05";
const DEFAULT_SPENDING_LIMIT = process.env.TASK_SPENDING_LIMIT_MON ?? "0.02";

const account = privateKeyToAccount(process.env.AGENT_KEY as `0x${string}`);
const transport = http(process.env.MONAD_RPC);
const publicClient = createPublicClient({ transport });
const escrowAddress = process.env.ESCROW_ADDRESS as `0x${string}`;
const walletAddress = process.env.AGENT_WALLET_ADDRESS as `0x${string}`;

const escrowAbi = [
  {
    type: "function",
    name: "createTask",
    stateMutability: "payable",
    inputs: [{ name: "taskId", type: "bytes32" }],
    outputs: [],
  },
  {
    type: "function",
    name: "tasks",
    stateMutability: "view",
    inputs: [{ name: "", type: "bytes32" }],
    outputs: [
      { name: "creator", type: "address" },
      { name: "reward", type: "uint256" },
      { name: "settled", type: "bool" },
    ],
  },
] as const;

const walletAbi = [
  { type: "function", name: "maxPayment", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
] as const;

export type RunStatus = "queued" | "running" | "settled" | "failed";

export type StageEvent = { stage: string; at: string; detail?: Record<string, unknown> };

export type RunRecord = {
  runId: string;
  taskId: `0x${string}` | null;
  status: RunStatus;
  stage: string;
  serviceType: string;
  providerEndpoint: string | null;
  rewardMon: string;
  spendingLimitMon: string;
  escrowTx: `0x${string}` | null;
  providerTx: `0x${string}` | null;
  resultHash: `0x${string}` | null;
  settlementTx: `0x${string}` | null;
  /// Spend in MON, as a decimal string. bigint never crosses the JSON boundary.
  spent: string | null;
  records: { id: string; value: string }[] | null;
  error: string | null;
  isMock: false;
  chainId: number | null;
  createdAt: string;
  updatedAt: string;
  stages: StageEvent[];
};

const runs = new Map<string, RunRecord>();

/// One private key signs createTask, payService and settleTask. Concurrent runs would race the
/// account nonce, so every run is serialized through this promise chain. This is why the service
/// must remain the single signer process: no second signer can contend for the same nonce.
let executionQueue: Promise<unknown> = Promise.resolve();

function touch(run: RunRecord, stage: string, detail?: Record<string, unknown>) {
  run.stage = stage;
  run.updatedAt = new Date().toISOString();
  run.stages.push({ stage, at: run.updatedAt, detail });
}

function buildChain(chainId: number) {
  return defineChain({
    id: chainId,
    name: "connected-chain",
    nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
    rpcUrls: { default: { http: [process.env.MONAD_RPC as string] } },
  });
}

async function execute(run: RunRecord, opts: { reward: string; spendingLimit: string; taskId?: `0x${string}` }) {
  run.status = "running";
  touch(run, "starting");

  // Chain ID always comes from the connected RPC. Never hardcoded, never supplied by the caller.
  const chainId = await publicClient.getChainId();
  run.chainId = chainId;

  const service = findService(run.serviceType);
  if (!service) {
    throw new Error(`No provider registered in marketplace for service type ${run.serviceType}`);
  }
  run.providerEndpoint = service.endpoint;
  touch(run, "service_discovered", {
    name: service.name,
    endpoint: service.endpoint,
    expectedCostMon: service.expectedCostMon,
  });

  // Policy sanity: the task spending cap can never exceed the immutable on-chain per-payment cap,
  // otherwise this service would approve a payment the chain is guaranteed to revert.
  const maxPayment = (await publicClient.readContract({
    address: walletAddress,
    abi: walletAbi,
    functionName: "maxPayment",
  })) as bigint;

  const spendingLimitWei = parseEther(opts.spendingLimit);
  if (spendingLimitWei > maxPayment) {
    throw new Error(
      `Task spending limit ${opts.spendingLimit} MON exceeds AgentWallet.maxPayment ${formatEther(maxPayment)} MON`
    );
  }

  const chain = buildChain(chainId);
  const walletClient = createWalletClient({ account, chain, transport });

  // --- Escrow: lock the reward ---
  const taskId = opts.taskId ?? taskIdFromLabel(`agentproof-${run.runId}-${Date.now()}`);
  run.taskId = taskId;

  const existing = (await publicClient.readContract({
    address: escrowAddress,
    abi: escrowAbi,
    functionName: "tasks",
    args: [taskId],
  })) as readonly [string, bigint, boolean];

  if (existing[0] === "0x0000000000000000000000000000000000000000") {
    touch(run, "creating_escrow", { rewardMon: opts.reward });
    const createHash = await walletClient.writeContract({
      address: escrowAddress,
      abi: escrowAbi,
      functionName: "createTask",
      args: [taskId],
      value: parseEther(opts.reward),
    });
    const createReceipt = await publicClient.waitForTransactionReceipt({ hash: createHash });
    if (createReceipt.status !== "success") {
      throw new Error(`createTask reverted (tx ${createHash})`);
    }
    // Recorded only after the receipt confirms success. A submitted hash is not a locked reward.
    run.escrowTx = createHash;
    touch(run, "escrow_created", { escrowTx: createHash, rewardMon: opts.reward });
  } else {
    if (existing[2]) throw new Error(`Task ${taskId} is already settled`);
    touch(run, "escrow_existing", { rewardMon: formatEther(existing[1]) });
  }

  // --- Canonical worker: 402 -> policy -> AgentWallet -> data -> evaluator -> signature -> settle ---
  const result = await runWorker(taskId, service.endpoint, spendingLimitWei, (stage: Stage, detail) => {
    if (detail?.providerTx) run.providerTx = detail.providerTx as `0x${string}`;
    if (detail?.resultHash) run.resultHash = detail.resultHash as `0x${string}`;
    if (detail?.settlementTx) run.settlementTx = detail.settlementTx as `0x${string}`;
    touch(run, stage, detail);
  });

  run.spent = formatEther(result.spent ?? 0n);
  if (result.providerTx) run.providerTx = result.providerTx;

  if (!result.settled) {
    if ("resultHash" in result && result.resultHash) run.resultHash = result.resultHash;
    run.status = "failed";
    run.error = `${result.stage}: ${result.reason ?? "unknown"}`;
    touch(run, "failed", { stage: result.stage, reason: result.reason });
    return;
  }

  run.settlementTx = result.hash ?? null;
  run.resultHash = result.resultHash ?? null;
  run.status = "settled";
  touch(run, "settled", { settlementTx: run.settlementTx, resultHash: run.resultHash });
}

const app = express();
app.use(express.json());

app.get("/health", async (_req, res) => {
  try {
    const chainId = await publicClient.getChainId();
    return res.status(200).json({
      status: "ok",
      chainId,
      agent: account.address,
      agentWallet: walletAddress,
      agentEscrow: escrowAddress,
      services: listServices(),
      activeRuns: runs.size,
      isMock: false,
    });
  } catch (err) {
    return res.status(503).json({ status: "degraded", error: (err as Error).message, isMock: false });
  }
});

app.get("/services", (_req, res) => res.status(200).json({ services: listServices() }));

app.post("/run", (req, res) => {
  const body = (req.body ?? {}) as {
    serviceType?: string;
    rewardMon?: string;
    spendingLimitMon?: string;
    taskId?: string;
    requestId?: string;
  };

  const runId =
    body.requestId?.trim() || `run_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  if (runs.has(runId)) {
    return res.status(409).json({ error: `Run ${runId} already exists`, run: runs.get(runId) });
  }

  const reward = body.rewardMon ?? DEFAULT_REWARD;
  const spendingLimit = body.spendingLimitMon ?? DEFAULT_SPENDING_LIMIT;
  const now = new Date().toISOString();

  const run: RunRecord = {
    runId,
    taskId: (body.taskId as `0x${string}`) ?? null,
    status: "queued",
    stage: "queued",
    serviceType: body.serviceType ?? CANONICAL_SERVICE_TYPE,
    providerEndpoint: null,
    rewardMon: reward,
    spendingLimitMon: spendingLimit,
    escrowTx: null,
    providerTx: null,
    resultHash: null,
    settlementTx: null,
    spent: null,
    records: null,
    error: null,
    isMock: false,
    chainId: null,
    createdAt: now,
    updatedAt: now,
    stages: [{ stage: "queued", at: now }],
  };
  runs.set(runId, run);

  // Serialized: each run waits for the previous one so the shared signer nonce is never contended.
  executionQueue = executionQueue.then(async () => {
    try {
      await execute(run, { reward, spendingLimit, taskId: body.taskId as `0x${string}` | undefined });
    } catch (err) {
      run.status = "failed";
      run.error = (err as Error).message;
      touch(run, "failed", { reason: run.error });
    }
  });

  return res.status(202).json(run);
});

app.get("/run/:id", (req, res) => {
  const run = runs.get(req.params.id);
  if (!run) return res.status(404).json({ error: `Run ${req.params.id} not found` });
  return res.status(200).json(run);
});

app.get("/runs", (_req, res) => res.status(200).json({ runs: Array.from(runs.values()) }));

app.listen(PORT, () => {
  console.log(`Canonical agent service listening on :${PORT}`);
  console.log(`  agent        ${account.address}`);
  console.log(`  AgentWallet  ${walletAddress}`);
  console.log(`  AgentEscrow  ${escrowAddress}`);
  console.log(`  reward ${DEFAULT_REWARD} MON | task cap ${DEFAULT_SPENDING_LIMIT} MON`);
});
