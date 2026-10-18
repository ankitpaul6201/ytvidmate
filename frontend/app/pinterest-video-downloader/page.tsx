import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PlatformLanding } from "@/components/PlatformLanding";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ytvidmate.com";

export const metadata: Metadata = {
  title: "Pinterest Video Downloader – Save Video Pins in HD MP4 | YTVidMate",
  description:
    "Free online Pinterest video downloader. Save Pinterest video pins, reels, story pins, and idea pins in HD 1080p MP4 with sound. No registration needed.",
  alternates: {
    canonical: `${baseUrl}/pinterest-video-downloader`,
  },
  openGraph: {
    title: "Pinterest Video Downloader – Save Video Pins in HD MP4 | YTVidMate",
    description: "Download Pinterest videos, reels, and GIFs in high definition with audio.",
    url: `${baseUrl}/pinterest-video-downloader`,
    siteName: "YTVidMate",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pinterest Video Downloader – Save Video Pins in HD MP4 | YTVidMate",
    description: "Download Pinterest videos, reels, and GIFs in high definition with audio.",
  },
};

export default function PinterestDownloaderPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "YTVidMate Pinterest Video Downloader",
    url: `${baseUrl}/pinterest-video-downloader`,
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Any (Web)",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free online Pinterest video downloader to save video pins, reels, and ideas in high quality MP4 with sound.",
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
          platformName="Pinterest"
          headline="Pinterest Video Downloader with Sound"
          subheadline="Save Pinterest video pins, idea pins, and DIY tutorials in full 1080p HD MP4 format with audio."
          contentTitle="Easily Save Pinterest Videos and Reels to Any Device"
          contentParagraphs={[
            "Pinterest is filled with inspiring cooking recipes, DIY crafts, home decor guides, and fitness tutorials. However, the official Pinterest app only lets you save pins to your personal boards without a direct offline download option.",
            "YTVidMate makes it seamless to save any public Pinterest video or animated pin directly to your phone, tablet, or computer. Both shortened 'pin.it' links and full 'pinterest.com/pin/...' web links are supported.",
            "Our automated download engine extracts the highest resolution video stream available and ensures that background music and voice narration remain fully synchronized in the final MP4 download.",
          ]}
        />
      </main>
      <Footer />
    </div>
  );
}
