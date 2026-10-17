# 04 — UI/UX Specification

**Product:** YTVidMate | Principle: **one input, one decision, one button.**

---

## 1. Design Principles
1. **Speed first**: the primary action is visible without scrolling on mobile.
2. **No dark patterns**: no fake download buttons, no popups, no forced redirects.
3. **Clarity**: plain words ("Download 1080p"), not jargon ("format 137+140").
4. **Mobile-first**: ~70% of traffic will be on phones.
5. **Accessible**: keyboard, screen reader, contrast ≥ 4.5:1.

## 2. Design Tokens
| Token | Value |
|---|---|
| Primary | `#6366F1` (indigo) |
| Primary hover | `#4F46E5` |
| Success | `#10B981` |
| Error | `#EF4444` |
| Warning | `#F59E0B` |
| Background light / dark | `#FFFFFF` / `#0B0F19` |
| Surface light / dark | `#F8FAFC` / `#131A2A` |
| Text light / dark | `#0F172A` / `#E5E7EB` |
| Font | Inter (system-ui fallback) |
| Radius | 12px cards, 10px inputs/buttons |
| Spacing scale | 4 / 8 / 12 / 16 / 24 / 32 / 48 |
| Breakpoints | 640 / 768 / 1024 / 1280 |

## 3. Site Map
```
/                         Home (main tool)
/youtube-downloader       Per-platform landing pages (tool embedded)
/instagram-video-downloader
/facebook-video-downloader
/twitter-video-downloader
/tiktok-video-downloader
/vimeo-downloader
/mp3-converter            Audio-extract tool page
/how-to/...               Guides (SEO content)
/faq
/blog
/about  /contact  /dmca  /terms  /privacy
```

## 4. Home Screen Layout
```
┌──────────────────────────────────────────┐
│ Logo        Platforms ▾  Guides  FAQ  ☾  │  Header
├──────────────────────────────────────────┤
│   Free Online Video Downloader           │  H1
│   Paste a link. Pick a quality. Done.    │
│  ┌──────────────────────────┐ ┌────────┐ │
│  │ Paste video link here... │ │ Fetch  │ │  Input + button
│  └──────────────────────────┘ └────────┘ │
│  Only download content you have rights to│  Notice
├──────────────────────────────────────────┤
│  [Thumbnail]  Title · 5:12 · Channel     │  Result card
│   Video: [1080p] [720p] [480p] [360p]    │
│   Audio: [MP3] [M4A]                     │
│   ┌───────────────────────────────┐      │
│   │      Download 1080p  (~52 MB) │      │
│   └───────────────────────────────┘      │
├──────────────────────────────────────────┤
│  How it works: 1 Paste · 2 Pick · 3 Save │
│  Supported sites · FAQ · Footer          │
└──────────────────────────────────────────┘
```

## 5. UI States
| State | What the user sees |
|---|---|
| Empty | Input focused, placeholder, example link |
| Pasted | Auto-fetch starts; button shows spinner |
| Loading | Skeleton card (thumbnail + text shimmer) |
| Ready | Result card, best quality pre-selected |
| Downloading | Progress bar, %, speed, ETA, Cancel button |
| Merging | "Adding sound & finishing…" indeterminate bar |
| Done | Green check, auto-save, "Download another" |
| Error | Red inline message + suggested fix + Retry |
| Rate-limited | Friendly message with wait time |

## 6. Error Copy
| Cause | Message |
|---|---|
| Invalid link | "That doesn't look like a video link. Paste the full URL." |
| Private/removed | "This video is private or no longer available." |
| Geo-blocked | "This video isn't available in our server's region." |
| DRM | "Protected content (DRM) can't be downloaded." |
| Too long/large | "This video is over our size limit (2 GB)." |
| Unsupported | "We don't support this site yet." |
| Server busy | "Lots of downloads right now. Retrying in a few seconds…" |

## 7. Interaction Details
- Auto-detect clipboard paste; "Paste" button for mobile.
- Enter key triggers fetch. Clear (×) button in input.
- Quality chips show resolution + size estimate; unavailable ones are hidden, not disabled.
- Highest quality pre-selected; 4K flagged "Large file".
- Progress is non-blocking; user can cancel.
- Playlist: checklist with "Select all", capped count.

## 8. Accessibility Checklist
- [ ] Labels on all inputs; visible focus rings
- [ ] `aria-live="polite"` for progress/status
- [ ] Color is never the only indicator
- [ ] Full keyboard navigation
- [ ] Reduced-motion respected
- [ ] Touch targets ≥ 44×44px

## 9. Performance Budget
JS < 150 KB gzipped on home; LCP < 2.5s; CLS < 0.1; INP < 200ms; fonts `font-display: swap`; images WebP/AVIF with width/height set.

## 10. Components
`UrlInput`, `FetchButton`, `VideoCard`, `QualityChips`, `DownloadButton`, `ProgressBar`, `ErrorBanner`, `PlatformGrid`, `HowItWorks`, `FaqAccordion`, `ThemeToggle`, `Header`, `Footer`, `Breadcrumbs`.

## 11. Ads Policy (if monetized)
Ads only in clearly labeled slots below the tool and on content pages; never adjacent to the Download button; no popups/popunders.
