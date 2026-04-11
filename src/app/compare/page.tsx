import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, GitCompare } from "lucide-react";

export const metadata: Metadata = {
  title: "Compare packages — pkgdocs",
  description:
    "Side-by-side comparisons of popular Python and JavaScript packages. Find out which library fits your use case.",
};

const POPULAR_PAIRS: { a: string; b: string; label: string }[] = [
  { a: "requests",     b: "httpx",         label: "Sync vs async HTTP" },
  { a: "pandas",       b: "polars",         label: "DataFrames: classic vs Rust-powered" },
  { a: "fastapi",      b: "flask",          label: "Modern async vs battle-tested micro" },
  { a: "axios",        b: "ky",             label: "Full-featured vs tiny fetch wrapper" },
  { a: "requests",     b: "aiohttp",        label: "Sync requests vs async client" },
  { a: "sqlalchemy",   b: "prisma",         label: "Python ORM vs TypeScript ORM" },
  { a: "pytest",       b: "vitest",         label: "Python testing vs JS testing" },
  { a: "zod",          b: "pydantic",       label: "TS schema validation vs Python" },
  { a: "react-query",  b: "swr",            label: "TanStack Query vs Vercel SWR" },
  { a: "zustand",      b: "jotai",          label: "Store-based vs atom-based state" },
  { a: "date-fns",     b: "dayjs",          label: "Functional vs chainable dates" },
  { a: "drizzle-orm",  b: "prisma",         label: "Lightweight ORM vs schema-first ORM" },
  { a: "flask",        b: "django",         label: "Micro vs batteries-included" },
  { a: "matplotlib",   b: "seaborn",        label: "Low-level plots vs statistical viz" },
  { a: "scrapy",       b: "beautifulsoup4", label: "Full crawl framework vs HTML parser" },
  { a: "click",        b: "typer",          label: "Decorator CLI vs type-annotated CLI" },
  { a: "axios",        b: "react-query",    label: "HTTP client vs data-fetching layer" },
  { a: "trpc",         b: "react-query",    label: "End-to-end types vs server state" },
];

const SECTIONS = [
  {
    heading: "HTTP & Networking",
    pairs: ["requests/httpx", "axios/ky", "requests/aiohttp"],
  },
  {
    heading: "Data & ORM",
    pairs: ["pandas/polars", "sqlalchemy/prisma", "drizzle-orm/prisma", "matplotlib/seaborn"],
  },
  {
    heading: "Web Frameworks",
    pairs: ["fastapi/flask", "flask/django"],
  },
  {
    heading: "State & Data Fetching",
    pairs: ["react-query/swr", "zustand/jotai", "axios/react-query", "trpc/react-query"],
  },
  {
    heading: "Validation & Types",
    pairs: ["zod/pydantic"],
  },
  {
    heading: "Dates & Utilities",
    pairs: ["date-fns/dayjs"],
  },
  {
    heading: "CLI & Scraping",
    pairs: ["click/typer", "scrapy/beautifulsoup4"],
  },
  {
    heading: "Testing",
    pairs: ["pytest/vitest"],
  },
];

function pairHref(pair: string) {
  const [a, b] = pair.split("/");
  return `/compare/${[a, b].sort().join("/")}`;
}

function pairLabel(pairStr: string) {
  const found = POPULAR_PAIRS.find(
    (p) => `${p.a}/${p.b}` === pairStr || `${p.b}/${p.a}` === pairStr
  );
  return found?.label ?? null;
}

function pairNames(pairStr: string): [string, string] {
  const [a, b] = pairStr.split("/");
  return [a, b];
}

export default function CompareLandingPage() {
  return (
    <div className="min-h-screen bg-warm-50">

      {/* Nav */}
      <div className="bg-white border-b border-warm-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Link href="/" className="text-warm-400 hover:text-warm-700 text-sm transition-colors font-medium">
            pkgdocs
          </Link>
          <span className="text-warm-300">/</span>
          <span className="text-warm-700 text-sm font-semibold">compare</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <GitCompare className="w-5 h-5 text-accent" />
            <span className="text-xs font-bold text-accent uppercase tracking-widest">Side-by-side</span>
          </div>
          <h1 className="text-4xl font-extrabold text-warm-950 tracking-tight mb-3">
            Compare packages
          </h1>
          <p className="text-warm-500 text-lg max-w-xl leading-relaxed">
            Can&apos;t decide between two libraries? See their difficulty, downloads, use cases,
            and recipes side by side.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-10">
          {SECTIONS.map((section) => (
            <div key={section.heading}>
              <h2 className="text-xs font-bold uppercase tracking-widest text-warm-400 mb-4">
                {section.heading}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {section.pairs.map((pair) => {
                  const [a, b] = pairNames(pair);
                  const label = pairLabel(pair);
                  return (
                    <Link
                      key={pair}
                      href={pairHref(pair)}
                      className="group flex items-center justify-between bg-white hover:bg-accent-light border border-warm-200 hover:border-accent/30 rounded-xl px-5 py-4 transition-all"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold font-mono text-warm-900 text-sm group-hover:text-accent transition-colors">
                            {a}
                          </span>
                          <span className="text-warm-300 font-light">vs</span>
                          <span className="font-bold font-mono text-warm-900 text-sm group-hover:text-accent transition-colors">
                            {b}
                          </span>
                        </div>
                        {label && (
                          <p className="text-xs text-warm-400">{label}</p>
                        )}
                      </div>
                      <ArrowRight className="w-4 h-4 text-warm-300 group-hover:text-accent group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Custom compare CTA */}
        <div className="mt-14 bg-white border border-warm-200 rounded-2xl p-8 text-center">
          <h3 className="font-bold text-warm-900 mb-2">Don&apos;t see your pair?</h3>
          <p className="text-sm text-warm-500 mb-5 max-w-xs mx-auto">
            Any two packages in pkgdocs can be compared. Just go to{" "}
            <code className="font-mono text-accent bg-accent-light px-1.5 py-0.5 rounded">
              /compare/[a]/[b]
            </code>
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dark text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            Browse all packages
          </Link>
        </div>

      </div>
    </div>
  );
}
