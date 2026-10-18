"use client";

import React from "react";
import { motion } from "framer-motion";

export function LegalPageMotion({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Clean Header with Smooth Motion Entrance */}
      <motion.section
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="pt-12 pb-8 border-b border-slate-100 bg-slate-50/50"
      >
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight"
          >
            {title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.12 }}
            className="mt-2 text-sm text-slate-500"
          >
            Last updated: {lastUpdated}
          </motion.p>
        </div>
      </motion.section>

      {/* Main Content with Smooth Staggered Fade Up */}
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="flex-1 py-12 px-5 sm:px-8"
      >
        {children}
      </motion.main>
    </>
  );
}
