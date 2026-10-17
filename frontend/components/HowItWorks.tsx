import React from "react";
import { Link2, Sliders, ArrowDownToLine } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Paste Video Link",
      desc: "Copy any public video link from YouTube, Instagram, or TikTok and paste it into the box.",
      icon: Link2,
    },
    {
      num: "02",
      title: "Pick Quality",
      desc: "Select your desired resolution from 360p up to pristine 4K, or choose audio-only MP3.",
      icon: Sliders,
    },
    {
      num: "03",
      title: "Instant Download",
      desc: "YTVidMate automatically merges the video and audio tracks with FFmpeg so you get full sound.",
      icon: ArrowDownToLine,
    },
  ];

  return (
    <section className="py-12 bg-slate-50 dark:bg-surfaceDark/50 border-t border-slate-200/60 dark:border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            How YTVidMate Works
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Download your favorite content in three simple, clutter-free steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.num}
                className="relative p-6 rounded-card border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-surfaceDark"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-btn bg-indigo-50 dark:bg-indigo-950/50 text-primary flex items-center justify-center font-bold">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-black text-slate-300 dark:text-slate-700">
                    {s.num}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  {s.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
