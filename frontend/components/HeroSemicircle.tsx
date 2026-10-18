"use client";

import React from "react";

// Current Official Brand SVG Logos for Video Platforms

// 1. YouTube - Official brand SVG logo
function YouTubeLogo({ className = "w-8 h-8 sm:w-9 sm:h-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 256 180" className={className} aria-label="YouTube" preserveAspectRatio="xMidYMid">
      <path
        d="M250.346231,28.0746923 C247.358133,17.0320558 238.732098,8.40602109 227.689461,5.41792308 C207.823743,0 127.868333,0 127.868333,0 C127.868333,0 47.9129229,0.164179487 28.0472049,5.58210256 C17.0045684,8.57020058 8.37853373,17.1962353 5.39043571,28.2388718 C-0.618533519,63.5374615 -2.94988224,117.322662 5.5546152,151.209308 C8.54271322,162.251944 17.1687479,170.877979 28.2113844,173.866077 C48.0771024,179.284 128.032513,179.284 128.032513,179.284 C128.032513,179.284 207.987923,179.284 227.853641,173.866077 C238.896277,170.877979 247.522312,162.251944 250.51041,151.209308 C256.847738,115.861464 258.801474,62.1091 250.346231,28.0746923 Z"
        fill="#FF0000"
      />
      <polygon fill="#FFFFFF" points="102.420513 128.06 168.749025 89.642 102.420513 51.224" />
    </svg>
  );
}

// 2. Instagram - Official brand SVG logo
function InstagramLogo({ className = "w-8 h-8 sm:w-9 sm:h-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 132.004 132" className={className} aria-label="Instagram">
      <defs>
        <linearGradient id="ig-b">
          <stop offset="0" stopColor="#3771c8" />
          <stop stopColor="#3771c8" offset=".128" />
          <stop offset="1" stopColor="#60f" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="ig-a">
          <stop offset="0" stopColor="#fd5" />
          <stop offset=".1" stopColor="#fd5" />
          <stop offset=".5" stopColor="#ff543e" />
          <stop offset="1" stopColor="#c837ab" />
        </linearGradient>
        <radialGradient
          id="ig-c"
          cx="158.429"
          cy="578.088"
          r="65"
          gradientUnits="userSpaceOnUse"
          gradientTransform="matrix(0 -1.98198 1.8439 0 -1031.402 454.004)"
          fx="158.429"
          fy="578.088"
        >
          <stop offset="0" stopColor="#fd5" />
          <stop offset=".1" stopColor="#fd5" />
          <stop offset=".5" stopColor="#ff543e" />
          <stop offset="1" stopColor="#c837ab" />
        </radialGradient>
        <radialGradient
          id="ig-d"
          cx="147.694"
          cy="473.455"
          r="65"
          gradientUnits="userSpaceOnUse"
          gradientTransform="matrix(.17394 .86872 -3.5818 .71718 1648.348 -458.493)"
          fx="147.694"
          fy="473.455"
        >
          <stop offset="0" stopColor="#3771c8" />
          <stop stopColor="#3771c8" offset=".128" />
          <stop offset="1" stopColor="#60f" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path
        fill="url(#ig-c)"
        d="M65.03 0C37.888 0 29.95.028 28.407.156c-5.57.463-9.036 1.34-12.812 3.22-2.91 1.445-5.205 3.12-7.47 5.468C4 13.126 1.5 18.394.595 24.656c-.44 3.04-.568 3.66-.594 19.188-.01 5.176 0 11.988 0 21.125 0 27.12.03 35.05.16 36.59.45 5.42 1.3 8.83 3.1 12.56 3.44 7.14 10.01 12.5 17.75 14.5 2.68.69 5.64 1.07 9.44 1.25 1.61.07 18.02.12 34.44.12 16.42 0 32.84-.02 34.41-.1 4.4-.207 6.955-.55 9.78-1.28 7.79-2.01 14.24-7.29 17.75-14.53 1.765-3.64 2.66-7.18 3.065-12.317.088-1.12.125-18.977.125-36.81 0-17.836-.04-35.66-.128-36.78-.41-5.22-1.305-8.73-3.127-12.44-1.495-3.037-3.155-5.305-5.565-7.624C116.9 4 111.64 1.5 105.372.596 102.335.157 101.73.027 86.19 0H65.03z"
        transform="translate(1.004 1)"
      />
      <path
        fill="url(#ig-d)"
        d="M65.03 0C37.888 0 29.95.028 28.407.156c-5.57.463-9.036 1.34-12.812 3.22-2.91 1.445-5.205 3.12-7.47 5.468C4 13.126 1.5 18.394.595 24.656c-.44 3.04-.568 3.66-.594 19.188-.01 5.176 0 11.988 0 21.125 0 27.12.03 35.05.16 36.59.45 5.42 1.3 8.83 3.1 12.56 3.44 7.14 10.01 12.5 17.75 14.5 2.68.69 5.64 1.07 9.44 1.25 1.61.07 18.02.12 34.44.12 16.42 0 32.84-.02 34.41-.1 4.4-.207 6.955-.55 9.78-1.28 7.79-2.01 14.24-7.29 17.75-14.53 1.765-3.64 2.66-7.18 3.065-12.317.088-1.12.125-18.977.125-36.81 0-17.836-.04-35.66-.128-36.78-.41-5.22-1.305-8.73-3.127-12.44-1.495-3.037-3.155-5.305-5.565-7.624C116.9 4 111.64 1.5 105.372.596 102.335.157 101.73.027 86.19 0H65.03z"
        transform="translate(1.004 1)"
      />
      <path
        fill="#fff"
        d="M66.004 18c-13.036 0-14.672.057-19.792.29-5.11.234-8.598 1.043-11.65 2.23-3.157 1.226-5.835 2.866-8.503 5.535-2.67 2.668-4.31 5.346-5.54 8.502-1.19 3.053-2 6.542-2.23 11.65C18.06 51.327 18 52.964 18 66s.058 14.667.29 19.787c.235 5.11 1.044 8.598 2.23 11.65 1.227 3.157 2.867 5.835 5.536 8.503 2.667 2.67 5.345 4.314 8.5 5.54 3.054 1.187 6.543 1.996 11.652 2.23 5.12.233 6.755.29 19.79.29 13.037 0 14.668-.057 19.788-.29 5.11-.234 8.602-1.043 11.656-2.23 3.156-1.226 5.83-2.87 8.497-5.54 2.67-2.668 4.31-5.346 5.54-8.502 1.18-3.053 1.99-6.542 2.23-11.65.23-5.12.29-6.752.29-19.788 0-13.036-.06-14.672-.29-19.792-.24-5.11-1.05-8.598-2.23-11.65-1.23-3.157-2.87-5.835-5.54-8.503-2.67-2.67-5.34-4.31-8.5-5.535-3.06-1.187-6.55-1.996-11.66-2.23-5.12-.233-6.75-.29-19.79-.29zm-4.306 8.65c1.278-.002 2.704 0 4.306 0 12.816 0 14.335.046 19.396.276 4.68.214 7.22.996 8.912 1.653 2.24.87 3.837 1.91 5.516 3.59 1.68 1.68 2.72 3.28 3.592 5.52.657 1.69 1.44 4.23 1.653 8.91.23 5.06.28 6.58.28 19.39s-.05 14.33-.28 19.39c-.214 4.68-.996 7.22-1.653 8.91-.87 2.24-1.912 3.835-3.592 5.514-1.68 1.68-3.275 2.72-5.516 3.59-1.69.66-4.232 1.44-8.912 1.654-5.06.23-6.58.28-19.396.28-12.817 0-14.336-.05-19.396-.28-4.68-.216-7.22-.998-8.913-1.655-2.24-.87-3.84-1.91-5.52-3.59-1.68-1.68-2.72-3.276-3.592-5.517-.657-1.69-1.44-4.23-1.653-8.91-.23-5.06-.276-6.58-.276-19.398s.046-14.33.276-19.39c.214-4.68.996-7.22 1.653-8.912.87-2.24 1.912-3.84 3.592-5.52 1.68-1.68 3.28-2.72 5.52-3.592 1.692-.66 4.233-1.44 8.913-1.655 4.428-.2 6.144-.26 15.09-.27zm29.928 7.97c-3.18 0-5.76 2.577-5.76 5.758 0 3.18 2.58 5.76 5.76 5.76 3.18 0 5.76-2.58 5.76-5.76 0-3.18-2.58-5.76-5.76-5.76zm-25.622 6.73c-13.613 0-24.65 11.037-24.65 24.65 0 13.613 11.037 24.645 24.65 24.645C79.617 90.645 90.65 79.613 90.65 66S79.616 41.35 66.003 41.35zm0 8.65c8.836 0 16 7.163 16 16 0 8.836-7.164 16-16 16-8.837 0-16-7.164-16-16 0-8.837 7.163-16 16-16z"
      />
    </svg>
  );
}

// 4. Facebook - Official brand SVG logo
function FacebookLogo({ className = "w-8 h-8 sm:w-9 sm:h-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 256 256" className={className} aria-label="Facebook" preserveAspectRatio="xMidYMid">
      <path
        d="M256,128 C256,57.3075 198.6925,0 128,0 C57.3075,0 0,57.3075 0,128 C0,191.8885 46.80775,244.8425 108,254.445 L108,165 L75.5,165 L75.5,128 L108,128 L108,99.8 C108,67.72 127.1095,50 156.3475,50 C170.35175,50 185,52.5 185,52.5 L185,84 L168.8595,84 C152.95875,84 148,93.86675 148,103.98925 L148,128 L183.5,128 L177.825,165 L148,165 L148,254.445 C209.19225,244.8425 256,191.8885 256,128"
        fill="#1877F2"
      />
      <path
        d="M177.825,165 L183.5,128 L148,128 L148,103.98925 C148,93.86675 152.95875,84 168.8595,84 L185,84 L185,52.5 C185,52.5 170.35175,50 156.3475,50 C127.1095,50 108,67.72 108,99.8 L108,128 L75.5,128 L75.5,165 L108,165 L108,254.445 C114.51675,255.4675 121.196,256 128,256 C134.804,256 141.48325,255.4675 148,254.445 L148,165 L177.825,165"
        fill="#FFFFFF"
      />
    </svg>
  );
}

// 5. X - Official brand SVG logo
function XLogo({ className = "w-7 h-7 sm:w-8 sm:h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 251 256" className={className} aria-label="X" preserveAspectRatio="xMidYMid">
      <path
        d="M149.078767,108.398529 L242.331303,0 L220.233437,0 L139.262272,94.1209195 L74.5908396,0 L0,0 L97.7958952,142.3275 L0,256 L22.0991185,256 L107.606755,156.605109 L175.904525,256 L250.495364,256 L149.07334,108.398529 L149.078767,108.398529 Z M118.810995,143.581438 L108.902233,129.408828 L30.0617399,16.6358981 L64.0046968,16.6358981 L127.629893,107.647252 L137.538655,121.819862 L220.243874,240.120681 L186.300917,240.120681 L118.810995,143.586865 L118.810995,143.581438 Z"
        fill="#000000"
      />
    </svg>
  );
}

// 6. Pinterest - Official brand SVG logo
function PinterestLogo({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 256 256" className={className} aria-label="Pinterest" preserveAspectRatio="xMidYMid">
      <path
        d="M0,128.002 C0,180.416 31.518,225.444 76.619,245.241 C76.259,236.303 76.555,225.573 78.847,215.848 C81.308,205.457 95.317,146.1 95.317,146.1 C95.317,146.1 91.228,137.927 91.228,125.848 C91.228,106.879 102.222,92.712 115.914,92.712 C127.557,92.712 133.182,101.457 133.182,111.929 C133.182,123.633 125.717,141.14 121.878,157.355 C118.671,170.933 128.686,182.008 142.081,182.008 C166.333,182.008 182.667,150.859 182.667,113.953 C182.667,85.899 163.772,64.901 129.405,64.901 C90.577,64.901 66.388,93.857 66.388,126.201 C66.388,137.353 69.676,145.217 74.826,151.307 C77.194,154.104 77.523,155.229 76.666,158.441 C76.052,160.796 74.642,166.466 74.058,168.713 C73.206,171.955 70.579,173.114 67.649,171.917 C49.765,164.616 41.436,145.031 41.436,123.015 C41.436,86.654 72.102,43.054 132.918,43.054 C181.788,43.054 213.953,78.418 213.953,116.379 C213.953,166.592 186.037,204.105 144.887,204.105 C131.068,204.105 118.069,196.635 113.616,188.15 C113.616,188.15 106.185,217.642 104.611,223.337 C101.897,233.206 96.585,243.07 91.728,250.758 C103.24,254.156 115.401,256.007 128.005,256.007 C198.689,256.007 256.001,198.698 256.001,128.002 C256.001,57.309 198.689,0 128.005,0 C57.314,0 0,57.309 0,128.002 Z"
        fill="#CB1F27"
      />
    </svg>
  );
}

// 7. Reddit - Official brand SVG logo
function RedditLogo({ className = "w-7 h-7 sm:w-8 sm:h-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 512 512"
      className={className}
      aria-label="Reddit"
      fillRule="evenodd"
      clipRule="evenodd"
      strokeLinejoin="round"
      strokeMiterlimit="2"
    >
      <circle cx="-892" cy="179" r="262" fill="#ff4500" transform="matrix(.9771 0 0 .9771 1127.57 81.1)" />
      <g transform="translate(1.249 1.608) scale(1.99024)">
        <circle cx="200.6" cy="123.7" r="29.9" fill="url(#rd-Radial1)" />
        <circle cx="55.4" cy="123.7" r="29.9" fill="url(#rd-Radial2)" />
        <ellipse cx="128.1" cy="149.3" rx="85.3" ry="64" fill="url(#rd-Radial3)" />
        <path
          d="M102.8 143.1c-.5 10.8-7.7 14.8-16.1 14.8-8.4 0-14.8-5.6-14.3-16.4.5-10.8 7.7-18 16.1-18 8.4 0 14.8 8.8 14.3 19.6zM183.6 141.5c.5 10.8-5.9 16.4-14.3 16.4s-15.6-3.9-16.1-14.8c-.5-10.8 5.9-19.6 14.3-19.6s15.6 7.1 16.1 18z"
          fill="#842123"
          fillRule="nonzero"
        />
        <path
          d="M153.3 144.1c.5 10.1 7.2 13.8 15 13.8s13.8-5.5 13.4-15.7c-.5-10.1-7.2-16.8-15-16.8s-13.9 8.5-13.4 18.7z"
          fill="url(#rd-Radial4)"
          fillRule="nonzero"
        />
        <path
          d="M102.8 144.1c-.5 10.1-7.2 13.8-15 13.8s-13.8-5.5-13.3-15.7c.5-10.1 7.2-16.8 15-16.8s13.8 8.5 13.3 18.7z"
          fill="url(#rd-Radial5)"
          fillRule="nonzero"
        />
        <path
          d="M128.1 165.1c-10.6 0-20.7.5-30.1 1.4-1.6.2-2.6 1.8-2 3.2 5.2 12.3 17.6 21 32.1 21s26.8-8.6 32.1-21c.6-1.5-.4-3.1-2-3.2-9.4-.9-19.5-1.4-30.1-1.4z"
          fill="#bbcfda"
          fillRule="nonzero"
        />
        <path
          d="M128.1 167.5c-10.6 0-20.7.5-30 1.5-1.6.2-2.6 1.8-2 3.3 5.2 12.5 17.6 21.3 32 21.3 14.4 0 26.8-8.8 32-21.3.6-1.5-.4-3.1-2-3.3-9.4-1-19.5-1.5-30-1.5z"
          fill="#fff"
          fillRule="nonzero"
        />
        <path
          d="M128.1 166.2c-10.4 0-20.3.5-29.5 1.4-1.6.2-2.6 1.8-2 3.2 5.2 12.3 17.3 21 31.5 21s26.3-8.6 31.5-21c.6-1.5-.4-3.1-2-3.2-9.2-.8-19.1-1.4-29.5-1.4z"
          fill="url(#rd-Radial6)"
          fillRule="nonzero"
        />
        <circle cx="174.8" cy="55.5" r="21.2" fill="url(#rd-Radial7)" />
        <path
          d="M127.8 88c-2.5 0-4.6-1.1-4.6-2.7 0-19 15.4-34.4 34.4-34.4 2.5 0 4.6 2.1 4.6 4.6 0 2.5-2.1 4.6-4.6 4.6-13.9 0-25.2 11.3-25.2 25.2 0 1.7-2.1 2.7-4.6 2.7z"
          fill="url(#rd-Radial8)"
          fillRule="nonzero"
        />
        <path
          d="M97.3 149.1c0 3.9-4.2 5.7-9.3 5.7-5.1 0-9.3-1.8-9.3-5.7 0-3.9 4.2-7.1 9.3-7.1 5.1 0 9.3 3.1 9.3 7.1zM177.5 149.1c0 3.9-4.2 5.7-9.3 5.7-5.1 0-9.3-1.8-9.3-5.7 0-3.9 4.2-7.1 9.3-7.1 5.1 0 9.3 3.1 9.3 7.1z"
          fill="#ff6101"
          fillRule="nonzero"
        />
        <ellipse cx="94.4" cy="134.8" rx="3.3" ry="3.6" fill="#ffc49c" />
        <ellipse cx="173.3" cy="134.8" rx="3.3" ry="3.6" fill="#ffc49c" />
      </g>
      <defs>
        <radialGradient id="rd-Radial1" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="matrix(59.9015 0 0 -52.2545 201.012 107.557)">
          <stop offset="0" stopColor="#feffff" />
          <stop offset=".4" stopColor="#feffff" />
          <stop offset=".51" stopColor="#f9fcfc" />
          <stop offset=".62" stopColor="#edf3f5" />
          <stop offset=".7" stopColor="#dee9ec" />
          <stop offset=".72" stopColor="#d8e4e8" />
          <stop offset=".76" stopColor="#ccd8df" />
          <stop offset=".8" stopColor="#c8d5dd" />
          <stop offset=".83" stopColor="#ccd6de" />
          <stop offset=".85" stopColor="#d8dbe2" />
          <stop offset=".88" stopColor="#ede3e9" />
          <stop offset=".9" stopColor="#ffebef" />
          <stop offset="1" stopColor="#ffebef" />
        </radialGradient>
        <radialGradient id="rd-Radial2" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="matrix(59.9015 0 0 -52.2545 55.892 107.557)">
          <stop offset="0" stopColor="#feffff" />
          <stop offset=".4" stopColor="#feffff" />
          <stop offset=".51" stopColor="#f9fcfc" />
          <stop offset=".62" stopColor="#edf3f5" />
          <stop offset=".7" stopColor="#dee9ec" />
          <stop offset=".72" stopColor="#d8e4e8" />
          <stop offset=".76" stopColor="#ccd8df" />
          <stop offset=".8" stopColor="#c8d5dd" />
          <stop offset=".83" stopColor="#ccd6de" />
          <stop offset=".85" stopColor="#d8dbe2" />
          <stop offset=".88" stopColor="#ede3e9" />
          <stop offset=".9" stopColor="#ffebef" />
          <stop offset="1" stopColor="#ffebef" />
        </radialGradient>
        <radialGradient id="rd-Radial3" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="matrix(180.687 0 0 -126.865 130.347 99.176)">
          <stop offset="0" stopColor="#feffff" />
          <stop offset=".4" stopColor="#feffff" />
          <stop offset=".51" stopColor="#f9fcfc" />
          <stop offset=".62" stopColor="#edf3f5" />
          <stop offset=".7" stopColor="#dee9ec" />
          <stop offset=".72" stopColor="#d8e4e8" />
          <stop offset=".76" stopColor="#ccd8df" />
          <stop offset=".8" stopColor="#c8d5dd" />
          <stop offset=".83" stopColor="#ccd6de" />
          <stop offset=".85" stopColor="#d8dbe2" />
          <stop offset=".88" stopColor="#ede3e9" />
          <stop offset=".9" stopColor="#ffebef" />
          <stop offset="1" stopColor="#ffebef" />
        </radialGradient>
        <radialGradient id="rd-Radial4" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="matrix(-15.0964 0 0 22.1628 165.28 150.971)">
          <stop offset="0" stopColor="#f60" />
          <stop offset=".5" stopColor="#ff4500" />
          <stop offset=".7" stopColor="#fc4301" />
          <stop offset=".82" stopColor="#f43f07" />
          <stop offset=".92" stopColor="#e53812" />
          <stop offset="1" stopColor="#d4301f" />
        </radialGradient>
        <radialGradient id="rd-Radial5" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="matrix(15.0964 0 0 22.1628 90.19 150.971)">
          <stop offset="0" stopColor="#f60" />
          <stop offset=".5" stopColor="#ff4500" />
          <stop offset=".7" stopColor="#fc4301" />
          <stop offset=".82" stopColor="#f43f07" />
          <stop offset=".92" stopColor="#e53812" />
          <stop offset="1" stopColor="#d4301f" />
        </radialGradient>
        <radialGradient id="rd-Radial6" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="matrix(53.2322 0 0 -35.1106 128.369 194.908)">
          <stop offset="0" stopColor="#172e35" />
          <stop offset=".29" stopColor="#0e1c21" />
          <stop offset=".73" stopColor="#030708" />
          <stop offset="1" />
        </radialGradient>
        <radialGradient id="rd-Radial7" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="matrix(46.7274 0 0 -46.7274 175.312 34.106)">
          <stop offset="0" stopColor="#feffff" />
          <stop offset=".4" stopColor="#feffff" />
          <stop offset=".51" stopColor="#f9fcfc" />
          <stop offset=".62" stopColor="#edf3f5" />
          <stop offset=".7" stopColor="#dee9ec" />
          <stop offset=".72" stopColor="#d8e4e8" />
          <stop offset=".76" stopColor="#ccd8df" />
          <stop offset=".8" stopColor="#c8d5dd" />
          <stop offset=".83" stopColor="#ccd6de" />
          <stop offset=".85" stopColor="#d8dbe2" />
          <stop offset=".88" stopColor="#ede3e9" />
          <stop offset=".9" stopColor="#ffebef" />
          <stop offset="1" stopColor="#ffebef" />
        </radialGradient>
        <radialGradient id="rd-Radial8" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="matrix(38.3003 0 0 -38.3003 155.84 85.046)">
          <stop offset="0" stopColor="#7a9299" />
          <stop offset=".48" stopColor="#7a9299" />
          <stop offset=".67" stopColor="#172e35" />
          <stop offset=".75" />
          <stop offset=".82" stopColor="#172e35" />
          <stop offset="1" stopColor="#172e35" />
        </radialGradient>
      </defs>
    </svg>
  );
}

interface OrbitItem {
  name: string;
  Logo: React.ElementType;
}

// Outer Orbit: Major video platforms (3 apps spaced 120° apart)
const OUTER_APPS: OrbitItem[] = [
  {
    name: "YouTube",
    Logo: YouTubeLogo,
  },
  {
    name: "Instagram",
    Logo: InstagramLogo,
  },
  {
    name: "Facebook",
    Logo: FacebookLogo,
  },
];

// Inner Orbit: Secondary video platforms (3 apps spaced 120° apart)
const INNER_APPS: OrbitItem[] = [
  {
    name: "X",
    Logo: XLogo,
  },
  {
    name: "Pinterest",
    Logo: PinterestLogo,
  },
  {
    name: "Reddit",
    Logo: RedditLogo,
  },
];

export function HeroSemicircle() {
  const outerTotal = OUTER_APPS.length;
  const outerDuration = 24; // seconds

  const innerTotal = INNER_APPS.length;
  const innerDuration = 20; // seconds

  return (
    <div className="relative w-full overflow-x-clip overflow-y-visible select-none pointer-events-none">
      {/* Semicircle stage with soft top & bottom fade so ambient glow blends seamlessly */}
      <div
        className="relative mx-auto w-full max-w-5xl h-[320px] sm:h-[420px] md:h-[480px] flex items-end justify-center"
        style={{
          maskImage:
            "linear-gradient(to top, transparent 0%, rgba(0,0,0,0.5) 4%, black 15%, black 78%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to top, transparent 0%, rgba(0,0,0,0.5) 4%, black 15%, black 78%, transparent 100%)",
        }}
      >
        {/* Layer 1: Outermost Concentric Semicircle Dome */}
        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-[-90px] sm:bottom-[-110px] w-[620px] sm:w-[860px] md:w-[980px] h-[310px] sm:h-[430px] md:h-[490px] rounded-t-full border-2 border-b-0 border-[#B7D5F9]/80 shadow-[0_-20px_45px_rgba(134,184,243,0.45)]"
          style={{
            background: "linear-gradient(to top, #86B8F3 0%, #86B8F3 55%, #B7D5F9 100%)",
          }}
        />

        {/* Layer 2: Middle Concentric Semicircle Dome */}
        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-[-90px] sm:bottom-[-110px] w-[480px] sm:w-[680px] md:w-[760px] h-[240px] sm:h-[340px] md:h-[380px] rounded-t-full border-2 border-b-0 border-white/60 dark:border-white/30 shadow-[0_-18px_40px_rgba(77,154,244,0.45)]"
          style={{
            background: "linear-gradient(to top, #4D9AF4 0%, #4D9AF4 55%, #A1CAF8 100%)",
          }}
        />

        {/* Layer 3: Inner Concentric Semicircle Dome */}
        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-[-90px] sm:bottom-[-110px] w-[340px] sm:w-[480px] md:w-[540px] h-[170px] sm:h-[240px] md:h-[270px] rounded-t-full border-2 border-b-0 border-white/60 dark:border-white/30 shadow-[0_-15px_35px_rgba(45,138,244,0.5)]"
          style={{
            background: "linear-gradient(to top, #2D8AF4 0%, #2D8AF4 55%, #99C4FB 100%)",
          }}
        />

        {/* Layer 4: Core Center Accent */}
        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-[-90px] sm:bottom-[-110px] w-[200px] sm:w-[280px] md:w-[320px] h-[100px] sm:h-[140px] md:h-[160px] rounded-t-full border-2 border-b-0 border-white/40 dark:border-white/20 shadow-[0_-10px_30px_rgba(27,120,226,0.6)]"
          style={{
            background: "linear-gradient(to top, #1664C0 0%, #2279E5 55%, #99C4FB 100%)",
          }}
        />

        {/* Outer Orbit Track Apps - Rotating on the EXACT arch of the Dome 2 dividing line (240px / 340px / 380px) */}
        <div className="absolute bottom-[-90px] sm:bottom-[-110px] left-1/2 pointer-events-auto">
          {OUTER_APPS.map((app, index) => {
            const delay = -((outerDuration / outerTotal) * index);
            const LogoComponent = app.Logo;

            return (
              <div
                key={`outer-${app.name}`}
                className="absolute bottom-0 left-0 w-0 h-[240px] sm:h-[340px] md:h-[380px] origin-bottom pointer-events-none"
                style={{
                  animation: `arc-orbit-outer ${outerDuration}s linear infinite`,
                  animationDelay: `${delay}s`,
                }}
              >
                {/* Independent centering wrapper locked at arm tip (0, 0) */}
                <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
                  <div
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center p-3 sm:p-3.5 bg-white border border-slate-100/90 shadow-[0_8px_25px_-4px_rgba(0,0,0,0.18)] cursor-pointer group"
                    style={{
                      animation: `arc-counter-outer ${outerDuration}s linear infinite`,
                      animationDelay: `${delay}s`,
                      transformOrigin: "center center",
                    }}
                    title={app.name}
                    aria-label={app.name}
                  >
                    <LogoComponent className="w-8 h-8 sm:w-9 sm:h-9 transition-transform duration-200 group-hover:scale-110" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Inner Orbit Track Apps - Rotating on the EXACT arch of the Dome 3 dividing line (170px / 240px / 270px) */}
        <div className="absolute bottom-[-90px] sm:bottom-[-110px] left-1/2 pointer-events-auto">
          {INNER_APPS.map((app, index) => {
            const delay = -((innerDuration / innerTotal) * index);
            const LogoComponent = app.Logo;

            return (
              <div
                key={`inner-${app.name}`}
                className="absolute bottom-0 left-0 w-0 h-[170px] sm:h-[240px] md:h-[270px] origin-bottom pointer-events-none"
                style={{
                  animation: `arc-orbit-inner ${innerDuration}s linear infinite`,
                  animationDelay: `${delay}s`,
                }}
              >
                {/* Independent centering wrapper locked at arm tip (0, 0) */}
                <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
                  <div
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center p-2.5 sm:p-3 bg-white border border-slate-100/90 shadow-[0_8px_20px_-4px_rgba(0,0,0,0.15)] cursor-pointer group"
                    style={{
                      animation: `arc-counter-inner ${innerDuration}s linear infinite`,
                      animationDelay: `${delay}s`,
                      transformOrigin: "center center",
                    }}
                    title={app.name}
                    aria-label={app.name}
                  >
                    <LogoComponent className="w-7 h-7 sm:w-8 sm:h-8 transition-transform duration-200 group-hover:scale-110" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Soft blur baseline at bottom ending */}
        <div className="absolute -bottom-1 left-0 right-0 h-8 pointer-events-none backdrop-blur-[2px]" />
      </div>
    </div>
  );
}
