import { createPublicClient, createWalletClient, http, defineChain, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const abi = [
  {
    type: "function",
    name: "payService",
    stateMutability: "nonpayable",
    inputs: [
      { name: "provider", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
] as const;

if (!process.env.MONAD_RPC) throw new Error("MONAD_RPC is required");
if (!process.env.AGENT_WALLET_ADDRESS) throw new Error("AGENT_WALLET_ADDRESS is required");
if (!process.env.AGENT_KEY) throw new Error("AGENT_KEY is required");

// Same key as worker.ts. One agent identity spends here and earns there.
const account = privateKeyToAccount(process.env.AGENT_KEY as `0x${string}`);
const transport = http(process.env.MONAD_RPC);
const publicClient = createPublicClient({ transport });
const walletAddress = process.env.AGENT_WALLET_ADDRESS as `0x${string}`;

type Invoice = { amount: string; currency: string; paymentAddress: `0x${string}` };

/// Tracks cumulative spend against a task's spending limit. One instance per task/run — spent resets when a fresh AgentFlow is created.
export class AgentFlow {
  private spent = 0n;

  constructor(private readonly spendingLimit: bigint) {}

  getSpent(): bigint {
    return this.spent;
  }

  /// Deterministic policy check: spent + invoice must not exceed the limit.
  checkPolicy(invoiceAmount: bigint): boolean {
    return this.spent + invoiceAmount <= this.spendingLimit;
  }

  /// Pays an invoice through AgentWallet if, and only if, the policy check passes. AgentWallet is never called when the check fails.
  async payInvoice(invoice: Invoice): Promise<
    | { paid: true; hash: `0x${string}` }
    | { paid: false; reason: "over_policy_limit" | "tx_failed" }
  > {
    const amount = parseEther(invoice.amount);

    if (!this.checkPolicy(amount)) {
      return { paid: false, reason: "over_policy_limit" };
    }

    const chainId = await publicClient.getChainId();
    const chain = defineChain({
      id: chainId,
      name: "connected-chain",
      nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
      rpcUrls: { default: { http: [process.env.MONAD_RPC as string] } },
    });
    const client = createWalletClient({ account, chain, transport });

    const hash = await client.writeContract({
      address: walletAddress,
      abi,
      functionName: "payService",
      args: [invoice.paymentAddress, amount],
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (receipt.status !== "success") {
      return { paid: false, reason: "tx_failed" };
    }

    this.spent += amount;
    return { paid: true, hash };
  }

  /// GET url; if 402, run the policy check and pay through AgentWallet; then retry once with the payment tx hash attached.
  async requestWithPayment(
    url: string
  ): Promise<{ status: number; data?: unknown; blocked?: boolean; reason?: string }> {
    const first = await fetch(url);
    if (first.status !== 402) {
      return { status: first.status, data: await first.json() };
    }

    const invoice = (await first.json()) as Invoice;
    const result = await this.payInvoice(invoice);

    if (!result.paid) {
      return { status: 402, blocked: true, reason: result.reason };
    }

    const second = await fetch(url, { headers: { "X-Payment-Tx": result.hash } });
    return { status: second.status, data: await second.json() };
  }
}
