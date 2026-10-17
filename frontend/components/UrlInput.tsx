"use client";

import React, { useState } from "react";
import { ArrowRight, Clipboard, Loader2, X } from "lucide-react";

interface UrlInputProps {
  onFetch: (url: string) => void;
  isLoading: boolean;
}

export function UrlInput({ onFetch, isLoading }: UrlInputProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onFetch(url.trim());
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text.trim());
        onFetch(text.trim());
      }
    } catch {
      // Clipboard read permission might be denied
    }
  };

  const handleClear = () => {
    setUrl("");
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="relative flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste video link here (YouTube, Instagram, TikTok...)"
            required
            disabled={isLoading}
            className="w-full h-14 pl-4 pr-20 rounded-btn border-2 border-slate-200 bg-white text-base text-textLight outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 dark:border-slate-800 dark:bg-surfaceDark dark:text-textDark dark:focus:border-primary dark:focus:ring-primary/20"
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
              onClick={handlePaste}
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
          className="h-14 px-8 font-bold text-white bg-primary hover:bg-primary-hover rounded-btn transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

      <p className="mt-2.5 text-xs text-center text-slate-500 dark:text-slate-400">
        Only download content you have permission or legal right to download.
      </p>
    </div>
  );
}
