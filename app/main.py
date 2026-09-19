"""
AgentFlow Core FastAPI Application.
Entrypoint for the AgentFlow AI Orchestration, Verification, and Risk Engine.
"""

from __future__ import annotations
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from app.config.settings import settings
from app.api.routes import (
    auth_router,
    agents_router,
    requests_router,
    marketplace_router,
    providers_router,
    transactions_router,
    approvals_router,
    verification_router,
    monitoring_router,
)

app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description=(
        "AgentFlow is an autonomous agentic payment and API-service orchestration platform "
        "built on LangGraph, multi-layer verification, deterministic risk controls, and Monad."
    ),
    debug=settings.debug,
)

# Strict CORS: an explicit origin allowlist. "*" with credentials is invalid per the CORS spec
# and is refused outside development by Settings.model_post_init.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allow_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

# Include v1 routes
v1_prefix = settings.api_v1_prefix
app.include_router(auth_router, prefix=v1_prefix)
app.include_router(agents_router, prefix=v1_prefix)
app.include_router(requests_router, prefix=v1_prefix)
app.include_router(marketplace_router, prefix=v1_prefix)
app.include_router(providers_router, prefix=v1_prefix)
app.include_router(transactions_router, prefix=v1_prefix)
app.include_router(approvals_router, prefix=v1_prefix)
app.include_router(verification_router, prefix=v1_prefix)
app.include_router(monitoring_router, prefix=v1_prefix)


@app.get("/health", status_code=status.HTTP_200_OK, tags=["Health"])
async def health_check():
    return {
        "status": "ok",
        "app": settings.app_name,
        "environment": settings.environment,
        "chain_id": settings.chain_id,
        "default_currency": settings.default_currency,
        "use_mock_payments": settings.use_mock_payments,
        "agent_service_url": settings.agent_service_url,
    }


@app.get("/v1/system/status", status_code=status.HTTP_200_OK, tags=["Health"])
async def system_status():
    """Reports whether the canonical agent service (the only signer) is reachable."""
    from app.services.agent_execution_client import AgentExecutionClient, AgentServiceError

    agent_service: dict = {"reachable": False}
    try:
        agent_service = {"reachable": True, **(await AgentExecutionClient().health())}
    except AgentServiceError as exc:
        agent_service = {"reachable": False, "error": str(exc)}

    return {
        "status": "ok",
        "environment": settings.environment,
        "chain_id": settings.chain_id,
        "use_mock_payments": settings.use_mock_payments,
        "agent_wallet": settings.agent_wallet_address,
        "agent_escrow": settings.escrow_address,
        "wallet_max_payment_mon": settings.wallet_max_payment_mon,
        "agent_service": agent_service,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
