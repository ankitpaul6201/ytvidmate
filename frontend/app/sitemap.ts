import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ytvidmate.com";
  const now = new Date();

  const routes: { path: string; priority: number; changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never" }[] = [
    { path: "", priority: 1.0, changeFrequency: "daily" },
    { path: "/youtube-downloader", priority: 0.9, changeFrequency: "weekly" },
    { path: "/instagram-video-downloader", priority: 0.9, changeFrequency: "weekly" },
    { path: "/facebook-video-downloader", priority: 0.9, changeFrequency: "weekly" },
    { path: "/twitter-video-downloader", priority: 0.9, changeFrequency: "weekly" },
    { path: "/pinterest-video-downloader", priority: 0.9, changeFrequency: "weekly" },
    { path: "/tiktok-video-downloader", priority: 0.8, changeFrequency: "weekly" },
    { path: "/vimeo-downloader", priority: 0.8, changeFrequency: "weekly" },
    { path: "/mp3-converter", priority: 0.9, changeFrequency: "weekly" },
    { path: "/how-to/download-youtube-video-with-sound", priority: 0.8, changeFrequency: "weekly" },
    { path: "/faq", priority: 0.7, changeFrequency: "weekly" },
    { path: "/terms", priority: 0.5, changeFrequency: "monthly" },
    { path: "/privacy", priority: 0.5, changeFrequency: "monthly" },
    { path: "/dmca", priority: 0.5, changeFrequency: "monthly" },
  ];

  return routes.map((item) => ({
    url: `${baseUrl}${item.path}`,
    lastModified: now,
    changeFrequency: item.changeFrequency,
    priority: item.priority,
  }));
}
