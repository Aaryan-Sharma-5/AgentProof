import "dotenv/config";
import { createPublicClient, createWalletClient, http, defineChain, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { runWorker, taskIdFromLabel } from "./worker.js";

const escrowAbi = [
  {
    type: "function",
    name: "createTask",
    stateMutability: "payable",
    inputs: [{ name: "taskId", type: "bytes32" }],
    outputs: [],
  },
] as const;

if (!process.env.MONAD_RPC) throw new Error("MONAD_RPC is required");
if (!process.env.ESCROW_ADDRESS) throw new Error("ESCROW_ADDRESS is required");
if (!process.env.AGENT_KEY) throw new Error("AGENT_KEY is required");

const REWARD = process.env.TASK_REWARD_MON ?? "0.05";
const SPENDING_LIMIT = process.env.TASK_SPENDING_LIMIT_MON ?? "0.02";
const PROVIDER_URL = process.env.PROVIDER_URL ?? "http://localhost:4000/pricing";

async function main() {
  const account = privateKeyToAccount(process.env.AGENT_KEY as `0x${string}`);
  const transport = http(process.env.MONAD_RPC);
  const publicClient = createPublicClient({ transport });
  const escrowAddress = process.env.ESCROW_ADDRESS as `0x${string}`;

  const chainId = await publicClient.getChainId();
  const chain = defineChain({
    id: chainId,
    name: "connected-chain",
    nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
    rpcUrls: { default: { http: [process.env.MONAD_RPC as string] } },
  });
  const client = createWalletClient({ account, chain, transport });

  const taskId = taskIdFromLabel(`agentproof-demo-${Date.now()}`);
  console.log(`Task ID: ${taskId}`);

  console.log(`Locking ${REWARD} MON in AgentEscrow...`);
  const createHash = await client.writeContract({
    address: escrowAddress,
    abi: escrowAbi,
    functionName: "createTask",
    args: [taskId],
    value: parseEther(REWARD),
  });
  const createReceipt = await publicClient.waitForTransactionReceipt({ hash: createHash });
  if (createReceipt.status !== "success") {
    throw new Error("createTask transaction failed");
  }
  console.log(`Task locked. tx: ${createHash}`);

  console.log(`Starting worker (spending limit: ${SPENDING_LIMIT} MON)...`);
  const result = await runWorker(taskId, PROVIDER_URL, parseEther(SPENDING_LIMIT));

  if (!result.settled) {
    console.error("Worker did not settle the task:", result);
    process.exitCode = 1;
    return;
  }

  console.log(`Settled. Spent ${result.spent} wei on provider. Settlement tx: ${result.hash}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
