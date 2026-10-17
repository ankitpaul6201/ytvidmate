# YTVidMate

> **YTVidMate** (`ytvidmate`) is a fast, clean, and secure web application where users paste a video link, pick their preferred quality (from 360p up to 4K, or audio-only MP3), and download the media with fully synchronized video and audio tracks.

---

## Architecture & Stack

- **Frontend**: Next.js 14+ (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons.
- **Backend API**: Python 3.11+ with FastAPI, Pydantic v2 Settings.
- **Media Engine**: Native Python `yt-dlp` integration + `FFmpeg` / `ffprobe` (strictly zero `shell=True`).
- **Real-time Progress**: Server-Sent Events (SSE).
- **Security & Access Control**: SSRF prevention (`validate_public_url`), IP range rejection, HMAC-SHA256 signed job tokens, rate limiting per hashed IP, and 30-minute temp storage auto-cleanup.
- **Orchestration**: Docker Compose (`infra/docker-compose.yml`), non-root `appuser` containers.

---

## Directory Structure

```
ytvidmate/
├── backend/
│   ├── app/
│   │   ├── api/v1/         # API endpoints (/info, /download, /progress, /file, /health)
│   │   ├── core/           # Security, config, rate limiter, tokens, Turnstile
│   │   ├── schemas/        # Pydantic v2 models
│   │   ├── services/       # yt-dlp service, FFmpeg service, job manager
│   │   └── main.py         # FastAPI application entrypoint
│   ├── tests/              # SSRF test suite, API tests, service tests, fixtures
│   ├── cli_runner.py       # Standalone CLI test & smoke runner
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── app/                # Next.js App Router (Home, 7 Platform Hubs, Guides, Legal, Sitemap)
│   ├── components/         # UrlInput, VideoCard, QualityChips, ProgressBar, Header, Footer
│   ├── lib/api.ts          # API client & SSE connector
│   ├── public/             # Static assets & robots.txt
│   └── Dockerfile
├── docs/                   # Full planning & architecture specifications (01-09)
├── infra/                  # docker-compose.yml
├── .github/workflows/      # CI testing & yt-dlp auto-update workflows
├── .env.example            # Empty environment variables template
├── .gitignore              # Strict ignore rules for secrets, media, and caches
└── AGENTS.md               # Guidelines for AI coding agents
```

---

## Getting Started

### 1. Prerequisites
- Python 3.11+
- Node.js 20+
- FFmpeg (on PATH or via Docker)
- Docker & Docker Compose (optional for local containerized run)

### 2. Backend Setup
```bash
cd backend
python -m venv venv

# Windows:
venv\Scripts\activate
# Linux/macOS:
# source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
API will be live at `http://localhost:8000`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Web app will be live at `http://localhost:3000`.

---

## Running Automated Tests

### Backend Tests (pytest & ruff)
```bash
cd backend
venv\Scripts\ruff check .
venv\Scripts\pytest -v
```

### Core Engine CLI Smoke Test
```bash
cd backend
python cli_runner.py --run-fixtures
```

### Frontend Tests & Type Checking
```bash
cd frontend
npm run type-check
npm run test
npm run build
```

---

## Docker Deployment

To spin up all services (backend, frontend, Redis) with resource constraints and security hardening:
```bash
cd infra
docker compose up --build -d
```

---

## Security & Compliance Highlights

1. **SSRF Defense**: All user-supplied URLs must pass `validate_public_url()` which enforces strict schemes, ports, DNS resolution, and bans loopback, private RFC1918 ranges, and cloud metadata (`169.254.169.254`).
2. **Zero Shell Execution**: yt-dlp is executed exclusively through its Python API; FFmpeg uses strict parameter arrays without `shell=True`.
3. **Signed Job Tokens**: Media downloads and progress streams require a short-lived HMAC-SHA256 signed token bound to the job UUID.
4. **Data Privacy**: Temporary files are permanently deleted after 30 minutes. Request IP addresses are hashed with rotating salts before storage for rate limiting.

---

## License

MIT License. Copyright (c) 2026 Ankit Paul.
