import { readdir, readFile } from "fs/promises";
import path from "path";
import { notFound } from "next/navigation";
import type { Package } from "@/lib/types";
import PackagePageClient from "@/components/PackagePageClient";

const PACKAGES_DIR = path.join(process.cwd(), "public", "data", "packages");

async function readPackage(slug: string): Promise<Package | null> {
  try {
    const raw = await readFile(path.join(PACKAGES_DIR, `${slug}.json`), "utf-8");
    return JSON.parse(raw) as Package;
  } catch {
    return null;
  }
}

async function readAllCards() {
  const files = await readdir(PACKAGES_DIR);
  const cards = await Promise.all(
    files
      .filter((f) => f.endsWith(".json"))
      .map(async (f) => {
        const raw = await readFile(path.join(PACKAGES_DIR, f), "utf-8");
        const pkg = JSON.parse(raw) as Package;
        return { id: pkg.id, name: pkg.name, ecosystem: pkg.ecosystem, summary: pkg.summary, tags: pkg.tags };
      })
  );
  return cards;
}

function computeRelated(pkg: Package, all: Awaited<ReturnType<typeof readAllCards>>) {
  return all
    .filter((p) => p.id !== pkg.id)
    .map((p) => ({ card: p, shared: p.tags.filter((t) => pkg.tags.includes(t)).length }))
    .filter((x) => x.shared > 0)
    .sort((a, b) => b.shared - a.shared)
    .slice(0, 4)
    .map((x) => x.card);
}

export async function generateStaticParams() {
  const files = await readdir(PACKAGES_DIR);
  return files
    .filter((f) => f.endsWith(".json"))
    .map((f) => ({ slug: f.replace(/\.json$/, "") }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pkg = await readPackage(slug);
  if (!pkg) return { title: "Package not found — pkgdocs" };
  return {
    title: `${pkg.name} — pkgdocs`,
    description: pkg.summary,
    openGraph: {
      title: `${pkg.name} — pkgdocs`,
      description: pkg.summary,
    },
  };
}

export default async function PackagePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [pkg, allCards] = await Promise.all([readPackage(slug), readAllCards()]);

  if (!pkg) notFound();

  const related = computeRelated(pkg, allCards);

  return <PackagePageClient pkg={pkg} related={related} />;
}
