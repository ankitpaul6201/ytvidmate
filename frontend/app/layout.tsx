import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YTVidMate – Free Online Video Downloader (HD & 4K with Sound)",
  description: "Paste a video link and download in 360p to 4K with merged audio. Fast, free, and secure.",
  metadataBase: new URL("https://ytvidmate.example.com"),
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
