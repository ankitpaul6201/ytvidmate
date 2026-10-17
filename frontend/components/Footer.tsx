import React from "react";
import Link from "next/link";
import { Download, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-12 dark:border-slate-800 dark:bg-bgDark">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-100 dark:border-slate-800">
          <Link href="/" className="flex items-center gap-2 font-black text-xl text-primary">
            <div className="flex h-8 w-8 items-center justify-center rounded-btn bg-primary text-white">
              <Download className="h-4 w-4" />
            </div>
            <span>YTVidMate</span>
          </Link>

          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500 dark:text-slate-400">
            <Link href="/terms" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/dmca" className="hover:text-primary transition-colors">
              DMCA Takedown
            </Link>
            <Link href="/faq" className="hover:text-primary transition-colors">
              FAQ
            </Link>
          </nav>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 dark:text-slate-500">
          <p>© {new Date().getFullYear()} YTVidMate. All rights reserved.</p>
          <div className="flex items-center gap-1.5 text-center">
            <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span>Files are encrypted in transit and permanently deleted after 30 minutes.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
