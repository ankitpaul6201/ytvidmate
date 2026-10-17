"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Download, Moon, Sun } from "lucide-react";

export function Header() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial preference
    if (
      localStorage.getItem("theme") === "dark" ||
      (!localStorage.getItem("theme") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-bgDark/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-black text-xl tracking-tight text-primary">
          <div className="flex h-9 w-9 items-center justify-center rounded-btn bg-primary text-white shadow-sm">
            <Download className="h-5 w-5" />
          </div>
          <span>YTVidMate</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 sm:flex dark:text-slate-300">
          <Link href="/#supported-sites" className="transition-colors hover:text-primary">
            Platforms
          </Link>
          <Link href="/how-to/download-youtube-video-with-sound" className="transition-colors hover:text-primary">
            How It Works
          </Link>
          <Link href="/faq" className="transition-colors hover:text-primary">
            FAQ
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex h-9 w-9 items-center justify-center rounded-btn border border-slate-200 text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-surfaceDark"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
