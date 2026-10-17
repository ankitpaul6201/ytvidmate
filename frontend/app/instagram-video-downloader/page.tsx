import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PlatformLanding } from "@/components/PlatformLanding";

export const metadata: Metadata = {
  title: "Instagram Video Downloader – Reels, Stories & Posts | YTVidMate",
  description:
    "Download Instagram reels, stories, and feed videos in high definition with sound. Fast, anonymous, free.",
  alternates: {
    canonical: "https://ytvidmate.example.com/instagram-video-downloader",
  },
};

export default function InstagramDownloaderPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bgLight text-textLight dark:bg-bgDark dark:text-textDark">
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
          ]}
        />
      </main>
      <Footer />
    </div>
  );
}
