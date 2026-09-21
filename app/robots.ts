import type { MetadataRoute } from "next";

const base = process.env.SITE_URL ?? "https://abdulhafeez.dev";

export default function robots(): MetadataRoute.Robots {
  return {
    // The admin is behind a password, but keep it out of the index regardless.
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] },
    sitemap: `${base}/sitemap.xml`,
  };
}
