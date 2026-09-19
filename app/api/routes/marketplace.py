"""
Marketplace API Routes.
"""

from __future__ import annotations
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from app.models.domain import ApiRecord
from app.repositories.in_memory import store

router = APIRouter(prefix="/marketplace/apis", tags=["Marketplace"])


@router.get("", response_model=List[ApiRecord])
async def list_marketplace_apis(
    category: Optional[str] = Query(None, description="Filter by category"),
    active_only: bool = Query(True, description="Filter active only")
):
    results = []
    for api in store.apis.values():
        if active_only and (not api.is_active or api.is_deprecated):
            continue
        if category and api.category.lower() != category.lower():
            continue
        results.append(api)
    return results


@router.get("/{api_id}", response_model=ApiRecord)
async def get_marketplace_api(api_id: str):
    api = store.apis.get(api_id)
    if not api:
        raise HTTPException(status_code=404, detail=f"API '{api_id}' not found.")
    return api
