"""
Unit Tests for API Discovery Agent & Marketplace Service.
"""

import pytest
import asyncio
from app.agents.discovery.agent import ApiDiscoveryAgent
from app.services.marketplace_service import MarketplaceService
from app.schemas.intent import StructuredIntent
from app.models.domain import AgentPolicy, ApiRecord, Provider
from app.repositories.in_memory import InMemoryStore


@pytest.fixture
def fresh_store():
    return InMemoryStore()


@pytest.fixture
def discovery_agent(fresh_store):
    service = MarketplaceService(data_store=fresh_store)
    return ApiDiscoveryAgent(marketplace_service=service)


def test_discover_crypto_api(discovery_agent):
    intent = StructuredIntent(
        task="retrieve_data",
        category="crypto_price",
        target="BTC",
        freshness="current",
        required_fields=["price"]
    )
    res = asyncio.run(discovery_agent.discover(intent))
    assert res.candidates_found > 0
    assert res.selected_api is not None
    assert res.selected_api.category == "crypto_price"
    assert res.selected_api.id == "api_crypto_btc_1"


def test_budget_filter_excludes_expensive_apis(discovery_agent):
    intent = StructuredIntent(
        task="retrieve_data",
        category="crypto_price",
        target="BTC",
        freshness="current",
        required_fields=["price"],
        max_budget=0.05 # Lower than 0.15 MON premium API
    )
    res = asyncio.run(discovery_agent.discover(intent))
    # Expensive API should be excluded
    api_ids = [c.api.id for c in res.scored_candidates]
    assert "api_crypto_expensive_1" not in api_ids
    assert "api_crypto_btc_1" in api_ids


def test_suspended_provider_filter(discovery_agent, fresh_store):
    discovery_agent.marketplace.store = fresh_store
    # Add an API from suspended provider
    bad_api = ApiRecord(
        id="api_bad_1",
        provider_id="provider_bad_1", # Suspended provider
        name="Untrusted API",
        category="crypto_price",
        price_mon=0.01,
        endpoint="https://untrusted.com"
    )
    fresh_store.apis[bad_api.id] = bad_api

    intent = StructuredIntent(
        task="retrieve_data",
        category="crypto_price",
        target="BTC",
        required_fields=["price"]
    )
    res = asyncio.run(discovery_agent.discover(intent))
    api_ids = [c.api.id for c in res.scored_candidates]
    assert "api_bad_1" not in api_ids


def test_policy_blocked_provider_filter(discovery_agent):
    intent = StructuredIntent(
        task="retrieve_data",
        category="crypto_price",
        target="BTC",
        required_fields=["price"]
    )
    policy = AgentPolicy(
        agent_id="agent-1",
        blocked_providers=["provider_crypto_1"]
    )
    res = asyncio.run(discovery_agent.discover(intent, policy=policy))
    api_ids = [c.api.id for c in res.scored_candidates]
    assert "api_crypto_btc_1" not in api_ids


def test_no_matching_api_returns_empty(discovery_agent):
    intent = StructuredIntent(
        task="retrieve_data",
        category="astrophysics", # Non-existent category
        target="Mars",
        required_fields=["spectrum"]
    )
    res = asyncio.run(discovery_agent.discover(intent))
    assert res.candidates_found == 0
    assert res.selected_api is None
