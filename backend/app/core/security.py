import ipaddress
import os
import re
import socket
import uuid
from urllib.parse import urlparse

ALLOWED_SCHEMES = {"http", "https"}
MAX_URL_LEN = 2048


NAT64_PREFIX = ipaddress.IPv6Network("64:ff9b::/96")


def _is_blocked_ip(ip_obj: ipaddress.IPv4Address | ipaddress.IPv6Address) -> bool:
    # Handle RFC 6052 NAT64/DNS64 prefix (64:ff9b::/96)
    if isinstance(ip_obj, ipaddress.IPv6Address) and ip_obj in NAT64_PREFIX:
        # Extract the embedded IPv4 address (last 32 bits) and check if that IPv4 is blocked
        embedded_ipv4 = ipaddress.IPv4Address(ip_obj.packed[-4:])
        return _is_blocked_ip(embedded_ipv4)

    return (
        ip_obj.is_private
        or ip_obj.is_loopback
        or ip_obj.is_link_local
        or ip_obj.is_multicast
        or ip_obj.is_reserved
        or ip_obj.is_unspecified
    )



def _check_ip_literal(
    hostname: str,
) -> ipaddress.IPv4Address | ipaddress.IPv6Address | None:
    """Attempts to parse string hostname as an IP literal."""
    # Check standard IPv4/IPv6 string
    try:
        return ipaddress.ip_address(hostname)
    except ValueError:
        pass

    # Check decimal integer notation (e.g. 2130706433 -> 127.0.0.1)
    if hostname.isdigit():
        try:
            val = int(hostname)
            if 0 <= val <= 0xFFFFFFFF:
                return ipaddress.IPv4Address(val)
        except ValueError:
            pass

    # Check hexadecimal notation (e.g. 0x7f000001 -> 127.0.0.1)
    if hostname.lower().startswith("0x"):
        try:
            val = int(hostname, 16)
            if 0 <= val <= 0xFFFFFFFF:
                return ipaddress.IPv4Address(val)
        except ValueError:
            pass

    # Check dword / shorthand IPv4 like 127.1
    parts = hostname.split(".")
    if len(parts) in (2, 3) and all(p.isdigit() for p in parts):
        try:
            if len(parts) == 2:  # e.g. 127.1 -> 127.0.0.1
                first = int(parts[0])
                rest = int(parts[1])
                if 0 <= first <= 255 and 0 <= rest <= 0xFFFFFF:
                    val = (first << 24) | rest
                    return ipaddress.IPv4Address(val)
            elif len(parts) == 3:  # e.g. 127.0.1 -> 127.0.0.1
                first = int(parts[0])
                second = int(parts[1])
                rest = int(parts[2])
                if 0 <= first <= 255 and 0 <= second <= 255 and 0 <= rest <= 0xFFFF:
                    val = (first << 24) | (second << 16) | rest
                    return ipaddress.IPv4Address(val)
        except ValueError:
            pass

    return None


def validate_public_url(raw: str) -> str:
    """
    Validates that a URL is a public web URL.
    Blocks private IP ranges, loopback, link-local (cloud metadata 169.254.169.254),
    credentials in URLs, non-HTTP/HTTPS schemes, and non-standard ports.
    """
    if not raw or not isinstance(raw, str):
        raise ValueError("URL must be a non-empty string")

    clean_url = raw.strip()
    if len(clean_url) > MAX_URL_LEN:
        raise ValueError("URL exceeds maximum length of 2048 characters")

    # If user provided a domain without scheme (e.g. youtube.com/watch), prepend https://
    has_scheme = bool(re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*://", clean_url))
    if not has_scheme and not clean_url.startswith("//"):
        clean_url = "https://" + clean_url

    u = urlparse(clean_url)

    if u.scheme not in ALLOWED_SCHEMES:
        raise ValueError(
            f"Scheme '{u.scheme}' is not allowed. Only http and https are permitted."
        )

    if not u.hostname or ("." not in u.hostname and u.hostname.strip("[]").lower() != "localhost"):
        raise ValueError("Please enter or paste a valid video URL.")

    if u.username or u.password:
        raise ValueError("Credentials in URL are forbidden")

    if u.port and u.port not in (80, 443):
        raise ValueError("Only default ports 80 and 443 are allowed")

    hostname = u.hostname.strip("[]")

    # 1. Direct IP literal check
    ip_literal = _check_ip_literal(hostname)
    if ip_literal:
        if _is_blocked_ip(ip_literal):
            raise ValueError(f"Access to IP address {ip_literal} is blocked")

    # 2. DNS resolution check
    try:
        infos = socket.getaddrinfo(hostname, None)
    except (socket.gaierror, UnicodeError, ValueError) as err:
        # If it wasn't an IP literal and cannot be resolved, reject
        if not ip_literal:
            raise ValueError("Please enter or paste a valid video URL.") from err
        infos = []

    for info in infos:
        resolved_ip = info[4][0]
        try:
            addr = ipaddress.ip_address(resolved_ip)
        except ValueError:
            raise ValueError(f"Invalid resolved IP address: {resolved_ip}")

        if _is_blocked_ip(addr):
            raise ValueError(f"Host resolves to blocked address: {resolved_ip}")


    return clean_url


def safe_name(title: str, ext: str) -> str:
    """Sanitizes a filename to avoid path traversal or unsafe shell characters."""
    base = re.sub(r"[^A-Za-z0-9._ -]", "_", title)
    base = re.sub(r"\.{2,}", "_", base)[:80].strip(" ._") or "video"
    clean_ext = re.sub(r"[^A-Za-z0-9]", "", ext) or "mp4"
    return f"{base}.{clean_ext}"


def safe_job_path(tmp_root: str, job_id: str, filename: str) -> str:
    """Validates that a job path stays within the designated tmp_root."""
    uuid.UUID(job_id)  # Enforces valid UUID format
    clean_filename = os.path.basename(filename)
    if clean_filename != filename or ".." in filename:
        raise ValueError("Path traversal blocked in filename")

    real_root = os.path.realpath(tmp_root)
    resolved_path = os.path.realpath(os.path.join(real_root, job_id, clean_filename))

    if not resolved_path.startswith(real_root + os.sep) and resolved_path != real_root:
        raise ValueError("Path traversal blocked")

    return resolved_path
