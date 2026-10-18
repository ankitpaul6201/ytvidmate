import React from "react";

export function SiteLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      viewBox="296 148 236 300"
      className={className}
      role="img"
      aria-label="YTVidMate Logo"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="site-logo-light" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6BE4F6" />
          <stop offset="1" stopColor="#58C9FF" />
        </linearGradient>
        <linearGradient id="site-logo-band" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#0A96FF" />
          <stop offset="1" stopColor="#00BDFF" />
        </linearGradient>
        <linearGradient id="site-logo-dark" x1="0.3" y1="0" x2="0.7" y2="1">
          <stop offset="0" stopColor="#0050D2" />
          <stop offset="1" stopColor="#0592E2" />
        </linearGradient>
      </defs>

      {/* middle bright band */}
      <path fill="url(#site-logo-band)" d="M441 235 L492 270 C515 286 515 312 494 327 L404 391 L346 298 Z" />

      {/* upper light piece */}
      <path fill="url(#site-logo-light)" d="M308 178 C308 163 325 156 338 165 L441 235 L346 298 C322 290 308 278 308 258 Z" />

      {/* lower dark piece */}
      <path fill="url(#site-logo-dark)" d="M308 350 C308 330 322 312 346 298 L400 336 C421 350 425 376 404 391 L340 437 C325 447 308 438 308 422 Z" />
    </svg>
  );
}

export function DownloadGlyph({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M8 12.0001L12 16.0001M12 16.0001L16 12.0001M12 16.0001V6.80006C12 5.40935 12 4.714 11.4495 3.93546C11.0837 3.41818 10.0306 2.77974 9.40278 2.69468C8.45789 2.56666 8.09907 2.75384 7.38143 3.1282C4.18333 4.79649 2 8.14331 2 12.0001C2 17.5229 6.47715 22.0001 12 22.0001C17.5228 22.0001 22 17.5229 22 12.0001C22 8.29865 19.989 5.06693 17 3.33788"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
