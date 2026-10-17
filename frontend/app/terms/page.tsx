import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Terms of Service | YTVidMate",
  description: "Terms and conditions of using the YTVidMate online video downloader.",
  alternates: { canonical: "https://ytvidmate.example.com/terms" },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bgLight text-textLight dark:bg-bgDark dark:text-textDark">
      <Header />
      <main className="flex-1 py-12 px-4 sm:px-6">
        <article className="max-w-3xl mx-auto space-y-6 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            Terms of Service
          </h1>
          <p className="text-sm text-slate-500">Last updated: October 2026</p>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing and using YTVidMate, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              2. Permitted Use & Copyright
            </h2>
            <p>
              YTVidMate is designed strictly for personal, non-commercial use to download content that you own, have created, or have express legal permission or license from the copyright holder to download.
            </p>
            <p>
              You agree not to use YTVidMate to infringe upon copyright, intellectual property rights, or the terms of third-party platforms. Downloading protected commercial content (DRM) is strictly blocked and prohibited.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              3. Disclaimer of Warranties
            </h2>
            <p>
              YTVidMate is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind. We do not guarantee uninterrupted, error-free, or secure operation.
            </p>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  );
}
