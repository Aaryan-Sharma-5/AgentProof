"""
In-Memory Repository and Seed Store.
Provides state persistence and marketplace catalog for AgentFlow.
Allows clean unit testing, local execution, and testnet workflows.
"""

from __future__ import annotations
from typing import Dict, List, Optional
from datetime import datetime, timezone
from app.models.domain import (
    User,
    Agent,
    AgentPolicy,
    Provider,
    ApiRecord,
    AuditEvent,
    RequestStatus,
    ApprovalStatus,
    PaymentStatus,
)
from app.schemas.approval import ApprovalRequest
from app.schemas.payment import PaymentIntent


class InMemoryStore:
    """Central state and persistence store for AgentFlow."""

    def __init__(self):
        self.users: Dict[str, User] = {}
        self.agents: Dict[str, Agent] = {}
        self.policies: Dict[str, AgentPolicy] = {}
        self.providers: Dict[str, Provider] = {}
        self.apis: Dict[str, ApiRecord] = {}
        self.requests: Dict[str, Dict] = {}
        self.approvals: Dict[str, ApprovalRequest] = {}
        self.payment_intents: Dict[str, PaymentIntent] = {}
        self.audit_logs: List[AuditEvent] = []
        self._seed_default_data()

    def _seed_default_data(self):
        # 1. Default user & agent
        user_1 = User(id="user-1", username="alice", email="alice@agentproof.io", wallet_address="0x1111111111111111111111111111111111111111")
        self.users[user_1.id] = user_1

        agent_1 = Agent(id="agent-1", user_id="user-1", name="ResearchBot", description="Autonomous research and market data agent")
        self.agents[agent_1.id] = agent_1

        policy_1 = AgentPolicy(
            agent_id="agent-1",
            max_transaction_mon=0.10,
            daily_limit_mon=1.00,
            auto_approve=True,
            allowed_categories=["crypto_price", "weather", "finance", "competitor_pricing", "market_data", "general_data"],
            require_human_above_mon=0.10,
            blocked_providers=[]
        )
        self.policies[policy_1.agent_id] = policy_1

        # 2. Providers
        p_crypto = Provider(
            id="provider_crypto_1",
            name="CryptoFeed Labs",
            description="High-performance real-time cryptocurrency oracle and pricing APIs",
            payment_address="0x2222222222222222222222222222222222222222",
            is_active=True,
            is_suspended=False,
            reputation_score=0.98,
            verification_success_rate=0.99
        )
        self.providers[p_crypto.id] = p_crypto

        p_weather = Provider(
            id="provider_weather_1",
            name="GlobalWeather Matrix",
            description="Hyperlocal atmospheric conditions and global weather forecasts",
            payment_address="0x3333333333333333333333333333333333333333",
            is_active=True,
            is_suspended=False,
            reputation_score=0.95,
            verification_success_rate=0.97
        )
        self.providers[p_weather.id] = p_weather

        # Canonical Demo Provider (Competitor Pricing)
        p_demo = Provider(
            id="provider_demo_1",
            name="CompetitiveIntelligence Provider",
            description="Real-time SaaS and cloud competitor pricing intelligence",
            payment_address="0x4444444444444444444444444444444444444444",
            is_active=True,
            is_suspended=False,
            reputation_score=0.99,
            verification_success_rate=1.00
        )
        self.providers[p_demo.id] = p_demo

        p_suspended = Provider(
            id="provider_bad_1",
            name="Suspicious Data Corp",
            description="Untrusted provider with history of manipulated data",
            payment_address="0x5555555555555555555555555555555555555555",
            is_active=False,
            is_suspended=True,
            reputation_score=0.30,
            verification_success_rate=0.40
        )
        self.providers[p_suspended.id] = p_suspended

        # 3. APIs
        # Crypto APIs
        api_btc = ApiRecord(
            id="api_crypto_btc_1",
            provider_id="provider_crypto_1",
            name="CryptoPrice API - BTC",
            category="crypto_price",
            version="1.0.0",
            method="GET",
            endpoint="https://api.cryptofeed.io/v1/price/btc",
            price_mon=0.02,
            currency="MON",
            timeout_ms=3000,
            is_active=True,
            is_deprecated=False,
            rate_limit_rpm=120,
            supported_targets=["BTC", "ETH", "MON"],
            output_schema={"type": "object", "required": ["price", "asset", "timestamp"]},
            reliability_score=0.99,
            tags=["crypto", "price", "btc", "realtime"]
        )
        self.apis[api_btc.id] = api_btc

        api_crypto_expensive = ApiRecord(
            id="api_crypto_expensive_1",
            provider_id="provider_crypto_1",
            name="FinanceData Premium Oracle",
            category="crypto_price",
            version="2.0.0",
            method="GET",
            endpoint="https://api.cryptofeed.io/v2/premium/btc",
            price_mon=0.15, # Exceeds default limit 0.10
            currency="MON",
            timeout_ms=2000,
            is_active=True,
            is_deprecated=False,
            rate_limit_rpm=300,
            supported_targets=["BTC", "ETH"],
            output_schema={"type": "object", "required": ["price", "asset", "timestamp"]},
            reliability_score=0.95,
            tags=["crypto", "premium"]
        )
        self.apis[api_crypto_expensive.id] = api_crypto_expensive

        # Weather API
        api_weather = ApiRecord(
            id="api_weather_1",
            provider_id="provider_weather_1",
            name="Global Weather Feed",
            category="weather",
            version="1.1.0",
            method="GET",
            endpoint="https://api.globalweather.io/v1/current",
            price_mon=0.01,
            currency="MON",
            timeout_ms=4000,
            is_active=True,
            is_deprecated=False,
            rate_limit_rpm=60,
            supported_targets=["Mumbai", "Delhi", "New York", "London", "Tokyo"],
            output_schema={"type": "object", "required": ["city", "temperature", "condition"]},
            reliability_score=0.96,
            tags=["weather", "climate", "temperature"]
        )
        self.apis[api_weather.id] = api_weather

        # Canonical Demo Competitor Pricing API
        api_pricing = ApiRecord(
            id="api_pricing_demo_1",
            provider_id="provider_demo_1",
            name="Competitor Pricing Intelligence API",
            category="competitor_pricing",
            version="1.0.0",
            method="GET",
            endpoint="http://localhost:4000/pricing", # Local provider mock endpoint
            price_mon=0.01,
            currency="MON",
            timeout_ms=5000,
            is_active=True,
            is_deprecated=False,
            rate_limit_rpm=60,
            supported_targets=["competitors", "saas_pricing"],
            output_schema={"type": "object", "required": ["records"]},
            reliability_score=0.99,
            tags=["competitor_pricing", "canonical_demo"]
        )
        self.apis[api_pricing.id] = api_pricing


# Global in-memory instance
store = InMemoryStore()
