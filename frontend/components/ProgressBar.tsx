"use client";

import React, { useEffect, useRef, useState } from "react";
import { CheckCircle2, Download, RefreshCw, X, XCircle } from "lucide-react";
import {
  getFileDownloadUrl,
  getProgressEventSourceUrl,
  ProgressEventData,
} from "@/lib/api";

interface ProgressBarProps {
  jobId: string;
  token: string;
  onReset: () => void;
  onCancel?: () => void;
}

export function ProgressBar({ jobId, token, onReset, onCancel }: ProgressBarProps) {
  const [backendProgress, setBackendProgress] = useState<ProgressEventData>({
    status: "queued",
    percent: 0,
    speed: "",
    eta: null,
  });

  const [displayPercent, setDisplayPercent] = useState<number>(0);
  const [isDownloadTriggered, setIsDownloadTriggered] = useState<boolean>(false);
  const [dotCount, setDotCount] = useState<number>(1);
  const targetPercentRef = useRef<number>(0);
  const backendStatusRef = useRef<string>("queued");
  const eventSourceRef = useRef<EventSource | null>(null);

  // Smoothly center the progress container in the viewport when it appears
  useEffect(() => {
    const timer = setTimeout(() => {
      const el = document.getElementById("progress-bar-container");
      if (el) {
        const lenis = (window as unknown as { lenis?: { scrollTo: (target: HTMLElement, options?: object) => void } }).lenis;
        if (lenis) {
          lenis.scrollTo(el, { offset: -110, duration: 0.7 });
        } else {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    }, 60);

    return () => clearTimeout(timer);
  }, []);

  // Animate blinking dots from 1 to 3 one by one
  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount((prev) => (prev >= 3 ? 1 : prev + 1));
    }, 450);

    return () => clearInterval(interval);
  }, []);

  // Drive displayPercent toward targetPercent in whole number steps
  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayPercent((prev) => {
        const status = backendStatusRef.current;
        const target = targetPercentRef.current;

        // On error or expiration, halt animation
        if (status === "error" || status === "expired") {
          return prev;
        }

        // When backend is done, step smoothly up to 100% in whole numbers
        if (status === "done") {
          if (prev >= 100) return 100;
          return prev + 1;
        }

        // When target is ahead, advance toward it
        if (target > prev) {
          const diff = target - prev;
          const step = Math.max(1, Math.round(diff * 0.25));
          return Math.min(target, prev + step);
        }

        return prev;
      });
    }, 30);

    return () => clearInterval(interval);
  }, []);

  // Listen to Server-Sent Events from backend
  useEffect(() => {
    const sseUrl = getProgressEventSourceUrl(jobId, token);
    const eventSource = new EventSource(sseUrl);
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data: ProgressEventData = JSON.parse(event.data);
        backendStatusRef.current = data.status;
        setBackendProgress(data);

        if (data.status === "done") {
          targetPercentRef.current = 100;
          eventSource.close();
          eventSourceRef.current = null;
        } else if (data.status === "error" || data.status === "expired") {
          eventSource.close();
          eventSourceRef.current = null;
        } else if (typeof data.percent === "number") {
          const whole = Math.round(data.percent);
          if (whole > targetPercentRef.current) {
            targetPercentRef.current = Math.min(99, whole);
          }
        }
      } catch {
        // Ignore parse errors on malformed messages
      }
    };

    eventSource.onerror = () => {
      // Only permanently close if the job reached a terminal state.
      // Otherwise, allow the browser EventSource to automatically reconnect.
      if (
        backendStatusRef.current === "done" ||
        backendStatusRef.current === "error" ||
        backendStatusRef.current === "expired"
      ) {
        eventSource.close();
        eventSourceRef.current = null;
      }
    };

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [jobId, token]);

  const handleCancel = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (onCancel) {
      onCancel();
    } else {
      onReset();
    }
  };

  // When backend is done, immediately complete percentage and trigger file download automatically
  useEffect(() => {
    if (backendProgress.status === "done" && !isDownloadTriggered) {
      setIsDownloadTriggered(true);
      setDisplayPercent(100);

      const downloadUrl = getFileDownloadUrl(jobId, token);

      const triggerDownload = () => {
        // 1. Primary programmatic anchor click with download attribute
        try {
          const link = document.createElement("a");
          link.href = downloadUrl;
          link.setAttribute("download", "");
          link.style.display = "none";
          document.body.appendChild(link);
          link.click();
          setTimeout(() => {
            if (document.body.contains(link)) {
              document.body.removeChild(link);
            }
          }, 2000);
        } catch {
          // fallback
        }

        // 2. Invisible iframe fallback to guarantee browser saves file
        try {
          const iframe = document.createElement("iframe");
          iframe.style.display = "none";
          iframe.src = downloadUrl;
          document.body.appendChild(iframe);
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          }, 30000);
        } catch {
          // fallback
        }
      };

      const timer = setTimeout(triggerDownload, 50);
      return () => clearTimeout(timer);
    }
  }, [backendProgress.status, isDownloadTriggered, jobId, token]);

  const isFinished = displayPercent >= 100 && backendProgress.status === "done";
  const isFailed =
    backendProgress.status === "error" || backendProgress.status === "expired";

  const renderStatus = () => {
    if (isFinished) {
      return <span>Download complete!</span>;
    }
    if (isFailed) {
      return <span>{backendProgress.error || "Download failed. Please try again."}</span>;
    }
    return (
      <span className="inline-flex items-center">
        Downloading
        <span className="inline-block w-4 text-left font-bold">
          {".".repeat(dotCount)}
        </span>
      </span>
    );
  };

  return (
    <div
      id="progress-bar-container"
      role="status"
      aria-live="polite"
      className="w-full max-w-4xl mx-auto rounded-card border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-surfaceDark scroll-mt-28"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
          {renderStatus()}
        </span>
        <span className="text-sm font-extrabold text-primary">
          {Math.min(100, Math.round(displayPercent))}%
        </span>
      </div>

      <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden dark:bg-slate-800">
        <div
          className={`h-full transition-all duration-150 rounded-full ${
            isFailed
              ? "bg-error"
              : isFinished
              ? "bg-success"
              : "bg-primary"
          }`}
          style={{ width: `${Math.max(displayPercent, 3)}%` }}
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        {isFailed ? (
          <div className="flex items-center gap-2 text-error font-semibold text-sm">
            <XCircle className="w-5 h-5" />
            <span>{backendProgress.error || "Download encountered an error"}</span>
          </div>
        ) : !isFinished ? (
          <div className="text-xs text-slate-400">
            Please keep this tab open while downloading.
          </div>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-2">
          {!isFinished && !isFailed ? (
            <button
              type="button"
              onClick={handleCancel}
              className="group px-4 sm:px-5 h-9 sm:h-10 rounded-full bg-gradient-to-r from-[#FF3366] via-[#F43F5E] to-[#E11D48] hover:from-[#E11D48] hover:to-[#BE123C] text-white flex items-center justify-center gap-1.5 shadow-md shadow-rose-500/25 transition-all cursor-pointer font-medium text-xs sm:text-sm active:scale-95"
            >
              <X className="w-4 h-4 stroke-[2.5] transition-transform duration-200 ease-out group-hover:rotate-90" />
              <span>Cancel</span>
            </button>
          ) : (
            <>
              {isFinished && (
                <a
                  href={getFileDownloadUrl(jobId, token)}
                  download
                  className="group px-4 sm:px-5 h-9 sm:h-10 rounded-full bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-semibold shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </a>
              )}

              <button
                type="button"
                onClick={onReset}
                className="group px-4 sm:px-5 h-9 sm:h-10 rounded-full border border-slate-200/90 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Download Another</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
