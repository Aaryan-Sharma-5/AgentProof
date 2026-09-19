"""
Unit Tests for API Execution Service & SSRF Protection.
"""

import pytest
import asyncio
from app.services.api_execution_service import ApiExecutionService
from app.models.domain import ApiRecord, ApiExecutionStatus


@pytest.fixture
def executor():
    return ApiExecutionService(allow_local_mock=False)


def test_ssrf_blocks_private_ips(executor):
    private_endpoints = [
        "http://127.0.0.1:8000/data",
        "http://localhost:8000/secret",
        "http://10.0.0.5/api",
        "http://192.168.1.1/admin",
        "http://172.16.0.1/status",
        "http://169.254.169.254/latest/meta-data",
        "http://metadata.google.internal/computeMetadata/v1",
        "file:///etc/passwd",
    ]

    for ep in private_endpoints:
        api = ApiRecord(
            id="test_api",
            provider_id="p1",
            name="Test",
            category="test",
            price_mon=0.01,
            endpoint=ep
        )
        res = asyncio.run(executor.execute(api))
        assert res.status == ApiExecutionStatus.SECURITY_BLOCKED
        assert "SSRF Block" in res.error_message or "Forbidden scheme" in res.error_message


def test_allow_local_mock_flag():
    local_executor = ApiExecutionService(allow_local_mock=True)
    api = ApiRecord(
        id="local_api",
        provider_id="p1",
        name="Local",
        category="test",
        price_mon=0.01,
        endpoint="http://127.0.0.1:9999/dummy"
    )
    # SSRF check passes because allow_local_mock is True; will get connection error instead of SECURITY_BLOCKED
    res = asyncio.run(local_executor.execute(api))
    assert res.status != ApiExecutionStatus.SECURITY_BLOCKED


def test_disallowed_http_method(executor):
    api = ApiRecord(
        id="bad_method_api",
        provider_id="p1",
        name="Bad Method",
        category="test",
        price_mon=0.01,
        endpoint="https://api.example.com/test",
        method="INVALID_METHOD"
    )
    res = asyncio.run(executor.execute(api))
    assert res.status == ApiExecutionStatus.SECURITY_BLOCKED
    assert "Disallowed HTTP method" in res.error_message
