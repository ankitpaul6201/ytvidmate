"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Clock, Download, User } from "lucide-react";
import { FormatOption, MediaInfoResponse } from "@/lib/api";
import { QualityChips } from "./QualityChips";

interface VideoCardProps {
  info: MediaInfoResponse;
  onDownload: (format: FormatOption) => void;
  isStarting: boolean;
}

export function VideoCard({ info, onDownload, isStarting }: VideoCardProps) {
  // Pre-select the highest resolution format or the first format
  const [selectedFormat, setSelectedFormat] = useState<FormatOption>(
    () => info.formats[0]
  );

  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const hours = Math.floor(mins / 60);
    if (hours > 0) {
      return `${hours}:${(mins % 60).toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const durationStr = formatDuration(info.duration);

  return (
    <div className="w-full max-w-4xl mx-auto text-left rounded-2xl sm:rounded-card border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-sm dark:border-slate-800 dark:bg-surfaceDark transition-all animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
        {info.thumbnail && (
          <div className="relative w-full sm:w-60 aspect-video sm:h-36 sm:aspect-auto flex-shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
            <Image
              src={info.thumbnail}
              alt={info.title}
              fill
              className="object-cover"
              unoptimized
            />
            {durationStr && (
              <span className="absolute bottom-2 right-2 rounded-md bg-black/85 backdrop-blur-xs px-2 py-0.5 text-[11px] font-bold text-white shadow-sm">
                {durationStr}
              </span>
            )}
          </div>
        )}

        <div className="flex-1 text-left space-y-2 sm:space-y-2.5 min-w-0 w-full">
          <h2 className="font-bold text-base sm:text-xl text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug">
            {info.title}
          </h2>

          <div className="flex flex-col gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            {info.uploader && (
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="truncate">{info.uploader}</span>
              </div>
            )}
            {durationStr && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span>{durationStr}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <hr className="my-4 sm:my-5 border-slate-100 dark:border-slate-800" />

      <QualityChips
        formats={info.formats}
        selectedFormat={selectedFormat}
        onSelect={setSelectedFormat}
      />

      <div className="mt-5 sm:mt-6">
        <button
          type="button"
          onClick={() => selectedFormat && onDownload(selectedFormat)}
          disabled={isStarting || !selectedFormat}
          className="w-full h-12 sm:h-13 py-3 px-5 sm:px-6 rounded-btn font-bold text-white bg-primary hover:bg-primary-hover shadow-md transition-all flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50 active:scale-[0.99]"
        >
          <Download className="w-5 h-5 flex-shrink-0" />
          <span className="truncate">
            {isStarting
              ? "Preparing Download..."
              : `Download ${selectedFormat?.label || "Video"}`}
          </span>
        </button>
      </div>
    </div>
  );
}
