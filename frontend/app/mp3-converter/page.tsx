import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PlatformLanding } from "@/components/PlatformLanding";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ytvidmate.com";

export const metadata: Metadata = {
  title: "Online MP3 Converter – Extract Audio from Video | YTVidMate",
  description:
    "Convert video links to 192kbps MP3 audio files. Free online video to MP3 converter for YouTube, TikTok, and more.",
  alternates: {
    canonical: `${baseUrl}/mp3-converter`,
  },
  openGraph: {
    title: "Online MP3 Converter – Extract Audio from Video | YTVidMate",
    description: "Extract high quality MP3 audio from any video link with one click.",
    url: `${baseUrl}/mp3-converter`,
    siteName: "YTVidMate",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Online MP3 Converter – Extract Audio from Video | YTVidMate",
    description: "Extract high quality MP3 audio from any video link with one click.",
  },
};

export default function Mp3ConverterPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "YTVidMate Online MP3 Converter",
    url: `${baseUrl}/mp3-converter`,
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Any (Web)",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free online video to MP3 audio converter with lossless audio extraction.",
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
          platformName="MP3 Converter"
          headline="Convert Any Video to MP3 Audio"
          subheadline="Extract crystal-clear 192kbps MP3 audio from any supported video link with one click."
          contentTitle="High Quality Audio Extraction"
          contentParagraphs={[
            "Want to listen to a lecture, podcast, music track, or speech on the go? YTVidMate's MP3 converter strips out the video stream and converts the audio track into a lightweight, high-compatibility MP3 file.",
            "Our background FFmpeg audio extractor guarantees 192kbps CBR/VBR audio quality with normalized volume levels.",
            "Fast conversion directly on our servers means you don't use up your phone battery or computer memory.",
          ]}
        />
      </main>
      <Footer />
    </div>
  );
}
