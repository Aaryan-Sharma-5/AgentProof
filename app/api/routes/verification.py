"""
Verification Audit API Routes.
"""

from __future__ import annotations
from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException
from app.repositories.in_memory import store

router = APIRouter(prefix="/verification", tags=["Verification"])


@router.get("/{request_id}")
async def get_verification_report(request_id: str) -> Dict[str, Any]:
    req = store.requests.get(request_id)
    if not req:
        raise HTTPException(status_code=404, detail=f"Request '{request_id}' not found.")

    verif = req.get("verification_result")
    if not verif:
        return {
            "request_id": request_id,
            "status": "NOT_VERIFIED_YET",
            "message": "No verification result has been recorded for this request."
        }

    return {
        "request_id": request_id,
        "verification_result": verif,
        "selected_api": req.get("selected_api"),
        "blockchain_tx_hash": req.get("blockchain_tx_hash"),
        "final_status": req.get("final_status")
    }
