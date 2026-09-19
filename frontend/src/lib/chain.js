import { defineChain } from "viem";

export const monadTestnet = defineChain({
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_MONAD_RPC || "https://testnet-rpc.monad.xyz"] },
  },
  blockExplorers: {
    default: { name: "Monadscan", url: "https://testnet.monadscan.com" },
  },
  testnet: true,
});

export function explorerAddressUrl(address) {
  return `${monadTestnet.blockExplorers.default.url}/address/${address}`;
}

export function explorerTxUrl(hash) {
  return `${monadTestnet.blockExplorers.default.url}/tx/${hash}`;
}
