import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy | YTVidMate",
  description: "Privacy Policy explaining data handling and auto-deletion on YTVidMate.",
  alternates: { canonical: "https://ytvidmate.example.com/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bgLight text-textLight dark:bg-bgDark dark:text-textDark">
      <Header />
      <main className="flex-1 py-12 px-4 sm:px-6">
        <article className="max-w-3xl mx-auto space-y-6 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            Privacy Policy
          </h1>
          <p className="text-sm text-slate-500">Last updated: October 2026</p>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              1. No Account Required
            </h2>
            <p>
              YTVidMate does not require user accounts, email addresses, passwords, or personal identity information to download public videos.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              2. 30-Minute Automatic File Purge
            </h2>
            <p>
              Any temporary files created during download and audio merging are automatically and permanently deleted from our servers within 30 minutes of processing. We do not maintain media archives or user download histories.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              3. IP Address Hashing & Logs
            </h2>
            <p>
              To prevent automated DDoS and bot abuse, incoming request IP addresses are hashed using irreversible cryptographic algorithms (SHA-256) combined with rotating salts. Raw IP addresses are never permanently retained or stored in database tables.
            </p>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  );
}
