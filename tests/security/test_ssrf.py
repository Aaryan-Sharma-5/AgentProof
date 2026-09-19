"""
Security Tests: SSRF Defenses & IP Boundary Enforcement.
"""

import pytest
from app.security.ssrf import validate_url_safe


def test_ssrf_blocks_all_forbidden_targets():
    forbidden = [
        "http://localhost:3000",
        "http://127.0.0.1:5000",
        "http://0.0.0.0:8080",
        "http://10.1.2.3/secret",
        "http://172.16.5.4/admin",
        "http://192.168.0.100/internal",
        "http://169.254.169.254/metadata",
        "http://metadata.google.internal/computeMetadata",
        "ftp://ftp.example.com/file",
        "file:///etc/hosts",
    ]

    for url in forbidden:
        safe, err = validate_url_safe(url, allow_local_mock=False, enforce_strict_https=False)
        assert safe is False, f"Expected {url} to be blocked by SSRF defense!"


def test_ssrf_strict_https_mode():
    safe, err = validate_url_safe("http://api.example.com/data", enforce_strict_https=True)
    assert safe is False
    assert "Strict HTTPS is required" in err


def test_ssrf_valid_public_endpoint():
    safe, err = validate_url_safe("https://api.cryptofeed.io/price", enforce_strict_https=True)
    assert safe is True
    assert err is None


def test_ssrf_blocks_ipv6_and_mapped_addresses():
    ipv6_forbidden = [
        "http://[::1]/secret",
        "http://[::ffff:127.0.0.1]/admin",
        "http://[::ffff:169.254.169.254]/metadata",
        "http://[::ffff:10.0.0.1]/internal",
        "http://[fe80::1]/link-local",
        "http://[fc00::1]/unique-local",
        "http://2130706433/", # integer format of 127.0.0.1
    ]
    for url in ipv6_forbidden:
        safe, err = validate_url_safe(url, allow_local_mock=False, enforce_strict_https=False)
        assert safe is False, f"Expected {url} to be blocked by SSRF defense! Got: {err}"
