"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Clipboard,
  Film,
  Loader2,
  Music,
  Sparkles,
  X,
} from "lucide-react";

interface UrlInputProps {
  onFetch: (url: string) => void;
  isLoading: boolean;
  value?: string;
  onChange?: (val: string) => void;
}

export function isValidVideoUrl(raw: string): boolean {
  if (!raw || typeof raw !== "string") return false;
  let clean = raw.trim();
  if (!clean) return false;

  // Strip surrounding quotes or angle brackets
  clean = clean.replace(/^[<"']+|[>"']+$/g, "");

  // URLs cannot have unencoded spaces in the hostname or domain portion
  const withoutScheme = clean.replace(/^https?:\/\//i, "");
  const hostPart = withoutScheme.split("/")[0].split("?")[0].split("#")[0];
  if (hostPart.includes(" ") || hostPart.length === 0) {
    return false;
  }

  // Prepend https:// if user entered domain without scheme
  let testUrl = clean;
  if (!/^https?:\/\//i.test(testUrl)) {
    testUrl = "https://" + testUrl;
  }

  try {
    const parsed = new URL(testUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }
    const host = parsed.hostname.toLowerCase();
    if (!host) return false;

    // Localhost allowed for dev/testing
    if (host === "localhost" || host === "127.0.0.1") return true;

    // Must have at least one dot and a valid TLD with at least 2 letters
    const hasValidDomain =
      /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,}$/i.test(
        host
      );
    return hasValidDomain;
  } catch {
    return false;
  }
}

export function normalizeUrl(raw: string): string {
  let clean = raw.trim();
  if (!clean) return "";
  // Strip surrounding quotes or angle brackets
  clean = clean.replace(/^[<"']+|[>"']+$/g, "");
  // Prepend https:// if user pasted domain without scheme
  if (!/^https?:\/\//i.test(clean) && (clean.includes(".") || clean.includes("localhost"))) {
    clean = "https://" + clean;
  }
  return clean;
}

export function UrlInput({ onFetch, isLoading, value, onChange }: UrlInputProps) {
  const [internalUrl, setInternalUrl] = useState("");
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isControlled = value !== undefined;
  const url = isControlled ? value : internalUrl;

  // Whenever fetching starts, anchor the input scroll to the very start (scrollLeft = 0)
  // so the starting characters (https://...) are always clearly visible inside the input box.
  useEffect(() => {
    if (isLoading && inputRef.current) {
      inputRef.current.scrollLeft = 0;
      try {
        inputRef.current.setSelectionRange(0, 0);
      } catch {
        // Safe fallback
      }
    }
  }, [isLoading]);

  const updateUrl = (newVal: string) => {
    if (!isControlled) {
      setInternalUrl(newVal);
    }
    onChange?.(newVal);
  };

  const triggerFetchWithUrl = (targetUrl: string) => {
    const trimmed = (targetUrl || "").trim();
    if (!trimmed) {
      setFeedbackNotice("Please enter or paste a valid video URL.");
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      inputRef.current?.focus();
      return;
    }

    if (!isValidVideoUrl(trimmed)) {
      setFeedbackNotice("Please enter a valid video link (e.g., https://www.youtube.com/watch?v=...). Search terms or plain text are not supported.");
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      inputRef.current?.focus();
      return;
    }

    const cleanUrl = normalizeUrl(trimmed);
    setFeedbackNotice(null);
    updateUrl(cleanUrl);

    // Anchor text to the left
    if (inputRef.current) {
      inputRef.current.scrollLeft = 0;
      try {
        inputRef.current.setSelectionRange(0, 0);
      } catch {
        // Safe fallback
      }
    }

    onFetch(cleanUrl);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentVal = inputRef.current?.value || url;
    triggerFetchWithUrl(currentVal);
  };

  const handleInputPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text");
    if (text) {
      const trimmed = text.trim();
      if (!isValidVideoUrl(trimmed)) {
        updateUrl(trimmed);
        setFeedbackNotice("Please enter a valid video link (e.g., https://www.youtube.com/watch?v=...). Search terms or plain text are not supported.");
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
        return;
      }

      const cleanUrl = normalizeUrl(trimmed);
      updateUrl(cleanUrl);
      setFeedbackNotice(null);
      if (inputRef.current) {
        inputRef.current.scrollLeft = 0;
      }
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.scrollLeft = 0;
          try {
            inputRef.current.setSelectionRange(0, 0);
          } catch {
            // Safe fallback
          }
        }
        onFetch(cleanUrl);
      }, 50);
    }
  };

  const handlePasteButtonClick = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          const trimmed = text.trim();
          if (!isValidVideoUrl(trimmed)) {
            updateUrl(trimmed);
            setFeedbackNotice("Please enter or paste a valid video URL (e.g. https://www.youtube.com/watch?v=...).");
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 500);
            inputRef.current?.focus();
            return;
          }
          triggerFetchWithUrl(trimmed);
          return;
        }
      }
    } catch {
      // Browser blocked clipboard reading
    }

    inputRef.current?.focus();
    setFeedbackNotice("Clipboard access blocked by browser. Please press Ctrl+V directly in the input box!");
    setTimeout(() => setFeedbackNotice(null), 4000);
  };

  const handleClear = () => {
    updateUrl("");
    setFeedbackNotice(null);
    inputRef.current?.focus();
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form
        onSubmit={handleSubmit}
        noValidate
        className={`relative w-full rounded-full bg-white/95 dark:bg-[#07132B]/95 backdrop-blur-2xl border border-white/80 dark:border-white/20 p-1.5 sm:p-2 pl-4 sm:pl-6 shadow-[0_15px_40px_-10px_rgba(3,25,80,0.18)] dark:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.6)] transition-all duration-200 focus-within:ring-4 focus-within:ring-blue-400/25 focus-within:border-white flex items-center gap-2 sm:gap-3 text-left ${
          isShaking ? "animate-bounce" : ""
        }`}
      >
        {/* Input Text Field */}
        <input
          ref={inputRef}
          type="text"
          inputMode="url"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          value={url}
          onChange={(e) => {
            updateUrl(e.target.value);
            if (feedbackNotice) setFeedbackNotice(null);
          }}
          onPaste={handleInputPaste}
          placeholder="Paste any video link..."
          readOnly={isLoading}
          className={`flex-1 min-w-0 text-xs sm:text-base font-normal text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-transparent outline-none py-1 sm:py-1.5 pl-1 pr-2 ${
            isLoading ? "cursor-wait opacity-90" : ""
          }`}
        />

        {/* Clear Button */}
        {url && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear input"
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Action Buttons in the same line */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={handlePasteButtonClick}
            aria-label="Paste from clipboard"
            className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-full border border-slate-200/80 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 cursor-pointer transition-colors"
          >
            <Clipboard className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Paste</span>
          </button>

          <button
            type="submit"
            disabled={isLoading}
            aria-label="Fetch video details"
            className="group px-3.5 sm:px-4 h-9 sm:h-10 rounded-full bg-[#1A82FF] hover:bg-blue-600 active:scale-95 text-white flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 font-medium text-xs sm:text-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Fetching...</span>
              </>
            ) : (
              <>
                <span>Fetch</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5] transition-transform duration-200 ease-out group-hover:translate-x-1" />
              </>
            )}
          </button>
        </div>
      </form>

      {isLoading && (
        <div className="mt-3 p-3 rounded-lg border border-primary/20 bg-primary/5 text-primary text-xs font-semibold flex items-center justify-center gap-2 animate-pulse text-center">
          <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
          <span>Analyzing link and extracting available qualities from server...</span>
        </div>
      )}

      {feedbackNotice && (
        <div className="mt-2.5 px-4 py-1.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs font-semibold text-center animate-fade-in inline-flex items-center justify-center gap-1.5 shadow-sm max-w-full mx-auto">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-rose-500" />
          <span className="truncate">{feedbackNotice}</span>
        </div>
      )}

      <p className="mt-3 text-[11px] sm:text-xs text-center text-slate-400 dark:text-slate-400 font-medium tracking-wide">
        Only download content you have permission or legal right to download.
      </p>
    </div>
  );
}
