import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/za-mezhoy", "/za-mezhoy/"],
    },
    sitemap: "https://www.tamgdeumiraetyav.ru/sitemap.xml",
  };
}
