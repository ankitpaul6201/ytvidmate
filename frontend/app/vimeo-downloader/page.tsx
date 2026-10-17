import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PlatformLanding } from "@/components/PlatformLanding";

export const metadata: Metadata = {
  title: "Vimeo Video Downloader – 1080p & 4K Free | YTVidMate",
  description:
    "Download Vimeo videos in full original resolution up to 4K with audio. Fast, free, and secure.",
  alternates: {
    canonical: "https://ytvidmate.example.com/vimeo-downloader",
  },
};

export default function VimeoDownloaderPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bgLight text-textLight dark:bg-bgDark dark:text-textDark">
      <Header />
      <main className="flex-1">
        <PlatformLanding
          platformName="Vimeo"
          headline="Vimeo Video Downloader"
          subheadline="Download high quality cinematic videos and presentations from Vimeo in 1080p and 4K."
          contentTitle="High-Bitrate Vimeo Video Saving"
          contentParagraphs={[
            "Vimeo is renowned for high bitrate and artistic video productions. YTVidMate lets creators and students download licensed or authorized Vimeo videos in their full resolution.",
            "Paste the Vimeo URL to view available qualities and begin your download immediately.",
          ]}
        />
      </main>
      <Footer />
    </div>
  );
}
