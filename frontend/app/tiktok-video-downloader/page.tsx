import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PlatformLanding } from "@/components/PlatformLanding";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ytvidmate.com";

export const metadata: Metadata = {
  title: "TikTok Video Downloader – No Watermark HD | YTVidMate",
  description:
    "Download TikTok videos in high definition with sound. Fast, free, and simple with no registration.",
  alternates: {
    canonical: `${baseUrl}/tiktok-video-downloader`,
  },
};

export default function TikTokDownloaderPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bgLight text-textLight dark:bg-bgDark dark:text-textDark">
      <Header />
      <main className="flex-1">
        <PlatformLanding
          platformName="TikTok"
          headline="TikTok Video Downloader"
          subheadline="Download TikTok clips and background audio in full HD MP4 and MP3 format."
          contentTitle="Save TikTok Videos with Original Sound"
          contentParagraphs={[
            "Save your favorite TikTok trends, dances, recipes, and life hacks directly to your device without quality loss.",
            "YTVidMate works on iPhone, Android, Mac, and Windows with no app installation required.",
          ]}
        />
      </main>
      <Footer />
    </div>
  );
}
