"""
Canonical Agent Execution Client.

HTTP client for the TypeScript canonical agent service (agents/service.ts), which is the
only process permitted to hold the economic signer.

This client deliberately performs NO Web3 work:
  - it never loads an agent, verifier or deployer private key
  - it never signs anything
  - it never computes a resultHash used for settlement
  - it never calls AgentWallet or AgentEscrow

It orchestrates. The TypeScript service spends, proves and earns.
"""

from __future__ import annotations
import asyncio
from typing import Any, Dict, Optional

from app.config.settings import settings


class AgentServiceError(RuntimeError):
    """Raised when the canonical agent service is unreachable or returns an error."""


class AgentExecutionClient:
    """Thin async client over the canonical agent service HTTP boundary."""

    def __init__(
        self,
        base_url: Optional[str] = None,
        timeout_seconds: Optional[float] = None,
        token: Optional[str] = None,
    ):
        self.base_url = (base_url or settings.agent_service_url).rstrip("/")
        self.timeout_seconds = timeout_seconds or settings.agent_service_timeout_seconds
        # Shared bearer token for the agent service's mutating route. Needed when that service is
        # publicly reachable (free-tier hosting offers no private networking). This is an access
        # credential, not an economic key: it authorizes asking the signer to run, nothing more.
        self.token = token if token is not None else (settings.agent_service_token or "")

    def _auth_headers(self) -> Dict[str, str]:
        return {"Authorization": f"Bearer {self.token}"} if self.token else {}

    # --- internal transport -------------------------------------------------

    async def _request(self, method: str, path: str, json_body: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        url = f"{self.base_url}{path}"
        try:
            try:
                import httpx
                async with httpx.AsyncClient(timeout=self.timeout_seconds) as client:
                    response = await client.request(
                        method, url, json=json_body, headers=self._auth_headers() or None
                    )
                if response.status_code == 401:
                    raise AgentServiceError(
                        "Canonical agent service rejected the request: AGENT_SERVICE_TOKEN is missing or wrong."
                    )
                if response.status_code >= 500:
                    raise AgentServiceError(
                        f"Canonical agent service returned {response.status_code} for {path}: {response.text[:300]}"
                    )
                return response.json()
            except ImportError:
                import urllib.request
                import urllib.error
                import json as _json
                req = urllib.request.Request(url, method=method)
                req.add_header("Content-Type", "application/json")
                for header_name, header_value in self._auth_headers().items():
                    req.add_header(header_name, header_value)
                data_bytes = _json.dumps(json_body).encode("utf-8") if json_body else None
                loop = asyncio.get_event_loop()
                def _do():
                    try:
                        with urllib.request.urlopen(req, data=data_bytes, timeout=self.timeout_seconds) as resp:
                            return resp.getcode(), resp.read().decode("utf-8")
                    except urllib.error.HTTPError as http_err:
                        # urlopen raises on 4xx; surface the status so 401 is reported precisely.
                        return http_err.code, http_err.read().decode("utf-8", errors="replace")
                code, text = await loop.run_in_executor(None, _do)
                if code == 401:
                    raise AgentServiceError(
                        "Canonical agent service rejected the request: AGENT_SERVICE_TOKEN is missing or wrong."
                    )
                if code >= 500:
                    raise AgentServiceError(f"Canonical agent service returned {code} for {path}: {text[:300]}")
                return _json.loads(text)
        except AgentServiceError:
            raise
        except Exception as exc:  # network / DNS / connect errors
            raise AgentServiceError(f"Canonical agent service unreachable at {url}: {exc}") from exc

    # --- public API ---------------------------------------------------------

    async def health(self) -> Dict[str, Any]:
        """GET /health - reports chain id, agent address and the deployed contract addresses."""
        return await self._request("GET", "/health")

    async def start_run(
        self,
        request_id: str,
        service_type: str = "competitor_pricing",
        reward_mon: Optional[float] = None,
        spending_limit_mon: Optional[float] = None,
    ) -> Dict[str, Any]:
        """
        POST /run - dispatches a canonical execution.

        Returns the initial run record (status 'queued'). The on-chain work happens inside the
        agent service; this call only asks it to begin.
        """
        body: Dict[str, Any] = {"requestId": request_id, "serviceType": service_type}
        if reward_mon is not None:
            body["rewardMon"] = _format_mon(reward_mon)
        if spending_limit_mon is not None:
            body["spendingLimitMon"] = _format_mon(spending_limit_mon)
        return await self._request("POST", "/run", json_body=body)

    async def get_run(self, run_id: str) -> Dict[str, Any]:
        """GET /run/:id - current execution state, including real transaction hashes."""
        return await self._request("GET", f"/run/{run_id}")

    async def wait_for_run(
        self,
        run_id: str,
        poll_interval_seconds: float = 1.5,
        max_wait_seconds: Optional[float] = None,
    ) -> Dict[str, Any]:
        """
        Polls GET /run/:id until the run reaches a terminal state ('settled' or 'failed').

        On timeout the last observed record is returned with a timeout error attached, rather than
        raising, so the orchestration layer can still record whatever real transactions occurred.
        """
        deadline_budget = max_wait_seconds or settings.agent_service_max_wait_seconds
        elapsed = 0.0
        record: Dict[str, Any] = {}

        while elapsed < deadline_budget:
            record = await self.get_run(run_id)
            status = record.get("status")
            if status in ("settled", "failed"):
                return record
            await asyncio.sleep(poll_interval_seconds)
            elapsed += poll_interval_seconds

        record = record or {"runId": run_id, "status": "running"}
        record["error"] = record.get("error") or (
            f"Timed out after {deadline_budget}s waiting for canonical execution to reach a terminal state."
        )
        return record


def _format_mon(value: float) -> str:
    """
    Formats a MON amount as an exact plain decimal string.

    Goes through Decimal(str(value)) rather than float formatting: f"{0.05:.18f}" yields
    "0.050000000000000003", which would lock a wrong reward into escrow.
    """
    from decimal import Decimal

    return format(Decimal(str(value)).normalize(), "f")
