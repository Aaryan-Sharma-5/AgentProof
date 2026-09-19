"""
API Discovery Agent.
Discovers and selects suitable marketplace services matching structured intent.
Applies deterministic filtering and scoring, with optional explanatory reasoning.
"""

from __future__ import annotations
from typing import Optional
from app.schemas.intent import StructuredIntent
from app.schemas.marketplace import DiscoveryResult
from app.models.domain import AgentPolicy
from app.services.marketplace_service import MarketplaceService


class ApiDiscoveryAgent:
    """Agent that coordinates discovery of services from the marketplace."""

    def __init__(self, marketplace_service: Optional[MarketplaceService] = None):
        self.marketplace = marketplace_service or MarketplaceService()

    async def discover(
        self,
        intent: StructuredIntent,
        policy: Optional[AgentPolicy] = None,
    ) -> DiscoveryResult:
        """Finds eligible API services for the requested intent."""
        return self.marketplace.discover_apis(intent=intent, policy=policy)
