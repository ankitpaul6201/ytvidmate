"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Menu, X } from "lucide-react";
import { SiteLogo } from "@/components/Icons";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "Platforms", href: "/#platforms" },
  { name: "How It Works", href: "/#how-it-works" },
  { name: "Comparison", href: "/#comparison" },
  { name: "FAQ", href: "/#faq" },
];

export function Header({
  showNav,
  theme,
}: {
  showNav?: boolean;
  theme?: "light" | "dark";
}) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  // Keep navigation options on the home screen, hide on legal / other subpages unless explicitly enabled
  const shouldShowNav = showNav !== undefined ? showNav : isHome;
  const isLight = theme ? theme === "light" : !isHome;

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    try {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } catch {
      // Safe fallback
    }
  }, []);

  // Lock body scroll and listen for Escape key when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setIsMenuOpen(false);
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isMenuOpen]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (pathname === "/" && (href.startsWith("/#") || href.startsWith("#") || href === "/")) {
      e.preventDefault();
      setIsMenuOpen(false);

      if (href === "/" || href === "/#") {
        const lenis = (window as unknown as { lenis?: { scrollTo: (target: number | HTMLElement, options?: object) => void } }).lenis;
        if (lenis) {
          lenis.scrollTo(0, { duration: 1.2 });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
        window.history.pushState(null, "", "/");
        return;
      }

      const targetId = href.replace(/^\/?#/, "");
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        const lenis = (window as unknown as { lenis?: { scrollTo: (target: HTMLElement, options?: object) => void } }).lenis;
        if (lenis) {
          lenis.scrollTo(targetEl, { offset: -30, duration: 1.2 });
        } else {
          targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        window.history.pushState(null, "", `#${targetId}`);
      }
    } else {
      setIsMenuOpen(false);
    }
  };

  return (
    <>
      <header className="w-full relative z-40 bg-transparent border-0 pt-4 sm:pt-5 pb-2 transition-colors">
        <div className="relative mx-auto flex max-w-7xl items-center justify-between px-5 sm:px-8">
          {/* Brand Logo */}
          <Link
            href="/"
            onClick={(e) => handleNavClick(e, "/")}
            className="flex items-center gap-2 group z-10"
          >
            <SiteLogo className="w-6 h-6 transition-transform group-hover:scale-105" />
            <span
              className={`text-xl sm:text-2xl font-bold tracking-tight transition-colors ${
                isLight ? "text-slate-900" : "text-white"
              }`}
            >
              YTVid
              <span className={isLight ? "text-[#1664C0]" : "text-[#86B8F3]"}>
                Mate
              </span>
            </span>
          </Link>

          {shouldShowNav && (
            <>
              {/* Desktop Centered Navigation (Home Screen) */}
              <nav
                className={`hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-7 text-xs sm:text-[13px] font-medium transition-colors ${
                  isLight ? "text-slate-700" : "text-white/80"
                }`}
              >
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className={`transition-colors cursor-pointer ${
                      isLight
                        ? "hover:text-[#1664C0]"
                        : "hover:text-white"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>

              {/* Desktop Right Balancing Spacer */}
              <div className="hidden md:block w-10 sm:w-28 pointer-events-none" />

              {/* Mobile Hamburger Button (Right side) */}
              <div className="md:hidden flex items-center">
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(true)}
                  aria-label="Open mobile navigation menu"
                  aria-expanded={isMenuOpen}
                  className={`flex h-9 w-9 items-center justify-center rounded-xl border backdrop-blur-md transition-all active:scale-95 cursor-pointer shadow-sm ${
                    isLight
                      ? "border-slate-200 bg-white/90 text-slate-800 hover:bg-slate-100"
                      : "border-white/20 bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  <Menu className="h-5 w-5" />
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {shouldShowNav && (
        <>
          {/* Mobile Drawer Backdrop Overlay */}
          <div
            onClick={() => setIsMenuOpen(false)}
            className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 transition-opacity duration-300 md:hidden ${
              isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
            aria-hidden="true"
          />

          {/* Mobile Right Slide-Over Drawer */}
          <aside
            className={`fixed top-0 bottom-0 right-0 z-50 w-[84vw] max-w-xs bg-white/95 backdrop-blur-2xl shadow-[-10px_0_40px_rgba(0,0,0,0.2)] border-l border-white/80 p-6 flex flex-col justify-between transition-transform duration-300 ease-out transform md:hidden ${
              isMenuOpen ? "translate-x-0" : "translate-x-full"
            }`}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation"
          >
            <div>
              {/* Drawer Top Header Row */}
              <div className="flex items-center justify-between pb-5 border-b border-slate-100">
                <Link
                  href="/"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 group"
                >
                  <SiteLogo className="w-6 h-6 transition-transform group-hover:scale-105" />
                  <span className="text-xl font-bold tracking-tight text-slate-900">
                    YTVid<span className="text-[#1664C0]">Mate</span>
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Close navigation menu"
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="mt-6 flex flex-col space-y-1.5">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className="flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:text-[#1A82FF] hover:bg-blue-50/80 transition-all active:scale-[0.99] cursor-pointer"
                  >
                    <span>{link.name}</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>
                ))}
              </nav>
            </div>

            {/* Drawer Bottom Info Card */}
            <div className="pt-6 border-t border-slate-100 text-center">
              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 text-left mb-3">
                <span className="text-[11px] font-bold text-[#1A82FF] uppercase tracking-wider block mb-1">
                  100% Free Downloader
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Download unlimited high-definition videos with merged sound from any platform.
                </p>
              </div>
              <p className="text-[11px] text-slate-400">
                © {new Date().getFullYear()} YTVidMate. All rights reserved.
              </p>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
