"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SiteLogo } from "@/components/Icons";

/* Layout primitive (Container) */
const containerWidths = {
  narrow: "max-w-3xl",
  default: "max-w-6xl",
  wide: "max-w-7xl",
};

interface ContainerProps extends React.ComponentProps<"div"> {
  width?: keyof typeof containerWidths;
}

function Container({ width = "wide", className = "", ...props }: ContainerProps) {
  return (
    <div
      data-slot="container"
      className={`mx-auto w-full px-6 sm:px-8 ${containerWidths[width]} ${className}`}
      {...props}
    />
  );
}

/* Brand icons for contact list */
type IconProps = React.ComponentProps<"svg">;

function EmailIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 512 512" fill="currentColor" aria-hidden {...props}>
      <path d="M496.563,68.828H15.438C6.922,68.828,0,75.75,0,84.281v30.391l256,171.547l256-171.563V84.281 C512,75.75,505.078,68.828,496.563,68.828z" />
      <path d="M0,178.016v203.391c0,34.125,27.641,61.766,61.781,61.766h388.438c34.141,0,61.781-27.641,61.781-61.766V178 L256,349.563L0,178.016z" />
    </svg>
  );
}

const columns = [
  {
    title: "Navigation",
    links: [
      { label: "Home", href: "/" },
      { label: "Platforms", href: "/#platforms" },
      { label: "How It Works", href: "/#how-it-works" },
      { label: "Comparison", href: "/#comparison" },
      { label: "FAQ", href: "/#faq" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "DMCA Takedown", href: "/dmca" },
    ],
  },
  {
    title: "Contact",
    links: [
      { label: "grievance@ytvidmate.com", href: "mailto:grievance@ytvidmate.com" },
    ],
  },
];

export function Footer() {
  const pathname = usePathname();

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (pathname === "/" && (href.startsWith("/#") || href.startsWith("#") || href === "/")) {
      e.preventDefault();

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
    }
  };

  return (
    <footer
      className="relative overflow-hidden pt-16 sm:pt-20 transition-colors"
      style={{
        background:
          "linear-gradient(180deg, #FFFFFF 0%, #F5F9FE 4%, #E5F0FD 12%, #B7D5F9 24%, #86B8F3 44%, #4D9AF4 70%, #2D8AF4 88%, #1664C0 100%)",
      }}
    >
      {/* Top Ambient Depth Blur & Feathered Blend (seamlessly connects to section above with no separation line) */}
      <div
        aria-hidden="true"
        className="absolute top-0 inset-x-0 h-24 sm:h-32 pointer-events-none select-none z-10"
        style={{
          background:
            "linear-gradient(to bottom, rgba(255, 255, 255, 0.95) 0%, rgba(245, 249, 254, 0.6) 50%, transparent 100%)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          maskImage:
            "linear-gradient(to bottom, black 0%, rgba(0, 0, 0, 0.5) 60%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 0%, rgba(0, 0, 0, 0.5) 60%, transparent 100%)",
        }}
      />

      <Container className="pt-0 relative z-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.2fr_2fr]">
          {/* Brand Info */}
          <div className="flex max-w-sm flex-col gap-5">
            <Link
              href="/"
              onClick={(e) => handleNavClick(e, "/")}
              className="flex items-center gap-2.5 font-bold tracking-tight text-slate-900 group"
            >
              <SiteLogo className="w-7 h-7 transition-transform group-hover:scale-105" />
              <span className="text-2xl font-black text-slate-900">
                YTVid<span className="text-[#1664C0]">Mate</span>
              </span>
            </Link>

            <p className="font-poppins text-sm leading-6 text-slate-800 font-normal">
              A free online tool to download videos and audio from your favorite websites with working sound and no sign-up required.
            </p>
          </div>

          {/* Navigation Columns with Poppins font and Semicircle Hover Color */}
          <nav
            aria-label="Footer"
            className="grid grid-cols-2 gap-8 sm:grid-cols-3"
          >
            {columns.map((column) => (
              <div key={column.title}>
                <h3 className="font-poppins text-xs font-bold uppercase tracking-[0.16em] text-slate-900">
                  {column.title}
                </h3>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        onClick={(e) => handleNavClick(e, link.href)}
                        className="group font-poppins text-sm font-medium text-slate-800 hover:text-[#1664C0] inline-flex items-center py-0.5 transition-colors duration-200"
                      >
                        <span className="inline-flex items-center gap-2 transition-transform duration-200 ease-out group-hover:translate-x-1">
                          {column.title === "Contact" && (
                            <EmailIcon className="size-3.5 shrink-0 transition-colors duration-200" />
                          )}
                          <span>{link.label}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Bar: Copyright notice */}
        <div className="mt-10 sm:mt-16 border-t border-slate-900/15 pt-6 pb-2 sm:py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p className="font-poppins text-xs sm:text-sm font-medium text-slate-800">
            © {new Date().getFullYear()} YTVidMate Inc. All rights reserved.
          </p>
        </div>
      </Container>

      {/* Massive Brand Watermark in capital letters spanning edge-to-edge with a small gap */}
      <div
        aria-hidden="true"
        className="pointer-events-none select-none overflow-hidden w-full px-2 sm:px-4 md:px-6 -mb-2 sm:-mb-4"
      >
        <svg
          viewBox="0 0 1000 120"
          className="w-full h-auto block select-none pointer-events-none"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="footer-wm-gradient" x1="0" y1="0" x2="0" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
              <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
          </defs>
          <text
            x="500"
            y="108"
            textAnchor="middle"
            fill="url(#footer-wm-gradient)"
            textLength="980"
            lengthAdjust="spacingAndGlyphs"
            className="font-black"
            style={{
              fontSize: "135px",
              fontWeight: 900,
              fontFamily: "var(--font-outfit), sans-serif",
            }}
          >
            YTVIDMATE
          </text>
        </svg>
      </div>
    </footer>
  );
}
