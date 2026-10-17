"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, Download, RefreshCw, XCircle } from "lucide-react";
import {
  getFileDownloadUrl,
  getProgressEventSourceUrl,
  ProgressEventData,
} from "@/lib/api";

interface ProgressBarProps {
  jobId: string;
  token: string;
  onReset: () => void;
}

export function ProgressBar({ jobId, token, onReset }: ProgressBarProps) {
  const [progress, setProgress] = useState<ProgressEventData>({
    status: "queued",
    percent: 0,
    speed: "",
    eta: null,
  });
  const [hasTriggeredDownload, setHasTriggeredDownload] = useState(false);

  useEffect(() => {
    const sseUrl = getProgressEventSourceUrl(jobId, token);
    const eventSource = new EventSource(sseUrl);

    eventSource.onmessage = (event) => {
      try {
        const data: ProgressEventData = JSON.parse(event.data);
        setProgress(data);

        if (data.status === "done" && !hasTriggeredDownload) {
          setHasTriggeredDownload(true);
          // Trigger browser download via invisible link
          const downloadUrl = getFileDownloadUrl(jobId, token);
          const link = document.createElement("a");
          link.href = downloadUrl;
          link.setAttribute("download", "");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }

        if (data.status === "done" || data.status === "error" || data.status === "expired") {
          eventSource.close();
        }
      } catch {
        // Parse error
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [jobId, token, hasTriggeredDownload]);

  const getStatusText = () => {
    switch (progress.status) {
      case "queued":
        return "Positioned in queue...";
      case "downloading":
        return `Downloading${progress.speed ? ` • ${progress.speed}` : ""}${
          progress.eta ? ` • ${progress.eta}s remaining` : ""
        }`;
      case "merging":
        return "Adding audio and finalizing file with FFmpeg...";
      case "done":
        return "Download complete! Your file has been saved.";
      case "error":
      case "expired":
        return progress.error || "Download failed. Please try again.";
      default:
        return "Processing...";
    }
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="w-full max-w-3xl mx-auto rounded-card border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-surfaceDark"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
          {getStatusText()}
        </span>
        <span className="text-sm font-extrabold text-primary">
          {Math.round(progress.percent)}%
        </span>
      </div>

      <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden dark:bg-slate-800">
        <div
          className={`h-full transition-all duration-300 rounded-full ${
            progress.status === "error" || progress.status === "expired"
              ? "bg-error"
              : progress.status === "done"
              ? "bg-success"
              : "bg-primary"
          }`}
          style={{ width: `${Math.max(progress.percent, 3)}%` }}
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        {progress.status === "done" ? (
          <div className="flex items-center gap-2 text-success font-semibold text-sm">
            <CheckCircle2 className="w-5 h-5" />
            <span>Ready in your downloads folder</span>
          </div>
        ) : progress.status === "error" || progress.status === "expired" ? (
          <div className="flex items-center gap-2 text-error font-semibold text-sm">
            <XCircle className="w-5 h-5" />
            <span>{progress.error || "Download encountered an error"}</span>
          </div>
        ) : (
          <div className="text-xs text-slate-400">
            Please keep this tab open while downloading.
          </div>
        )}

        <div className="flex items-center gap-2">
          {progress.status === "done" && (
            <a
              href={getFileDownloadUrl(jobId, token)}
              download
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-btn bg-primary text-white text-sm font-semibold hover:bg-primary-hover shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download Again</span>
            </a>
          )}

          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-btn border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Download Another</span>
          </button>
        </div>
      </div>
    </div>
  );
}
