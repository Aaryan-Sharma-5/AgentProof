export const AGENT_WALLET_ADDRESS =
  process.env.NEXT_PUBLIC_AGENT_WALLET_ADDRESS || "0x7263058B4040ae7410340f63d292152DE8d867FA";

export const AGENT_ESCROW_ADDRESS =
  process.env.NEXT_PUBLIC_ESCROW_ADDRESS || "0x0AEb04B6e92984EC94BbbB4aF234efD080e8e9f1";

export const agentWalletAbi = [
  {
    type: "function",
    name: "agent",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }],
  },
  {
    type: "function",
    name: "maxPayment",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "event",
    name: "PaymentSettled",
    inputs: [
      { name: "provider", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
];

export const agentEscrowAbi = [
  {
    type: "function",
    name: "trustedVerifier",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }],
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
  {
    type: "event",
    name: "TaskCreated",
    inputs: [
      { name: "taskId", type: "bytes32", indexed: true },
      { name: "creator", type: "address", indexed: true },
      { name: "reward", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "TaskSettled",
    inputs: [
      { name: "taskId", type: "bytes32", indexed: true },
      { name: "worker", type: "address", indexed: true },
      { name: "reward", type: "uint256", indexed: false },
      { name: "resultHash", type: "bytes32", indexed: false },
    ],
  },
];
