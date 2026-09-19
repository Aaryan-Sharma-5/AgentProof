import "dotenv/config";
import express from "express";
import { createPublicClient, http, parseEther, formatEther, decodeEventLog } from "viem";

const PORT = Number(process.env.PROVIDER_PORT ?? 4000);
const INVOICE_AMOUNT = process.env.PROVIDER_INVOICE_MON ?? "0.01";

if (!process.env.MONAD_RPC) throw new Error("MONAD_RPC is required");
if (!process.env.AGENT_WALLET_ADDRESS) throw new Error("AGENT_WALLET_ADDRESS is required");
if (!process.env.PROVIDER_ADDRESS) throw new Error("PROVIDER_ADDRESS is required");

const walletAddress = process.env.AGENT_WALLET_ADDRESS as `0x${string}`;
const providerAddress = (process.env.PROVIDER_ADDRESS as `0x${string}`).toLowerCase();

const paymentSettledAbi = [
  {
    type: "event",
    name: "PaymentSettled",
    inputs: [
      { name: "provider", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
] as const;

const publicClient = createPublicClient({ transport: http(process.env.MONAD_RPC) });

// Deterministic pricing data. 10 records so the worker's TaskResult satisfies the evaluator's `records.length === 10` check unmodified.
const PRICING_DATA = {
  records: [
    { id: "competitor-1-tier-basic", value: "Competitor One / Basic / $9/mo" },
    { id: "competitor-1-tier-pro", value: "Competitor One / Pro / $29/mo" },
    { id: "competitor-2-tier-basic", value: "Competitor Two / Basic / $12/mo" },
    { id: "competitor-2-tier-pro", value: "Competitor Two / Pro / $35/mo" },
    { id: "competitor-3-tier-basic", value: "Competitor Three / Basic / $8/mo" },
    { id: "competitor-3-tier-pro", value: "Competitor Three / Pro / $25/mo" },
    { id: "competitor-1-tier-enterprise", value: "Competitor One / Enterprise / Custom" },
    { id: "competitor-2-tier-enterprise", value: "Competitor Two / Enterprise / Custom" },
    { id: "competitor-3-tier-enterprise", value: "Competitor Three / Enterprise / Custom" },
    { id: "market-summary", value: "Median pro-tier price: $29/mo" },
  ],
};

/// Verifies a PaymentSettled(provider, amount) event, for our provider and at least the invoice amount, was emitted by AgentWallet in a successful tx.
async function verifyPayment(txHash: `0x${string}`): Promise<boolean> {
  const receipt = await publicClient.getTransactionReceipt({ hash: txHash });
  if (receipt.status !== "success") return false;
  if (receipt.to?.toLowerCase() !== walletAddress.toLowerCase()) return false;

  const requiredAmount = parseEther(INVOICE_AMOUNT);

  for (const log of receipt.logs) {
    if (log.address.toLowerCase() !== walletAddress.toLowerCase()) continue;
    try {
      const decoded = decodeEventLog({
        abi: paymentSettledAbi,
        data: log.data,
        topics: log.topics,
      });
      if (
        decoded.eventName === "PaymentSettled" &&
        decoded.args.provider.toLowerCase() === providerAddress &&
        decoded.args.amount >= requiredAmount
      ) {
        return true;
      }
    } catch {
      continue;
    }
  }

  return false;
}

const app = express();

app.get("/pricing", async (req, res) => {
  const txHash = req.header("X-Payment-Tx");

  if (!txHash) {
    return res.status(402).json({
      amount: INVOICE_AMOUNT,
      currency: "MON",
      paymentAddress: providerAddress,
    });
  }

  try {
    const paid = await verifyPayment(txHash as `0x${string}`);
    if (!paid) {
      return res.status(402).json({
        amount: INVOICE_AMOUNT,
        currency: "MON",
        paymentAddress: providerAddress,
        error: "payment_not_verified",
      });
    }
  } catch {
    return res.status(402).json({
      amount: INVOICE_AMOUNT,
      currency: "MON",
      paymentAddress: providerAddress,
      error: "payment_verification_failed",
    });
  }

  return res.status(200).json(PRICING_DATA);
});

app.listen(PORT, () => {
  console.log(`Provider listening on :${PORT}`);
  console.log(`Invoice per request: ${formatEther(parseEther(INVOICE_AMOUNT))} MON`);
});
