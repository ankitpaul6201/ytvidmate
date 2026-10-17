"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: "Why does my downloaded video always have sound on YTVidMate?",
    answer:
      "Modern video sites serve high-definition video (1080p, 2K, 4K) as separate video and audio streams. Other downloaders give you silent videos because they don't merge them. YTVidMate utilizes background FFmpeg processing to cleanly merge both streams into a single, high-quality MP4.",
  },
  {
    question: "Is YTVidMate completely free to use?",
    answer:
      "Yes! YTVidMate is 100% free with no registration, no subscription fees, and no deceptive popup ads.",
  },
  {
    question: "Can I download audio-only MP3s from videos?",
    answer:
      "Yes. Every video processed offers an MP3 audio-only format option extracted at a clean 192kbps bitrate.",
  },
  {
    question: "Does YTVidMate support protected or DRM content?",
    answer:
      "No. YTVidMate strictly blocks DRM-protected content (such as Netflix, Disney+, Prime Video) and respects copyright holder takedown notices.",
  },
  {
    question: "How long are downloaded files kept on the server?",
    answer:
      "Files are temporary and are permanently removed automatically within 30 minutes to protect your privacy and minimize data storage.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="py-12 border-t border-slate-200/60 dark:border-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Everything you need to know about downloading videos with sound on YTVidMate.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.question}
                className="rounded-card border border-slate-200 bg-white dark:border-slate-800 dark:bg-surfaceDark overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full flex items-center justify-between p-5 text-left font-semibold text-slate-900 dark:text-slate-100 hover:text-primary dark:hover:text-primary transition-colors"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/60">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
