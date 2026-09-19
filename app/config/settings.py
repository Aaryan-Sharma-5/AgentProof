"""
AgentFlow Configuration Settings
Centralized configuration management adhering to 12-factor application principles.
Preserves existing Monad / Web3 environment variables established by Teammate 3.
"""

from __future__ import annotations
import os
from typing import Dict, List, Optional
from pydantic import BaseModel, Field


# Development-only fallback. Refused outside development by Settings.model_post_init below.
DEFAULT_DEV_JWT_SECRET = "agentflow-dev-only-insecure-secret"


class RiskThresholdSettings(BaseModel):
    low_max: int = 29
    medium_max: int = 59
    high_max: int = 79
    critical_max: int = 100
    auto_approve_max_score: int = 29
    high_value_mon_threshold: float = 0.10


class ApprovalSettings(BaseModel):
    default_ttl_seconds: int = 3600
    require_human_above_mon: float = 0.10


class Settings(BaseModel):
    model_config = {"protected_namespaces": ()}

    # App
    app_name: str = "AgentFlow Core"
    environment: str = Field(default_factory=lambda: os.getenv("ENVIRONMENT", "development"))
    # Debug echoes stack traces to HTTP clients. Off unless explicitly enabled, and forced off in
    # production by model_post_init below.
    debug: bool = Field(default_factory=lambda: os.getenv("DEBUG", "false").lower() in ("true", "1", "yes"))
    api_v1_prefix: str = "/v1"

    # LLM Settings
    model_name: str = Field(default_factory=lambda: os.getenv("MODEL_NAME", "gpt-4o-mini"))
    model_temperature: float = Field(default_factory=lambda: float(os.getenv("MODEL_TEMPERATURE", "0.0")))
    model_timeout_seconds: float = Field(default_factory=lambda: float(os.getenv("MODEL_TIMEOUT", "10.0")))
    openai_api_key: Optional[str] = Field(default_factory=lambda: os.getenv("OPENAI_API_KEY"))

    # Security & SSRF Protection
    max_api_timeout_seconds: float = Field(default_factory=lambda: float(os.getenv("MAX_API_TIMEOUT", "5.0")))
    max_api_retries: int = Field(default_factory=lambda: int(os.getenv("MAX_API_RETRIES", "2")))
    max_response_size_bytes: int = Field(default_factory=lambda: int(os.getenv("MAX_RESPONSE_SIZE", "1048576"))) # 1 MB
    allowed_schemes: List[str] = ["https", "http"] # http allowed only in dev for localhost mocks if explicitly flagged
    enforce_strict_https: bool = Field(default_factory=lambda: os.getenv("ENFORCE_STRICT_HTTPS", "false").lower() in ("true", "1"))
    enforce_freshness: bool = Field(default_factory=lambda: os.getenv("ENFORCE_FRESHNESS", "false").lower() in ("true", "1"))
    freshness_max_age_seconds: int = Field(default_factory=lambda: int(os.getenv("FRESHNESS_MAX_AGE", "86400")))

    # Risk & Policy Defaults
    risk: RiskThresholdSettings = Field(default_factory=RiskThresholdSettings)
    approval: ApprovalSettings = Field(default_factory=ApprovalSettings)
    default_currency: str = "MON"
    default_max_transaction_mon: float = 0.10
    default_daily_limit_mon: float = 1.00
    allowed_categories: List[str] = ["crypto_price", "weather", "finance", "competitor_pricing", "market_data", "general_data"]

    # Web3 / Blockchain Layer (Preserving Teammate 3's environment variable names)
    monad_rpc: str = Field(default_factory=lambda: os.getenv("MONAD_RPC", "http://localhost:8545"))
    chain_id: int = Field(default_factory=lambda: int(os.getenv("CHAIN_ID", "10143"))) # Monad Testnet or local
    deployer_key: Optional[str] = Field(default_factory=lambda: os.getenv("DEPLOYER_KEY"))
    verifier_key: Optional[str] = Field(default_factory=lambda: os.getenv("VERIFIER_KEY"))
    agent_key: Optional[str] = Field(default_factory=lambda: os.getenv("AGENT_KEY"))
    agent_wallet_address: Optional[str] = Field(default_factory=lambda: os.getenv("AGENT_WALLET_ADDRESS"))
    escrow_address: Optional[str] = Field(default_factory=lambda: os.getenv("ESCROW_ADDRESS"))
    provider_address: Optional[str] = Field(default_factory=lambda: os.getenv("PROVIDER_ADDRESS"))
    provider_url: str = Field(default_factory=lambda: os.getenv("PROVIDER_URL", "http://localhost:4000/pricing"))
    task_reward_mon: float = Field(default_factory=lambda: float(os.getenv("TASK_REWARD_MON", "0.05")))
    task_spending_limit_mon: float = Field(default_factory=lambda: float(os.getenv("TASK_SPENDING_LIMIT_MON", "0.02")))

    # Canonical agent service (agents/service.ts) - the ONLY process holding the economic signer.
    # Python orchestrates it over HTTP and never receives a private key.
    agent_service_url: str = Field(default_factory=lambda: os.getenv("AGENT_SERVICE_URL", "http://localhost:4100"))
    agent_service_timeout_seconds: float = Field(default_factory=lambda: float(os.getenv("AGENT_SERVICE_TIMEOUT", "30.0")))
    agent_service_max_wait_seconds: float = Field(default_factory=lambda: float(os.getenv("AGENT_SERVICE_MAX_WAIT", "180.0")))

    # AgentWallet's immutable per-payment cap, mirrored here so the Python policy engine can never
    # approve an invoice the chain is guaranteed to revert. The chain remains the final authority.
    wallet_max_payment_mon: float = Field(default_factory=lambda: float(os.getenv("WALLET_MAX_PAYMENT_MON", "0.02")))

    # Mock payments are TEST-ONLY and must be opted into explicitly. When false (the default), the
    # live request path dispatches to the canonical TypeScript agent service and real transactions.
    use_mock_payments: bool = Field(
        default_factory=lambda: os.getenv("USE_MOCK_PAYMENTS", "false").lower() in ("true", "1", "yes")
    )

    # CORS: explicit origin allowlist. Never "*" together with credentials.
    cors_allow_origins: List[str] = Field(
        default_factory=lambda: [
            o.strip()
            for o in os.getenv("CORS_ALLOW_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")
            if o.strip()
        ]
    )

    # Allow localhost provider endpoints (SSRF relaxation) only under an explicit demo/dev flag.
    allow_local_provider: bool = Field(
        default_factory=lambda: os.getenv("ALLOW_LOCAL_PROVIDER", "true").lower() in ("true", "1", "yes")
    )

    # JWT / Auth Secret
    jwt_secret: str = Field(default_factory=lambda: os.getenv("JWT_SECRET", DEFAULT_DEV_JWT_SECRET))
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24

    # Ranking Weights
    ranking_weights: Dict[str, float] = {
        "capability_score": 0.30,
        "schema_score": 0.20,
        "reliability_score": 0.15,
        "verification_score": 0.15,
        "reputation_score": 0.10,
        "price_score": 0.10,
    }


    def model_post_init(self, __context) -> None:
        """Refuses insecure defaults outside development."""
        if self.environment.lower() not in ("development", "dev", "test", "testing"):
            if self.jwt_secret == DEFAULT_DEV_JWT_SECRET:
                raise ValueError(
                    "JWT_SECRET must be set to a non-default value when ENVIRONMENT is not development."
                )
            if "*" in self.cors_allow_origins:
                raise ValueError(
                    "CORS_ALLOW_ORIGINS must list explicit origins (never '*') outside development."
                )
            if self.allow_local_provider:
                raise ValueError(
                    "ALLOW_LOCAL_PROVIDER must be false outside development (SSRF hardening)."
                )
            # Stack traces and internal state must never reach a public client.
            object.__setattr__(self, "debug", False)


# Global singleton settings
settings = Settings()
