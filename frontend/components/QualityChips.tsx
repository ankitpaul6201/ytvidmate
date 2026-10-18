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

  const getCleanLabel = (label: string) => {
    // Trim trailing MP4 from individual chips to keep text punchy and clean
    return label.replace(/\s*MP4$/i, "");
  };

  return (
    <div className="space-y-4">
      {videoFormats.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
            <Video className="w-3.5 h-3.5" />
            <span>Video (with Audio Combined)</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5">
            {videoFormats.map((fmt) => {
              const isSelected = selectedFormat?.format_id === fmt.format_id;
              const size = formatSize(fmt.filesize_approx);

              return (
                <button
                  key={fmt.format_id}
                  type="button"
                  onClick={() => onSelect(fmt)}
                  className={`min-w-0 w-full flex flex-col items-center justify-center px-2 py-2.5 rounded-btn border text-center transition-all ${
                    isSelected
                      ? "border-primary bg-primary text-white shadow-sm ring-2 ring-primary/20 scale-[1.01]"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50/80 dark:border-slate-700 dark:bg-surfaceDark dark:text-slate-200 dark:hover:border-slate-600"
                  }`}
                >
                  <span className="text-xs sm:text-sm font-bold tracking-tight truncate w-full block">
                    {getCleanLabel(fmt.label)}
                  </span>
                  <span
                    className={`text-[11px] font-medium mt-0.5 ${
                      isSelected ? "text-blue-100" : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    {size || "MP4"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {audioFormats.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
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
                  className={`w-full sm:w-auto flex items-center justify-center sm:justify-start gap-2 px-4 py-2.5 rounded-btn border text-sm font-semibold transition-all ${
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
