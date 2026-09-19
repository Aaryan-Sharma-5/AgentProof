/// Wakes the free-tier services before a demo.
///
/// Free Render web services sleep after ~15 minutes idle and take ~50s to cold start. Hitting a
/// sleeping service mid-demo looks like a failure. Run this a couple of minutes beforehand:
///
///   npm run warm
///
/// Reads the public URLs from the environment, so it works against both local and deployed stacks:
///   PROVIDER_URL          e.g. https://agentproof-provider.onrender.com/pricing
///   AGENT_SERVICE_URL     e.g. https://agentproof-agent.onrender.com
///   API_URL               e.g. https://agentproof-api.onrender.com
///
/// No token is needed: every endpoint probed here is a read-only health route.

import "dotenv/config";

type Target = { name: string; url: string };

const PROVIDER_URL = process.env.PROVIDER_URL ?? "http://localhost:4000/pricing";
const AGENT_SERVICE_URL = process.env.AGENT_SERVICE_URL ?? "http://localhost:4100";
const API_URL = process.env.API_URL ?? "http://localhost:8000";

// Derive the provider's /health from its /pricing endpoint.
const providerHealth = PROVIDER_URL.replace(/\/pricing\/?$/, "") + "/health";

const TARGETS: Target[] = [
  { name: "provider", url: providerHealth },
  { name: "agent service", url: `${AGENT_SERVICE_URL.replace(/\/$/, "")}/health` },
  { name: "fastapi", url: `${API_URL.replace(/\/$/, "")}/health` },
];

const MAX_ATTEMPTS = Number(process.env.WARM_MAX_ATTEMPTS ?? 12);
const ATTEMPT_TIMEOUT_MS = 20_000;
const RETRY_DELAY_MS = 5_000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function warm(target: Target): Promise<boolean> {
  const started = Date.now();

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(target.url, { signal: AbortSignal.timeout(ATTEMPT_TIMEOUT_MS) });
      if (res.ok) {
        const seconds = ((Date.now() - started) / 1000).toFixed(1);
        console.log(`  OK    ${target.name.padEnd(14)} ${res.status} after ${seconds}s (attempt ${attempt})`);
        return true;
      }
      console.log(`  ...   ${target.name.padEnd(14)} HTTP ${res.status}, retrying (${attempt}/${MAX_ATTEMPTS})`);
    } catch {
      // A cold start looks like a timeout or a connection reset. Both are expected here.
      console.log(`  ...   ${target.name.padEnd(14)} waking, retrying (${attempt}/${MAX_ATTEMPTS})`);
    }
    if (attempt < MAX_ATTEMPTS) await sleep(RETRY_DELAY_MS);
  }

  console.log(`  FAIL  ${target.name.padEnd(14)} still not responding at ${target.url}`);
  return false;
}

async function main() {
  console.log("Warming AgentProof services...");
  for (const target of TARGETS) {
    console.log(`        ${target.name}: ${target.url}`);
  }
  console.log("");

  // Sequential rather than parallel: free instances are small, and a simultaneous burst of cold
  // starts is slower than waking them one at a time.
  const results = [];
  for (const target of TARGETS) {
    results.push(await warm(target));
  }

  const allUp = results.every(Boolean);
  console.log("");
  console.log(allUp ? "All services are awake. Safe to demo." : "Some services did not wake. Check the dashboards before demoing.");
  if (!allUp) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
