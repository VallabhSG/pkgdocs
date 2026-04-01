import { readdir, readFile } from "fs/promises";
import path from "path";
import Link from "next/link";
import type { Package } from "@/lib/types";
import SearchBar from "@/components/SearchBar";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

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

const FEATURES = [
  {
    icon: "📖",
    title: "Story view",
    desc: "The problem, mental model, when to use it — written for humans, not robots.",
  },
  {
    icon: "▶",
    title: "Live demos",
    desc: "Interactive playgrounds that run in the browser. No setup required.",
  },
  {
    icon: "🗺",
    title: "API map",
    desc: "Visual graph of classes, functions and relationships — navigate the API visually.",
  },
  {
    icon: "⚡",
    title: "Recipes",
    desc: "Copy-paste code snippets for the most common tasks. One click to copy.",
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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">📦</span>
            <span className="font-bold text-slate-900">pkgdocs</span>
            <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-medium">beta</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span className="hidden sm:inline">
              <span className="font-semibold text-slate-700">{packages.length}</span> packages
            </span>
            <a
              href="https://github.com/VallabhSG/pkgdocs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-slate-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.749 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              GitHub
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-16 text-center">
          <div className="flex items-center justify-center gap-2 mb-5">
            <span className="text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100 px-3 py-1 rounded-full">
              {pypiCount} Python · {npmCount} npm packages
            </span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 mb-5 leading-tight tracking-tight">
            Package docs that
            <br />
            <span className="text-indigo-600">actually make sense</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-8 leading-relaxed">
            Every package explained with a story, a visual API map, a live demo,
            and copy-paste recipes. For beginners and experts alike.
          </p>
          <a
            href="#search"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
          >
            Browse packages
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </a>
        </div>
      </section>

      {/* Feature pills */}
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {FEATURES.map(({ icon, title, desc }) => (
              <div key={title} className="bg-white border border-slate-200 rounded-xl p-4 text-center">
                <div className="text-2xl mb-2">{icon}</div>
                <div className="text-sm font-semibold text-slate-800 mb-1">{title}</div>
                <div className="text-xs text-slate-500 leading-snug">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured packages */}
      {featured.length > 0 && (
        <section className="border-b border-slate-200 bg-white">
          <div className="max-w-5xl mx-auto px-6 py-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-widest">
                Popular packages
              </h2>
              <a href="#search" className="text-xs text-indigo-600 hover:text-indigo-800">
                View all {packages.length} →
              </a>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {featured.map((p) => (
                <Link
                  key={p.id}
                  href={`/package/${p.id}`}
                  className="group border border-slate-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-md transition-all bg-slate-50 hover:bg-white"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold font-mono text-sm text-slate-900 group-hover:text-indigo-700 transition-colors">
                      {p.name}
                    </span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                      p.ecosystem === "npm" ? "bg-rose-50 text-rose-500" : "bg-blue-50 text-blue-500"
                    }`}>
                      {p.ecosystem === "npm" ? "npm" : "Python"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-snug line-clamp-2">{p.summary}</p>
                  <div className="mt-2.5 flex items-center justify-between">
                    <div className="flex gap-1">
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
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Search */}
      <div id="search" className="max-w-5xl mx-auto px-6 py-10 pb-20">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-5">
          All packages
        </h2>
        <SearchBar packages={packages} />
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <span>pkgdocs · {packages.length} packages across Python and npm</span>
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
