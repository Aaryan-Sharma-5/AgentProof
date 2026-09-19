"""
API Execution Service.
Safely and deterministically executes external API calls.
Enforces SSRF defense, timeout boundaries, payload size limits, and backoff retries.
"""

from __future__ import annotations
import asyncio
import json
from typing import Dict, Any, Optional, Tuple
import urllib.request
import urllib.error
from urllib.parse import urlparse
from app.models.domain import ApiRecord, ApiExecutionStatus
from app.security.ssrf import validate_url_safe
from app.config.settings import settings


class ApiExecutionResponse:
    def __init__(
        self,
        status: ApiExecutionStatus,
        http_status: int,
        data: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None,
        error_message: Optional[str] = None,
        elapsed_ms: float = 0.0,
        raw_body: Optional[str] = None,
    ):
        self.status = status
        self.http_status = http_status
        self.data = data or {}
        self.headers = headers or {}
        self.error_message = error_message
        self.elapsed_ms = elapsed_ms
        self.raw_body = raw_body

    @property
    def is_success(self) -> bool:
        return self.status in (
            ApiExecutionStatus.RESPONSE_RECEIVED,
            ApiExecutionStatus.RESPONSE_VALIDATED,
        ) and (200 <= self.http_status < 300)

    @property
    def is_402_payment_required(self) -> bool:
        return self.http_status == 402


class SafeRedirectHandler(urllib.request.HTTPRedirectHandler):
    """
    Intercepts and validates every redirect target against SSRF protection.
    Enforces maximum redirect count. Strictly implements Section 12 & 42.
    """

    def __init__(self, allow_local_mock: bool, max_redirects: int = 2):
        super().__init__()
        self.allow_local_mock = allow_local_mock
        self.max_redirects = max_redirects
        self.redirects_count = 0

    def redirect_request(self, req, fp, code, msg, headers, newurl):
        self.redirects_count += 1
        if self.redirects_count > self.max_redirects:
            raise urllib.error.HTTPError(
                req.full_url, code, f"Exceeded maximum allowed redirects ({self.max_redirects})", headers, fp
            )
        is_safe, err = validate_url_safe(
            newurl,
            allow_local_mock=self.allow_local_mock,
            enforce_strict_https=settings.enforce_strict_https
        )
        if not is_safe:
            raise urllib.error.HTTPError(
                newurl, 403, f"SSRF Block on redirect: {err}", headers, fp
            )
        return super().redirect_request(req, fp, code, msg, headers, newurl)


class ApiExecutionService:
    """Executes validated marketplace APIs under strict security controls."""

    def __init__(self, allow_local_mock: bool = True):
        self.allow_local_mock = allow_local_mock
        self.max_retries = settings.max_api_retries
        self.max_bytes = settings.max_response_size_bytes

    async def execute(
        self,
        api: ApiRecord,
        payment_tx_hash: Optional[str] = None,
        custom_headers: Optional[Dict[str, str]] = None,
    ) -> ApiExecutionResponse:
        """Asynchronously executes an API request with retry logic for transient errors."""
        url = api.endpoint
        method = api.method.upper()
        timeout_seconds = min(api.timeout_ms / 1000.0, settings.max_api_timeout_seconds)

        # 0. Method Validation (Section 12)
        valid_methods = ("GET", "POST", "PUT", "DELETE", "PATCH")
        if method not in valid_methods:
            return ApiExecutionResponse(
                status=ApiExecutionStatus.SECURITY_BLOCKED,
                http_status=400,
                error_message=f"Disallowed HTTP method '{method}'. Allowed: {valid_methods}"
            )

        # 1. SSRF Safety Check (Initial URL)
        is_safe, ssrf_error = validate_url_safe(
            url,
            allow_local_mock=self.allow_local_mock,
            enforce_strict_https=settings.enforce_strict_https
        )
        if not is_safe:
            return ApiExecutionResponse(
                status=ApiExecutionStatus.SECURITY_BLOCKED,
                http_status=403,
                error_message=f"SSRF Block: {ssrf_error}"
            )

        headers = {
            "User-Agent": "AgentFlow-Core/1.0",
            "Accept": "application/json",
        }
        if payment_tx_hash:
            headers["X-Payment-Tx"] = payment_tx_hash
        if custom_headers:
            headers.update(custom_headers)

        # Retry loop for transient failures (timeouts, 502, 503, 504)
        attempts = 0
        last_response: Optional[ApiExecutionResponse] = None

        while attempts <= self.max_retries:
            attempts += 1
            start_time = asyncio.get_event_loop().time()

            try:
                # Perform HTTP request using run_in_executor
                response = await asyncio.get_event_loop().run_in_executor(
                    None,
                    self._make_request,
                    url,
                    method,
                    headers,
                    timeout_seconds
                )
                elapsed_ms = (asyncio.get_event_loop().time() - start_time) * 1000.0
                response.elapsed_ms = elapsed_ms
                return response

            except urllib.error.HTTPError as he:
                elapsed_ms = (asyncio.get_event_loop().time() - start_time) * 1000.0
                status_code = he.code

                # Check if this was an SSRF block from our SafeRedirectHandler
                if "SSRF Block" in str(he.reason) or "SSRF Block" in str(he):
                    return ApiExecutionResponse(
                        status=ApiExecutionStatus.SECURITY_BLOCKED,
                        http_status=403,
                        elapsed_ms=elapsed_ms,
                        error_message=f"SSRF Block: {he.reason}"
                    )

                # Read error body up to max_bytes
                error_body = ""
                try:
                    raw = he.read(self.max_bytes).decode("utf-8", errors="replace")
                    error_body = raw
                    parsed_json = json.loads(raw) if raw else {}
                except Exception:
                    parsed_json = {}

                # 402 Payment Required: Never retry automatically, return immediately
                if status_code == 402:
                    return ApiExecutionResponse(
                        status=ApiExecutionStatus.RESPONSE_RECEIVED,
                        http_status=402,
                        data=parsed_json,
                        elapsed_ms=elapsed_ms,
                        raw_body=error_body,
                        error_message="Payment Required (HTTP 402)"
                    )

                # Transient errors: 502, 503, 504 -> retry with backoff
                if status_code in (502, 503, 504) and attempts <= self.max_retries:
                    await asyncio.sleep(0.5 * (2 ** (attempts - 1)))
                    continue

                return ApiExecutionResponse(
                    status=ApiExecutionStatus.HTTP_ERROR,
                    http_status=status_code,
                    data=parsed_json,
                    elapsed_ms=elapsed_ms,
                    raw_body=error_body,
                    error_message=f"HTTP Error {status_code}: {he.reason}"
                )

            except (urllib.error.URLError, TimeoutError) as ue:
                elapsed_ms = (asyncio.get_event_loop().time() - start_time) * 1000.0
                is_timeout = isinstance(ue, TimeoutError) or "timed out" in str(ue).lower()
                status = ApiExecutionStatus.TIMEOUT if is_timeout else ApiExecutionStatus.HTTP_ERROR

                if attempts <= self.max_retries:
                    await asyncio.sleep(0.5 * (2 ** (attempts - 1)))
                    continue

                return ApiExecutionResponse(
                    status=status,
                    http_status=504 if is_timeout else 500,
                    elapsed_ms=elapsed_ms,
                    error_message=f"Network error: {str(ue)}"
                )

            except Exception as e:
                elapsed_ms = (asyncio.get_event_loop().time() - start_time) * 1000.0
                return ApiExecutionResponse(
                    status=ApiExecutionStatus.INVALID_RESPONSE,
                    http_status=500,
                    elapsed_ms=elapsed_ms,
                    error_message=f"Execution error: {str(e)}"
                )

        return last_response or ApiExecutionResponse(
            status=ApiExecutionStatus.TIMEOUT,
            http_status=504,
            error_message="Max retries exhausted"
        )

    def _make_request(
        self,
        url: str,
        method: str,
        headers: Dict[str, str],
        timeout: float,
    ) -> ApiExecutionResponse:
        """Synchronous HTTP call executed in worker thread with redirect and content-type controls."""
        req = urllib.request.Request(url, headers=headers, method=method)
        opener = urllib.request.build_opener(
            SafeRedirectHandler(allow_local_mock=self.allow_local_mock, max_redirects=2)
        )
        with opener.open(req, timeout=timeout) as resp:
            http_status = resp.getcode()
            resp_headers = dict(resp.headers)
            content_type = resp_headers.get("Content-Type", "")

            # Content type check (Section 12 requirement): reject HTML error pages
            ct_lower = content_type.lower()
            if "text/html" in ct_lower:
                return ApiExecutionResponse(
                    status=ApiExecutionStatus.SCHEMA_ERROR,
                    http_status=http_status,
                    headers=resp_headers,
                    error_message=f"Unsupported Content-Type '{content_type}'. Expected JSON response."
                )

            # Read bounded bytes to protect memory
            raw_bytes = resp.read(self.max_bytes + 1)
            if len(raw_bytes) > self.max_bytes:
                return ApiExecutionResponse(
                    status=ApiExecutionStatus.SECURITY_BLOCKED,
                    http_status=http_status,
                    headers=resp_headers,
                    error_message=f"Response payload exceeds maximum allowed size of {self.max_bytes} bytes"
                )

            raw_text = raw_bytes.decode("utf-8", errors="replace")
            try:
                data = json.loads(raw_text) if raw_text else {}
            except json.JSONDecodeError as je:
                return ApiExecutionResponse(
                    status=ApiExecutionStatus.INVALID_RESPONSE,
                    http_status=http_status,
                    headers=resp_headers,
                    raw_body=raw_text,
                    error_message=f"Invalid JSON response: {str(je)}"
                )

            return ApiExecutionResponse(
                status=ApiExecutionStatus.RESPONSE_VALIDATED,
                http_status=http_status,
                headers=resp_headers,
                data=data,
                raw_body=raw_text
            )
