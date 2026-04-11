export const revalidate = 3600;

import { readdir, readFile } from "fs/promises";
import path from "path";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Package } from "@/lib/types";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import CompareView from "@/components/CompareView";

const PACKAGES_DIR = path.join(process.cwd(), "public", "data", "packages");

async function readPackage(slug: string): Promise<Package | null> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from("packages")
      .select("data")
      .eq("id", slug)
      .single();
    if (!error && data) return (data as { data: Package }).data;
  }
  try {
    const raw = await readFile(path.join(PACKAGES_DIR, `${slug}.json`), "utf-8");
    return JSON.parse(raw) as Package;
  } catch {
    return null;
  }
}

async function readAllPackages(): Promise<Package[]> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from("packages")
      .select("data")
      .limit(500);
    if (!error && data && data.length > 0) {
      return data.map((r) => (r as { data: Package }).data);
    }
  }
  const files = await readdir(PACKAGES_DIR);
  return Promise.all(
    files
      .filter((f) => f.endsWith(".json"))
      .map(async (f) => {
        const raw = await readFile(path.join(PACKAGES_DIR, f), "utf-8");
        return JSON.parse(raw) as Package;
      })
  );
}

// Generate pairs: for each package, pick its top-5 most tag-similar others
export async function generateStaticParams() {
  const all = await readAllPackages();
  const pairs = new Set<string>();

  for (const pkg of all) {
    const scored = all
      .filter((p) => p.id !== pkg.id)
      .map((p) => ({ id: p.id, shared: p.tags.filter((t) => pkg.tags.includes(t)).length }))
      .filter((x) => x.shared > 0)
      .sort((a, b) => b.shared - a.shared)
      .slice(0, 5);

    for (const other of scored) {
      // Canonical order: alphabetical, so /compare/a/b and /compare/b/a both resolve to same
      const [a, b] = [pkg.id, other.id].sort();
      pairs.add(`${a}|||${b}`);
    }
  }

  return Array.from(pairs).map((pair) => {
    const [slug1, slug2] = pair.split("|||");
    return { slug1, slug2 };
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug1: string; slug2: string }>;
}): Promise<Metadata> {
  const { slug1, slug2 } = await params;
  const [a, b] = await Promise.all([readPackage(slug1), readPackage(slug2)]);
  if (!a || !b) return { title: "Compare — pkgdocs" };

  const title = `${a.name} vs ${b.name} — pkgdocs`;
  const description = `Side-by-side comparison of ${a.name} and ${b.name}: difficulty, downloads, use cases, recipes, and when to pick each one.`;

  return {
    title,
    description,
    openGraph: { title, description },
  };
}

export default async function ComparePage({
  params,
}: {
  params: Promise<{ slug1: string; slug2: string }>;
}) {
  const { slug1, slug2 } = await params;
  const [a, b] = await Promise.all([readPackage(slug1), readPackage(slug2)]);

  if (!a || !b) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${a.name} vs ${b.name}`,
    description: `Compare ${a.name} and ${b.name} — difficulty, downloads, use cases, and recipes.`,
    url: `https://pkgdocs.dev/compare/${slug1}/${slug2}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CompareView a={a} b={b} />
    </>
  );
}
