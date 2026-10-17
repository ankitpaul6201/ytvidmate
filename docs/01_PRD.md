# 01 — Product Requirements Document (PRD)

**Product:** YTVidMate | **Version:** 1.0 | **Owner:** Ankit | **Status:** Draft

---

## 1. Vision
A fast, clean web tool (and later desktop app) where a user **pastes a link, picks a quality, and downloads the video with sound**. No signup, no clutter, no confusing steps.

## 2. Problem
- Most downloader sites are full of ads, fake buttons, and malware-style popups.
- Many give low quality or silent video because high-quality streams come as separate video + audio files that need merging.
- Users don't know which quality/format to pick.

## 3. Target Users
| Persona | Need |
|---|---|
| Student / casual user | Save a lecture or clip for offline use, quickly |
| Content creator | Save own/licensed videos in highest quality |
| Mobile user | One-tap download, works on small screens |
| Audio listener | Extract MP3/M4A from a video |

## 4. Goals & Non-Goals
**Goals**
- Paste → Fetch → Choose quality → Download in under 3 clicks
- Output always has audio and correct quality
- Page load < 2s, mobile-first, SEO-driven organic growth

**Non-Goals (v1)**
- DRM content (Netflix, Prime, Disney+) — not possible and not supported
- User accounts, payments, social features
- Video editing

## 5. Features (Tiered Priority)
### P0 — Must have (MVP)
| ID | Feature | Acceptance Criteria |
|---|---|---|
| F1 | Paste-link input | Accepts URL, validates, auto-detects on paste |
| F2 | Metadata fetch | Shows thumbnail, title, duration, uploader within 5s |
| F3 | Quality selector | Lists available resolutions (360p → 4K) + audio-only |
| F4 | Download with merge | Final file has video + audio, correct resolution |
| F5 | Progress UI | Live percent, speed, ETA |
| F6 | Error messages | Clear messages for private/removed/geo-blocked/unsupported |
| F7 | Format output | MP4 (video), MP3/M4A (audio) |

### P1 — Should have
| F8 | Playlist support (select items) |
| F9 | Subtitle download (SRT/VTT) |
| F10 | Thumbnail download |
| F11 | Download history (local browser storage only) |
| F12 | Dark/light mode |

### P2 — Nice to have
| F13 | Desktop app (Tauri/Electron) with bundled yt-dlp + FFmpeg |
| F14 | Browser extension |
| F15 | Multi-language UI (Hindi, English first) |
| F16 | Batch link paste |

## 6. User Flow
1. Open site → see big input box.
2. Paste link (auto-fetch triggers).
3. Preview card appears with quality chips.
4. Click quality → **Download**.
5. Progress bar → file saved to device.

## 7. Supported Sources (v1 target)
Whatever yt-dlp supports and policy allows. Launch-marketed pages: YouTube, Instagram, Facebook, X/Twitter, TikTok, Vimeo, Reddit, Dailymotion. (Each gets its own SEO landing page.)

## 8. Success Metrics
| Metric | Target (3 months) |
|---|---|
| Successful download rate | ≥ 92% |
| Median time paste→download start | < 8s |
| Organic search share of traffic | ≥ 60% |
| Bounce rate | < 55% |
| Core Web Vitals | All "Good" |

## 9. Monetization (optional, later)
Non-intrusive ads on landing pages only (never fake download buttons), optional donation link, optional Pro tier (higher limits, no ads).

## 10. Legal & Compliance (IMPORTANT)
- Downloading from many platforms violates their Terms of Service; copyrighted content may be illegal to download without rights.
- Show a clear notice: *"Only download content you own or have permission to download."*
- Publish: Terms of Service, Privacy Policy, DMCA/Takedown contact page.
- Block DRM content and respect takedown requests.
- Do not store downloaded files longer than necessary (auto-delete within 30 minutes).
- Do not log full URLs with personal data; keep privacy-light analytics.

## 11. Risks
| Risk | Mitigation |
|---|---|
| Sites change → extractors break | Auto-update yt-dlp daily, health-check dashboard |
| Server IP blocked by platforms | Rotating proxies, rate limit, desktop-app fallback |
| High bandwidth cost | Stream directly, auto-delete, rate limits, CDN |
| Legal takedowns | DMCA process, ToS, clear disclaimer |
| Abuse / bots | Rate limiting, CAPTCHA (Turnstile), queue caps |

## 12. Open Questions
- Web-only first, or web + desktop together?
- Free forever, or ad-supported / Pro tier?
- Which regions to target first (India-first SEO?)
