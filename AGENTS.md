# AGENTS.md

> Project Name: **YTVidMate** (slug: `ytvidmate`). Any AI coding agent must read this **before** touching the code.

## Project
YTVidMate — paste a link, choose quality, download the video with sound.
Stack: Next.js (TypeScript, Tailwind) frontend • FastAPI (Python) backend • yt-dlp + FFmpeg • Redis queue.

Read first: `docs/01_PRD.md`, `docs/02_TRD.md`, `docs/06_ARCHITECTURE.md`, `docs/07_DEV_RULES_AND_GIT.md`, and **`docs/09_SECURITY.md` (mandatory — security is a hard requirement, not optional)**.

## Repo Layout
```
/frontend        Next.js app (ytvidmate-frontend)
/backend         FastAPI app, workers, yt-dlp wrappers (ytvidmate-backend)
/docs            All planning documents
/infra           Dockerfiles, compose, nginx, CI
.github/workflows
AGENTS.md
```

## Security Gate (see docs/09_SECURITY.md)
Every change must comply with `09_SECURITY.md`. Before coding, identify untrusted inputs. Before merging, complete its **Section 17 checklist**. Specifically:
- All user URLs go through `validate_public_url()` (SSRF protection). Never fetch a user URL without it.
- Database access: parameterized queries / ORM only. No string-built SQL.
- Never render untrusted data with `dangerouslySetInnerHTML` / `innerHTML`; keep CSP and security headers intact.
- Every endpoint: authenticate/authorize where needed, validate input, rate-limit, return generic errors.
- Use `server-only` for server modules; never put secrets in `NEXT_PUBLIC_*`.
- If a task conflicts with `09_SECURITY.md`, stop and ask. Security wins over speed or convenience.

## Absolute Rules (never break)
1. **NEVER commit secrets**: API keys, tokens, `.env*`, private keys, credentials, DB dumps. Only `.env.example` (empty values) is allowed.
2. **NEVER print or log secrets**, and never hardcode them in code, tests, or docs.
3. **NEVER use `shell=True`** or build shell commands from user input.
4. **NEVER skip URL validation / SSRF checks** on any endpoint that accepts a URL.
5. **NEVER push directly to `main`.** Work on a branch, open a PR.
6. **NEVER force-push** shared branches or rewrite published history.
7. **NEVER add DRM-bypass code.**
8. Do not add dependencies without stating why in the PR description.
9. Do not edit generated/lock files by hand.

## Agent Roles (when splitting work across agents)
| Agent | Owns | Must not touch |
|---|---|---|
| **Frontend Agent** | `/frontend`, UI, accessibility, SEO components | backend logic |
| **Backend Agent** | `/backend`, API, queue, yt-dlp/FFmpeg | UI code |
| **DevOps Agent** | `/infra`, CI/CD, Docker, deploy | app logic |
| **QA Agent** | tests, test data, bug reports | feature code (except test fixes) |
| **SEO Agent** | metadata, schema, sitemap, landing pages, `robots.txt` | backend |
| **Docs Agent** | `/docs`, README, changelog | source code |

Agents coordinate through the API contract in `02_TRD.md`. Any contract change must update the TRD **in the same PR**.

## Workflow for Every Task
1. Read the relevant docs and existing code.
2. State a short plan before coding.
3. Create a branch: `feat/<name>`, `fix/<name>`, `chore/<name>`, `docs/<name>`.
4. Make small, focused changes.
5. Write/update tests.
6. Run: lint → type-check → tests → build (commands in `07_DEV_RULES_AND_GIT.md`).
7. Run the secret check (below) before every commit.
8. Commit with Conventional Commits. Open a PR.

## Pre-commit Secret Check
```bash
git status
git diff --staged --name-only | grep -Ei '(^|/)\.env|\.pem$|\.key$|credentials|secret' && echo "STOP: sensitive file staged"
git diff --staged | grep -Ei '(api[_-]?key|secret|token|password)\s*[:=]\s*[A-Za-z0-9_\-]{8,}' && echo "STOP: possible secret in diff"
```
If either prints STOP → unstage and fix. If a secret was ever committed, **rotate it immediately**; deleting the file is not enough.

## Code Standards
- TypeScript strict mode; Python type hints + `ruff` + `black`.
- No `any` unless justified in a comment.
- Functions small and single-purpose; meaningful names.
- Every new endpoint: input validation, error handling, rate-limit consideration, test.
- Never swallow errors silently; return clear user-facing messages, log technical details server-side.
- No `console.log` / `print` debugging left in commits.

## Definition of Done
- [ ] Works locally end-to-end
- [ ] Tests added and passing
- [ ] Lint/type-check clean
- [ ] No secrets or `.env` in diff
- [ ] Docs/TRD updated if behavior or API changed
- [ ] Accessible and responsive (UI changes)
- [ ] PR description explains what/why/how tested

## When Unsure
Ask, or write the assumption down in the PR. Don't guess on security, legal, or data-retention behavior.
