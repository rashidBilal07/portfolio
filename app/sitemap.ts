import type { MetadataRoute } from "next";
import { getContent } from "@/lib/store";

const base = process.env.SITE_URL ?? "https://abdulhafeez.dev";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { projects } = await getContent();
  return [
    { url: base, lastModified: new Date(), priority: 1 },
    ...projects
      .filter((p) => p.caseStudy)
      .map((p) => ({
        url: `${base}/projects/${p.slug}`,
        lastModified: new Date(),
        priority: 0.8,
      })),
  ];
}
