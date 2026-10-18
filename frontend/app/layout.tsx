import type { Metadata, Viewport } from "next";
import { Outfit, Poppins } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/SmoothScroll";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-outfit",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ytvidmate.com";

export const viewport: Viewport = {
  themeColor: "#01193d",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "YTVidMate – Free Online Video Downloader (HD & 4K with Sound)",
    template: "%s | YTVidMate",
  },
  description:
    "Free online video downloader. Download high-definition videos in 1080p, 2K, and 4K with synchronized sound or convert to 320kbps MP3 audio from YouTube, Instagram, Facebook, Pinterest, and X.",
  keywords: [
    "video downloader",
    "online video downloader",
    "youtube video downloader",
    "download youtube videos with sound",
    "instagram video downloader",
    "facebook video downloader",
    "twitter video downloader",
    "pinterest video downloader",
    "mp3 converter",
    "4k video downloader",
    "free video downloader",
    "save video from link",
  ],
  authors: [{ name: "YTVidMate Engineering Team" }],
  creator: "YTVidMate",
  publisher: "YTVidMate",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "YTVidMate – Free Online Video Downloader (HD & 4K with Sound)",
    description:
      "Paste any video link to save in 360p up to 4K resolution with perfectly merged audio, or extract studio-quality MP3 audio. 100% free with no software installation required.",
    url: siteUrl,
    siteName: "YTVidMate",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "YTVidMate – Free Online Video Downloader (HD & 4K with Sound)",
    description:
      "Save videos and audios from YouTube, Instagram, Facebook, Pinterest, and X with synchronized audio.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const globalSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "YTVidMate",
        url: siteUrl,
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/logo.svg`,
        },
      },
      {
        "@type": "WebApplication",
        "@id": `${siteUrl}/#webapp`,
        name: "YTVidMate Video Downloader",
        url: siteUrl,
        applicationCategory: "MultimediaApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires modern JavaScript-enabled browser",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        description:
          "Free online video and audio downloader with synchronized audio merging from YouTube, Instagram, Facebook, Pinterest, and X.",
        publisher: {
          "@id": `${siteUrl}/#organization`,
        },
      },
    ],
  };

  return (
    <html lang="en" className={`${outfit.variable} ${poppins.variable}`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(globalSchema).replace(/</g, "\\u003c"),
          }}
        />
      </head>
      <body className={`${outfit.className} antialiased selection:bg-[#2D8AF4] selection:text-white`}>
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
