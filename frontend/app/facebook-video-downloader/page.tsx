import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PlatformLanding } from "@/components/PlatformLanding";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ytvidmate.com";

export const metadata: Metadata = {
  title: "Facebook Video Downloader – HD Online Free | YTVidMate",
  description:
    "Download Facebook public videos, reels, and clips in HD MP4 with audio. Safe, fast, no login required.",
  alternates: {
    canonical: `${baseUrl}/facebook-video-downloader`,
  },
  openGraph: {
    title: "Facebook Video Downloader – HD Online Free | YTVidMate",
    description: "Download Facebook public videos, reels, and clips in HD MP4 with audio.",
    url: `${baseUrl}/facebook-video-downloader`,
    siteName: "YTVidMate",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Facebook Video Downloader – HD Online Free | YTVidMate",
    description: "Download Facebook public videos, reels, and clips in HD MP4 with audio.",
  },
};

export default function FacebookDownloaderPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "YTVidMate Facebook Video Downloader",
    url: `${baseUrl}/facebook-video-downloader`,
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Any (Web)",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free online Facebook video downloader to save public videos and reels in HD with sound.",
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
          platformName="Facebook"
          headline="Facebook Video Downloader with Audio"
          subheadline="Paste any public Facebook video or Reel URL to download in crystal-clear high definition."
          contentTitle="Save Facebook Videos to Watch Offline Anytime"
          contentParagraphs={[
            "Facebook feeds move quickly, making it easy to lose memorable video clips, recipes, or tutorials. YTVidMate makes it effortless to save any public Facebook video in MP4 format.",
            "Our tool extracts the highest available stream and makes sure audio and video are unified into a single download without quality degradation.",
            "No account or login is required. Just paste your link, pick your preferred resolution, and start downloading.",
          ]}
        />
      </main>
      <Footer />
    </div>
  );
}
