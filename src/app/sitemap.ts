import type { MetadataRoute } from "next";
import { readdir, readFile } from "fs/promises";
import path from "path";
import type { Package } from "@/lib/types";

const BASE_URL = "https://pkgdocs-swart.vercel.app";
const PACKAGES_DIR = path.join(process.cwd(), "public", "data", "packages");

async function getComparePairs(): Promise<string[][]> {
  const files = await readdir(PACKAGES_DIR);
  const pkgs: Package[] = await Promise.all(
    files.filter((f) => f.endsWith(".json")).map(async (f) => {
      const raw = await readFile(path.join(PACKAGES_DIR, f), "utf-8");
      return JSON.parse(raw) as Package;
    })
  );

  const pairs = new Set<string>();
  for (const pkg of pkgs) {
    const scored = pkgs
      .filter((p) => p.id !== pkg.id)
      .map((p) => ({ id: p.id, shared: p.tags.filter((t) => pkg.tags.includes(t)).length }))
      .filter((x) => x.shared > 0)
      .sort((a, b) => b.shared - a.shared)
      .slice(0, 5);
    for (const other of scored) {
      const [a, b] = [pkg.id, other.id].sort();
      pairs.add(`${a}/${b}`);
    }
  }
  return Array.from(pairs).map((p) => p.split("/"));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const dir = PACKAGES_DIR;
  const files = await readdir(dir);
  const slugs = files.filter((f) => f.endsWith(".json")).map((f) => f.replace(".json", ""));
  const pairs = await getComparePairs();

  const packageUrls = slugs.map((slug) => ({
    url: `${BASE_URL}/package/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const compareUrls = pairs.map(([a, b]) => ({
    url: `${BASE_URL}/compare/${a}/${b}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    ...packageUrls,
    ...compareUrls,
  ];
}
