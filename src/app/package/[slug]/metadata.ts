import type { Metadata } from "next";

const BASE_URL = "https://pkgdocs-swart.vercel.app";

export function buildMetadata(pkg: {
  name: string;
  ecosystem: string;
  summary: string;
  tags: string[];
}): Metadata {
  const title = `${pkg.name} — ${pkg.ecosystem === "npm" ? "npm" : "PyPI"} package`;
  const description = pkg.summary
    ? `${pkg.summary}. Interactive story, API map, live demo, and copy-paste recipes.`
    : `Visual documentation for ${pkg.name}: stories, API graph, and recipes.`;

  return {
    title,
    description,
    keywords: [pkg.name, pkg.ecosystem, ...pkg.tags],
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/package/${pkg.name}`,
      images: [{ url: `/og-default.png`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
