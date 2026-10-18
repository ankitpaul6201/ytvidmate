import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Download } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ytvidmate.com";

export const metadata: Metadata = {
  title: "How to Download YouTube Videos in 1080p with Sound (Step-by-Step) | YTVidMate",
  description:
    "Learn why high-resolution YouTube videos download without sound and how to easily save them with merged audio using YTVidMate.",
  alternates: {
    canonical: `${baseUrl}/how-to/download-youtube-video-with-sound`,
  },
  openGraph: {
    title: "How to Download YouTube Videos in 1080p with Sound | YTVidMate",
    description: "Step-by-step instructions on saving high-definition videos with synced sound.",
    url: `${baseUrl}/how-to/download-youtube-video-with-sound`,
    siteName: "YTVidMate",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "How to Download YouTube Videos in 1080p with Sound | YTVidMate",
    description: "Step-by-step instructions on saving high-definition videos with synced sound.",
  },
};

export default function HowToDownloadWithSoundPage() {
  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to download a video from a link with sound",
    description:
      "Step-by-step instructions on downloading high-definition videos with merged audio using YTVidMate.",
    step: [
      {
        "@type": "HowToStep",
        name: "Copy the video link",
        text: "Copy the video URL from YouTube or any supported platform.",
      },
      {
        "@type": "HowToStep",
        name: "Paste into YTVidMate",
        text: "Paste the URL into the input field and click Fetch.",
      },
      {
        "@type": "HowToStep",
        name: "Choose your quality",
        text: "Select your preferred resolution (e.g. 1080p Full HD) or MP3 audio.",
      },
      {
        "@type": "HowToStep",
        name: "Download and save",
        text: "Click Download and let the automated FFmpeg engine merge video and audio before saving to your device.",
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-bgLight text-textLight dark:bg-bgDark dark:text-textDark">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(howToJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Header />
      <main className="flex-1 py-12 px-4 sm:px-6">
        <article className="max-w-3xl mx-auto space-y-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Downloader</span>
          </Link>

          <header className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white leading-tight">
              Why Do High-Quality Videos Download Without Sound? (And How to Fix It)
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Published by YTVidMate Engineering Team • 4 min read
            </p>
          </header>

          <section className="space-y-4 text-base text-slate-700 dark:text-slate-300 leading-relaxed">
            <p>
              Have you ever downloaded a 1080p, 1440p, or 4K video from YouTube or another streaming platform only to find that it has completely no audio during playback? This is one of the most common complaints among users of online video tools.
            </p>
            <p>
              Here is the technical reason: modern video platforms utilize adaptive bitrate streaming (DASH). In standard 360p or 720p streams, the video and audio are pre-multiplexed together. However, for 1080p and higher resolutions, video streams and audio streams are stored and transmitted separately to save bandwidth.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              The YTVidMate Solution: Automatic FFmpeg Merging
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              YTVidMate downloads both the pristine high-resolution video stream and the highest-bitrate AAC audio stream in parallel. Then, our background engine executes an automated FFmpeg multiplexing process that binds the streams into an MP4 container without re-encoding, preserving 100% original visual and sound fidelity.
            </p>
          </section>

          <section className="p-6 rounded-card border border-indigo-100 bg-indigo-50/60 dark:border-indigo-950/80 dark:bg-indigo-950/30 space-y-4">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              Step-by-Step Instructions:
            </h3>
            <ol className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span><strong>Step 1:</strong> Copy the URL of the video you wish to download.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span><strong>Step 2:</strong> Paste it into <Link href="/" className="text-primary underline">YTVidMate</Link> and click Fetch.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span><strong>Step 3:</strong> Select 1080p Full HD (or your preferred resolution).</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span><strong>Step 4:</strong> Click Download. The file will automatically save with synced sound.</span>
              </li>
            </ol>

            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-btn bg-primary text-white font-semibold text-sm hover:bg-primary-hover shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Try YTVidMate Now</span>
              </Link>
            </div>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  );
}
