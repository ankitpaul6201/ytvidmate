import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LegalPageMotion } from "@/components/LegalPageMotion";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ytvidmate.com";

export const metadata: Metadata = {
  title: "Terms of Service – YTVidMate",
  description:
    "Read the Terms of Service for YTVidMate. Learn about permitted personal use, copyright guidelines, and our terms of use.",
  alternates: { canonical: `${baseUrl}/terms` },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800">
      <Header />

      <LegalPageMotion
        title="Terms of Service"
        lastUpdated="October 2026"
      >
        <article className="max-w-4xl mx-auto space-y-8 text-[15px] sm:text-base text-slate-700 leading-relaxed font-normal">
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            Welcome to YTVidMate. These Terms of Service (&quot;Terms&quot;) govern your access to and use of the YTVidMate website and tools. By accessing or using our service, you agree to be bound by these Terms. If you do not agree with any part of these terms, please do not use our website.
          </p>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              1. Description of Service
            </h2>
            <p>
              YTVidMate is a free web-based utility that helps users download and convert publicly accessible online video and audio streams for personal, offline use. YTVidMate does not host, store, or distribute video libraries. All media processing is temporary and automated.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              2. Permitted Personal Use & Copyright
            </h2>
            <p>
              YTVidMate is provided strictly for your personal, non-commercial use. You may only use this service to download content that you own, have created, or have express permission from the copyright owner to download.
            </p>
            <p>
              You agree not to use this service to infringe upon the intellectual property rights of any individual, creator, or entity. You are solely responsible for ensuring that your use of downloaded material complies with applicable copyright laws and the terms of the platform hosting the original content.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              3. Prohibition on Circumventing Protections
            </h2>
            <p>
              YTVidMate does not bypass or circumvent digital rights management (DRM), access control systems, or encrypted paywalls. You agree not to attempt to download protected commercial content, subscription-only material, or media restricted by digital rights management.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              4. Prohibited Activities
            </h2>
            <p>
              When using YTVidMate, you agree not to:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-700">
              <li>Use automated bots, scrapers, or scripts to overload or abuse our systems.</li>
              <li>Attempt to bypass rate limits, server protections, or security features.</li>
              <li>Interfere with or disrupt the normal operation of our website or servers.</li>
              <li>Use the service for any unlawful, commercial, or harmful purpose.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              5. Intellectual Property
            </h2>
            <p>
              All branding, logos, graphics, user interface designs, and code on YTVidMate are the property of YTVidMate. You are granted a personal, non-exclusive license to use the website through a standard web browser.
            </p>
            <p>
              Third-party brand names and platform trademarks (such as YouTube, Vimeo, TikTok, etc.) mentioned on this site are the property of their respective owners. They are referenced solely to describe technical compatibility and do not imply any partnership or endorsement.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              6. Disclaimer of Warranties
            </h2>
            <p>
              YTVidMate is provided &quot;as is&quot; and &quot;as available&quot; without any warranties of any kind, whether express or implied. While we strive to maintain a smooth and reliable service, we cannot guarantee uninterrupted access, error-free operation, or compatibility with every third-party video link.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              7. Limitation of Liability
            </h2>
            <p>
              To the fullest extent permitted by law, YTVidMate and its operators shall not be liable for any indirect, incidental, or consequential damages arising from your use of or inability to use the service. You use YTVidMate at your own discretion and risk.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              8. Changes to These Terms
            </h2>
            <p>
              We may revise these Terms from time to time. Any changes will be posted on this page along with an updated revision date. By continuing to use YTVidMate after changes are published, you agree to the revised Terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              9. Contact Us
            </h2>
            <p>
              If you have any questions about these Terms of Service, please reach out to us at{" "}
              <a
                href="mailto:legal@ytvidmate.com"
                className="text-[#1664C0] font-semibold hover:underline"
              >
                legal@ytvidmate.com
              </a>
              . For copyright and takedown inquiries, please review our{" "}
              <Link
                href="/dmca"
                className="text-[#1664C0] font-semibold hover:underline"
              >
                DMCA Policy
              </Link>
              .
            </p>
          </section>
        </article>
      </LegalPageMotion>

      <Footer />
    </div>
  );
}
