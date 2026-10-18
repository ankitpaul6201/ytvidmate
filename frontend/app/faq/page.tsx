import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FaqSection } from "@/components/FaqSection";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ytvidmate.com";

export const metadata: Metadata = {
  title: "Frequently Asked Questions (FAQ) | YTVidMate",
  description:
    "Find answers to common questions about downloading video and audio in high definition with synchronized sound on YTVidMate.",
  alternates: { canonical: `${baseUrl}/faq` },
  openGraph: {
    title: "Frequently Asked Questions (FAQ) | YTVidMate",
    description: "Find answers to common questions about downloading video and audio with synchronized sound.",
    url: `${baseUrl}/faq`,
    siteName: "YTVidMate",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Frequently Asked Questions (FAQ) | YTVidMate",
    description: "Find answers to common questions about downloading video and audio with synchronized sound.",
  },
};

export default function FaqPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Why does my downloaded video always have sound on YTVidMate?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Platforms like YouTube store high-definition video (1080p, 2K, and 4K) separately from audio. Many other downloaders only grab the video track, which leaves the downloaded file completely silent. YTVidMate combines both tracks automatically before saving, so your video always plays with full sound.",
        },
      },
      {
        "@type": "Question",
        name: "Is YTVidMate completely free to use?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, it is 100% free. You don't need to create an account, sign up for a plan, or install any software.",
        },
      },
      {
        "@type": "Question",
        name: "Can I download only the audio as an MP3?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Simply paste your link and select the MP3 option to save just the audio track for offline listening.",
        },
      },
      {
        "@type": "Question",
        name: "Can I download copyrighted or DRM-protected movies?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. YTVidMate cannot download content protected by DRM from subscription streaming services like Netflix, Disney+, or Prime Video. You should only download videos you own or have permission to save.",
        },
      },
      {
        "@type": "Question",
        name: "How long are my files kept on the server?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Downloaded files are stored temporarily for up to 30 minutes so you can finish saving your file. After that, they are permanently deleted to protect your privacy.",
        },
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-bgLight text-textLight dark:bg-bgDark dark:text-textDark">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Header />
      <main className="flex-1 py-8">
        <FaqSection />
      </main>
      <Footer />
    </div>
  );
}
