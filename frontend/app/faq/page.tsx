import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FaqSection } from "@/components/FaqSection";

export const metadata: Metadata = {
  title: "Frequently Asked Questions (FAQ) | YTVidMate",
  description:
    "Find answers to common questions about downloading video and audio in high definition with YTVidMate.",
  alternates: { canonical: "https://ytvidmate.example.com/faq" },
};

export default function FaqPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Why does my downloaded video have sound on YTVidMate?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "High-quality videos come as separate video and audio streams. YTVidMate merges them automatically so you always get sound.",
        },
      },
      {
        "@type": "Question",
        name: "Is YTVidMate completely free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, YTVidMate is completely free to use without any account registration or subscription.",
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
