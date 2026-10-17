import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "DMCA Copyright & Takedown Policy | YTVidMate",
  description: "DMCA and copyright takedown information for YTVidMate.",
  alternates: { canonical: "https://ytvidmate.example.com/dmca" },
};

export default function DmcaPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bgLight text-textLight dark:bg-bgDark dark:text-textDark">
      <Header />
      <main className="flex-1 py-12 px-4 sm:px-6">
        <article className="max-w-3xl mx-auto space-y-6 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            DMCA / Takedown Notice
          </h1>
          <p className="text-sm text-slate-500">Last updated: October 2026</p>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Respect for Intellectual Property
            </h2>
            <p>
              YTVidMate respects the intellectual property rights of copyright holders and complies with the Digital Millennium Copyright Act (DMCA) and international copyright legislation.
            </p>
            <p>
              YTVidMate does not host third-party videos, media databases, or public search indexes. It functions strictly as a client-side transcoding and conversion proxy utility for authorized users.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Submitting a Takedown Notice
            </h2>
            <p>
              If you are a copyright owner or authorized agent and believe content accessible through our platform infringes your copyright, you may submit a formal notification containing:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm">
              <li>Identification of the copyrighted work claimed to have been infringed.</li>
              <li>Identification of the URL or material to be blocked.</li>
              <li>Your contact information (name, address, email, telephone number).</li>
              <li>A statement of good faith belief that the disputed use is unauthorized.</li>
              <li>A statement under penalty of perjury that the information provided is accurate.</li>
            </ul>
            <p className="pt-2">
              Please direct notifications to our designated copyright team at:{" "}
              <a
                href="mailto:dmca@ytvidmate.example.com"
                className="text-primary font-semibold underline"
              >
                dmca@ytvidmate.example.com
              </a>
            </p>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  );
}
