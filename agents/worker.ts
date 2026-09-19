import { createPublicClient, createWalletClient, http, defineChain, keccak256, toHex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { evaluate, TaskResult } from "./evaluator.js";
import { AgentFlow } from "./agentFlow.js";

const abi = [
  {
    type: "function",
    name: "settleTask",
    stateMutability: "nonpayable",
    inputs: [
      { name: "taskId", type: "bytes32" },
      { name: "resultHash", type: "bytes32" },
      { name: "v", type: "uint8" },
      { name: "r", type: "bytes32" },
      { name: "s", type: "bytes32" },
    ],
    outputs: [],
  },
] as const;

// Fail loudly on missing config. A silent fallback here is how you end up signing for the wrong network without noticing.
if (!process.env.MONAD_RPC) throw new Error("MONAD_RPC is required");
if (!process.env.ESCROW_ADDRESS) throw new Error("ESCROW_ADDRESS is required");
if (!process.env.AGENT_KEY) throw new Error("AGENT_KEY is required");

// Same key as agentFlow.ts. One agent identity spends there and earns here.
const account = privateKeyToAccount(process.env.AGENT_KEY as `0x${string}`);
const transport = http(process.env.MONAD_RPC);
const publicClient = createPublicClient({ transport });
const contractAddress = process.env.ESCROW_ADDRESS as `0x${string}`;

export type Stage =
  | "escrow_created"
  | "provider_invoice"
  | "policy_approved"
  | "policy_rejected"
  | "provider_paid"
  | "data_received"
  | "evaluated"
  | "proof_signed"
  | "settled";

/// Optional observer for UI/orchestration. Purely informational: it can never alter payment or cryptographic behaviour.
export type StageReporter = (stage: Stage, detail?: Record<string, unknown>) => void;

const noopReporter: StageReporter = () => {};

export async function runTask(result: TaskResult, onStage: StageReporter = noopReporter) {
  // Single source of truth for chain ID: read once here, pass it through. Never hardcode this, and never let the evaluator fetch its own.
  const chainId = await publicClient.getChainId();

  // viem's WalletClient type requires a concrete Chain to type writeContract. Built from the RPC's own chainId at runtime, never hardcoded.
  const chain = defineChain({
    id: chainId,
    name: "connected-chain",
    nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
    rpcUrls: { default: { http: [process.env.MONAD_RPC as string] } },
  });
  const client = createWalletClient({ account, chain, transport });

  const proof = await evaluate(chainId, contractAddress, account.address, result);
  if (!proof.ok) return { settled: false as const, reason: "deterministic_checks_failed" as const };

  onStage("evaluated", { resultHash: proof.resultHash });
  onStage("proof_signed", { resultHash: proof.resultHash });

  const hash = await client.writeContract({
    address: contractAddress,
    abi,
    functionName: "settleTask",
    args: [result.taskId, proof.resultHash, proof.v, proof.r, proof.s],
  });

  // A submitted hash is not a confirmed payout. Wait for the receipt before telling the UI the task settled.
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  const settled = receipt.status === "success";
  if (settled) onStage("settled", { settlementTx: hash });
  return { settled, hash, resultHash: proof.resultHash };
}

type PricingRecord = { id: string; value: string };

/// End-to-end worker run for the canonical demo task: fetch pricing data through AgentFlow (paying the provider's 402 invoice within policy), build the deterministic TaskResult, evaluate it, and settle on-chain.
export async function runWorker(
  taskId: `0x${string}`,
  providerUrl: string,
  spendingLimit: bigint,
  onStage: StageReporter = noopReporter
) {
  const agentFlow = new AgentFlow(spendingLimit);

  const response = await agentFlow.requestWithPayment(providerUrl, (event, detail) => {
    if (event === "invoice") onStage("provider_invoice", detail);
    if (event === "approved") onStage("policy_approved", detail);
    if (event === "rejected") onStage("policy_rejected", detail);
    if (event === "paid") onStage("provider_paid", detail);
  });

  if (response.status !== 200 || !response.data) {
    return {
      settled: false as const,
      stage: "provider" as const,
      reason: response.reason ?? "provider_error",
      providerTx: response.paymentTx ?? null,
      spent: agentFlow.getSpent(),
    };
  }

  onStage("data_received", { records: (response.data as { records: PricingRecord[] }).records.length });

  const { records } = response.data as { records: PricingRecord[] };
  const result: TaskResult = { taskId, records };

  const settlement = await runTask(result, onStage);
  if (!settlement.settled) {
    return {
      settled: false as const,
      stage: "evaluation_or_settlement" as const,
      reason: settlement.reason ?? "settlement_failed",
      providerTx: response.paymentTx ?? null,
      resultHash: settlement.resultHash ?? null,
      spent: agentFlow.getSpent(),
    };
  }

  return {
    settled: true as const,
    hash: settlement.hash,
    resultHash: settlement.resultHash,
    providerTx: response.paymentTx ?? null,
    spent: agentFlow.getSpent(),
  };
}

/// Deterministic taskId derivation for the demo: keccak256 of a UTF-8 label.
export function taskIdFromLabel(label: string): `0x${string}` {
  return keccak256(toHex(label));
}
