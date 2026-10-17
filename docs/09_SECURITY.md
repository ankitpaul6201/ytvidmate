# 09 — Security Specification

**Product:** YTVidMate | **Status:** Mandatory — every PR must comply.

> **Honest note:** no software is "100% unhackable." The goal here is **defense in depth**: multiple independent layers so that if one fails, the next one stops the attack. Every rule below exists to make SQL injection, XSS, SSRF, command injection, and similar attacks practically impossible, and to limit the damage if something still goes wrong.

---

## 0. Security Principles
1. **Never trust input.** All data from users, URLs, headers, cookies, and third-party sites (including video titles from yt-dlp) is hostile until validated.
2. **Least privilege.** Every service, key, container, and DB user gets the minimum access it needs.
3. **Defense in depth.** Validate at the edge, API, service, and storage layers.
4. **Secure by default.** Deny first, allow explicitly.
5. **Fail closed.** On error, block, don't allow.
6. **Minimize data.** What you don't store can't be stolen.
7. **Keep it updated.** Dependencies, OS, yt-dlp, FFmpeg.

---

## 1. Threat Model (what we defend against)

| # | Threat | Where | Main defense |
|---|---|---|---|
| T1 | **SSRF** (attacker makes server fetch internal URLs) | `/info`, `/download` | URL validation + IP blocklist + network isolation |
| T2 | **Command injection** | yt-dlp / FFmpeg calls | No shell, library calls, argument lists |
| T3 | **SQL injection** | any DB query | ORM + parameterized queries |
| T4 | **XSS** | video titles, errors, URLs rendered in UI | Output escaping + CSP |
| T5 | **CSRF** | state-changing endpoints | SameSite cookies + tokens + Origin checks |
| T6 | **Path traversal / file overwrite** | filenames, file endpoint | UUID paths, sanitization, realpath checks |
| T7 | **DoS / abuse / bandwidth theft** | all endpoints | Rate limits, quotas, queue caps, CAPTCHA |
| T8 | **Resource exhaustion** (huge video, zip-bomb-like media) | worker | Size/duration/time limits, sandbox |
| T9 | **Malicious media files (FFmpeg exploits)** | merge/convert | Updated FFmpeg, sandboxed worker, whitelisted codecs |
| T10 | **Secret leakage** | git, logs, client bundle | Secret management, scanning, redaction |
| T11 | **Dependency / supply-chain attack** | npm, pip, Docker images | Pinning, audits, lockfiles, minimal images |
| T12 | **Broken auth / session hijack** | admin panel (and future accounts) | Strong auth flow (Section 6) |
| T13 | **IDOR** (access other users' files) | `/file/{job_id}` | Unguessable IDs + ownership token |
| T14 | **Clickjacking, MIME sniffing, open redirect** | frontend | Security headers, redirect allowlist |
| T15 | **Server compromise / lateral movement** | infra | Non-root containers, network segmentation, firewall |
| T16 | **Legal abuse (DRM, illegal content)** | product | ToS, DMCA process, blocklist, logging of abuse |

---

## 2. Secrets & Configuration Security

- All secrets come from **environment variables or a secret manager** (GitHub Actions Secrets, Vercel env vars, Docker secrets, Doppler/Vault/AWS Secrets Manager).
- `.env*` are git-ignored; only `.env.example` with **empty values** is committed (see `07_DEV_RULES_AND_GIT.md`).
- **Validate config at startup** (fail to boot if a required secret is missing):

```python
# backend/app/core/config.py
from pydantic_settings import BaseSettings
from pydantic import SecretStr

class Settings(BaseSettings):
    app_env: str
    frontend_origin: str
    redis_url: SecretStr
    turnstile_secret_key: SecretStr
    database_url: SecretStr | None = None
    sentry_dsn: SecretStr | None = None
    max_filesize_bytes: int = 2_000_000_000
    max_duration_seconds: int = 10_800
    model_config = {"env_file": ".env", "extra": "forbid"}

settings = Settings()
```
- `SecretStr` prevents accidental printing in logs.
- **Never** put secrets in `NEXT_PUBLIC_*` variables (they ship to the browser).
- Separate secrets per environment (dev/staging/prod). Never reuse.
- Rotate secrets every 90 days and immediately on suspicion.
- Enable **GitHub Secret Scanning + Push Protection** and `gitleaks` in pre-commit and CI.
- File permissions on servers: `chmod 600 .env`, owned by the app user.

---

## 3. Input Validation & SSRF Protection (CRITICAL)

The core feature is "server fetches a user-supplied URL," which is the textbook SSRF risk. Treat it as the highest-priority control.

### Rules
1. Only `http://` and `https://` schemes. Reject `file://`, `ftp://`, `gopher://`, `data:`, `javascript:` etc.
2. Max URL length 2048. Reject credentials in URL (`user:pass@host`).
3. Resolve the hostname via DNS **on the server**, and reject if **any** resolved IP is private, loopback, link-local, multicast, or reserved:
   `127.0.0.0/8, 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 169.254.0.0/16 (cloud metadata!), 100.64.0.0/10, 0.0.0.0/8, ::1, fc00::/7, fe80::/16`.
4. **Re-validate after redirects** and prevent DNS rebinding (pin the resolved IP for the request or re-check on every hop; limit redirects to 3–5).
5. Optional allowlist mode: only domains yt-dlp is expected to support (best for hardening).
6. Run workers in a network segment that **cannot reach** internal services (DB, Redis admin, cloud metadata endpoint) except what's strictly needed. Block `169.254.169.254` at the firewall.

```python
# backend/app/core/security.py
import ipaddress, socket
from urllib.parse import urlparse

ALLOWED_SCHEMES = {"http", "https"}
MAX_URL_LEN = 2048

def _is_blocked_ip(ip: str) -> bool:
    addr = ipaddress.ip_address(ip)
    return (addr.is_private or addr.is_loopback or addr.is_link_local
            or addr.is_multicast or addr.is_reserved or addr.is_unspecified)

def validate_public_url(raw: str) -> str:
    if len(raw) > MAX_URL_LEN:
        raise ValueError("URL too long")
    u = urlparse(raw.strip())
    if u.scheme not in ALLOWED_SCHEMES or not u.hostname:
        raise ValueError("Invalid URL")
    if u.username or u.password:
        raise ValueError("Credentials in URL not allowed")
    if u.port and u.port not in (80, 443):
        raise ValueError("Port not allowed")
    try:
        infos = socket.getaddrinfo(u.hostname, None)
    except socket.gaierror:
        raise ValueError("Host not resolvable")
    for info in infos:
        if _is_blocked_ip(info[4][0]):
            raise ValueError("Blocked address")
    return raw.strip()
```
> Note: a DNS check at validation time alone can be bypassed by rebinding. Combine with network-level egress rules (firewall/proxy that denies private ranges) — the firewall is the real safety net.

### General input validation
- **Backend:** Pydantic models with strict types, max lengths, enums for `type` and allowed `height` values (e.g. `{144,240,360,480,720,1080,1440,2160}`).
- **Frontend:** Zod schemas (UX only — never rely on frontend validation for security).
- Reject unknown fields (`extra = "forbid"`).
- Limit request body size (e.g., 10 KB) at the proxy and the app.

---

## 4. Command Injection & Process Security

- **Never** use `shell=True`, `os.system`, backticks, or string-concatenated commands.
- Use the **yt-dlp Python API**; for FFmpeg use argument lists:
```python
import subprocess
subprocess.run(
    ["ffmpeg", "-nostdin", "-i", in_path, "-c", "copy", out_path],
    check=True, timeout=600, shell=False,
    stdout=subprocess.DEVNULL, stderr=subprocess.PIPE,
)
```
- Whitelist yt-dlp options. **Never** let users supply raw yt-dlp/FFmpeg flags, `--exec`, output templates, config paths, cookies paths, or proxy settings.
- Build output paths yourself: `TMP_DIR/<uuid4>/<sanitized_name>.<ext>`.
- Set `timeout`, memory (`ulimit`/cgroups) and CPU limits on each job.
- Kill and clean up orphan processes on cancel/timeout.

### Filename & path safety
```python
import re, uuid, os
def safe_name(title: str, ext: str) -> str:
    base = re.sub(r"[^A-Za-z0-9._ -]", "_", title)[:80].strip(" .") or "video"
    return f"{base}.{ext}"

def safe_job_path(tmp_root: str, job_id: str, filename: str) -> str:
    uuid.UUID(job_id)  # raises if not a valid UUID
    path = os.path.realpath(os.path.join(tmp_root, job_id, filename))
    if not path.startswith(os.path.realpath(tmp_root) + os.sep):
        raise ValueError("Path traversal blocked")
    return path
```

---

## 5. Database Security (SQL Injection & NoSQL Injection)

v1 can run with **no database** (Redis only). If PostgreSQL is used (stats, abuse log, admin users), enforce:

1. **ORM or parameterized queries only** (SQLAlchemy / Prisma / psycopg parameters). **Never** build SQL with f-strings, `+`, or `.format()`.
```python
# ❌ NEVER
db.execute(f"SELECT * FROM jobs WHERE id = '{job_id}'")
# ✅ ALWAYS
db.execute(text("SELECT * FROM jobs WHERE id = :id"), {"id": job_id})
```
2. Validate types before the query (UUID, int, enum).
3. **Least-privilege DB user:** app user has only `SELECT/INSERT/UPDATE` on needed tables, no `DROP/CREATE/SUPERUSER`. Separate migration user.
4. DB not exposed to the internet; private network only; TLS enforced (`sslmode=require`).
5. Strong, unique DB password from the secret manager.
6. Encrypted backups; tested restore; no production data in dev.
7. Store **no raw URLs with tokens**; hash IPs (`HMAC-SHA256` with a server secret and daily salt) for abuse tracking instead of storing them raw.
8. Statement/connection timeouts and pool limits to stop slow-query DoS.
9. **If MongoDB is ever used:** reject objects in user input where strings are expected (block `$ne`, `$gt`, `$where` operators), use schema validation (Mongoose strict mode), and `express-mongo-sanitize`.
10. **Redis:** require password/ACL, bind to private interface, disable dangerous commands (`FLUSHALL`, `CONFIG`, `KEYS` in prod), never expose port 6379 publicly.

---

## 6. Authentication & Authorization

### 6.1 Public tool (v1)
- **No user accounts** by design: no passwords, no PII, much smaller attack surface.
- Anonymous abuse control uses: rate limit per hashed IP, Cloudflare Turnstile, and short-lived signed job tokens.

### 6.2 Job access control (prevents IDOR)
- `job_id` = UUIDv4 (122 bits of randomness, unguessable).
- On job creation, issue a **signed job token** (HMAC/JWT, 30–60 min expiry) in an `HttpOnly; Secure; SameSite=Strict` cookie bound to that job.
- `/progress/{id}` and `/file/{id}` require a matching token. A leaked ID alone is useless.
- Files return **410 Gone** after TTL; cleanup deletes them from disk.

### 6.3 Admin dashboard / future user accounts — required auth flow
(Use a proven provider/library: **Auth.js (NextAuth)**, **Clerk**, **Supabase Auth**, or **Keycloak**. Do **not** build crypto yourself.)

**Registration / login flow**
```
1. User submits email + password over HTTPS
2. Server validates (zod/pydantic), rate-limits, checks breached-password list (HIBP k-anonymity API)
3. Password hashed with Argon2id (or bcrypt cost ≥ 12) + unique salt
4. Email verification link (single-use, 15–30 min expiry, random 256-bit token, stored hashed)
5. Login: constant-time compare, generic error ("Invalid email or password")
6. On success: create server-side session (random 256-bit ID) OR short-lived JWT access token (≤15 min) + rotating refresh token
7. Set cookie: HttpOnly; Secure; SameSite=Lax/Strict; Path=/; short Max-Age
8. Rotate session ID on login and privilege change; invalidate on logout
9. MFA (TOTP/WebAuthn) mandatory for admin accounts
```
**Password rules:** min 12 chars, no composition theatre, block common/breached passwords, allow password managers (no paste blocking).

**Brute-force protection:** progressive delay, lockout/CAPTCHA after 5 failures per account + per IP, alerts on spikes.

**Password reset:** single-use token, 15 min expiry, hashed in DB, generic response ("If the email exists, we sent a link"), invalidate all sessions after reset.

**Authorization:**
- RBAC with roles (`admin`, `user`); **deny by default**.
- Check permissions **on the server for every request** (never rely on hidden buttons).
- Verify resource ownership on each access (`WHERE id = :id AND owner_id = :uid`).
- Admin routes: separate subdomain/path, IP allowlist or VPN, MFA, audit log.

**JWT rules (if used):** algorithm pinned (`RS256`/`EdDSA`/`HS256` with ≥256-bit secret), verify `exp`, `iss`, `aud`; never accept `alg: none`; never store in `localStorage` (use HttpOnly cookies); keep payload minimal.

**OAuth (Google login etc.):** use Authorization Code + PKCE, validate `state` and `nonce`, exact-match redirect URIs, request minimal scopes.

---

## 7. Server-Side Rendering (SSR) Security (Next.js)

1. **Server code never reaches the browser.** Keep secrets only in server files / Server Components / Route Handlers. Add `import "server-only";` to modules containing secrets or DB access.
2. **Only `NEXT_PUBLIC_*` env vars are exposed** — contain no secrets.
3. **No `dangerouslySetInnerHTML`** with untrusted data. If rich text is needed, sanitize with `DOMPurify` / `sanitize-html` (allowlist).
4. React auto-escapes text — don't bypass it. Never inject video titles/URLs into `<script>`, `style`, `href="javascript:"`, or event handlers.
5. When passing SSR data to the client (`__NEXT_DATA__`/props), send **only what the UI needs** — no tokens, internal IDs, stack traces, or full API responses.
6. Escape JSON embedded in `<script type="application/ld+json">` (replace `<` with `\u003c`):
```tsx
<script type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
```
7. **Cache safety:** never cache personalized/authenticated responses on a shared CDN. Use `Cache-Control: private, no-store` for anything user-specific; `Vary` headers where needed. Prevent cache poisoning: ignore untrusted `Host` / `X-Forwarded-Host`; set a fixed canonical origin.
8. **Server Actions / Route Handlers:** treat as public endpoints — authenticate, authorize, validate, rate-limit each one. Verify `Origin` header (Next.js does same-origin checks; keep `allowedOrigins` tight).
9. **Open redirects:** redirect only to relative paths or an allowlist.
10. **Errors:** custom error pages; never leak stack traces, file paths, or env info in production (`NODE_ENV=production`).
11. Keep Next.js and React **patched** — subscribe to security advisories; update promptly (critical SSR/middleware CVEs have occurred in the past).
12. Disable `X-Powered-By` (`poweredByHeader: false`).
13. Middleware must not be the *only* auth check; re-verify in the handler/data layer.

---

## 8. XSS, CSRF & Browser Security

### Security headers (Next.js `next.config.js`)
```js
const csp = [
  "default-src 'self'",
  "script-src 'self' 'nonce-__NONCE__' https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self'",
  "connect-src 'self' https://api.yourdomain.com https://challenges.cloudflare.com",
  "frame-src https://challenges.cloudflare.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

module.exports = {
  poweredByHeader: false,
  async headers() {
    return [{
      source: "/(.*)",
      headers: [
        { key: "Content-Security-Policy", value: csp },
        { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
        { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        { key: "Cross-Origin-Resource-Policy", value: "same-site" },
      ],
    }];
  },
};
```
> Prefer a **nonce-based CSP** generated per request in middleware (avoid `unsafe-inline` for scripts). Test CSP in report-only mode first.

### Third-party images (thumbnails)
Thumbnails come from external sites. Proxy and re-serve them via your own image endpoint (or Next.js `images.remotePatterns` with an explicit allowlist) to avoid tracking pixels, SSRF via image fetch, and mixed content.

### Downloaded-file response headers
```
Content-Disposition: attachment; filename="safe_name.mp4"
X-Content-Type-Options: nosniff
Content-Type: video/mp4  (never text/html)
Cache-Control: private, no-store
```
Never serve user-derived files inline from your main origin (avoid stored XSS via HTML/SVG disguised as media).

### CSRF
- Cookies: `SameSite=Strict` (or `Lax` for login flows), `HttpOnly`, `Secure`.
- Verify `Origin`/`Referer` against `FRONTEND_ORIGIN` on all state-changing requests.
- Use CSRF tokens (double-submit or synchronizer) for authenticated forms.
- CORS: explicit allowlist (`FRONTEND_ORIGIN`), **never `*` with credentials**; limit methods and headers.

### Cookies
`__Host-` prefix where possible, no sensitive data in cookies, short lifetimes.

---

## 9. API Security

| Control | Setting |
|---|---|
| TLS | 1.2+ only, HSTS, auto-renew certs |
| Rate limits | `/info` 10/10min/IP, `/download` 5/10min/IP, global queue cap, burst control (token bucket via Redis) |
| CAPTCHA | Cloudflare Turnstile on `/download` (verify token **server-side**) |
| Body size | ≤ 10 KB JSON |
| Timeouts | Request 15s (`/info`), job hard timeout 15 min |
| Errors | Generic to client; detailed in server logs with request ID |
| Methods | Explicit allowlist per route (405 otherwise) |
| Versioning | `/api/v1`; deprecate old versions safely |
| Docs | Disable `/docs` and `/openapi.json` in production (or protect them) |
| Idempotency | Dedupe repeated identical download requests per client |
| Pagination | Max page size when listing anything |

```python
# FastAPI hardening
app = FastAPI(docs_url=None if settings.app_env == "production" else "/docs",
              redoc_url=None, openapi_url=None if settings.app_env == "production" else "/openapi.json")
app.add_middleware(CORSMiddleware, allow_origins=[settings.frontend_origin],
                   allow_methods=["GET", "POST"], allow_headers=["Content-Type"], allow_credentials=True)
app.add_middleware(TrustedHostMiddleware, allowed_hosts=["api.yourdomain.com"])
```

---

## 10. Worker, Media & File Security

- Run workers in **separate low-privilege containers** with: non-root user, read-only root FS, writable `tmpfs`/volume only for `TMP_DIR`, `no-new-privileges`, dropped capabilities, seccomp profile, CPU/memory/pids limits.
- **Egress control:** workers may only reach the public internet (via proxy/firewall that blocks private ranges + metadata IP).
- Keep **FFmpeg & yt-dlp updated** (media parsers are a common exploit vector). Pin FFmpeg version in the Docker image; rebuild weekly.
- Limits: `max_filesize`, `max_duration`, max concurrent jobs per IP, wall-clock timeout, disk quota per job.
- Output **codec/container allowlist** (mp4/h264+aac, webm, mp3, m4a); reject others.
- Verify output with `ffprobe` (has expected streams, sane duration) before serving.
- Optional: scan with ClamAV for defense in depth.
- Auto-delete: cleanup cron every 5 min removes anything older than 30 min; delete on completion download + cancel.
- Disk usage alert at 80%.
- No user-uploaded files in v1 (no upload endpoint = no upload attack surface).

---

## 11. Infrastructure & Deployment Security

**Network**
- Cloudflare in front: WAF managed rules, bot fight mode, DDoS protection, "Under Attack" mode runbook.
- Origin server accepts traffic **only from Cloudflare IP ranges** (firewall) — prevents origin bypass.
- Redis/DB on a private network; no public ports except 80/443 (and SSH restricted).
- Firewall default-deny (`ufw` / cloud security groups).

**Server**
- SSH: key-only, no root login, no passwords, non-default port optional, `fail2ban`, MFA for the cloud console.
- Automatic security updates (`unattended-upgrades`).
- Run apps as non-root; separate users for API/worker.
- Time sync, minimal installed packages, disk encryption where available.

**Docker**
```dockerfile
FROM python:3.12-slim
RUN useradd -r -u 10001 appuser
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app ./app
USER appuser
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```
- Pin base image versions (digest), use slim/distroless, scan with **Trivy**/`docker scout`, no secrets in image layers or build args, `.dockerignore` excludes `.env`, `.git`.
- Compose/K8s: `read_only: true`, `cap_drop: [ALL]`, `security_opt: ["no-new-privileges:true"]`, resource limits, health checks.

**CI/CD**
- Branch protection, required reviews, signed commits (recommended).
- GitHub Actions: minimal `permissions:`, pin actions by commit SHA, use OIDC instead of long-lived cloud keys, secrets only via `secrets.*`, never `pull_request_target` with untrusted code, no secrets exposed to fork PRs.
- Separate deploy credentials per environment; production deploy requires approval.

**Backups & recovery**
- Daily encrypted backups (if a DB exists), offsite, restore-tested monthly.
- Documented rollback (`git revert` + redeploy) and an incident runbook (Section 15).

---

## 12. Dependency & Supply-Chain Security
- Commit lockfiles (`package-lock.json`, `requirements.txt` with hashes or `poetry.lock`/`uv.lock`).
- Enable **Dependabot** + **GitHub security alerts**.
- CI runs `npm audit --audit-level=high`, `pip-audit`, `bandit`, `semgrep` (OWASP ruleset), `gitleaks`, Trivy on images.
- Review new dependencies: maintenance status, downloads, maintainers; avoid tiny unvetted packages (typosquatting risk).
- `npm ci` / `pip install --require-hashes` in CI for reproducible builds.
- Disable npm install scripts for untrusted packages where feasible (`--ignore-scripts`).
- **yt-dlp updates** go through the smoke test before production rollout, and install only from the official PyPI/GitHub release.

---

## 13. Logging, Monitoring & Privacy

**Log:** timestamp, request ID, route, status, latency, hashed IP, job outcome, error class.
**Never log:** passwords, tokens, cookies, full auth headers, secrets, full URLs containing tokens/queries, raw IPs (use hashes), downloaded content.
- Redact with a logging filter; use structured JSON logs.
- Sentry with `send_default_pii=False` and `before_send` scrubbers.
- Alerts: spike in 4xx/5xx, rate-limit hits, SSRF-block events, auth failures, disk/queue thresholds, yt-dlp failure rate, new CVE for dependencies.
- Audit log for admin actions (who/what/when), append-only.
- Retention: app logs 14–30 days, security/audit logs 90 days.

**Privacy & compliance**
- No accounts, no ad-profiling by default; cookie banner only if you use non-essential cookies/analytics (GDPR/ePrivacy; India DPDP Act considerations).
- Publish Privacy Policy describing exactly what is collected and retention periods.
- Provide a contact for security reports: `security@yourdomain.com`, and a `/.well-known/security.txt`:
```
Contact: mailto:security@yourdomain.com
Expires: 2027-12-31T23:59:59.000Z
Preferred-Languages: en, hi
Canonical: https://yourdomain.com/.well-known/security.txt
```

---

## 14. Abuse Prevention & Legal Safety
- Rate limits + Turnstile + per-IP concurrent job cap.
- Blocklist: DRM-protected domains (Netflix, Prime Video, Disney+, etc.), known CSAM/illegal content reports, and domains named in valid takedown notices.
- DMCA/takedown workflow: dedicated email and form, response SLA, repeat-complaint tracking.
- ToS prohibits illegal use; log abuse patterns (hashed) to ban offenders.
- Don't proxy or cache third-party copyrighted content beyond the job TTL.

---

## 15. Incident Response Plan
1. **Detect:** alert, user report, or provider notice.
2. **Contain:** enable Cloudflare "Under Attack", block IPs/ASNs, disable affected endpoint with a feature flag, scale down workers if abused.
3. **Eradicate:** patch, rotate **all** potentially exposed secrets, rebuild containers from clean images.
4. **Recover:** redeploy, verify health, monitor closely for 24–48 hours.
5. **Notify:** affected users/regulators as required by law (e.g., within 72 hours under GDPR if personal data was involved).
6. **Post-mortem:** root cause, fix, regression test, update this document.

---

## 16. Security Testing Plan

| Test | Tool | When |
|---|---|---|
| Secret scanning | gitleaks | pre-commit + every PR |
| SAST | semgrep, bandit, ESLint security plugin, CodeQL | every PR |
| Dependency audit | npm audit, pip-audit, Dependabot | every PR + weekly |
| Container scan | Trivy | every build |
| DAST | OWASP ZAP baseline scan | staging, weekly |
| Header check | securityheaders.com, Mozilla Observatory | each release |
| SSL check | SSL Labs (target A+) | each release |
| SSRF test suite | custom pytest (localhost, 127.1, 0x7f.1, decimal IPs, IPv6 `::1`, `169.254.169.254`, DNS-rebinding hosts, redirect-to-internal) | every PR touching URL handling |
| Injection tests | sqlmap on staging, payload fuzz of `/info` | before launch + quarterly |
| Rate-limit test | k6 | before launch |
| Authz tests | Access other jobs' files, forged/expired tokens, role escalation | every PR touching auth |
| Pen test | External professional or bug-bounty program | before public launch, then yearly |

**Example SSRF test cases (must all be rejected):**
```
http://localhost/              http://127.0.0.1/            http://127.1/
http://0x7f000001/             http://2130706433/           http://[::1]/
http://169.254.169.254/latest/meta-data/
http://10.0.0.5/               http://192.168.1.1/          file:///etc/passwd
http://evil.com@127.0.0.1/     http://user:pass@example.com/
https://redirects-to-internal.example/   (302 → http://127.0.0.1)
```

---

## 17. Secure Development Rules (add to every task)

**Before writing code**
- [ ] Identify untrusted inputs and trust boundaries for this change.
- [ ] Check this document's relevant section.

**While writing code**
- [ ] Validate every input (type, length, range, format, allowlist).
- [ ] Parameterized DB access only.
- [ ] No `shell=True`, `eval`, `exec`, `pickle` on untrusted data, `innerHTML`/`dangerouslySetInnerHTML` with raw data.
- [ ] Authenticate + authorize + rate-limit every endpoint.
- [ ] Errors are generic to users, detailed in logs (without secrets).
- [ ] No secrets in code, logs, URLs, or client bundles.
- [ ] Use well-maintained crypto/auth libraries; no custom crypto.
- [ ] Use `secrets` / `crypto.randomBytes` for tokens (never `random` / `Math.random`).

**Before merging**
- [ ] `gitleaks`, SAST, dependency audit pass.
- [ ] Security tests added for new attack surface.
- [ ] Headers/CSP still valid (no new `unsafe-*`).
- [ ] New dependency justified and reviewed.
- [ ] Threat model table (Section 1) updated if new surface was added.

**Before release**
- [ ] ZAP scan clean of high/medium findings.
- [ ] SSL Labs A / securityheaders A.
- [ ] Backups verified; rollback plan ready; alerts working.

---

## 18. OWASP Top 10 (2021) Coverage Map

| OWASP | Covered in |
|---|---|
| A01 Broken Access Control | §6.2, §6.3 (job tokens, RBAC, ownership checks) |
| A02 Cryptographic Failures | §2, §6.3, §11 (TLS, Argon2id, secret mgmt) |
| A03 Injection | §3, §4, §5, §8 (SQL, command, XSS) |
| A04 Insecure Design | §0, §1, §10 (threat model, limits, isolation) |
| A05 Security Misconfiguration | §7, §9, §11 (headers, docs off, hardening) |
| A06 Vulnerable Components | §12 |
| A07 Identification & Auth Failures | §6 |
| A08 Software & Data Integrity Failures | §11 (CI/CD), §12 |
| A09 Logging & Monitoring Failures | §13 |
| A10 SSRF | §3 |

Also review the **OWASP ASVS** (Level 2 target) and **OWASP API Security Top 10** during design reviews.

---

## 19. Security Ownership
| Area | Owner |
|---|---|
| This document, threat model | Project owner (Ankit) |
| Dependency updates, CVE watch | Backend/DevOps agent |
| CI security gates | DevOps agent |
| Frontend headers/CSP | Frontend agent |
| Incident response | Project owner |

Review this file **every quarter** and after any security incident.
