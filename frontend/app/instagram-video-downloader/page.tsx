import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PlatformLanding } from "@/components/PlatformLanding";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ytvidmate.com";

export const metadata: Metadata = {
  title: "Instagram Video Downloader – Reels, Stories & Posts | YTVidMate",
  description:
    "Download Instagram reels, stories, and feed videos in high definition with sound. Fast, anonymous, free.",
  alternates: {
    canonical: `${baseUrl}/instagram-video-downloader`,
  },
  openGraph: {
    title: "Instagram Video Downloader – Reels, Stories & Posts | YTVidMate",
    description: "Download Instagram reels, stories, and feed videos in high definition with sound.",
    url: `${baseUrl}/instagram-video-downloader`,
    siteName: "YTVidMate",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Instagram Video Downloader – Reels, Stories & Posts | YTVidMate",
    description: "Download Instagram reels, stories, and feed videos in high definition with sound.",
  },
};

export default function InstagramDownloaderPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "YTVidMate Instagram Video Downloader",
    url: `${baseUrl}/instagram-video-downloader`,
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Any (Web)",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free online Instagram video downloader to save reels, stories, and feed clips with sound.",
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
          platformName="Instagram"
          headline="Instagram Video & Reels Downloader"
          subheadline="Save Instagram Reels, video posts, and clips directly to your phone or computer gallery."
          contentTitle="How to Download Instagram Reels in Full HD"
          contentParagraphs={[
            "Instagram Reels are filled with entertaining and educational content, but saving them offline with original audio can be tricky. YTVidMate provides an easy, one-tap tool to download Instagram videos in their original uploaded quality.",
            "Copy the share link from any public Instagram post or Reel, paste it into YTVidMate, and choose your format. The video will be processed and saved directly to your device with full sound quality.",
            "Works smoothly on iPhone, iPad, Android smartphones, and all desktop browsers without needing an app installation.",
          ]}
        />
      </main>
      <Footer />
    </div>
  );
}
