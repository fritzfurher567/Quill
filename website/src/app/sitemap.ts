import type { MetadataRoute } from "next";
import { siteUrl } from "@/config/site";

/** Lists the single page once the production origin is known; empty until then rather than guessing a domain. */
export default function sitemap(): MetadataRoute.Sitemap {
  return siteUrl ? [{ url: new URL("/", siteUrl).href, changeFrequency: "monthly", priority: 1 }] : [];
}
