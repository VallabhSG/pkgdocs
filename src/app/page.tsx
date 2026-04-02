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
  { label: "Data Science",     emoji: "📊", ids: ["pandas", "numpy", "polars", "pillow", "sqlalchemy"] },
  { label: "Web Frameworks",   emoji: "🌐", ids: ["fastapi", "flask", "django", "express"] },
  { label: "HTTP & Async",     emoji: "⚡", ids: ["requests", "httpx", "axios", "ky", "aiohttp", "anyio"] },
  { label: "Testing",          emoji: "🧪", ids: ["pytest", "vitest", "playwright"] },
  { label: "ORM & Database",   emoji: "🗄️", ids: ["prisma", "drizzle-orm", "sqlalchemy", "redis-py", "alembic"] },
  { label: "State & Forms",    emoji: "🔄", ids: ["zustand", "jotai", "immer", "react-query", "react-hook-form"] },
  { label: "Validation",       emoji: "✅", ids: ["zod", "pydantic"] },
  { label: "Scraping & ML",    emoji: "🤖", ids: ["scrapy", "beautifulsoup4", "boto3"] },
  { label: "Build & Tooling",  emoji: "🔧", ids: ["vite", "tailwindcss", "typescript"] },
  { label: "CLI & Output",     emoji: "🖥️", ids: ["click", "typer", "rich"] },
];

const FEATURES = [
  {
    icon: "📖",
    title: "Story View",
    desc: "The problem, mental model, when to use — written for humans, not robots.",
    color: "from-blue-500/10 to-indigo-500/10 border-blue-200/60",
    iconBg: "bg-blue-50",
  },
  {
    icon: "▶",
    title: "Live Demos",
    desc: "Interactive playgrounds that run in the browser. No setup required.",
    color: "from-violet-500/10 to-purple-500/10 border-violet-200/60",
    iconBg: "bg-violet-50",
  },
  {
    icon: "🗺",
    title: "API Map",
    desc: "Visual graph of classes, functions and relationships — navigate visually.",
    color: "from-emerald-500/10 to-teal-500/10 border-emerald-200/60",
    iconBg: "bg-emerald-50",
  },
  {
    icon: "⚡",
    title: "Recipes",
    desc: "Copy-paste code snippets for the most common tasks. One click to copy.",
    color: "from-amber-500/10 to-orange-500/10 border-amber-200/60",
    iconBg: "bg-amber-50",
  },
];

const difficultyLabel = ["", "Beginner", "Intermediate", "Advanced"];
const difficultyColor = [
  "",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
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
    <div className="min-h-screen bg-slate-50">

      {/* ── Sticky Nav ── */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">📦</span>
            <span className="font-bold text-slate-900 tracking-tight">pkgdocs</span>
            <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-medium">beta</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <CmdKTrigger />
            <span className="hidden sm:inline">
              <span className="font-semibold text-slate-700">{packages.length}</span> packages
            </span>
            <a
              href="https://github.com/VallabhSG/pkgdocs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-slate-800 transition-colors font-medium"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.749 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              GitHub
            </a>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <HeroSection packageCount={packages.length} pypiCount={pypiCount} npmCount={npmCount} />

      {/* ── Features ── */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">
            Four ways to understand any package
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {FEATURES.map(({ icon, title, desc, color, iconBg }) => (
              <div
                key={title}
                className={`bg-gradient-to-br ${color} border rounded-2xl p-5 hover:shadow-md transition-shadow`}
              >
                <div className={`w-9 h-9 ${iconBg} rounded-xl flex items-center justify-center text-lg mb-3`}>
                  {icon}
                </div>
                <div className="text-sm font-bold text-slate-800 mb-1">{title}</div>
                <div className="text-xs text-slate-500 leading-snug">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured packages ── */}
      {/* ── Category browser ── */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">
            Browse by category
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {categories.map((cat) => (
              <div key={cat.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base">{cat.emoji}</span>
                  <span className="text-sm font-bold text-slate-700">{cat.label}</span>
                  <span className="ml-auto text-xs text-slate-400">{cat.packages.length} packages</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {cat.packages.map((p) => (
                    <Link
                      key={p.id}
                      href={`/package/${p.id}`}
                      className={`text-xs font-mono px-2.5 py-1 rounded-full border font-medium transition-all hover:shadow-sm ${
                        p.ecosystem === "npm"
                          ? "bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100"
                          : "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100"
                      }`}
                    >
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
        <section className="border-b border-slate-200 bg-slate-50">
          <div className="max-w-5xl mx-auto px-6 py-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Popular packages
              </h2>
              <a href="#search" className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                View all {packages.length} →
              </a>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {featured.map((p) => (
                <Link
                  key={p.id}
                  href={`/package/${p.id}`}
                  className="group relative bg-white border border-slate-200 rounded-2xl p-4 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-100 transition-all overflow-hidden"
                >
                  {/* Subtle glow on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/0 to-indigo-50/0 group-hover:from-indigo-50/60 group-hover:to-violet-50/30 transition-all rounded-2xl pointer-events-none" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold font-mono text-sm text-slate-900 group-hover:text-indigo-700 transition-colors">
                        {p.name}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        p.ecosystem === "npm"
                          ? "bg-rose-50 text-rose-500 border border-rose-100"
                          : "bg-blue-50 text-blue-500 border border-blue-100"
                      }`}>
                        {p.ecosystem === "npm" ? "npm" : "Python"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-snug line-clamp-2 mb-3">{p.summary}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1 flex-wrap">
                        {p.tags.slice(0, 2).map((t) => (
                          <span key={t} className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">
                            {t}
                          </span>
                        ))}
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${difficultyColor[p.difficulty]}`}>
                        {difficultyLabel[p.difficulty]}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Search / All packages ── */}
      <div id="search" className="max-w-5xl mx-auto px-6 py-10 pb-24">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            All packages
          </h2>
          <span className="text-xs text-slate-400">{packages.length} total</span>
        </div>
        <SearchBar packages={packages} />
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <span>pkgdocs · {packages.length} packages · Python &amp; npm</span>
          <div className="flex items-center gap-4">
            <a href="https://github.com/VallabhSG/pkgdocs" target="_blank" rel="noopener noreferrer" className="hover:text-slate-600 transition-colors">
              GitHub
            </a>
            <a href="/sitemap.xml" className="hover:text-slate-600 transition-colors">Sitemap</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
