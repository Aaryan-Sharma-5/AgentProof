"""
AgentFlow In-Memory ASGI Test Client.
Provides a lightweight, zero-dependency HTTP client for FastAPI/Starlette applications
that executes requests in-memory via ASGI 3.0 without requiring `httpx`.
"""

from __future__ import annotations
import asyncio
import concurrent.futures
import json
import urllib.parse
from typing import Any, Dict, Optional, Union


class InMemoryResponse:
    """Represents an HTTP response from InMemoryTestClient."""

    def __init__(self, status_code: int, headers: list[tuple[bytes, bytes]], content: bytes):
        self.status_code = status_code
        self.raw_headers = headers
        self.headers: Dict[str, str] = {
            k.decode("latin1").lower() if isinstance(k, bytes) else str(k).lower():
            v.decode("latin1") if isinstance(v, bytes) else str(v)
            for k, v in headers
        }
        self.content = content

    @property
    def text(self) -> str:
        """Returns the decoded string response."""
        return self.content.decode("utf-8", errors="replace")

    def json(self) -> Any:
        """Parses response content as JSON."""
        if not self.content:
            return None
        return json.loads(self.content.decode("utf-8"))

    def raise_for_status(self) -> None:
        """Raises RuntimeError if status code indicates HTTP error."""
        if self.status_code >= 400:
            raise RuntimeError(f"HTTP Error {self.status_code}: {self.text}")

    def __repr__(self) -> str:
        return f"<InMemoryResponse [{self.status_code}]>"


class InMemoryTestClient:
    """
    Lightweight in-memory test client for ASGI applications (FastAPI / Starlette).
    Allows making GET, POST, PUT, DELETE, PATCH requests synchronously
    without requiring the external httpx library.
    """

    def __init__(self, app: Any, base_url: str = "http://testserver"):
        self.app = app
        self.base_url = base_url.rstrip("/")

    def __enter__(self) -> InMemoryTestClient:
        return self

    def __exit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
        pass

    def request(
        self,
        method: str,
        url: str,
        *,
        params: Optional[Dict[str, Any]] = None,
        json: Optional[Any] = None,
        data: Optional[Union[bytes, str, Dict[str, Any]]] = None,
        content: Optional[Union[bytes, str]] = None,
        headers: Optional[Dict[str, str]] = None,
    ) -> InMemoryResponse:
        """Executes a synchronous request against the in-memory ASGI application."""
        if content is not None and data is None:
            data = content

        coro = self._request_async(
            method=method,
            url=url,
            params=params,
            json_data=json,
            data=data,
            headers=headers
        )

        try:
            loop = asyncio.get_running_loop()
        except RuntimeError:
            loop = None

        if loop is not None and loop.is_running():
            # Already inside an event loop (e.g. within an async test)
            with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
                return pool.submit(asyncio.run, coro).result()
        else:
            return asyncio.run(coro)

    async def _request_async(
        self,
        method: str,
        url: str,
        *,
        params: Optional[Dict[str, Any]] = None,
        json_data: Optional[Any] = None,
        data: Optional[Union[bytes, str, Dict[str, Any]]] = None,
        headers: Optional[Dict[str, str]] = None,
    ) -> InMemoryResponse:
        """Internal coroutine that invokes the ASGI application interface."""
        parsed = urllib.parse.urlparse(url)
        path = parsed.path or "/"
        query = parsed.query or ""

        if params:
            encoded_params = urllib.parse.urlencode(params, doseq=True)
            query = f"{query}&{encoded_params}" if query else encoded_params

        body = b""
        req_headers: Dict[str, str] = {}
        if headers:
            for k, v in headers.items():
                req_headers[k.lower()] = str(v)

        if json_data is not None:
            body = json.dumps(json_data).encode("utf-8")
            req_headers["content-type"] = "application/json"
        elif data is not None:
            if isinstance(data, bytes):
                body = data
            elif isinstance(data, str):
                body = data.encode("utf-8")
            elif isinstance(data, dict):
                body = urllib.parse.urlencode(data).encode("utf-8")
                req_headers["content-type"] = "application/x-www-form-urlencoded"

        req_headers["content-length"] = str(len(body))
        req_headers.setdefault("host", "testserver")

        asgi_headers = [
            (k.encode("latin1"), v.encode("latin1"))
            for k, v in req_headers.items()
        ]

        scope = {
            "type": "http",
            "asgi": {"version": "3.0", "spec_version": "2.1"},
            "http_version": "1.1",
            "method": method.upper(),
            "scheme": "http",
            "path": path,
            "raw_path": path.encode("ascii"),
            "query_string": query.encode("ascii"),
            "headers": asgi_headers,
            "client": ("127.0.0.1", 50000),
            "server": ("testserver", 80),
        }

        sent = False

        async def receive() -> Dict[str, Any]:
            nonlocal sent
            if not sent:
                sent = True
                return {"type": "http.request", "body": body, "more_body": False}
            return {"type": "http.request", "body": b"", "more_body": False}

        status_code = 500
        resp_headers: list[tuple[bytes, bytes]] = []
        body_chunks: list[bytes] = []

        async def send(message: Dict[str, Any]) -> None:
            nonlocal status_code, resp_headers, body_chunks
            if message["type"] == "http.response.start":
                status_code = message["status"]
                resp_headers = message.get("headers", [])
            elif message["type"] == "http.response.body":
                body_chunks.append(message.get("body", b""))

        await self.app(scope, receive, send)
        return InMemoryResponse(status_code, resp_headers, b"".join(body_chunks))

    def get(self, url: str, **kwargs: Any) -> InMemoryResponse:
        return self.request("GET", url, **kwargs)

    def post(self, url: str, **kwargs: Any) -> InMemoryResponse:
        return self.request("POST", url, **kwargs)

    def put(self, url: str, **kwargs: Any) -> InMemoryResponse:
        return self.request("PUT", url, **kwargs)

    def delete(self, url: str, **kwargs: Any) -> InMemoryResponse:
        return self.request("DELETE", url, **kwargs)

    def patch(self, url: str, **kwargs: Any) -> InMemoryResponse:
        return self.request("PATCH", url, **kwargs)

    async def async_request(
        self,
        method: str,
        url: str,
        *,
        params: Optional[Dict[str, Any]] = None,
        json: Optional[Any] = None,
        data: Optional[Union[bytes, str, Dict[str, Any]]] = None,
        content: Optional[Union[bytes, str]] = None,
        headers: Optional[Dict[str, str]] = None,
    ) -> InMemoryResponse:
        """Executes an asynchronous request directly against the ASGI app without threads."""
        if content is not None and data is None:
            data = content
        return await self._request_async(
            method=method,
            url=url,
            params=params,
            json_data=json,
            data=data,
            headers=headers
        )

    async def async_get(self, url: str, **kwargs: Any) -> InMemoryResponse:
        return await self.async_request("GET", url, **kwargs)

    async def async_post(self, url: str, **kwargs: Any) -> InMemoryResponse:
        return await self.async_request("POST", url, **kwargs)

    async def async_put(self, url: str, **kwargs: Any) -> InMemoryResponse:
        return await self.async_request("PUT", url, **kwargs)

    async def async_delete(self, url: str, **kwargs: Any) -> InMemoryResponse:
        return await self.async_request("DELETE", url, **kwargs)

    async def async_patch(self, url: str, **kwargs: Any) -> InMemoryResponse:
        return await self.async_request("PATCH", url, **kwargs)
