import hashlib
import os
import time
from collections import defaultdict
from threading import Lock

# In-memory sliding window tracker: hashed_ip -> list of timestamps
_INFO_REQUESTS: dict[str, list[float]] = defaultdict(list)
_DOWNLOAD_REQUESTS: dict[str, list[float]] = defaultdict(list)
_LOCK = Lock()

WINDOW_SECONDS = 600  # 10 minutes
MAX_INFO_PER_WINDOW = 15
MAX_DOWNLOAD_PER_WINDOW = 6
MAX_TRACKER_KEYS = 3000

_IP_SALT = os.environ.get("IP_HASH_SALT", "ytvidmate_ip_salt_daily_secure")


def hash_ip(client_ip: str) -> str:
    """Hashes IP address for privacy per docs/09_SECURITY.md Section 5."""
    return hashlib.sha256(f"{client_ip}:{_IP_SALT}".encode("utf-8")).hexdigest()[:16]


def is_rate_limited(hashed_ip: str, endpoint: str) -> bool:
    """
    Checks if a hashed IP exceeds the rate limit for the given endpoint.
    Endpoints: 'info' or 'download'.
    Bypassed in non-production environments.
    """
    from app.core.config import settings

    if settings.app_env != "production":
        return False

    now = time.time()
    cutoff = now - WINDOW_SECONDS

    with _LOCK:
        tracker = _INFO_REQUESTS if endpoint == "info" else _DOWNLOAD_REQUESTS
        max_allowed = (
            MAX_INFO_PER_WINDOW if endpoint == "info" else MAX_DOWNLOAD_PER_WINDOW
        )

        # Evict timestamps outside current window
        active_timestamps = [t for t in tracker.get(hashed_ip, []) if t > cutoff]

        if not active_timestamps:
            if hashed_ip in tracker:
                del tracker[hashed_ip]
        else:
            tracker[hashed_ip] = active_timestamps

        # Guard against unbounded dictionary memory growth under high traffic
        if len(tracker) > MAX_TRACKER_KEYS:
            stale_keys = [k for k, timestamps in tracker.items() if not timestamps or timestamps[-1] < cutoff]
            for k in stale_keys:
                del tracker[k]

        current_count = len(tracker.get(hashed_ip, []))
        if current_count >= max_allowed:
            return True

        tracker[hashed_ip].append(now)
        return False
