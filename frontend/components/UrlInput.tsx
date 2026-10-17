"use client";

import React, { useRef, useState } from "react";
import { ArrowRight, Clipboard, Loader2, X } from "lucide-react";

interface UrlInputProps {
  onFetch: (url: string) => void;
  isLoading: boolean;
}

function normalizeUrl(raw: string): string {
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

export function UrlInput({ onFetch, isLoading }: UrlInputProps) {
  const [url, setUrl] = useState("");
  const [pasteNotice, setPasteNotice] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = normalizeUrl(url);
    if (cleanUrl) {
      setUrl(cleanUrl);
      onFetch(cleanUrl);
    }
  };

  const handleInputPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text");
    if (text) {
      const cleanUrl = normalizeUrl(text);
      if (cleanUrl) {
        setUrl(cleanUrl);
        // Automatically trigger fetch on direct paste into input
        setTimeout(() => {
          onFetch(cleanUrl);
        }, 50);
      }
    }
  };

  const handlePasteButtonClick = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          const cleanUrl = normalizeUrl(text);
          setUrl(cleanUrl);
          onFetch(cleanUrl);
          return;
        }
      }
    } catch {
      // Browser blocked clipboard reading
    }

    // Fallback: Focus input and show notice
    inputRef.current?.focus();
    setPasteNotice(true);
    setTimeout(() => setPasteNotice(false), 3000);
  };

  const handleClear = () => {
    setUrl("");
    inputRef.current?.focus();
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="relative flex flex-col sm:flex-row gap-2"
      >
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            inputMode="url"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onPaste={handleInputPaste}
            placeholder="Paste video link here (YouTube, Instagram, TikTok...)"
            disabled={isLoading}
            className="w-full h-14 pl-4 pr-24 rounded-btn border-2 border-slate-200 bg-white text-base text-textLight outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 dark:border-slate-800 dark:bg-surfaceDark dark:text-textDark dark:focus:border-primary dark:focus:ring-primary/20"
          />

          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {url && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear input"
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={handlePasteButtonClick}
              aria-label="Paste from clipboard"
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <Clipboard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Paste</span>
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !url.trim()}
          className="h-14 px-8 font-bold text-white bg-primary hover:bg-primary-hover rounded-btn transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Fetching...</span>
            </>
          ) : (
            <>
              <span>Fetch</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>

      {pasteNotice && (
        <p className="mt-2 text-xs text-amber-600 dark:text-amber-400 font-medium text-center animate-fade-in">
          Clipboard access was blocked by your browser. Please press{" "}
          <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700">
            Ctrl+V
          </kbd>{" "}
          directly in the input box!
        </p>
      )}

      <p className="mt-2.5 text-xs text-center text-slate-500 dark:text-slate-400">
        Only download content you have permission or legal right to download.
      </p>
    </div>
  );
}
