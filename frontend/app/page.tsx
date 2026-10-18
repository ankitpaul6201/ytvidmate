"use client";

import React, { useState } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { isValidVideoUrl, UrlInput } from "@/components/UrlInput";
import { VideoCard } from "@/components/VideoCard";
import { ProgressBar } from "@/components/ProgressBar";
import { HowItWorks } from "@/components/HowItWorks";
import { ComparisonSection } from "@/components/ComparisonSection";
import { FaqSection } from "@/components/FaqSection";
import { Footer } from "@/components/Footer";
import { HeroSemicircle } from "@/components/HeroSemicircle";
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
    const trimmed = (url || "").trim();
    if (!trimmed || !isValidVideoUrl(trimmed)) {
      setErrorMessage("Please enter or paste a valid video URL (e.g. https://www.youtube.com/watch?v=...).");
      setVideoInfo(null);
      return;
    }

    setIsFetching(true);
    setErrorMessage(null);
    setActiveJob(null);
    setCurrentUrl(trimmed);

    try {
      const data = await fetchMediaInfo(trimmed);
      setVideoInfo(data);
    } catch (err: unknown) {
      let msg =
        err instanceof Error
          ? err.message
          : "Failed to fetch video information. Please verify the URL.";
      const lower = msg.toLowerCase();
      if (
        lower.includes("idna") ||
        lower.includes("codec") ||
        lower.includes("label too long") ||
        lower.includes("hostname") ||
        lower.includes("scheme") ||
        lower.includes("422") ||
        lower.includes("unprocessable") ||
        lower.includes("field required")
      ) {
        msg = "Please enter or paste a valid video URL.";
      } else if (lower.includes("500") || lower.includes("failed to fetch") || lower.includes("networkerror")) {
        msg = "Unable to reach the backend service. The server may be waking up, please try again shortly.";
      }
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

      // Smoothly scroll and center the download progress bar in the viewport
      setTimeout(() => {
        const el = document.getElementById("progress-bar-container") || document.getElementById("download-stage");
        if (el) {
          const lenis = (window as unknown as { lenis?: { scrollTo: (target: HTMLElement, options?: object) => void } }).lenis;
          if (lenis) {
            lenis.scrollTo(el, { offset: -110, duration: 0.7 });
          } else {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }
      }, 60);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to initiate download.";
      setErrorMessage(msg);
    } finally {
      setIsStartingDownload(false);
    }
  };

  const handleCancelDownload = () => {
    setActiveJob(null);
    // Keep user right in the hero section with their video details intact
    setTimeout(() => {
      const el = document.getElementById("download-stage") || document.getElementById("download-input");
      if (el) {
        const lenis = (window as unknown as { lenis?: { scrollTo: (target: HTMLElement, options?: object) => void } }).lenis;
        if (lenis) {
          lenis.scrollTo(el, { offset: -80, duration: 0.6 });
        } else {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    }, 60);
  };

  const handleReset = () => {
    setActiveJob(null);
    setVideoInfo(null);
    setErrorMessage(null);
    setCurrentUrl("");
    setTimeout(() => {
      const lenis = (window as unknown as { lenis?: { scrollTo: (target: number | HTMLElement, options?: object) => void } }).lenis;
      if (lenis) {
        lenis.scrollTo(0, { duration: 0.6 });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 50);
  };

  const homeJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://ytvidmate.com/#website",
        name: "YTVidMate",
        url: "https://ytvidmate.com",
        description: "Free online video and audio downloader with synchronized sound.",
      },
      {
        "@type": "HowTo",
        name: "How to Download Videos Online with Full Sound",
        description:
          "Save high-definition videos from YouTube, Instagram, Facebook, Pinterest, and X with synchronized audio.",
        step: [
          {
            "@type": "HowToStep",
            position: 1,
            name: "Paste the Video Link",
            text: "Copy the link of any video from YouTube, Instagram, Facebook, Pinterest, or X and paste it into the search box.",
          },
          {
            "@type": "HowToStep",
            position: 2,
            name: "Choose Your Quality",
            text: "Pick the resolution you want — from 720p, 1080p Full HD up to 4K, or choose MP3 if you only need audio.",
          },
          {
            "@type": "HowToStep",
            position: 3,
            name: "Download Your File",
            text: "Click Download. The video and audio streams are automatically merged with working sound and saved directly to your device.",
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Why does my downloaded video always have sound on YTVidMate?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Platforms like YouTube store high-definition video (1080p, 2K, and 4K) separately from audio. Many other downloaders only grab the video track, which leaves the downloaded file completely silent. YTVidMate combines both tracks automatically before saving, so your video always plays with full sound.",
            },
          },
          {
            "@type": "Question",
            name: "Is YTVidMate completely free to use?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes, it is 100% free. You don't need to create an account, sign up for a plan, or install any software.",
            },
          },
          {
            "@type": "Question",
            name: "Can I download only the audio as an MP3?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Simply paste your link and select the MP3 option to save just the audio track for offline listening.",
            },
          },
          {
            "@type": "Question",
            name: "Can I download copyrighted or DRM-protected movies?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "No. YTVidMate cannot download content protected by DRM from subscription streaming services like Netflix, Disney+, or Prime Video. You should only download videos you own or have permission to save.",
            },
          },
          {
            "@type": "Question",
            name: "How long are my files kept on the server?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Downloaded files are stored temporarily for up to 30 minutes so you can finish saving your file. After that, they are permanently deleted to protect your privacy.",
            },
          },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5faff] text-textLight overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(homeJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      {/* Hero Section Container with Space-to-Daylight Layered Backdrop Gradient */}
      <section
        id="hero"
        className="relative min-h-[auto] sm:min-h-screen flex flex-col justify-between overflow-hidden"
        style={{
          background: `
            /* 1. Top-centre light beam */
            radial-gradient(ellipse 16% 30% at 50% 0%, rgba(116, 180, 254, 0.95) 0%, rgba(20, 125, 252, 0.55) 45%, transparent 100%),
            /* 2. Darker, lower dome in the centre so the glow curves like a bowl */
            radial-gradient(ellipse 60% 42% at 50% 22%, rgba(0, 26, 64, 0.92) 0%, rgba(0, 38, 89, 0.7) 55%, transparent 100%),
            /* 3. Base vertical ramp */
            linear-gradient(180deg,
              #01193d 0%,
              #002659 19%,
              #004094 29%,
              #006df0 38%,
              #2588fd 43%,
              #6fb1ff 52%,
              #a9cffc 62%,
              #cfe4ff 71%,
              #eff6ff 82%,
              #f5faff 90%,
              #f5faff 100%
            )
          `,
        }}
      >
        {/* Soft edge vignette & subtle star-like white specks strictly in upper dark half only */}
        <div
          className="absolute inset-x-0 top-0 h-[52%] pointer-events-none select-none"
          style={{
            maskImage: "linear-gradient(to bottom, black 35%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 35%, transparent 100%)",
            background: `
              /* Soft edge vignette */
              radial-gradient(ellipse at 50% 30%, transparent 55%, rgba(0, 10, 30, 0.35) 100%),
              /* Tiny star-like white specks in the upper dark area */
              radial-gradient(1.5px 1.5px at 12% 16%, rgba(255,255,255,0.65), transparent 100%),
              radial-gradient(1px 1px at 28% 10%, rgba(255,255,255,0.55), transparent 100%),
              radial-gradient(1.5px 1.5px at 42% 18%, rgba(255,255,255,0.5), transparent 100%),
              radial-gradient(1px 1px at 65% 12%, rgba(255,255,255,0.6), transparent 100%),
              radial-gradient(2px 2px at 78% 20%, rgba(255,255,255,0.6), transparent 100%),
              radial-gradient(1px 1px at 88% 14%, rgba(255,255,255,0.5), transparent 100%),
              radial-gradient(1.5px 1.5px at 18% 28%, rgba(255,255,255,0.55), transparent 100%),
              radial-gradient(1px 1px at 34% 24%, rgba(255,255,255,0.45), transparent 100%),
              radial-gradient(1.5px 1.5px at 58% 26%, rgba(255,255,255,0.6), transparent 100%),
              radial-gradient(1px 1px at 72% 30%, rgba(255,255,255,0.5), transparent 100%),
              radial-gradient(1.5px 1.5px at 84% 28%, rgba(255,255,255,0.55), transparent 100%),
              radial-gradient(1px 1px at 93% 20%, rgba(255,255,255,0.6), transparent 100%),
              radial-gradient(1px 1px at 8% 34%, rgba(255,255,255,0.4), transparent 100%),
              radial-gradient(1.5px 1.5px at 23% 36%, rgba(255,255,255,0.45), transparent 100%),
              radial-gradient(1px 1px at 48% 34%, rgba(255,255,255,0.5), transparent 100%),
              radial-gradient(1px 1px at 64% 35%, rgba(255,255,255,0.45), transparent 100%),
              radial-gradient(1.5px 1.5px at 82% 36%, rgba(255,255,255,0.5), transparent 100%)
            `,
          }}
        />

        {/* Floating Transparent Glass Header */}
        <Header />

        {/* Hero Content Stage */}
        <div className="relative z-10 flex-1 flex flex-col justify-start sm:justify-center items-center px-4 sm:px-6 pt-10 sm:pt-14 md:pt-16 pb-14 sm:pb-12 text-center max-w-5xl mx-auto w-full">
          {/* Announcement Banner */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[11px] sm:text-xs font-medium shadow-sm mb-6 sm:mb-8 md:mb-10 select-none cursor-default max-w-full"
          >
            <span className="px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold bg-white text-slate-900 uppercase tracking-wider flex-shrink-0">
              FREE
            </span>
            <span className="truncate">Online Video & Audio Downloader</span>
          </motion.div>

          {/* Main Headline with Italic Serif styling */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.14] sm:leading-[1.12] mb-3 sm:mb-4 px-2"
          >
            Download Videos Online
            <br />
            <span className="italic font-serif font-light text-transparent bg-clip-text bg-gradient-to-r from-blue-100 via-white to-blue-200">
              In One Click
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="mt-1 sm:mt-2 text-xs sm:text-base lg:text-lg text-blue-100/90 max-w-2xl mx-auto leading-relaxed font-normal mb-4 sm:mb-8 px-2"
          >
            Paste a link from YouTube, Instagram, Facebook, Pinterest or X. Choose your
            resolution & save it as an MP4 or MP3 file. 100% free with no sign-up needed.
          </motion.p>

          {/* Redesigned Input Card */}
          <motion.div
            id="download-input"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-20 w-full mb-4 sm:mb-6"
          >
            <UrlInput
              value={currentUrl}
              onChange={(val) => {
                setCurrentUrl(val);
                if (errorMessage) setErrorMessage(null);
              }}
              onFetch={handleFetch}
              isLoading={isFetching}
            />
          </motion.div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="relative z-20 mt-4 max-w-2xl mx-auto p-4 rounded-btn border border-red-200 bg-red-50 text-red-700 text-sm flex items-center gap-3 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300 text-left">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Result Card or Progress Bar */}
          {/* Result Card or Progress Bar */}
          <div id="download-stage" className="relative z-20 mt-4 w-full scroll-mt-28">
            {activeJob ? (
              <ProgressBar
                jobId={activeJob.jobId}
                token={activeJob.token}
                onReset={handleReset}
                onCancel={handleCancelDownload}
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
        </div>
      </section>

      {/* Main Page Body: Flat #f5faff background that blends in with no visible seam */}
      <main className="flex-1 bg-[#f5faff]">
        {/* Concentric Semicircle on the clean #f5faff background with Supported Platforms Heading */}
        <motion.section
          id="platforms"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 overflow-x-clip overflow-y-visible mt-0 pt-6 sm:pt-10 pb-6 text-center max-w-6xl mx-auto scroll-mt-6"
        >
          {/* Supported Platforms Section Header */}
          <div className="mb-4 sm:mb-6 text-center max-w-xl mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Supported Platforms

            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Save videos and audios directly from YouTube, Instagram, Facebook, Pinterest and X.
            </p>
          </div>

          <HeroSemicircle />
        </motion.section>

        {/* Feature Hubs and Explanations */}
        <HowItWorks />
        <ComparisonSection />
        <FaqSection />
      </main>

      <Footer />
    </div>
  );
}
