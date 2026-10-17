import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://ytvidmate.example.com";
  const now = new Date();

  const routes = [
    "",
    "/youtube-downloader",
    "/instagram-video-downloader",
    "/facebook-video-downloader",
    "/twitter-video-downloader",
    "/tiktok-video-downloader",
    "/vimeo-downloader",
    "/mp3-converter",
    "/how-to/download-youtube-video-with-sound",
    "/faq",
    "/terms",
    "/privacy",
    "/dmca",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : route.startsWith("/how-to") || route.includes("-downloader") ? 0.8 : 0.5,
  }));
}
