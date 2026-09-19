from app.api.routes.auth import router as auth_router
from app.api.routes.agents import router as agents_router
from app.api.routes.requests import router as requests_router
from app.api.routes.marketplace import router as marketplace_router
from app.api.routes.providers import router as providers_router
from app.api.routes.transactions import router as transactions_router
from app.api.routes.approvals import router as approvals_router
from app.api.routes.verification import router as verification_router
from app.api.routes.monitoring import router as monitoring_router

__all__ = [
    "auth_router",
    "agents_router",
    "requests_router",
    "marketplace_router",
    "providers_router",
    "transactions_router",
    "approvals_router",
    "verification_router",
    "monitoring_router",
]
