"use client";

import React, { useState } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
import { UrlInput } from "@/components/UrlInput";
import { VideoCard } from "@/components/VideoCard";
import { ProgressBar } from "@/components/ProgressBar";
import { HowItWorks } from "@/components/HowItWorks";
import { PlatformGrid } from "@/components/PlatformGrid";
import {
  fetchMediaInfo,
  FormatOption,
  MediaInfoResponse,
  startDownload,
} from "@/lib/api";

interface PlatformLandingProps {
  platformName: string;
  headline: string;
  subheadline: string;
  contentTitle: string;
  contentParagraphs: string[];
}

export function PlatformLanding({
  platformName,
  headline,
  subheadline,
  contentTitle,
  contentParagraphs,
}: PlatformLandingProps) {
  const [isFetching, setIsFetching] = useState(false);
  const [isStartingDownload, setIsStartingDownload] = useState(false);
  const [currentUrl, setCurrentUrl] = useState<string>("");
  const [videoInfo, setVideoInfo] = useState<MediaInfoResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [activeJob, setActiveJob] = useState<{
    jobId: string;
    token: string;
  } | null>(null);

  const handleFetch = async (url: string) => {
    setIsFetching(true);
    setErrorMessage(null);
    setActiveJob(null);
    setCurrentUrl(url);

    try {
      const data = await fetchMediaInfo(url);
      setVideoInfo(data);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : `Failed to fetch ${platformName} video details. Please verify the URL.`;
      setErrorMessage(msg);
      setVideoInfo(null);
    } finally {
      setIsFetching(false);
    }
  };

  const handleDownload = async (format: FormatOption) => {
    if (!videoInfo || !currentUrl) return;

    setIsStartingDownload(true);
    setErrorMessage(null);

    try {
      const mediaType = format.audio_only ? "audio" : "video";
      const height = format.height || 1080;

      const res = await startDownload(currentUrl, height, mediaType);
      setActiveJob({ jobId: res.job_id, token: res.token });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to initiate download.";
      setErrorMessage(msg);
    } finally {
      setIsStartingDownload(false);
    }
  };

  const handleReset = () => {
    setActiveJob(null);
    setVideoInfo(null);
    setErrorMessage(null);
    setCurrentUrl("");
  };

  return (
    <div>
      <section className="pt-10 pb-16 px-4 sm:px-6 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#2D8AF4]/10 border border-[#2D8AF4]/30 text-[#1664C0] dark:text-[#86B8F3] dark:bg-[#2D8AF4]/20 mb-5">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>{platformName} High Speed Downloader</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
          {headline}
        </h1>
        <p className="mt-3 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          {subheadline}
        </p>

        <div className="mt-8">
          <UrlInput
            value={currentUrl}
            onChange={setCurrentUrl}
            onFetch={handleFetch}
            isLoading={isFetching}
          />
        </div>

        {errorMessage && (
          <div className="mt-6 max-w-2xl mx-auto p-4 rounded-btn border border-red-200 bg-red-50 text-red-700 text-sm flex items-center gap-3 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300 text-left">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="mt-8">
          {activeJob ? (
            <ProgressBar
              jobId={activeJob.jobId}
              token={activeJob.token}
              onReset={handleReset}
            />
          ) : (
            videoInfo && (
              <VideoCard
                info={videoInfo}
                onDownload={handleDownload}
                isStarting={isStartingDownload}
              />
            )
          )}
        </div>
      </section>

      {/* SEO Long-form content */}
      <section className="py-12 border-t border-slate-200/60 dark:border-slate-800 bg-white dark:bg-surfaceDark/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-5 text-slate-600 dark:text-slate-300 text-base leading-relaxed">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {contentTitle}
          </h2>
          {contentParagraphs.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>
      </section>

      <HowItWorks />
      <PlatformGrid />
    </div>
  );
}
