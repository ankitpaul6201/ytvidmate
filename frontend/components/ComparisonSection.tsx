"use client";

import React from "react";
import { Check, X, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";
import { SiteLogo } from "@/components/Icons";

interface ComparisonPoint {
  feature: string;
  others: string;
  ytvidmate: string;
}

const COMPARISON_POINTS: ComparisonPoint[] = [
  {
    feature: "Video & Audio Combined",
    others: "Videos often have no sound (audio and video downloaded separately)",
    ytvidmate: "Video and audio are combined, so sound always works",
  },
  {
    feature: "Sign-up or Login",
    others: "Forces you to create an account, enter email, or install apps",
    ytvidmate: "No sign-up or login needed — just paste and download",
  },
  {
    feature: "Price & Limits",
    others: "Daily download limits, hidden fees, or subscription paywalls",
    ytvidmate: "Completely free with unlimited downloads",
  },
  {
    feature: "Quality & Formats",
    others: "Often locked to low quality (360p or 720p)",
    ytvidmate: "Pick any resolution from 360p up to 4K, or extract MP3 audio",
  },
  {
    feature: "Ads & Safety",
    others: "Full of fake download buttons, redirects, and annoying popups",
    ytvidmate: "Clean and safe interface with zero misleading ads",
  },
  {
    feature: "Download Speed",
    others: "Slow countdown timers and artificial waiting queues",
    ytvidmate: "Fast processing with direct download links",
  },
];

export function ComparisonSection() {
  return (
    <section id="comparison" className="py-20 bg-slate-50/70 dark:bg-bgDark/50 border-t border-slate-200/70 dark:border-slate-800/80 transition-colors scroll-mt-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Why Use YTVidMate?
          </h2>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
            Most downloaders give you silent videos or spam you with popup ads. Here is how YTVidMate is different.
          </p>
        </motion.div>

        {/* 2 Comparison Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Card 1: Traditional Downloaders */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-[28px] sm:rounded-[32px] bg-white dark:bg-surfaceDark/60 p-7 sm:p-9 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-center gap-3 pb-6 border-b border-slate-100 dark:border-slate-800/80 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                  <ShieldAlert className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Other Sites
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-700 dark:text-slate-300">
                    Other Downloaders
                  </h3>
                </div>
              </div>

              {/* Feature Points */}
              <ul className="space-y-4">
                {COMPARISON_POINTS.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3.5 text-sm">
                    <div className="mt-0.5 w-5 h-5 rounded-full bg-red-100/80 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center flex-shrink-0">
                      <X className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                        {item.feature}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 text-xs sm:text-[13px] leading-relaxed">
                        {item.others}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                Slow downloads, popup ads, and silent videos
              </span>
            </div>
          </motion.div>

          {/* Card 2: YTVidMate (Highlighted) */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-[28px] sm:rounded-[32px] bg-white dark:bg-[#070F26] p-7 sm:p-9 border-2 border-[#2D8AF4]/50 shadow-[0_20px_50px_-15px_rgba(45,138,244,0.22)] dark:shadow-[0_20px_50px_-15px_rgba(45,138,244,0.4)] flex flex-col justify-between overflow-hidden"
          >
            {/* Ambient Corner Glow */}
            <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-gradient-to-br from-[#86B8F3]/25 to-[#2D8AF4]/25 blur-2xl pointer-events-none" />

            {/* Bottom Radiant Bloom */}
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#2D8AF4]/15 via-[#86B8F3]/5 to-transparent pointer-events-none rounded-b-[28px] sm:rounded-b-[32px]" />

            {/* Luminous Bottom Rim */}
            <div
              className="absolute bottom-0 inset-x-8 h-[3px] rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, transparent, #2279E5 25%, #2D8AF4 50%, #86B8F3 75%, transparent)",
                boxShadow: "0 -4px 18px 2px rgba(45, 138, 244, 0.45)",
              }}
            />

            <div className="relative z-10">
              {/* Card Header */}
              <div className="flex items-center justify-between pb-6 border-b border-blue-100/80 dark:border-slate-800 mb-6">
                <div className="flex items-center gap-3">
                  <SiteLogo className="w-9 h-9 shrink-0" />
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#2279E5] dark:text-[#86B8F3]">
                      Simple & Free
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                      YTVid<span className="text-[#2D8AF4]">Mate</span>
                    </h3>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-[#2D8AF4]/10 dark:bg-[#2D8AF4]/25 border border-[#2D8AF4]/30 text-[#1664C0] dark:text-[#86B8F3] text-[11px] font-extrabold uppercase tracking-wider">
                  Better Choice
                </span>
              </div>

              {/* Feature Points */}
              <ul className="space-y-4">
                {COMPARISON_POINTS.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3.5 text-sm">
                    <div className="mt-0.5 w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 shadow-xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {item.feature}
                      </span>
                      <span className="text-slate-600 dark:text-slate-300 text-xs sm:text-[13px] leading-relaxed">
                        {item.ytvidmate}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative z-10 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80 text-center">
              <span className="text-xs font-bold text-[#2279E5] dark:text-[#4D9AF4] flex items-center justify-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-500 stroke-[3]" />
                100% Free • No Account Needed
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
