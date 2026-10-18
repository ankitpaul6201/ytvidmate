import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LegalPageMotion } from "@/components/LegalPageMotion";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ytvidmate.com";

export const metadata: Metadata = {
  title: "DMCA & Copyright Policy – YTVidMate",
  description:
    "Learn about YTVidMate's copyright policy and how copyright owners can request URL blacklisting or submit a DMCA takedown notice.",
  alternates: { canonical: `${baseUrl}/dmca` },
};

export default function DmcaPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800">
      <Header />

      <LegalPageMotion
        title="DMCA & Copyright Policy"
        lastUpdated="October 2026"
      >
        <article className="max-w-4xl mx-auto space-y-8 text-[15px] sm:text-base text-slate-700 leading-relaxed font-normal">
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            YTVidMate respects the intellectual property rights of content creators, copyright owners, and artists. We comply with the Digital Millennium Copyright Act (DMCA) and applicable copyright laws.
          </p>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              1. How YTVidMate Works
            </h2>
            <p>
              YTVidMate is a technical conversion tool. We do not host, store, broadcast, or index any video or audio files on our servers. All media content remains hosted on the original third-party platforms (such as YouTube, Vimeo, etc.).
            </p>
            <p>
              When a user pastes a link, our tool simply helps them download the public media stream provided by that platform. If a video is removed or made private on the host platform, it is immediately unavailable on YTVidMate as well.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              2. URL Blacklisting for Copyright Owners
            </h2>
            <p>
              Even though we do not host any files, we provide copyright owners with a straightforward remedy: <strong>URL Blacklisting</strong>.
            </p>
            <p>
              If you own the copyright to a video and do not want it to be downloadable through our website, you can request that the link be blacklisted. Once added to our blacklist, our system will block all future download requests for that URL.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              3. How to Submit a Takedown or Blacklist Request
            </h2>
            <p>
              To request that a URL be blacklisted, please send an email to{" "}
              <a
                href="mailto:dmca@ytvidmate.com"
                className="text-[#1664C0] font-semibold hover:underline"
              >
                dmca@ytvidmate.com
              </a>{" "}
              with the following details:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-700">
              <li>
                <strong>Your Contact Information:</strong> Your full name, company name (if applicable), and email address.
              </li>
              <li>
                <strong>Identification of Your Work:</strong> The name or description of your copyrighted content.
              </li>
              <li>
                <strong>Exact URL(s):</strong> The specific video link(s) on the platform (e.g., <code>https://www.youtube.com/watch?v=...</code>) that you want blocked on YTVidMate.
              </li>
              <li>
                <strong>A Simple Statement:</strong> A brief statement confirming that you are the copyright owner or authorized to act on the owner&apos;s behalf, and that the information provided is accurate.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              4. Email Template for Quick Requests
            </h2>
            <p>
              You can copy, fill out, and send this simple template to{" "}
              <a
                href="mailto:dmca@ytvidmate.com"
                className="text-[#1664C0] font-semibold hover:underline"
              >
                dmca@ytvidmate.com
              </a>
              :
            </p>
            <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm font-mono leading-relaxed space-y-1.5">
              <p>Subject: URL Blacklist Request</p>
              <p>Name: [Your Full Name]</p>
              <p>Company / Channel: [Your Company or Channel Name]</p>
              <p>Work Title: [Title of Copyrighted Work]</p>
              <p>Links to Block:</p>
              <p className="text-[#1664C0]"> - [Paste video link here]</p>
              <p>Statement: I confirm that I am the copyright owner or authorized representative for the content listed above.</p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              5. Counter-Notifications
            </h2>
            <p>
              If you believe a link was blocked by mistake or misidentification, you may contact us at{" "}
              <a
                href="mailto:dmca@ytvidmate.com"
                className="text-[#1664C0] font-semibold hover:underline"
              >
                dmca@ytvidmate.com
              </a>{" "}
              with the link and an explanation of your ownership or authorization to have the block reviewed.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              6. Contact Us
            </h2>
            <p>
              For all copyright and DMCA matters, please email us directly at{" "}
              <a
                href="mailto:dmca@ytvidmate.com"
                className="text-[#1664C0] font-semibold hover:underline"
              >
                dmca@ytvidmate.com
              </a>
              . We review and process valid requests promptly.
            </p>
          </section>
        </article>
      </LegalPageMotion>

      <Footer />
    </div>
  );
}
