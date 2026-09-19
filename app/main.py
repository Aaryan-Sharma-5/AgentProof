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

# Strict CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
