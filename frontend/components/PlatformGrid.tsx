import React from "react";
import Link from "next/link";
import { PlaySquare, Instagram, Facebook, Twitter, Video, Share2, Film, Pin } from "lucide-react";

const PLATFORMS = [
  { name: "YouTube", href: "/youtube-downloader", icon: PlaySquare, color: "text-red-600 bg-red-50 dark:bg-red-950/30" },
  { name: "Instagram", href: "/instagram-video-downloader", icon: Instagram, color: "text-pink-600 bg-pink-50 dark:bg-pink-950/30" },
  { name: "Facebook", href: "/facebook-video-downloader", icon: Facebook, color: "text-blue-600 bg-blue-50 dark:bg-blue-950/30" },
  { name: "Pinterest", href: "/pinterest-video-downloader", icon: Pin, color: "text-rose-600 bg-rose-50 dark:bg-rose-950/30" },
  { name: "X / Twitter", href: "/twitter-video-downloader", icon: Twitter, color: "text-slate-800 bg-slate-100 dark:text-slate-200 dark:bg-slate-800" },
  { name: "TikTok", href: "/tiktok-video-downloader", icon: Share2, color: "text-cyan-600 bg-cyan-50 dark:bg-cyan-950/30" },
  { name: "Vimeo", href: "/vimeo-downloader", icon: Video, color: "text-sky-600 bg-sky-50 dark:bg-sky-950/30" },
  { name: "MP3 Audio", href: "/mp3-converter", icon: Film, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30" },
];

export function PlatformGrid() {
  return (
    <section id="supported-sites" className="py-12 border-t border-slate-200/60 dark:border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Supported Video Platforms
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Download high-quality videos and extract crystal-clear audio from all your favorite websites.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-8 gap-3">
          {PLATFORMS.map((platform) => {
            const Icon = platform.icon;
            return (
              <Link
                key={platform.name}
                href={platform.href}
                className="flex flex-col items-center p-4 rounded-card border border-slate-200 bg-white hover:border-primary/50 hover:shadow-sm transition-all text-center dark:border-slate-800 dark:bg-surfaceDark group"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2.5 transition-transform group-hover:scale-110 ${platform.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                  {platform.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
