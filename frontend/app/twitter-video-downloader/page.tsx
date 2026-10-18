import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PlatformLanding } from "@/components/PlatformLanding";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ytvidmate.com";

export const metadata: Metadata = {
  title: "Twitter / X Video Downloader – Save HD Clips | YTVidMate",
  description:
    "Fast and free X / Twitter video downloader. Paste tweet URL, pick quality (1080p, 720p, 480p), and download MP4 with sound.",
  alternates: {
    canonical: `${baseUrl}/twitter-video-downloader`,
  },
  openGraph: {
    title: "Twitter / X Video Downloader – Save HD Clips | YTVidMate",
    description: "Download videos and GIFs from X (Twitter) in high definition MP4 format with sound.",
    url: `${baseUrl}/twitter-video-downloader`,
    siteName: "YTVidMate",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Twitter / X Video Downloader – Save HD Clips | YTVidMate",
    description: "Download videos and GIFs from X (Twitter) in high definition MP4 format with sound.",
  },
};

export default function TwitterDownloaderPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "YTVidMate Twitter / X Video Downloader",
    url: `${baseUrl}/twitter-video-downloader`,
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Any (Web)",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free online X / Twitter video downloader to save video tweets and GIFs in MP4 format with sound.",
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
          platformName="X / Twitter"
          headline="Twitter (X) Video Downloader"
          subheadline="Download videos and GIFs from X (Twitter) in high definition MP4 format with sound."
          contentTitle="How to Save X / Twitter Videos Directly"
          contentParagraphs={[
            "Twitter and X timelines are full of fast-breaking news, highlights, and viral clips. With YTVidMate, you can extract video from any public tweet and save it in MP4 format without watermarks.",
            "Simply copy the tweet URL, paste it into our tool, and your download will start immediately.",
            "Supports both x.com and twitter.com links with multiple quality options and audio extraction.",
          ]}
        />
      </main>
      <Footer />
    </div>
  );
}
