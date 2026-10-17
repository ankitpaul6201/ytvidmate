"use client";

import React from "react";
import { Music, Video } from "lucide-react";
import { FormatOption } from "@/lib/api";

interface QualityChipsProps {
  formats: FormatOption[];
  selectedFormat: FormatOption | null;
  onSelect: (format: FormatOption) => void;
}

export function QualityChips({
  formats,
  selectedFormat,
  onSelect,
}: QualityChipsProps) {
  const videoFormats = formats.filter((f) => !f.audio_only);
  const audioFormats = formats.filter((f) => f.audio_only);

  const formatSize = (bytes?: number | null) => {
    if (!bytes) return "";
    const mb = bytes / (1024 * 1024);
    if (mb >= 1000) {
      return `~${(mb / 1024).toFixed(1)} GB`;
    }
    return `~${Math.round(mb)} MB`;
  };

  return (
    <div className="space-y-4">
      {videoFormats.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            <Video className="w-3.5 h-3.5" />
            <span>Video (Merged with Audio)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {videoFormats.map((fmt) => {
              const isSelected = selectedFormat?.format_id === fmt.format_id;
              const size = formatSize(fmt.filesize_approx);

              return (
                <button
                  key={fmt.format_id}
                  type="button"
                  onClick={() => onSelect(fmt)}
                  className={`flex flex-col items-center px-4 py-2.5 rounded-btn border text-sm font-semibold transition-all ${
                    isSelected
                      ? "border-primary bg-primary text-white shadow-sm ring-2 ring-primary/20"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-surfaceDark dark:text-slate-200 dark:hover:border-slate-600"
                  }`}
                >
                  <span>{fmt.label}</span>
                  {size && (
                    <span
                      className={`text-[11px] ${
                        isSelected ? "text-indigo-100" : "text-slate-400"
                      }`}
                    >
                      {size}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {audioFormats.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            <Music className="w-3.5 h-3.5" />
            <span>Audio Only</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {audioFormats.map((fmt) => {
              const isSelected = selectedFormat?.format_id === fmt.format_id;

              return (
                <button
                  key={fmt.format_id}
                  type="button"
                  onClick={() => onSelect(fmt)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-btn border text-sm font-semibold transition-all ${
                    isSelected
                      ? "border-primary bg-primary text-white shadow-sm ring-2 ring-primary/20"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-surfaceDark dark:text-slate-200 dark:hover:border-slate-600"
                  }`}
                >
                  <Music className="w-4 h-4" />
                  <span>{fmt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
