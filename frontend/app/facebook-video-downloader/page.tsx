import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PlatformLanding } from "@/components/PlatformLanding";

export const metadata: Metadata = {
  title: "Facebook Video Downloader – HD Online Free | YTVidMate",
  description:
    "Download Facebook public videos, reels, and clips in HD MP4 with audio. Safe, fast, no login required.",
  alternates: {
    canonical: "https://ytvidmate.example.com/facebook-video-downloader",
  },
};

export default function FacebookDownloaderPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bgLight text-textLight dark:bg-bgDark dark:text-textDark">
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
          ]}
        />
      </main>
      <Footer />
    </div>
  );
}
