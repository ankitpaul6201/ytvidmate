# 02 — Technical Requirements Document (TRD)

**Product:** YTVidMate | **Version:** 1.0

---

## 1. Tech Stack
| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js 14+ (App Router), React, TypeScript, Tailwind CSS | SSR/SSG = best SEO, fast |
| Backend API | Python 3.11+ with FastAPI | Native yt-dlp integration |
| Core engines | **yt-dlp** + **FFmpeg** | Extract, download, merge |
| Queue | Redis + RQ (or Celery) | Background downloads |
| Storage | Local temp disk (or S3-compatible with lifecycle rules) | Auto-delete after 30 min |
| Realtime progress | Server-Sent Events (SSE) | Simpler than WebSockets |
| DB (optional) | PostgreSQL | Only for stats/abuse logs, not user data |
| Hosting | Frontend: Vercel; Backend: VPS/Docker (Hetzner, DigitalOcean, Railway) | Backend needs FFmpeg + long jobs |
| CDN / WAF | Cloudflare | Caching, DDoS, bot protection |
| CI/CD | GitHub Actions | Lint, test, build, deploy |
| Monitoring | Sentry + Uptime Kuma + Prometheus (optional) | Errors and uptime |

> Vercel serverless can't run long FFmpeg jobs — keep the downloader backend on a real server/container.

## 2. System Requirements
**Server:** 2+ vCPU, 4 GB RAM, 50+ GB SSD, Ubuntu 22.04+, Docker, FFmpeg 6+, Python 3.11+, Redis 7+
**Dev machine:** Node 20 LTS, Python 3.11+, FFmpeg on PATH, Docker, Git

## 3. API Specification
### `POST /api/v1/info`
Request: `{ "url": "https://..." }`
Response:
```json
{
  "id": "abc123",
  "title": "Video title",
  "thumbnail": "https://...",
  "duration": 312,
  "uploader": "Channel",
  "formats": [
    { "format_id": "137+140", "label": "1080p MP4", "height": 1080, "ext": "mp4", "filesize_approx": 52000000 },
    { "format_id": "bestaudio", "label": "MP3 192kbps", "ext": "mp3", "audio_only": true }
  ]
}
```

### `POST /api/v1/download`
Request: `{ "url": "...", "height": 1080, "type": "video|audio" }`
Response: `{ "job_id": "uuid" }`

### `GET /api/v1/progress/{job_id}` (SSE)
Events: `{ "status": "queued|downloading|merging|done|error", "percent": 63.2, "speed": "3.1MiB/s", "eta": 12 }`

### `GET /api/v1/file/{job_id}`
Streams the finished file with `Content-Disposition: attachment`. Returns 410 Gone after expiry.

### `GET /api/v1/health`
Returns yt-dlp version, FFmpeg version, queue depth.

## 4. Core Download Logic
```python
opts = {
    "format": f"bv*[height<={height}]+ba/b[height<={height}]",
    "merge_output_format": "mp4",
    "outtmpl": f"{TMP_DIR}/{job_id}/%(title).80s.%(ext)s",
    "progress_hooks": [hook],
    "noplaylist": True,
    "max_filesize": MAX_BYTES,
    "restrictfilenames": True,
}
```
Audio-only: `format: bestaudio`, postprocessor `FFmpegExtractAudio` (mp3, 192).

## 5. Non-Functional Requirements
| Area | Requirement |
|---|---|
| Performance | `/info` < 5s p95; frontend LCP < 2.5s |
| Concurrency | Max 3 jobs per worker; global queue cap |
| Rate limiting | 10 info + 5 downloads per IP per 10 min (tune later) |
| Limits | Max duration (e.g., 3 hrs), max filesize (e.g., 2 GB) |
| Cleanup | Cron deletes job folders older than 30 min |
| Availability | 99% target; auto-restart via Docker restart policy |
| Browser support | Last 2 versions of Chrome, Edge, Firefox, Safari; Android/iOS browsers |
| Accessibility | WCAG 2.1 AA |

## 6. Security Requirements
- Validate URLs: allow only `http/https`; **block private/internal IPs and localhost (SSRF protection)**; resolve DNS and re-check.
- Never pass user input to a shell; call yt-dlp through the Python API or an argument list (no `shell=True`).
- Sanitize filenames; random UUID job folders.
- Rate limit + Cloudflare Turnstile on `/download`.
- CORS: allow only your own frontend origin.
- HTTPS everywhere, HSTS, secure headers (CSP, X-Content-Type-Options, Referrer-Policy).
- Secrets only via environment variables / secret manager. **Never committed** (see `07_DEV_RULES_AND_GIT.md`).
- Dependencies pinned; Dependabot enabled; `pip-audit` and `npm audit` in CI.
- Run containers as non-root, read-only filesystem where possible.

## 7. Environment Variables (names only — values never committed)
```
APP_ENV=
FRONTEND_ORIGIN=
REDIS_URL=
TMP_DIR=
MAX_FILESIZE_BYTES=
MAX_DURATION_SECONDS=
RATE_LIMIT_INFO=
RATE_LIMIT_DOWNLOAD=
TURNSTILE_SECRET_KEY=
SENTRY_DSN=
PROXY_URL=
DATABASE_URL=
NEXT_PUBLIC_API_BASE_URL=
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
```

## 8. Maintenance
- Daily scheduled job: `pip install -U yt-dlp` + smoke test on sample URLs; roll back if tests fail.
- Alert if download success rate drops below threshold.
