# 07 — Commands, Strict Rules & Git Workflow

---

# 🚫 PART 1 — STRICT RULES (READ FIRST)

## Never commit or push
- `.env`, `.env.local`, `.env.production`, any `.env.*` (except `.env.example` with **empty** values)
- API keys, tokens, passwords, JWT secrets, Turnstile/Sentry/DB credentials
- Private keys: `*.pem`, `*.key`, `id_rsa`, `*.p12`, `*.pfx`
- Cloud credentials: `credentials.json`, `service-account*.json`, `.aws/`, `.gcloud/`
- Cookies files (`cookies.txt`), browser profiles, session dumps
- Database dumps (`*.sql`, `*.dump`, `*.sqlite`)
- Downloaded videos/audio, temp folders, logs
- `node_modules/`, `venv/`, `__pycache__/`, `.next/`, `dist/`, `build/`

## Always
1. Run the **secret check** before every commit.
2. Use `.env.example` to document variable names only.
3. Commit small, focused changes with Conventional Commit messages.
4. Branch → PR → review → merge. **Never push to `main` directly.**
5. Keep `gitleaks` in pre-commit and CI.
6. Rotate any secret that has ever touched git history, even briefly.

---

# 📄 PART 2 — `.gitignore` (copy to repo root)
```gitignore
# Secrets
.env
.env.*
!.env.example
*.pem
*.key
*.p12
*.pfx
id_rsa*
credentials.json
service-account*.json
cookies.txt
secrets/
.aws/
.gcloud/

# Dependencies
node_modules/
venv/
.venv/
__pycache__/
*.pyc

# Build output
.next/
out/
dist/
build/
.vercel/
coverage/
.pytest_cache/
.ruff_cache/
.mypy_cache/

# App data
downloads/
tmp/
temp/
*.mp4
*.mkv
*.webm
*.mp3
*.m4a
*.log
*.sql
*.dump
*.sqlite

# OS / IDE
.DS_Store
Thumbs.db
.idea/
.vscode/*
!.vscode/extensions.json
```

---

# 🔧 PART 3 — ONE-TIME SETUP COMMANDS

## Git identity
```bash
git config --global user.name "Ankit"
git config --global user.email "your-email@example.com"
git config --global init.defaultBranch main
git config --global pull.rebase true
git config --global core.autocrlf input
```

## Create repo and first push
```bash
mkdir ytvidmate && cd ytvidmate
git init
# add .gitignore, .env.example, AGENTS.md, docs/ first
git add .gitignore .env.example AGENTS.md docs/
git status                      # verify no secret files
git commit -m "chore: initial project scaffolding and docs"
git branch -M main
git remote add origin https://github.com/<your-username>/ytvidmate.git
git push -u origin main
```

## Install secret scanning (pre-commit)
```bash
pip install pre-commit
# create .pre-commit-config.yaml with gitleaks hook, then:
pre-commit install
```
`.pre-commit-config.yaml`
```yaml
repos:
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.18.4
    hooks:
      - id: gitleaks
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.6.9
    hooks:
      - id: ruff
```

## Backend setup
```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp ../.env.example .env           # then fill real values locally (never commit)
uvicorn app.main:app --reload --port 8000
```

## Frontend setup
```bash
cd frontend
npm install
cp .env.example .env.local        # fill locally (never commit)
npm run dev                       # http://localhost:3000
```

## Redis + everything via Docker
```bash
docker compose up --build
docker compose down
docker compose logs -f backend
```

## Check FFmpeg / yt-dlp
```bash
ffmpeg -version
yt-dlp --version
pip install -U yt-dlp
```

---

# 🔁 PART 4 — DAILY GIT WORKFLOW

```bash
# 1. Start from fresh main
git checkout main
git pull origin main

# 2. Create a branch
git checkout -b feat/quality-selector

# 3. Work, then review what changed
git status
git diff

# 4. SECRET CHECK (mandatory)
git diff --staged --name-only | grep -Ei '(^|/)\.env|\.pem$|\.key$|credentials|secret|cookies' && echo "STOP: sensitive file staged"
gitleaks detect --staged --verbose

# 5. Stage specific files (avoid blind `git add .`)
git add frontend/components/QualityChips.tsx
git add -p                         # interactively review hunks

# 6. Commit
git commit -m "feat(frontend): add quality selector chips"

# 7. Push branch
git push -u origin feat/quality-selector

# 8. Open PR on GitHub, wait for CI, get review, squash-merge

# 9. Clean up
git checkout main
git pull origin main
git branch -d feat/quality-selector
git push origin --delete feat/quality-selector
```

> Prefer `git add <file>` or `git add -p`. If you use `git add .`, **always** run `git status` first.

---

# 🏷️ PART 5 — COMMIT MESSAGE RULES (Conventional Commits)

Format: `type(scope): short imperative summary`

| Type | Use for |
|---|---|
| `feat` | new feature |
| `fix` | bug fix |
| `docs` | documentation only |
| `style` | formatting, no logic change |
| `refactor` | restructure, no behavior change |
| `perf` | performance |
| `test` | add/fix tests |
| `build` | build system, dependencies |
| `ci` | GitHub Actions / pipelines |
| `chore` | maintenance, tooling |
| `security` | security fixes |
| `revert` | revert a commit |

Scopes: `frontend`, `backend`, `api`, `worker`, `infra`, `seo`, `docs`, `deps`.

**Examples**
```
feat(api): add SSE progress endpoint
fix(worker): prevent merge failure on missing audio stream
security(api): block private IP ranges in URL validator
perf(frontend): lazy-load FAQ accordion
docs(seo): add schema markup guide
chore(deps): bump yt-dlp to latest
ci: add gitleaks to pull request workflow
feat(api)!: rename /download payload field   # ! = breaking change
```
Rules: ≤ 72 chars subject, imperative mood ("add", not "added"), no period, body explains *why* when non-obvious.

---

# 🌿 PART 6 — BRANCHING STRATEGY

| Branch | Purpose |
|---|---|
| `main` | production-ready, protected |
| `develop` | staging/integration (optional) |
| `feat/<name>` | new feature |
| `fix/<name>` | bug fix |
| `hotfix/<name>` | urgent prod fix from `main` |
| `docs/<name>` | docs |
| `chore/<name>` | maintenance |

**GitHub branch protection for `main`:** require PR, require 1 review, require CI status checks, block force-push, block deletion, require linear history.

---

# 🧰 PART 7 — USEFUL GIT COMMANDS

```bash
git status                         # what changed
git log --oneline --graph -20      # history
git diff --staged                  # review before commit
git restore --staged <file>        # unstage a file
git restore <file>                 # discard local changes (careful)
git commit --amend                 # fix last commit (only if NOT pushed)
git stash / git stash pop          # temporarily shelve work
git fetch --all --prune            # sync remote info
git rebase origin/main             # update branch cleanly
git cherry-pick <sha>              # copy one commit
git revert <sha>                   # safe undo (creates new commit)
git tag -a v1.0.0 -m "Release 1.0.0"
git push origin v1.0.0
git blame <file>
git bisect start                   # find which commit broke something
```

---

# 🚨 PART 8 — "I COMMITTED A SECRET" EMERGENCY PLAN

1. **Rotate/revoke the secret immediately** at the provider (this is the most important step).
2. Remove it from the code and use an env var.
3. If not pushed yet: `git reset --soft HEAD~1`, fix, recommit.
4. If pushed: rewrite history, then force-push (coordinate with the team):
```bash
pip install git-filter-repo
git filter-repo --path .env --invert-paths
git push origin --force --all
git push origin --force --tags
```
5. Ask collaborators to re-clone.
6. Check provider logs for misuse.
7. Enable GitHub **Secret Scanning + Push Protection** (Settings → Code security).

> Deleting the file in a new commit does **not** remove it from history. Always rotate.

---

# 🧪 PART 9 — BUILD, LINT, TEST COMMANDS

## Frontend
```bash
npm run lint
npm run type-check          # tsc --noEmit
npm run test                # vitest
npm run build
npx playwright test         # e2e
npm audit
npx lhci autorun            # Lighthouse CI
```

## Backend
```bash
ruff check .
black --check .
mypy app
pytest -q --cov=app
pip-audit
bandit -r app
```

## Secrets / security
```bash
gitleaks detect --verbose              # scan full history
gitleaks detect --staged               # scan staged changes
git log -p | grep -Ei 'api[_-]?key|secret|token' # quick manual look
```

---

# 🚀 PART 10 — RELEASE COMMANDS
```bash
git checkout main && git pull origin main
# update CHANGELOG.md
git commit -am "chore(release): v1.0.0"
git tag -a v1.0.0 -m "Release 1.0.0"
git push origin main --tags
# CI deploys on tag
# rollback:
git revert <bad-sha> && git push origin main
```

---

# ✅ PART 11 — PRE-PUSH CHECKLIST
- [ ] `git status` reviewed — no `.env`, keys, videos, logs
- [ ] `gitleaks detect --staged` clean
- [ ] Lint, type-check, tests pass
- [ ] Commit message follows convention
- [ ] On a feature branch, not `main`
- [ ] Docs updated if API/behavior changed
- [ ] `.env.example` updated if a new variable was added (name only, empty value)

---

# 📜 PART 12 — CHANGE LOG TRACKING
Maintain `CHANGELOG.md` (Keep a Changelog format):
```md
## [Unreleased]
### Added
### Changed
### Fixed
### Security

## [1.0.0] - YYYY-MM-DD
### Added
- Paste-link download with quality selector
```
Update it in every PR that changes user-visible behavior.

---

# 🔐 PART 13 — SECRETS MANAGEMENT
| Where | How |
|---|---|
| Local | `.env` / `.env.local` (git-ignored) |
| GitHub Actions | Repo → Settings → Secrets and variables → Actions |
| Vercel | Project → Settings → Environment Variables |
| Server | Docker secrets / `.env` with `chmod 600`, or a secret manager |
| Public variables | Only `NEXT_PUBLIC_*` values are exposed to the browser — never put secrets there |
