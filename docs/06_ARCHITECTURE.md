# 06 — Architecture, Design & Workflow

---

## 1. High-Level Architecture
```
                    ┌────────────────────┐
   User Browser ──► │ Cloudflare (CDN/WAF)│
                    └─────────┬──────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
   ┌─────────────────────┐        ┌───────────────────────┐
   │ Next.js Frontend    │  REST  │ FastAPI Backend (API) │
   │ (Vercel)            │ ─────► │ validate · rate-limit │
   │ SSR/SSG, SEO pages  │ ◄───── │ SSE progress          │
   └─────────────────────┘        └──────────┬────────────┘
                                             │ enqueue
                                             ▼
                                   ┌──────────────────┐
                                   │ Redis (queue +   │
                                   │ job state)       │
                                   └────────┬─────────┘
                                            │ pull
                                            ▼
                                   ┌──────────────────┐
                                   │ Worker(s)        │
                                   │ yt-dlp → FFmpeg  │
                                   └────────┬─────────┘
                                            ▼
                                   ┌──────────────────┐
                                   │ Temp storage     │
                                   │ (auto-delete 30m)│
                                   └──────────────────┘
```

## 2. Component Responsibilities
| Component | Responsibility |
|---|---|
| Frontend | UI, SEO pages, calls API, shows progress, triggers file save |
| API | Validate input, SSRF check, rate limit, create jobs, expose status/file |
| Redis | Job queue, job state (status/percent), rate-limit counters |
| Worker | Run yt-dlp, merge with FFmpeg, update progress, write file |
| Storage | Short-lived files; cleanup cron |
| Cloudflare | Caching of static pages, DDoS/bot protection |

## 3. Sequence: Download Flow
```
User      Frontend        API            Redis        Worker
 │ paste    │              │               │             │
 │─────────►│ POST /info   │               │             │
 │          │─────────────►│ validate+SSRF │             │
 │          │              │ yt-dlp(meta)  │             │
 │ card     │◄─────────────│ formats       │             │
 │ pick 1080│              │               │             │
 │─────────►│ POST /download               │             │
 │          │─────────────►│ enqueue ─────►│             │
 │          │ ◄ job_id ────│               │ ──pull────► │
 │          │ GET /progress (SSE)          │             │ download v+a
 │ progress │◄═════════════│ ◄──── state ──│ ◄───────────│ merge (FFmpeg)
 │          │ GET /file/{id}               │             │ save file
 │ file     │◄─────────────│ stream        │             │
```

## 4. Job State Machine
```
queued → downloading → merging → done
   │          │           │
   └──────────┴───────────┴──► error
done ──(30 min)──► expired (410)
```

## 5. Repository Structure
```
ytvidmate/
├─ frontend/
│  ├─ app/                 routes, layouts, SEO metadata
│  ├─ components/
│  ├─ lib/api.ts           API client
│  ├─ public/              robots.txt, icons, og images
│  └─ tests/
├─ backend/
│  ├─ app/
│  │  ├─ main.py
│  │  ├─ api/              routes
│  │  ├─ core/             config, security, rate limit
│  │  ├─ services/         ytdlp_service.py, ffmpeg_service.py
│  │  ├─ workers/          job runner, cleanup
│  │  └─ schemas/          pydantic models
│  └─ tests/
├─ infra/                  Dockerfiles, docker-compose.yml, nginx.conf
├─ docs/                   01..08 documents
├─ .github/workflows/      ci.yml, deploy.yml, ytdlp-update.yml
├─ .env.example
├─ .gitignore
└─ AGENTS.md
```

## 6. Design Decisions
| Decision | Reason |
|---|---|
| yt-dlp as library, not CLI | Safer (no shell), progress hooks |
| Queue + workers | Long jobs shouldn't block API |
| SSE over WebSocket | Simple, one-way, auto-reconnect |
| Temp files with TTL | Lower storage cost, privacy, legal exposure |
| Next.js SSG/SSR | Crawlable HTML for SEO |
| Stateless API | Easy horizontal scaling |
| No user accounts (v1) | Less data, less liability, faster growth |

## 7. Scaling Plan
1. **Stage 1:** single VPS (API + worker + Redis in Docker Compose).
2. **Stage 2:** separate worker machines; shared Redis; object storage with lifecycle rules.
3. **Stage 3:** autoscale workers on queue depth; proxy pool; regional workers.

## 8. Observability
- Logs: structured JSON, no full URLs with tokens or personal data.
- Metrics: success rate, p95 time, queue depth, yt-dlp version, disk usage.
- Alerts: success rate < 85%, queue > threshold, disk > 80%, health check failing.

## 9. Development Workflow
```
Issue → Branch → Code → Test → Secret check → Commit → Push → PR
      → CI (lint/test/gitleaks) → Review → Squash merge → Auto-deploy → Monitor
```

## 10. Environments
| Env | Purpose | Deploy |
|---|---|---|
| local | development | `docker compose up` |
| staging | pre-release testing | auto on merge to `develop` |
| production | live | auto/manual on tag `vX.Y.Z` |
