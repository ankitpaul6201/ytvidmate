# 08 — Complete SEO Strategy

> **Honest note:** nobody can *guarantee* the #1 spot. Google's ranking is never promised, and broad terms like "video downloader" or "youtube downloader" are dominated by long-established sites. This plan gives you the best realistic path: win long-tail and platform-specific searches first, build authority, then climb to the head terms.

---

## 1. Keyword Strategy

### Tier 1 — Head terms (hard, long-term)
`video downloader`, `online video downloader`, `youtube video downloader`, `download video from link`

### Tier 2 — Platform pages (medium, main focus)
`instagram video downloader`, `facebook video downloader`, `twitter video downloader`, `tiktok video downloader no watermark`, `vimeo downloader`, `reddit video downloader`, `dailymotion downloader`

### Tier 3 — Long-tail / intent (easiest wins, start here)
- `how to download youtube video in 1080p with sound`
- `download video from link without software`
- `why youtube video downloads without audio`
- `youtube to mp3 converter online free`
- `download 4k video from link`
- `how to save instagram reel to gallery`
- `download video with subtitles`
- `how to merge video and audio after download`
- Hindi/Hinglish variants: `video download kaise kare`, `youtube video download link se`, `instagram reel download kaise kare`

### Keyword workflow
1. Collect ideas: Google autocomplete, "People also ask", related searches, Search Console queries.
2. Check volume/difficulty: Ahrefs/Semrush (paid), or free: Google Keyword Planner, Ubersuggest, AnswerThePublic.
3. Map **one primary keyword per page** (avoid cannibalization).
4. Track in Search Console + a rank tracker.

---

## 2. Site Structure & URLs
```
/                              video downloader (primary)
/youtube-downloader
/instagram-video-downloader
/facebook-video-downloader
/twitter-video-downloader
/tiktok-video-downloader
/vimeo-downloader
/mp3-converter
/how-to/download-youtube-video-with-sound
/how-to/download-1080p-video
/faq
/blog/...
```
Rules: lowercase, hyphens, short, keyword-first, no query strings for content pages, flat structure (≤ 3 levels), one canonical URL per page, HTTPS only, no trailing-slash duplicates (pick one, redirect the other).

---

## 3. On-Page SEO (per page)
| Element | Rule |
|---|---|
| `<title>` | 50–60 chars, primary keyword first, brand last. e.g. `YouTube Video Downloader – HD 1080p & 4K with Sound | YTVidMate` |
| Meta description | 140–160 chars, benefit + CTA, includes keyword |
| H1 | Exactly one, matches search intent |
| H2/H3 | Include secondary keywords naturally |
| First 100 words | Contain primary keyword |
| Content length | Tool pages: 600–1200 words below the tool (how-to, FAQ, features); guides: 1200–2000+ |
| Images | WebP/AVIF, descriptive `alt`, `width`/`height`, lazy-load below the fold |
| Internal links | Each page links to related platform/guide pages with descriptive anchors |
| URL | Primary keyword, short |
| Canonical | Self-referencing `<link rel="canonical">` |
| Language | `<html lang="en">`, `hreflang` if you add Hindi |

### Next.js metadata example
```tsx
// app/youtube-downloader/page.tsx
export const metadata = {
  title: "YouTube Video Downloader – HD 1080p & 4K with Sound | YTVidMate",
  description: "Paste a YouTube link and download the video in 360p to 4K with sound. Free, fast, no signup. MP4 and MP3 supported.",
  alternates: { canonical: "https://yourdomain.com/youtube-downloader" },
  openGraph: {
    title: "YouTube Video Downloader – HD with Sound",
    description: "Paste a link, pick quality, download.",
    url: "https://yourdomain.com/youtube-downloader",
    siteName: "YTVidMate",
    images: [{ url: "https://yourdomain.com/og/youtube.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};
```

---

## 4. Structured Data (JSON-LD)

### SoftwareApplication / WebApplication (home + tool pages)
```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "YTVidMate",
  "url": "https://yourdomain.com",
  "applicationCategory": "MultimediaApplication",
  "operatingSystem": "Any (Web)",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "description": "Free online video downloader. Paste a link, choose quality, download with sound."
}
```

### FAQPage (FAQ sections)
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "Why does my downloaded video have no sound?",
    "acceptedAnswer": { "@type": "Answer", "text": "High-quality videos come as separate video and audio streams. YTVidMate merges them automatically so you always get sound." }
  }]
}
```

### HowTo (guide pages)
```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to download a video from a link",
  "step": [
    { "@type": "HowToStep", "name": "Copy the link", "text": "Copy the video URL from the app or browser." },
    { "@type": "HowToStep", "name": "Paste it", "text": "Paste into the input box and press Fetch." },
    { "@type": "HowToStep", "name": "Choose quality", "text": "Select resolution or MP3." },
    { "@type": "HowToStep", "name": "Download", "text": "Click Download and save the file." }
  ]
}
```

### BreadcrumbList, Organization, WebSite
Add to every page / globally. Validate in Google's **Rich Results Test**.

> Only mark up content that is visible on the page. Don't add fake reviews or ratings — Google penalizes that.

---

## 5. Technical SEO

### Crawl & Index
- Server-render (SSR/SSG) all content pages so crawlers see full HTML.
- `robots.txt` at `/robots.txt` (file provided separately).
- `sitemap.xml` at `/sitemap.xml` (auto-generated; submit to Search Console and Bing Webmaster).
- Return correct status codes: 200, 301 (permanent redirects), 404 (real missing pages), 410 (gone). No soft 404s.
- Avoid redirect chains; avoid duplicate content (www vs non-www, http vs https, trailing slash).
- Use `noindex` on: thank-you/result pages, `/api/*`, search/filter parameter pages, staging.

### Sitemap (Next.js)
```ts
// app/sitemap.ts
import type { MetadataRoute } from "next";
const base = "https://yourdomain.com";
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", "/youtube-downloader", "/instagram-video-downloader",
    "/facebook-video-downloader", "/twitter-video-downloader",
    "/tiktok-video-downloader", "/vimeo-downloader", "/mp3-converter",
    "/faq", "/about", "/contact"];
  return paths.map((p) => ({
    url: `${base}${p}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: p === "" ? 1 : 0.8,
  }));
}
```

### Core Web Vitals targets
LCP < 2.5s • INP < 200ms • CLS < 0.1. Tactics: SSG + CDN caching, preload the main font, `font-display: swap`, minimal JS, defer third-party scripts (ads/analytics), compress images, HTTP/2 or 3, Brotli.

### Mobile
Google indexes mobile-first: same content on mobile and desktop, tap targets ≥ 44px, no intrusive interstitials.

### Security & trust signals
HTTPS + HSTS, security headers, no malware ads, clear About/Contact/Privacy/Terms/DMCA pages.

### International (optional, Hindi)
`/hi/...` paths with `hreflang="en"`, `hreflang="hi"`, and `x-default`.

---

## 6. How Google's Crawlers Work (and how this site guides them)
1. **Discovery:** Googlebot finds URLs via the sitemap, internal links, and backlinks.
2. **Crawl:** It fetches `robots.txt` first, then requests allowed URLs within its crawl budget.
3. **Render:** Googlebot renders JavaScript, but SSR HTML is indexed faster and more reliably.
4. **Index:** Content, title, links, and structured data are processed; duplicates are clustered under one canonical.
5. **Rank:** Relevance, content quality, usefulness, links, speed, mobile experience, and trust all contribute.

**Crawl-budget hygiene:** block `/api/`, temp/result URLs, and parameter spam; keep internal links crawlable (`<a href>`, not click-only JS); keep a shallow structure so every page is ≤ 3 clicks from home; fix broken links; avoid infinite URL spaces.

**Important:** `robots.txt` controls *crawling*, not *indexing*. To keep a page out of search results, allow crawling and use `<meta name="robots" content="noindex">`; a blocked page can still be indexed from external links.

---

## 7. Content Strategy
**Pillar + cluster model**
- Pillar: `/` and each platform page.
- Cluster: guides that link up to the pillars.

**Content ideas (blog/how-to)**
1. How to download a YouTube video in 1080p with sound
2. Why do downloaded videos have no audio? (and the fix)
3. Best video formats: MP4 vs WebM vs MKV
4. 1080p vs 4K: file size and quality explained
5. How to extract MP3 from a video
6. How to save Instagram Reels to your phone
7. How to download videos on Android / iPhone / PC
8. How to download subtitles (SRT) with a video
9. What is a video bitrate? (educational)
10. Is it legal to download videos? (honest, trust-building)

**Rules:** write for humans first; answer the search intent immediately; add original value (screenshots, comparison tables, troubleshooting); update pages regularly; no AI-spam or thin pages (violates Google's spam policies).

---

## 8. Link Building (Off-Page SEO)
- Submit to: Product Hunt, AlternativeTo, Slant, SaaSHub, BetaList, Indie Hackers, Hacker News "Show HN" (when ready).
- Reddit/Quora: answer real questions helpfully; avoid spam.
- Write guest posts on tech/productivity blogs; build free tools or tutorials people link to.
- GitHub: open-source a small helper/library with a link back.
- YouTube tutorials (screen recordings) linking to the site.
- Broken-link outreach to "best downloader" lists.
- Avoid: bought links, link farms, PBNs, exact-match anchor spam.

---

## 9. Brand & Local-ish Signals
Consistent name and logo, social profiles (X, Instagram, YouTube, GitHub, LinkedIn) linking to the site, Google Business not needed (no physical location).

---

## 10. Analytics & Tools
| Tool | Purpose |
|---|---|
| Google Search Console | Indexing, queries, errors, sitemap |
| Bing Webmaster Tools | Bing/DuckDuckGo traffic |
| Google Analytics 4 or Plausible | Traffic (Plausible is privacy-friendly and lightweight) |
| PageSpeed Insights / Lighthouse CI | Speed and CWV |
| Screaming Frog (free to 500 URLs) | Site crawl audit |
| Ahrefs Webmaster Tools (free) | Backlinks and site audit |
| Rich Results Test | Schema validation |

**Setup:** verify the domain in Search Console (DNS TXT), submit sitemap, request indexing for key pages, monitor "Pages" and "Core Web Vitals" reports weekly.

---

## 11. SEO Launch Checklist
- [ ] Domain with HTTPS, single canonical host (www or non-www)
- [ ] `robots.txt` live and tested
- [ ] `sitemap.xml` submitted (Google + Bing)
- [ ] Unique title + meta description on every page
- [ ] One H1 per page
- [ ] JSON-LD on home, platform pages, FAQ, guides
- [ ] OG + Twitter cards + 1200×630 images
- [ ] Favicon, apple-touch-icon, `manifest.webmanifest`
- [ ] Lighthouse SEO/Perf/A11y ≥ 95
- [ ] All pages SSR/SSG
- [ ] Internal linking map done
- [ ] Legal pages present (Terms, Privacy, DMCA, About, Contact)
- [ ] 404 page helpful, with links to the tool
- [ ] Analytics + Search Console verified
- [ ] 10+ quality guides published
- [ ] First 20 backlinks/directory listings submitted

## 12. Ongoing SEO Cadence
| Frequency | Task |
|---|---|
| Weekly | Check Search Console errors/queries; publish 1–2 guides; fix broken links |
| Monthly | Refresh top pages; track rankings; backlink outreach; CWV review |
| Quarterly | Full technical audit; keyword gap analysis; prune thin content |

## 13. Realistic Timeline
| Month | Expect |
|---|---|
| 0–1 | Indexed; impressions for long-tail terms |
| 2–3 | First page-1 rankings for low-competition long-tail |
| 4–6 | Platform pages climbing, steady organic clicks |
| 6–12+ | Competitive terms become possible with strong backlinks and content |

## 14. Risks Specific to This Niche
- Downloader sites get **DMCA complaints and Google removals**; keep a clear DMCA process and don't promote piracy.
- Google may demote sites for deceptive ads or malware-like UX — keep the UI clean.
- YouTube-specific downloader pages face the heaviest competition and legal scrutiny; diversify across many platforms and useful guides.
- **Don't use black-hat tricks** (keyword stuffing, cloaking, hidden text, link buying): they cause penalties that can end the site's search presence.
