"""
SSRF (Server-Side Request Forgery) Protection Module.
Prevents internal network scanning, access to cloud metadata endpoints,
and non-HTTP(S) scheme exploitation.
"""

from __future__ import annotations
import ipaddress
import socket
from urllib.parse import urlparse
from typing import Tuple, Optional
from app.config.settings import settings


PRIVATE_IPV4_NETWORKS = [
    ipaddress.ip_network("0.0.0.0/8"),
    ipaddress.ip_network("10.0.0.0/8"),
    ipaddress.ip_network("127.0.0.0/8"),
    ipaddress.ip_network("169.254.0.0/16"), # Link-local / AWS / GCP metadata
    ipaddress.ip_network("172.16.0.0/12"),
    ipaddress.ip_network("192.168.0.0/16"),
    ipaddress.ip_network("224.0.0.0/4"),   # Multicast
    ipaddress.ip_network("240.0.0.0/4"),   # Reserved
]

PRIVATE_IPV6_NETWORKS = [
    ipaddress.ip_network("::1/128"),        # Loopback
    ipaddress.ip_network("::/128"),         # Unspecified
    ipaddress.ip_network("fe80::/10"),      # Link-local
    ipaddress.ip_network("fc00::/7"),       # Unique Local Address (ULA)
    ipaddress.ip_network("ff00::/8"),       # Multicast
    ipaddress.ip_network("2001:db8::/32"),  # Documentation
    ipaddress.ip_network("100::/64"),       # Discard prefix
]

CLOUD_METADATA_HOSTS = {
    "169.254.169.254",
    "::ffff:169.254.169.254",
    "metadata.google.internal",
    "instance-data",
    "fd00:ec2::254", # AWS IMDSv2 IPv6
}


def is_ip_private_or_reserved(ip: ipaddress.IPv4Address | ipaddress.IPv6Address) -> bool:
    """Checks if an IP is private, loopback, link-local, reserved, multicast, or unspecified."""
    if (
        ip.is_loopback
        or ip.is_private
        or ip.is_reserved
        or ip.is_link_local
        or ip.is_multicast
        or ip.is_unspecified
    ):
        return True

    if isinstance(ip, ipaddress.IPv6Address):
        if ip.ipv4_mapped:
            return is_ip_private_or_reserved(ip.ipv4_mapped)
        for net in PRIVATE_IPV6_NETWORKS:
            if ip in net:
                return True
    elif isinstance(ip, ipaddress.IPv4Address):
        for net in PRIVATE_IPV4_NETWORKS:
            if ip in net:
                return True
    return False


def validate_url_safe(
    url: str,
    allow_local_mock: bool = False,
    enforce_strict_https: Optional[bool] = None,
) -> Tuple[bool, Optional[str]]:
    """
    Validates that a URL is safe to execute by the API execution service.
    Returns (is_safe, error_reason).
    """
    if not url or not isinstance(url, str):
        return False, "URL is empty or invalid"

    try:
        parsed = urlparse(url)
    except Exception as e:
        return False, f"Malformed URL: {e}"

    scheme = parsed.scheme.lower()
    strict_https = (
        enforce_strict_https
        if enforce_strict_https is not None
        else settings.enforce_strict_https
    )

    if strict_https and scheme != "https":
        return False, f"Insecure scheme '{scheme}'. Strict HTTPS is required."

    if scheme not in ("http", "https"):
        return False, f"Forbidden scheme '{scheme}'. Only HTTP/HTTPS allowed."

    hostname = parsed.hostname
    if not hostname:
        return False, "Missing hostname in URL"

    hostname_lower = hostname.lower().strip("[]")

    # Block well-known cloud metadata endpoints
    if hostname_lower in CLOUD_METADATA_HOSTS:
        return False, f"Blocked request to cloud metadata host '{hostname}'."

    # In local testing/mocking mode, allow explicit localhost / 127.0.0.1 / ::1 if requested
    if allow_local_mock and (hostname_lower in ("localhost", "127.0.0.1", "::1")):
        return True, None

    # Check for direct IP address literal (supports IPv4, IPv6, integer, and hex formats)
    try:
        if hostname_lower.isdigit():
            ip = ipaddress.ip_address(int(hostname_lower))
        elif hostname_lower.startswith("0x") and len(hostname_lower) <= 10:
            ip = ipaddress.ip_address(int(hostname_lower, 16))
        else:
            ip = ipaddress.ip_address(hostname_lower)
        if is_ip_private_or_reserved(ip):
            return False, f"Blocked access to private or reserved IP address '{ip}'."
    except ValueError:
        # Hostname is a domain name, not an IP literal. Resolve DNS to check target IP.
        try:
            # We resolve the host to detect internal DNS rebinding / private resolutions
            addr_info = socket.getaddrinfo(hostname, None)
            for item in addr_info:
                sockaddr = item[4]
                ip_str = sockaddr[0]
                resolved_ip = ipaddress.ip_address(ip_str)
                if not allow_local_mock and is_ip_private_or_reserved(resolved_ip):
                    return False, f"Domain '{hostname}' resolves to private IP '{resolved_ip}'."
        except socket.gaierror:
            # DNS resolution failed or offline; if not strictly required, allow domain or flag
            pass

    return True, None
