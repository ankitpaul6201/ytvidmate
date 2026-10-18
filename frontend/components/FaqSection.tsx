"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: "Why does my downloaded video always have sound on YTVidMate?",
    answer:
      "Platforms like YouTube store high-definition video (1080p, 2K, and 4K) separately from audio. Many other downloaders only grab the video track, which leaves the downloaded file completely silent. YTVidMate combines both tracks automatically before saving, so your video always plays with full sound.",
  },
  {
    question: "Is YTVidMate completely free to use?",
    answer:
      "Yes, it is 100% free. You don't need to create an account, sign up for a plan, or install any software.",
  },
  {
    question: "Can I download only the audio as an MP3?",
    answer:
      "Yes. Simply paste your link and select the MP3 option to save just the audio track for offline listening.",
  },
  {
    question: "Can I download copyrighted or DRM-protected movies?",
    answer:
      "No. YTVidMate cannot download content protected by DRM from subscription streaming services like Netflix, Disney+, or Prime Video. You should only download videos you own or have permission to save.",
  },
  {
    question: "How long are my files kept on the server?",
    answer:
      "Downloaded files are stored temporarily for up to 30 minutes so you can finish saving your file. After that, they are permanently deleted to protect your privacy.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="relative py-24 bg-white dark:bg-bgDark border-t border-slate-200/60 dark:border-slate-800/80 transition-colors scroll-mt-6">
      {/* Background subtle architectural grid lines matching the reference design */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.4] dark:opacity-[0.15]">
        <div className="max-w-6xl mx-auto h-full border-x border-slate-200 dark:border-slate-800 grid grid-cols-3 divide-x divide-slate-200 dark:divide-slate-800" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6">
        {/* Section Heading matching reference image */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-12 sm:mb-14"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
            Frequently
            <br />
            Asked Questions
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Quick answers to common questions about saving videos and audio.
          </p>
        </motion.div>

        {/* Accordion List */}
        <div className="space-y-3.5 sm:space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.45, delay: idx * 0.06, ease: [0.22, 1, 0.36, 1] }}
                className={`transition-[background-color,border-color,box-shadow] duration-300 ease-out px-6 sm:px-8 border rounded-[28px] overflow-hidden ${
                  isOpen
                    ? "bg-white dark:bg-surfaceDark border-slate-200/90 dark:border-slate-800 shadow-[0_12px_36px_-10px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_36px_-10px_rgba(0,0,0,0.5)]"
                    : "bg-[#EFF4FD] hover:bg-[#E5EEFC] dark:bg-slate-800/70 dark:hover:bg-slate-800 border-blue-100/40 dark:border-slate-700/40 shadow-xs"
                }`}
              >
                {/* Header row: rock-solid fixed height so question never jumps */}
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full min-h-[58px] sm:min-h-[62px] py-3.5 flex items-center justify-between gap-4 text-left cursor-pointer select-none group"
                >
                  <span className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white transition-colors group-hover:text-[#0077B6] dark:group-hover:text-[#00BDFF]">
                    {faq.question}
                  </span>

                  {/* Plus Icon that turns 45 deg to become a cross, and turns opposite to become plus */}
                  <div
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center flex-shrink-0 pointer-events-none transition-colors duration-300 ${
                      isOpen
                        ? "bg-[#E5EEFC] text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                        : "bg-white text-slate-800 shadow-sm dark:bg-slate-700 dark:text-white"
                    }`}
                  >
                    <Plus
                      className={`w-4 h-4 stroke-[2.2] transition-transform duration-300 ease-in-out ${
                        isOpen ? "rotate-45" : "rotate-0"
                      }`}
                    />
                  </div>
                </button>

                {/* Downward stretching boundary container */}
                <div
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="pb-5 sm:pb-6 pt-0.5 pr-6 sm:pr-12 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal max-w-2xl">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
