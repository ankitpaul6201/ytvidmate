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
    <div className="w-full max-w-3xl mx-auto rounded-card border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-surfaceDark transition-all animate-fade-in">
      <div className="flex flex-col md:flex-row gap-5">
        {info.thumbnail && (
          <div className="relative w-full md:w-60 h-40 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
            <Image
              src={info.thumbnail}
              alt={info.title}
              fill
              className="object-cover"
              unoptimized
            />
            {durationStr && (
              <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-[11px] font-bold text-white">
                {durationStr}
              </span>
            )}
          </div>
        )}

        <div className="flex-1 space-y-2">
          <h2 className="font-bold text-lg text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug">
            {info.title}
          </h2>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            {info.uploader && (
              <div className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                <span>{info.uploader}</span>
              </div>
            )}
            {durationStr && (
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{durationStr}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <hr className="my-5 border-slate-100 dark:border-slate-800" />

      <QualityChips
        formats={info.formats}
        selectedFormat={selectedFormat}
        onSelect={setSelectedFormat}
      />

      <div className="mt-6">
        <button
          type="button"
          onClick={() => selectedFormat && onDownload(selectedFormat)}
          disabled={isStarting || !selectedFormat}
          className="w-full h-13 py-3 px-6 rounded-btn font-bold text-white bg-primary hover:bg-primary-hover shadow-md transition-colors flex items-center justify-center gap-2 text-base disabled:opacity-50"
        >
          <Download className="w-5 h-5" />
          <span>
            {isStarting
              ? "Preparing Download..."
              : `Download ${selectedFormat?.label || "Video"}`}
          </span>
        </button>
      </div>
    </div>
  );
}
