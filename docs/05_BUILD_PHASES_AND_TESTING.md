# 05 — Building Phases & Testing

---

## Part A — Build Phases

### Phase 0 — Setup (Day 1–2)
- [ ] Create GitHub repo, branch protection on `main`
- [ ] Add `.gitignore`, `.env.example`, `AGENTS.md`, `/docs`
- [ ] Monorepo folders: `frontend`, `backend`, `infra`
- [ ] Install Node 20, Python 3.11, FFmpeg, Docker, Redis
- [ ] CI skeleton (lint + test on PR)
**Exit:** repo clones and runs "hello world" for both apps.

### Phase 1 — Core Engine (Week 1)
- [ ] Python script: URL → metadata → formats (yt-dlp)
- [ ] Quality-to-format selector, merge to MP4 with FFmpeg
- [ ] Audio-only extraction (MP3)
- [ ] Verify output has audio + correct resolution (ffprobe)
**Exit:** CLI downloads 10 sample videos correctly.

### Phase 2 — Backend API (Week 2)
- [ ] FastAPI: `/info`, `/download`, `/progress` (SSE), `/file`, `/health`
- [ ] URL validation + SSRF protection
- [ ] Redis queue + worker; temp storage; 30-min cleanup job
- [ ] Rate limiting, size/duration caps
**Exit:** all endpoints pass automated tests via curl/pytest.

### Phase 3 — Frontend MVP (Week 3)
- [ ] Next.js + Tailwind setup, design tokens
- [ ] Input → fetch → result card → quality chips → download
- [ ] Progress bar via SSE; error states
- [ ] Responsive + dark mode
**Exit:** full flow works in browser against local backend.

### Phase 4 — Hardening & Security (Week 4)
- [ ] Turnstile CAPTCHA, CORS, security headers, CSP
- [ ] Dockerize both apps, non-root users
- [ ] Sentry, health checks, yt-dlp auto-update job
- [ ] Load test; fix bottlenecks
**Exit:** security checklist (TRD §6) fully ticked.

### Phase 5 — SEO & Content (Week 5)
- [ ] Per-platform landing pages, FAQ, how-to guides
- [ ] Metadata, schema, sitemap, robots.txt (see `08_SEO.md`)
- [ ] Legal pages (Terms, Privacy, DMCA)
- [ ] Lighthouse ≥ 95 on all categories
**Exit:** pages indexed in Google Search Console.

### Phase 6 — Beta & Launch (Week 6)
- [ ] Deploy: Vercel (frontend), VPS (backend), Cloudflare in front
- [ ] Closed beta with 20–50 users; collect failures
- [ ] Fix top 10 issues; monitor success rate
- [ ] Public launch
**Exit:** success rate ≥ 90% for 7 days.

### Phase 7 — Growth (Ongoing)
Playlist support, subtitles, desktop app (Tauri), browser extension, multi-language, blog cadence, backlinks.

---

## Part B — Testing Strategy

### Test Pyramid
| Level | Tool | What |
|---|---|---|
| Unit | pytest, Vitest | URL validator, format selector, filename sanitizer, formatters |
| Integration | pytest + httpx, Redis test instance | API endpoints, queue, cleanup |
| E2E | Playwright | Paste → download flow on Chromium/Firefox/WebKit + mobile viewport |
| Contract | OpenAPI schema check | Frontend/backend agreement |
| Security | `pip-audit`, `npm audit`, OWASP ZAP, Bandit | Dependencies, SSRF, headers |
| Performance | Lighthouse CI, k6 | Core Web Vitals, concurrent jobs |
| Accessibility | axe-core, manual screen reader | WCAG 2.1 AA |

### Critical Test Cases
**Functional**
1. Valid public video → downloads at each listed quality.
2. Output file has **audio track + video track** (`ffprobe`), resolution matches selection.
3. Audio-only → valid MP3.
4. Invalid URL → clear error, no crash.
5. Private/removed/geo-blocked video → correct message.
6. Playlist URL with `noplaylist` → only one video.
7. Cancel mid-download → temp files removed.
8. File URL returns 410 after expiry.

**Security**
1. `http://localhost`, `127.0.0.1`, `169.254.169.254`, `file://`, DNS-rebinding hostnames → **rejected**.
2. Filename with `../` or shell characters → sanitized.
3. Rate limit trips at configured threshold.
4. Oversized/over-long video → rejected before download.
5. No secrets in repo: `gitleaks detect` returns clean.

**Resilience**
1. Redis down → graceful error.
2. yt-dlp extractor failure → user-friendly message + Sentry event.
3. Disk full / cleanup job failure alerts.

### Sample Test URL Set
Maintain `backend/tests/fixtures/test_urls.json` with **non-copyrighted / Creative Commons** videos per platform. Run nightly as a smoke test.

### CI Pipeline (GitHub Actions) — every PR
```
lint (eslint, ruff) → type-check (tsc, mypy) → unit tests → integration tests
→ build → gitleaks → npm audit / pip-audit → Lighthouse CI → (on main) deploy
```

### Release Checklist
- [ ] All tests green, coverage ≥ 80% on core modules
- [ ] No secrets (`gitleaks`)
- [ ] Lighthouse ≥ 95
- [ ] Manual test on Android Chrome + iOS Safari
- [ ] Changelog updated, version tagged
- [ ] Rollback plan ready
