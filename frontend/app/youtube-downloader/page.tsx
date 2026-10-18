import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PlatformLanding } from "@/components/PlatformLanding";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ytvidmate.com";

export const metadata: Metadata = {
  title: "YouTube Video Downloader – HD 1080p & 4K with Sound | YTVidMate",
  description:
    "Paste a YouTube link and download videos in 360p to 4K with merged audio. Free, fast, no registration. MP4 and MP3 supported.",
  alternates: { canonical: `${baseUrl}/youtube-downloader` },
  openGraph: {
    title: "YouTube Video Downloader – HD 1080p & 4K with Sound | YTVidMate",
    description: "Paste a YouTube link and download with crisp audio. Free, fast, no registration.",
    url: `${baseUrl}/youtube-downloader`,
    siteName: "YTVidMate",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "YouTube Video Downloader – HD 1080p & 4K with Sound | YTVidMate",
    description: "Paste a YouTube link and download with crisp audio. Free, fast, no registration.",
  },
};

export default function YouTubeDownloaderPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "YTVidMate YouTube Downloader",
    url: `${baseUrl}/youtube-downloader`,
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Any (Web)",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free online YouTube video downloader in 1080p, 4K, and MP3 with sound.",
  };

  return (
    <div className="min-h-screen flex flex-col bg-bgLight text-textLight dark:bg-bgDark dark:text-textDark">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Header />
      <main className="flex-1">
        <PlatformLanding
          platformName="YouTube"
          headline="YouTube Video Downloader with Sound"
          subheadline="Download YouTube videos in 1080p, 2K, 4K, and audio-only MP3 format without audio loss."
          contentTitle="Download High-Definition YouTube Videos Without Missing Audio"
          contentParagraphs={[
            "Most online YouTube downloaders struggle with videos above 720p because YouTube serves separate video and audio streams for full 1080p, 1440p, and 4K content. Other websites end up giving you silent videos or downgrade the quality.",
            "YTVidMate solves this permanently by automatically merging the high-definition video track with the highest-bitrate audio stream using server-side FFmpeg processing. The result is a pristine MP4 file with crisp sound ready for offline playback on any device.",
            "Simply copy the YouTube video link from your browser or the mobile YouTube app, paste it into the search box above, select your desired resolution, and click Download.",
          ]}
        />
      </main>
      <Footer />
    </div>
  );
}
