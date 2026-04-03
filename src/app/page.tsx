import { readdir, readFile } from "fs/promises";
import path from "path";
import Link from "next/link";
import type { Package } from "@/lib/types";
import SearchBar from "@/components/SearchBar";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { HeroSection } from "@/components/HeroSection";
import CmdKTrigger from "@/components/CmdKTrigger";

async function getPackages(): Promise<Package[]> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from("packages")
      .select("data")
      .order("weekly_downloads", { ascending: false })
      .limit(200);
    if (!error && data) return data.map((row) => (row as { data: Package }).data);
  }
  const dir = path.join(process.cwd(), "public", "data", "packages");
  const files = await readdir(dir);
  const packages = await Promise.all(
    files
      .filter((f) => f.endsWith(".json"))
      .map(async (f) => {
        const raw = await readFile(path.join(dir, f), "utf-8");
        return JSON.parse(raw) as Package;
      })
  );
  return packages.sort((a, b) => b.meta.weekly_downloads - a.meta.weekly_downloads);
}

const FEATURED_IDS = ["requests", "pandas", "fastapi", "zod", "axios", "vite"];

const CATEGORIES: { label: string; emoji: string; ids: string[] }[] = [
  { label: "Data Science",    emoji: "ðŸ“Š", ids: ["pandas", "numpy", "polars", "pillow", "sqlalchemy"] },
  { label: "Web Frameworks",  emoji: "ðŸŒ", ids: ["fastapi", "flask", "django", "express"] },
  { label: "HTTP and Async",  emoji: "âš¡", ids: ["requests", "httpx", "axios", "ky", "aiohttp", "anyio"] },
  { label: "Testing",         emoji: "ðŸ§ª", ids: ["pytest", "vitest", "playwright"] },
  { label: "ORM and Database",emoji: "ðŸ—„ï¸", ids: ["prisma", "drizzle-orm", "sqlalchemy", "redis-py", "alembic"] },
  { label: "State and Forms", emoji: "ðŸ”„", ids: ["zustand", "jotai", "immer", "react-query", "react-hook-form"] },
  { label: "Validation",      emoji: "âœ…", ids: ["zod", "pydantic"] },
  { label: "Scraping and ML", emoji: "ðŸ¤–", ids: ["scrapy", "beautifulsoup4", "boto3"] },
  { label: "Build Tooling",   emoji: "ðŸ”§", ids: ["vite", "tailwindcss", "typescript"] },
  { label: "CLI and Output",  emoji: "ðŸ–¥ï¸", ids: ["click", "typer", "rich"] },
];

const FEATURES = [
  { num: "01", title: "Story View", desc: "The problem, mental model, and when to use it â€” written for humans." },
  { num: "02", title: "Live Demos", desc: "Interactive playgrounds that run in the browser. No setup required." },
  { num: "03", title: "API Map",    desc: "Visual graph of classes, functions and relationships." },
  { num: "04", title: "Recipes",    desc: "Copy-paste code snippets for the most common tasks." },
];

const difficultyLabel = ["", "Beginner", "Intermediate", "Advanced"];
const difficultyColor = [
  "",
  "bg-emerald-50 text-emerald-700 border border-emerald-200",
  "bg-amber-50 text-amber-700 border border-amber-200",
  "bg-rose-50 text-rose-700 border border-rose-200",
];

export default async function HomePage() {
  const packages = await getPackages();
  const featured = FEATURED_IDS.map((id) => packages.find((p) => p.id === id)).filter(Boolean) as Package[];
  const pypiCount = packages.filter((p) => p.ecosystem === "pypi").length;
  const npmCount  = packages.filter((p) => p.ecosystem === "npm").length;
  const pkgById = new Map(packages.map((p) => [p.id, p]));
  const categories = CATEGORIES.map((cat) => ({
    ...cat,
    packages: cat.ids.map((id) => pkgById.get(id)).filter(Boolean) as Package[],
  })).filter((c) => c.packages.length > 0);

  return (
    <div className="min-h-screen bg-warm-50">

      <header className="border-b border-warm-200 bg-white sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">ðŸ“¦</span>
            <span className="font-bold text-warm-950 tracking-tight">pkgdocs</span>
            <span className="text-[10px] font-bold bg-accent-light text-accent px-2 py-0.5 rounded uppercase tracking-wider">beta</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-warm-500">
            <CmdKTrigger />
            <span className="hidden sm:inline">
              <span className="font-semibold text-warm-800">{packages.length}</span> packages
            </span>
            <a href="https://github.com/VallabhSG/pkgdocs" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-warm-900 transition-colors font-medium">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.749 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              GitHub
            </a>
          </div>
        </div>
      </header>

      <HeroSection packageCount={packages.length} pypiCount={pypiCount} npmCount={npmCount} />

      <section className="bg-white border-b border-warm-200">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <p className="text-[11px] font-bold text-warm-400 uppercase tracking-[0.15em] mb-8">
            Four ways to understand any package
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-warm-100">
            {FEATURES.map(({ num, title, desc }) => (
              <div key={title} className="px-5 first:pl-0 last:pr-0">
                <div className="text-xs font-bold text-warm-300 mb-3 font-mono">{num}</div>
                <div className="text-sm font-bold text-warm-900 mb-1.5">{title}</div>
                <div className="text-xs text-warm-500 leading-relaxed">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white border-b border-warm-200">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <p className="text-[11px] font-bold text-warm-400 uppercase tracking-[0.15em] mb-7">
            Browse by category
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categories.map((cat) => (
              <div key={cat.label} className="rounded-lg border border-warm-200 bg-warm-50 p-4 hover:border-accent/40 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base">{cat.emoji}</span>
                  <span className="text-sm font-semibold text-warm-800">{cat.label}</span>
                  <span className="ml-auto text-xs text-warm-400">{cat.packages.length}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {cat.packages.map((p) => (
                    <Link key={p.id} href={`/package/${p.id}`}
                      className={`text-xs font-mono px-2.5 py-1 rounded border font-medium transition-colors ${
                        p.ecosystem === "npm"
                          ? "bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100"
                          : "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100"
                      }`}>
                      {p.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="border-b border-warm-200 bg-warm-50">
          <div className="max-w-5xl mx-auto px-6 py-10">
            <div className="flex items-center justify-between mb-6">
              <p className="text-[11px] font-bold text-warm-400 uppercase tracking-[0.15em]">Popular packages</p>
              <a href="#search" className="text-xs text-accent hover:text-accent-dark font-medium transition-colors">
                View all {packages.length} â†’
              </a>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {featured.map((p) => (
                <Link key={p.id} href={`/package/${p.id}`}
                  className="group block border border-warm-200 bg-white rounded-lg p-4 hover:border-accent/50 hover:shadow-sm transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-bold font-mono text-sm text-warm-950 group-hover:text-accent transition-colors truncate mr-2">{p.name}</span>
                    <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      p.ecosystem === "npm"
                        ? "bg-rose-50 text-rose-500 border border-rose-100"
                        : "bg-blue-50 text-blue-500 border border-blue-100"
                    }`}>
                      {p.ecosystem === "npm" ? "npm" : "py"}
                    </span>
                  </div>
                  <p className="text-xs text-warm-500 leading-snug line-clamp-2 mb-3">{p.summary}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1 flex-wrap">
                      {p.tags.slice(0, 2).map((t) => (
                        <span key={t} className="text-[10px] bg-warm-100 text-warm-500 px-1.5 py-0.5 rounded font-mono">{t}</span>
                      ))}
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${difficultyColor[p.difficulty]}`}>
                      {difficultyLabel[p.difficulty]}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <div id="search" className="max-w-5xl mx-auto px-6 py-10 pb-20">
        <div className="flex items-center justify-between mb-6">
          <p className="text-[11px] font-bold text-warm-400 uppercase tracking-[0.15em]">All packages</p>
          <span className="text-xs text-warm-400">{packages.length} total</span>
        </div>
        <SearchBar packages={packages} />
      </div>

      <section className="bg-warm-950">
        <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h2 className="text-base font-bold text-white mb-1">Don&apos;t see your package?</h2>
            <p className="text-sm text-warm-400">pkgdocs is open source. Request a package on GitHub and it could be added next.</p>
          </div>
          <a href="https://github.com/VallabhSG/pkgdocs/issues/new?template=package_request.md&title=Package+request%3A+[package+name]&labels=package-request"
            target="_blank" rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-2 bg-accent hover:bg-accent-dark text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.749 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            Request a package
          </a>
        </div>
      </section>

      <footer className="border-t border-warm-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-warm-400">
          <span>pkgdocs Â· {packages.length} packages Â· Python &amp; npm</span>
          <div className="flex items-center gap-4">
            <a href="https://github.com/VallabhSG/pkgdocs" target="_blank" rel="noopener noreferrer" className="hover:text-warm-700 transition-colors">GitHub</a>
            <a href="/sitemap.xml" className="hover:text-warm-700 transition-colors">Sitemap</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
