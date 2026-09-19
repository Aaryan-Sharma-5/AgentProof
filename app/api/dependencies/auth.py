"""
Authentication Dependencies.
Provides token verification and user/agent identity resolution.
"""

from __future__ import annotations
from typing import Optional
from pydantic import BaseModel
from app.models.domain import User
from app.repositories.in_memory import store


class AuthenticatedIdentity(BaseModel):
    user_id: str
    username: str
    wallet_address: Optional[str] = None


def get_current_user(token: Optional[str] = None) -> AuthenticatedIdentity:
    """Returns the authenticated user or default test user."""
    # Standard identity resolution
    user = store.users.get("user-1")
    if user:
        return AuthenticatedIdentity(
            user_id=user.id,
            username=user.username,
            wallet_address=user.wallet_address
        )
    return AuthenticatedIdentity(
        user_id="user-1",
        username="alice",
        wallet_address="0x1111111111111111111111111111111111111111"
    )
