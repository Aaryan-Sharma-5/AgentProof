"""
Marketplace Service.
Manages API catalog retrieval, candidate filtering, and deterministic scoring.
Never fabricates or invents providers or URLs.
"""

from __future__ import annotations
from typing import List, Optional, Tuple, Dict
from app.models.domain import ApiRecord, Provider, AgentPolicy
from app.schemas.intent import StructuredIntent
from app.schemas.marketplace import (
    DiscoveryResult,
    ScoredApiCandidate,
    ApiScoreBreakdown,
)
from app.repositories.in_memory import store, InMemoryStore
from app.config.settings import settings


class MarketplaceService:
    """Deterministic marketplace discovery and ranking service."""

    def __init__(self, data_store: Optional[InMemoryStore] = None):
        self.store = data_store or store
        self.weights = settings.ranking_weights

    def discover_apis(
        self,
        intent: StructuredIntent,
        policy: Optional[AgentPolicy] = None,
    ) -> DiscoveryResult:
        """
        Retrieves matching APIs from the marketplace catalog, applies deterministic
        filters, calculates score breakdowns, and ranks candidates.
        """
        scored_candidates: List[ScoredApiCandidate] = []
        rejection_reasons: Dict[str, str] = {}

        for api in self.store.apis.values():
            # 1. Active & Not Deprecated
            if not api.is_active or api.is_deprecated:
                rejection_reasons[api.id] = "API is inactive or deprecated"
                continue

            # 2. Provider Check
            provider = self.store.providers.get(api.provider_id)
            if not provider:
                rejection_reasons[api.id] = "Provider not found"
                continue
            if not provider.is_active or provider.is_suspended:
                rejection_reasons[api.id] = f"Provider '{provider.name}' is suspended or inactive"
                continue

            # 3. Policy restrictions on provider
            if policy and api.provider_id in policy.blocked_providers:
                rejection_reasons[api.id] = "Provider blocked by policy"
                continue

            # 4. Category Match
            if api.category.lower() != intent.category.lower():
                rejection_reasons[api.id] = f"Category mismatch: expected {intent.category}, got {api.category}"
                continue

            # 5. Budget Filter
            if intent.max_budget is not None and api.price_mon > intent.max_budget:
                rejection_reasons[api.id] = f"Price {api.price_mon} MON exceeds budget {intent.max_budget} MON"
                continue

            # 6. Policy Max Transaction Cap
            if policy and api.price_mon > policy.max_transaction_mon:
                rejection_reasons[api.id] = f"Price {api.price_mon} MON exceeds policy max {policy.max_transaction_mon} MON"
                continue

            # 7. Calculate Deterministic Score
            breakdown, total_score = self._calculate_score(api, provider, intent)
            reason = (
                f"Matched category '{api.category}'. Provider reputation: {provider.reputation_score:.2f}, "
                f"Reliability: {api.reliability_score:.2f}, Price: {api.price_mon} MON."
            )

            scored_candidates.append(
                ScoredApiCandidate(
                    api=api,
                    score=total_score,
                    breakdown=breakdown,
                    selection_reason=reason
                )
            )

        # Sort by total_score descending
        scored_candidates.sort(key=lambda c: c.score, reverse=True)

        selected_api = scored_candidates[0].api if scored_candidates else None
        explanation = (
            f"Selected '{selected_api.name}' with composite score {scored_candidates[0].score:.4f}."
            if selected_api
            else "No matching eligible API found in marketplace."
        )

        return DiscoveryResult(
            candidates_found=len(scored_candidates),
            selected_api=selected_api,
            scored_candidates=scored_candidates,
            rejection_reasons=rejection_reasons,
            explanation=explanation
        )

    def _calculate_score(
        self,
        api: ApiRecord,
        provider: Provider,
        intent: StructuredIntent,
    ) -> Tuple[ApiScoreBreakdown, float]:
        """Calculates deterministic composite score based on configured weights."""
        # 1. Capability score
        capability = 0.80
        if intent.target and api.supported_targets:
            target_upper = intent.target.upper()
            supported_upper = [t.upper() for t in api.supported_targets]
            if target_upper in supported_upper:
                capability = 1.0
            else:
                capability = 0.50

        # 2. Schema score
        required = set(intent.required_fields)
        api_required = set(api.output_schema.get("required", []))
        if not required:
            schema_score = 1.0
        else:
            matching = len(required.intersection(api_required))
            schema_score = matching / len(required)

        # 3. Reliability score
        reliability = api.reliability_score

        # 4. Verification score
        verification = provider.verification_success_rate

        # 5. Reputation score
        reputation = provider.reputation_score

        # 6. Price score (cheaper is better, benchmark 0.10 MON)
        price_score = max(0.0, 1.0 - (api.price_mon / 0.15))

        total = (
            capability * self.weights["capability_score"]
            + schema_score * self.weights["schema_score"]
            + reliability * self.weights["reliability_score"]
            + verification * self.weights["verification_score"]
            + reputation * self.weights["reputation_score"]
            + price_score * self.weights["price_score"]
        )
        total = round(min(1.0, max(0.0, total)), 4)

        breakdown = ApiScoreBreakdown(
            capability_score=round(capability, 4),
            schema_score=round(schema_score, 4),
            reliability_score=round(reliability, 4),
            verification_score=round(verification, 4),
            reputation_score=round(reputation, 4),
            price_score=round(price_score, 4),
            total_score=total,
            weights_applied=self.weights
        )
        return breakdown, total
