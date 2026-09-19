"""
Authentication API Routes.
"""

from __future__ import annotations
import uuid
from typing import Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from app.models.domain import User
from app.repositories.in_memory import store

router = APIRouter(prefix="/auth", tags=["Auth"])


class RegisterRequest(BaseModel):
    username: str
    email: str
    wallet_address: Optional[str] = None


class LoginRequest(BaseModel):
    username: str
    password: Optional[str] = None


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: User


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(req: RegisterRequest):
    for u in store.users.values():
        if u.username.lower() == req.username.lower():
            raise HTTPException(status_code=400, detail="Username already taken.")

    user_id = f"usr_{uuid.uuid4().hex[:8]}"
    user = User(
        id=user_id,
        username=req.username,
        email=req.email,
        wallet_address=req.wallet_address
    )
    store.users[user_id] = user

    return AuthResponse(
        access_token=f"jwt_{user_id}",
        user=user
    )


@router.post("/login", response_model=AuthResponse)
async def login(req: LoginRequest):
    for u in store.users.values():
        if u.username.lower() == req.username.lower():
            return AuthResponse(
                access_token=f"jwt_{u.id}",
                user=u
            )
    raise HTTPException(status_code=401, detail="Invalid username or credentials.")
