import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LegalPageMotion } from "@/components/LegalPageMotion";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ytvidmate.com";

export const metadata: Metadata = {
  title: "Privacy Policy – YTVidMate",
  description:
    "Learn about YTVidMate's privacy practices, zero-account architecture, and 30-minute automatic file deletion policy.",
  alternates: { canonical: `${baseUrl}/privacy` },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800">
      <Header />

      <LegalPageMotion
        title="Privacy Policy"
        lastUpdated="October 2026"
      >
        <article className="max-w-4xl mx-auto space-y-8 text-[15px] sm:text-base text-slate-700 leading-relaxed font-normal">
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            At YTVidMate, we respect your privacy. This Privacy Policy explains what information we process when you use our website and how we keep your experience safe, simple, and private.
          </p>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              1. No Account or Registration Required
            </h2>
            <p>
              You do not need to create an account, log in, or provide any personal details to use YTVidMate. We do not ask for your name, email address, phone number, password, or payment details. Our service is completely free to use without sign-up.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              2. How Videos Are Processed & 30-Minute Auto-Deletion
            </h2>
            <p>
              When you paste a link to download a video, our servers temporarily process the request to merge audio and video into a single file ready for download.
            </p>
            <p>
              Any temporary files created during this conversion are automatically and permanently deleted from our servers within <strong>30 minutes</strong>. We do not store, archive, or build libraries of downloaded videos.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              3. Information We Do Not Collect or Sell
            </h2>
            <p>
              We believe your downloading activity is personal to you. We strictly follow these principles:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-700">
              <li>We do not build personal profiles or track your downloading history over time.</li>
              <li>We never sell, rent, trade, or share any user data with advertisers or data brokers.</li>
              <li>We do not run invasive cross-site advertising trackers or tracking pixels.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              4. Abuse Prevention & Security
            </h2>
            <p>
              To protect our website against automated spam bots, abuse, and server overload, we use standard rate-limiting on incoming web traffic. This is handled temporarily in memory to keep the service running smoothly for everyone and is not used to track individual users.
            </p>
            <p>
              All connections to YTVidMate use standard secure HTTPS encryption to protect your data in transit between your browser and our servers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              5. Cookies & Local Storage
            </h2>
            <p>
              We do not use advertising or tracking cookies. We only use minimal browser local storage to remember your display preferences (such as your light or dark theme setting) so you don&apos;t have to reset it on every visit.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              6. Third-Party Websites
            </h2>
            <p>
              When you paste a link, our service connects to the platform hosting that media to retrieve the stream. We encourage you to review the privacy policies and terms of those third-party platforms, as their data handling practices are governed by their own policies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              7. Children&apos;s Privacy
            </h2>
            <p>
              YTVidMate is not directed at children under the age of 13. We do not knowingly collect or solicit personal information from children.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              8. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy periodically. Any updates will be posted directly to this page with an updated date at the top.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              9. Contact Us
            </h2>
            <p>
              If you have any questions or feedback regarding our privacy practices, please contact us at{" "}
              <a
                href="mailto:privacy@ytvidmate.com"
                className="text-[#1664C0] font-semibold hover:underline"
              >
                privacy@ytvidmate.com
              </a>
              .
            </p>
          </section>
        </article>
      </LegalPageMotion>

      <Footer />
    </div>
  );
}
