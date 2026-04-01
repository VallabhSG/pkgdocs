import type { MetadataRoute } from "next";
import { readdir } from "fs/promises";
import path from "path";

const BASE_URL = "https://pkgdocs-swart.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const dir = path.join(process.cwd(), "public", "data", "packages");
  const files = await readdir(dir);
  const slugs = files.filter((f) => f.endsWith(".json")).map((f) => f.replace(".json", ""));

  const packageUrls = slugs.map((slug) => ({
    url: `${BASE_URL}/package/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    ...packageUrls,
  ];
}
