"use client";

import React, { useState } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { UrlInput } from "@/components/UrlInput";
import { VideoCard } from "@/components/VideoCard";
import { ProgressBar } from "@/components/ProgressBar";
import { PlatformGrid } from "@/components/PlatformGrid";
import { HowItWorks } from "@/components/HowItWorks";
import { FaqSection } from "@/components/FaqSection";
import { Footer } from "@/components/Footer";
import {
  fetchMediaInfo,
  FormatOption,
  MediaInfoResponse,
  startDownload,
} from "@/lib/api";

export default function HomePage() {
  const [isFetching, setIsFetching] = useState(false);
  const [isStartingDownload, setIsStartingDownload] = useState(false);
  const [currentUrl, setCurrentUrl] = useState<string>("");
  const [videoInfo, setVideoInfo] = useState<MediaInfoResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active download job
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
          : "Failed to fetch video information. Please verify the URL.";
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

      // Start job with validated current URL
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
  };

  return (
    <div className="min-h-screen flex flex-col bg-bgLight text-textLight dark:bg-bgDark dark:text-textDark">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-12 pb-16 px-4 sm:px-6 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-primary dark:bg-indigo-950/60 mb-5">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Guaranteed Audio & Video Synchronization</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            Free Online Video Downloader
          </h1>
          <p className="mt-3 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Paste a link, choose your preferred quality (360p to 4K or MP3), and
            download fast with clean, crystal-clear audio.
          </p>

          <div className="mt-8">
            <UrlInput onFetch={handleFetch} isLoading={isFetching} />
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mt-6 max-w-2xl mx-auto p-4 rounded-btn border border-red-200 bg-red-50 text-red-700 text-sm flex items-center gap-3 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300 text-left">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Result Card or Progress Bar */}
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

        {/* Feature Hubs and Explanations */}
        <PlatformGrid />
        <HowItWorks />
        <FaqSection />
      </main>

      <Footer />
    </div>
  );
}
