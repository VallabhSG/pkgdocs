export const revalidate = 3600;

import { readdir, readFile } from "fs/promises";
import path from "path";
import { notFound } from "next/navigation";
import type { Package } from "@/lib/types";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import PackagePageClient from "@/components/PackagePageClient";

const PACKAGES_DIR = path.join(process.cwd(), "public", "data", "packages");

// --- Data helpers: Supabase first, filesystem fallback ---

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

async function readAllCards() {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from("packages")
      .select("id, name, ecosystem, summary, tags")
      .limit(500);
    if (!error && data && data.length > 0) {
      return data as { id: string; name: string; ecosystem: string; summary: string; tags: string[] }[];
    }
  }
  const files = await readdir(PACKAGES_DIR);
  return Promise.all(
    files
      .filter((f) => f.endsWith(".json"))
      .map(async (f) => {
        const raw = await readFile(path.join(PACKAGES_DIR, f), "utf-8");
        const pkg = JSON.parse(raw) as Package;
        return { id: pkg.id, name: pkg.name, ecosystem: pkg.ecosystem, summary: pkg.summary, tags: pkg.tags };
      })
  );
}

async function getAllSlugs(): Promise<string[]> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase.from("packages").select("id").limit(500);
    if (!error && data && data.length > 0) return data.map((r: { id: string }) => r.id);
  }
  const files = await readdir(PACKAGES_DIR);
  return files.filter((f) => f.endsWith(".json")).map((f) => f.replace(/\.json$/, ""));
}

function computeRelated(
  pkg: Package,
  all: { id: string; name: string; ecosystem: string; summary: string; tags: string[] }[]
) {
  return all
    .filter((p) => p.id !== pkg.id)
    .map((p) => ({ card: p, shared: p.tags.filter((t) => pkg.tags.includes(t)).length }))
    .filter((x) => x.shared > 0)
    .sort((a, b) => b.shared - a.shared)
    .slice(0, 4)
    .map((x) => x.card);
}

// --- Next.js route exports ---

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pkg = await readPackage(slug);
  if (!pkg) return { title: "Package not found — pkgdocs" };
  return {
    title: `${pkg.name} — pkgdocs`,
    description: pkg.summary,
    openGraph: { title: `${pkg.name} — pkgdocs`, description: pkg.summary },
  };
}

export default async function PackagePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [pkg, allCards] = await Promise.all([readPackage(slug), readAllCards()]);

  if (!pkg) notFound();

  const related = computeRelated(pkg, allCards);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: pkg.name,
    description: pkg.summary,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any",
    url: `https://pkgdocs.dev/package/${pkg.id}`,
    downloadUrl: pkg.meta.pypi_url ?? pkg.meta.npm_url,
    softwareVersion: pkg.meta.version,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    ...(pkg.meta.repo_url ? { codeRepository: pkg.meta.repo_url } : {}),
    ...(pkg.meta.docs_url ? { documentation: pkg.meta.docs_url } : {}),
    keywords: pkg.tags.join(", "),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PackagePageClient pkg={pkg} related={related} />
    </>
  );
}
