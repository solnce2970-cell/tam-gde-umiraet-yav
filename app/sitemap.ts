import type { MetadataRoute } from "next";

const origin = "https://www.tamgdeumiraetyav.ru";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: origin, lastModified: "2026-08-29", changeFrequency: "weekly", priority: 1 },
    { url: `${origin}/o-romane`, lastModified: "2026-08-29", changeFrequency: "monthly", priority: 0.8 },
    { url: `${origin}/genealogy`, lastModified: "2026-08-29", changeFrequency: "monthly", priority: 0.7 },
    { url: `${origin}/larets-predaniy`, lastModified: "2026-08-29", changeFrequency: "monthly", priority: 0.6 },
  ];
}
