/// Minimal in-memory Service Marketplace (CLAUDE.md §18).
/// Maps a service type to a provider endpoint and its expected cost so the worker
/// discovers where to buy a resource instead of having the URL hardcoded at the call site.
/// Intentionally static: this is a discovery directory, not a production marketplace.

export type ServiceType = "competitor_pricing";

export type ServiceListing = {
  serviceType: ServiceType;
  name: string;
  endpoint: string;
  /// Expected cost in MON. Advisory only - the provider's HTTP 402 invoice is authoritative,
  /// and AgentFlow's policy check is what actually gates the payment.
  expectedCostMon: string;
  currency: "MON";
  description: string;
};

const PROVIDER_URL = process.env.PROVIDER_URL ?? "http://localhost:4000/pricing";
const EXPECTED_COST_MON = process.env.PROVIDER_INVOICE_MON ?? "0.01";

const REGISTRY: ServiceListing[] = [
  {
    serviceType: "competitor_pricing",
    name: "Competitor Pricing API",
    endpoint: PROVIDER_URL,
    expectedCostMon: EXPECTED_COST_MON,
    currency: "MON",
    description: "Returns a deterministic 10-record SaaS competitor pricing comparison behind an HTTP 402 paywall.",
  },
];

export function listServices(): ServiceListing[] {
  return REGISTRY.map((entry) => ({ ...entry }));
}

/// Discovers the provider endpoint for a service type. Returns undefined when nothing is registered,
/// so the caller fails loudly rather than inventing a URL.
export function findService(serviceType: string): ServiceListing | undefined {
  const match = REGISTRY.find((entry) => entry.serviceType === serviceType);
  return match ? { ...match } : undefined;
}

/// The canonical demo task always resolves to the competitor pricing service.
export const CANONICAL_SERVICE_TYPE: ServiceType = "competitor_pricing";
