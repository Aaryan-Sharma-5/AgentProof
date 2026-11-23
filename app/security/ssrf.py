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


def _parse_numeric_ipv4(host: str) -> Optional[ipaddress.IPv4Address]:
    """
    Parses IPv4 address representations supporting decimal, octal, hex octets,
    as well as 1-4 part dotted notation (BSD/POSIX socket convention).
    """
    parts = host.split(".")
    if not (1 <= len(parts) <= 4):
        return None
    try:
        nums = []
        for p in parts:
            if not p:
                return None
            if p.lower().startswith("0x"):
                n = int(p, 16)
            elif len(p) > 1 and p.startswith("0") and p.isdigit():
                # Octal representation (leading zeros)
                n = int(p, 8)
            else:
                n = int(p, 10)
            nums.append(n)

        if len(nums) == 4:
            if any(n < 0 or n > 255 for n in nums):
                return None
            val = (nums[0] << 24) | (nums[1] << 16) | (nums[2] << 8) | nums[3]
        elif len(nums) == 3:
            if nums[0] < 0 or nums[0] > 255 or nums[1] < 0 or nums[1] > 255 or nums[2] < 0 or nums[2] > 0xFFFF:
                return None
            val = (nums[0] << 24) | (nums[1] << 16) | nums[2]
        elif len(nums) == 2:
            if nums[0] < 0 or nums[0] > 255 or nums[1] < 0 or nums[1] > 0xFFFFFF:
                return None
            val = (nums[0] << 24) | nums[1]
        elif len(nums) == 1:
            if nums[0] < 0 or nums[0] > 0xFFFFFFFF:
                return None
            val = nums[0]
        else:
            return None
        return ipaddress.IPv4Address(val)
    except (ValueError, OverflowError):
        return None


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

    # Normalize hostname by stripping IPv6 brackets and trailing dot (FQDN canonicalization)
    hostname_clean = hostname.lower().strip("[]").rstrip(".")

    # Block well-known cloud metadata endpoints
    if hostname_clean in CLOUD_METADATA_HOSTS:
        return False, f"Blocked request to cloud metadata host '{hostname}'."

    # In local testing/mocking mode, allow explicit localhost / 127.0.0.1 / ::1 if requested
    if allow_local_mock and (hostname_clean in ("localhost", "127.0.0.1", "::1")):
        return True, None

    # Check for direct IP address literal (supports IPv4 numeric notations and IPv6 formats)
    parsed_ip = _parse_numeric_ipv4(hostname_clean)
    if parsed_ip is not None:
        if is_ip_private_or_reserved(parsed_ip):
            return False, f"Blocked access to private or reserved IP address '{parsed_ip}'."
    else:
        try:
            ip = ipaddress.ip_address(hostname_clean)
            if is_ip_private_or_reserved(ip):
                return False, f"Blocked access to private or reserved IP address '{ip}'."
        except ValueError:
            # Hostname is a domain name, not an IP literal. Resolve DNS to check target IP.
            try:
                # We resolve the host to detect internal DNS rebinding / private resolutions
                addr_info = socket.getaddrinfo(hostname_clean, None)
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
