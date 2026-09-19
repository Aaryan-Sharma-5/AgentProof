"""
AgentFlow Configuration Settings
Centralized configuration management adhering to 12-factor application principles.
Preserves existing Monad / Web3 environment variables established by Teammate 3.
"""

from __future__ import annotations
import os
from typing import Dict, List, Optional
from pydantic import BaseModel, Field


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
    debug: bool = Field(default_factory=lambda: os.getenv("DEBUG", "true").lower() in ("true", "1", "yes"))
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

    # JWT / Auth Secret
    jwt_secret: str = Field(default_factory=lambda: os.getenv("JWT_SECRET", "agentflow-super-secret-key-change-in-prod"))
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


# Global singleton settings
settings = Settings()
