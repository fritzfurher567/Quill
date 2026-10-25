import type { MetadataRoute } from "next";
import { siteUrl } from "@/config/site";

/** Lists the public pages once the production origin is known; empty until then rather than guessing a domain. */
export default function sitemap(): MetadataRoute.Sitemap {
  if (!siteUrl) return [];
  return [
    { url: new URL("/", siteUrl).href, changeFrequency: "monthly", priority: 1 },
    { url: new URL("/download", siteUrl).href, changeFrequency: "monthly", priority: 0.8 },
  ];
}
