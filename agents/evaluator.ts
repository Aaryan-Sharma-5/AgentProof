import {
  keccak256,
  encodeAbiParameters,
  parseAbiParameters,
  hexToBytes,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

const verifier = privateKeyToAccount(process.env.VERIFIER_KEY as `0x${string}`);

// Fixed schema. Field order and types never change without also changing the contract's expected digest structure.
export type TaskResult = {
  taskId: `0x${string}`;
  records: { id: string; value: string }[];
};

// Canonical result encoding: records[] -> (string id, string value)[]
// Array order is significant. The same logical result must always produce the same bytes. Never replace this with JSON.stringify(result).
function serializeResult(result: TaskResult): `0x${string}` {
  return encodeAbiParameters(parseAbiParameters("(string id, string value)[] records"), [
    result.records.map((r) => ({ id: r.id, value: r.value })),
  ]);
}

function runChecks(result: TaskResult): boolean {
  return (
    Array.isArray(result.records) &&
    result.records.length === 10 &&
    new Set(result.records.map((r) => r.id)).size === result.records.length
  );
}

// chainId and contractAddress are supplied by the caller (worker), which reads them from its own connected RPC/config at runtime. The evaluator never reads either value independently. Never hardcode them here.
export async function evaluate(
  chainId: number,
  contractAddress: `0x${string}`,
  worker: `0x${string}`,
  result: TaskResult
) {
  if (!runChecks(result)) return { ok: false as const };

  const resultHash = keccak256(serializeResult(result));
  const raw = keccak256(
    encodeAbiParameters(
      parseAbiParameters(
        "uint256 chainId, address contractAddr, bytes32 taskId, address worker, bytes32 resultHash"
      ),
      [BigInt(chainId), contractAddress, result.taskId, worker, resultHash]
    )
  );

  // viem prefixes with "\x19Ethereum Signed Message:\n32" automatically for {raw}
  const signature = await verifier.signMessage({ message: { raw } });
  const { v, r, s } = splitSignature(signature);
  return { ok: true as const, resultHash, v, r, s };
}

// Do not switch to signTypedData without changing the contract's verification scheme to match (see CLAUDE.md).
function splitSignature(sig: `0x${string}`) {
  const bytes = hexToBytes(sig);
  const r = `0x${Buffer.from(bytes.slice(0, 32)).toString("hex")}` as `0x${string}`;
  const s = `0x${Buffer.from(bytes.slice(32, 64)).toString("hex")}` as `0x${string}`;
  const v = bytes[64];
  return { v, r, s };
}
