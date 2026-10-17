import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PlatformLanding } from "@/components/PlatformLanding";

export const metadata: Metadata = {
  title: "Twitter / X Video Downloader – Save HD Clips | YTVidMate",
  description:
    "Fast and free X / Twitter video downloader. Paste tweet URL, pick quality (1080p, 720p, 480p), and download MP4 with sound.",
  alternates: {
    canonical: "https://ytvidmate.example.com/twitter-video-downloader",
  },
};

export default function TwitterDownloaderPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bgLight text-textLight dark:bg-bgDark dark:text-textDark">
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
          ]}
        />
      </main>
      <Footer />
    </div>
  );
}
