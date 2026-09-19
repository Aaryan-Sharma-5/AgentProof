"""
Agent Management API Routes.
"""

from __future__ import annotations
from typing import List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.models.domain import Agent, AgentPolicy
from app.repositories.in_memory import store

router = APIRouter(prefix="/agents", tags=["Agents"])


class UpdatePolicyRequest(BaseModel):
    max_transaction_mon: Optional[float] = None
    daily_limit_mon: Optional[float] = None
    auto_approve: Optional[bool] = None
    allowed_categories: Optional[List[str]] = None
    require_human_above_mon: Optional[float] = None
    blocked_providers: Optional[List[str]] = None


@router.get("", response_model=List[Agent])
async def list_agents():
    return list(store.agents.values())


@router.get("/{agent_id}", response_model=Agent)
async def get_agent(agent_id: str):
    agent = store.agents.get(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found.")
    return agent


@router.get("/{agent_id}/policy", response_model=AgentPolicy)
async def get_agent_policy(agent_id: str):
    policy = store.policies.get(agent_id)
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found for agent.")
    return policy


@router.put("/{agent_id}/policy", response_model=AgentPolicy)
async def update_agent_policy(agent_id: str, req: UpdatePolicyRequest):
    policy = store.policies.get(agent_id)
    if not policy:
        policy = AgentPolicy(agent_id=agent_id)
        store.policies[agent_id] = policy

    if req.max_transaction_mon is not None:
        policy.max_transaction_mon = req.max_transaction_mon
    if req.daily_limit_mon is not None:
        policy.daily_limit_mon = req.daily_limit_mon
    if req.auto_approve is not None:
        policy.auto_approve = req.auto_approve
    if req.allowed_categories is not None:
        policy.allowed_categories = req.allowed_categories
    if req.require_human_above_mon is not None:
        policy.require_human_above_mon = req.require_human_above_mon
    if req.blocked_providers is not None:
        policy.blocked_providers = req.blocked_providers

    return policy
