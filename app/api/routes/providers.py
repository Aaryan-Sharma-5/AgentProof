"""
Provider Management API Routes.
"""

from __future__ import annotations
from typing import List, Optional
from fastapi import APIRouter, HTTPException
from app.models.domain import Provider, ApiRecord
from app.repositories.in_memory import store

router = APIRouter(prefix="/providers", tags=["Providers"])


@router.get("", response_model=List[Provider])
async def list_providers():
    return list(store.providers.values())


@router.get("/apis", response_model=List[ApiRecord])
async def list_all_provider_apis():
    """Lists all APIs cataloged across all providers (Section 36)."""
    return list(store.apis.values())


@router.get("/{provider_id}", response_model=Provider)
async def get_provider(provider_id: str):
    provider = store.providers.get(provider_id)
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found.")
    return provider


@router.get("/{provider_id}/apis", response_model=List[ApiRecord])
async def get_provider_apis(provider_id: str):
    return [api for api in store.apis.values() if api.provider_id == provider_id]
