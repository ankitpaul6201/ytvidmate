import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PlatformLanding } from "@/components/PlatformLanding";

export const metadata: Metadata = {
  title: "Online MP3 Converter – Extract Audio from Video | YTVidMate",
  description:
    "Convert video links to 192kbps MP3 audio files. Free online video to MP3 converter for YouTube, TikTok, and more.",
  alternates: {
    canonical: "https://ytvidmate.example.com/mp3-converter",
  },
};

export default function Mp3ConverterPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bgLight text-textLight dark:bg-bgDark dark:text-textDark">
      <Header />
      <main className="flex-1">
        <PlatformLanding
          platformName="MP3 Converter"
          headline="Convert Any Video to MP3 Audio"
          subheadline="Extract crystal-clear 192kbps MP3 audio from any supported video link with one click."
          contentTitle="High Quality Audio Extraction"
          contentParagraphs={[
            "Want to listen to a lecture, podcast, music track, or speech on the go? YTVidMate's MP3 converter strips out the video stream and converts the audio track into a lightweight, high-compatibility MP3 file.",
            "Our background FFmpeg audio extractor guarantees 192kbps CBR/VBR audio quality with normalized volume levels.",
          ]}
        />
      </main>
      <Footer />
    </div>
  );
}
