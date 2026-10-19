import logging
import os
import platform
import shutil
import socket
import subprocess
import time
import urllib.request
from typing import Optional
from urllib.parse import urlparse

from app.core.config import settings

logger = logging.getLogger(__name__)

_POT_PROCESS: Optional[subprocess.Popen] = None

# Download URLs for release v0.8.1
RELEASE_URLS = {
    ("Linux", "x86_64"): (
        "https://github.com/jim60105/bgutil-ytdlp-pot-provider-rs/releases/download/v0.8.1/bgutil-pot-linux-x86_64"
    ),
    ("Linux", "aarch64"): (
        "https://github.com/jim60105/bgutil-ytdlp-pot-provider-rs/releases/download/v0.8.1/bgutil-pot-linux-aarch64"
    ),
    ("Windows", "AMD64"): (
        "https://github.com/jim60105/bgutil-ytdlp-pot-provider-rs/releases/download/v0.8.1/bgutil-pot-windows-x86_64.exe"
    ),
    ("Windows", "x86_64"): (
        "https://github.com/jim60105/bgutil-ytdlp-pot-provider-rs/releases/download/v0.8.1/bgutil-pot-windows-x86_64.exe"
    ),
}


def is_pot_server_running(url: str = "http://127.0.0.1:4416") -> bool:
    """Checks if the POT provider server is responding on its host and port."""
    try:
        parsed = urlparse(url)
        host = parsed.hostname or "127.0.0.1"
        port = parsed.port or 4416
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(1.0)
            return s.connect_ex((host, port)) == 0
    except Exception:
        return False


def get_pot_provider_url() -> str:
    """Returns the configured or default PO Token Provider base URL."""
    if settings.pot_provider_url:
        return settings.pot_provider_url.rstrip("/")
    return "http://127.0.0.1:4416"


def find_or_download_binary() -> Optional[str]:
    """Finds existing bgutil-pot binary or downloads it into temp bin directory."""
    binary_name = "bgutil-pot.exe" if platform.system() == "Windows" else "bgutil-pot"

    # 1. Check in PATH
    which_bin = shutil.which(binary_name) or shutil.which("bgutil-pot")
    if which_bin and os.path.isfile(which_bin):
        return which_bin

    # 2. Check standard Linux/Docker location
    for loc in ["/usr/local/bin/bgutil-pot", "/usr/bin/bgutil-pot"]:
        if os.path.isfile(loc) and os.access(loc, os.X_OK):
            return loc

    # 3. Check inside tmp_dir/bin
    bin_dir = os.path.join(settings.tmp_dir, "bin")
    target_path = os.path.join(bin_dir, binary_name)
    if os.path.isfile(target_path) and os.path.getsize(target_path) > 1000000:
        return target_path

    # 4. Attempt download if on a supported platform
    os_name = platform.system()
    arch = platform.machine()
    dl_url = RELEASE_URLS.get((os_name, arch))
    if not dl_url:
        logger.warning(f"[POT] No precompiled bgutil-pot binary available for {os_name} {arch}")
        return None

    try:
        os.makedirs(bin_dir, exist_ok=True)
        print(f"[YTVidMate POT] Downloading bgutil-pot binary for {os_name} {arch}...", flush=True)
        req = urllib.request.Request(dl_url, headers={"User-Agent": "YTVidMate"})
        with urllib.request.urlopen(req, timeout=30) as resp, open(target_path, "wb") as f:
            shutil.copyfileobj(resp, f)

        # Make executable on Unix
        if os_name != "Windows":
            os.chmod(target_path, 0o755)

        print(f"[YTVidMate POT] Successfully downloaded bgutil-pot to {target_path}", flush=True)
        return target_path
    except Exception as e:
        logger.warning(f"[POT] Failed to download bgutil-pot binary: {e}")
        return None


def start_pot_server() -> bool:
    """
    Ensures the bgutil-pot server is running.
    If not already running on port 4416, launches it as a background process.
    """
    global _POT_PROCESS
    pot_url = get_pot_provider_url()

    if is_pot_server_running(pot_url):
        print(f"[YTVidMate POT] PO Token Provider server is active at {pot_url}", flush=True)
        return True

    # Only attempt to auto-launch if targeting localhost
    parsed = urlparse(pot_url)
    host = parsed.hostname or "127.0.0.1"
    port = parsed.port or 4416
    if host not in ("127.0.0.1", "localhost", "0.0.0.0"):
        # Remote/Docker-compose service that isn't up yet
        return False

    bin_path = find_or_download_binary()
    if not bin_path:
        print("[YTVidMate POT] Binary not found; skipping automatic POT server startup", flush=True)
        return False

    try:
        print(f"[YTVidMate POT] Starting background server: {bin_path} on port {port}...", flush=True)
        _POT_PROCESS = subprocess.Popen(
            [bin_path, "server", "--host", "127.0.0.1", "-p", str(port)],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )

        # Wait up to 5 seconds for socket ready
        for _ in range(25):
            time.sleep(0.2)
            if is_pot_server_running(pot_url):
                print(f"[YTVidMate POT] Server successfully bound to {pot_url}", flush=True)
                return True

        if _POT_PROCESS.poll() is not None:
            print(f"[YTVidMate POT] Server exited prematurely with code {_POT_PROCESS.returncode}", flush=True)
            return False

        return is_pot_server_running(pot_url)
    except Exception as e:
        logger.error(f"[POT] Failed to start server: {e}")
        return False


def stop_pot_server() -> None:
    """Stops the background POT server if one was spawned by this process."""
    global _POT_PROCESS
    if _POT_PROCESS is not None:
        try:
            print("[YTVidMate POT] Stopping background server...", flush=True)
            _POT_PROCESS.terminate()
            _POT_PROCESS.wait(timeout=3)
        except Exception:
            try:
                _POT_PROCESS.kill()
            except Exception:
                pass
        finally:
            _POT_PROCESS = None
