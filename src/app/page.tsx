import Link from "next/link";
import { readdir, readFile } from "fs/promises";
import path from "path";
import type { Package } from "@/lib/types";

async function getPackages(): Promise<Package[]> {
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

const difficultyLabel = ["", "Beginner", "Intermediate", "Advanced"];
const difficultyColor = [
  "",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
];

function DownloadCount({ n }: { n: number }) {
  if (n >= 1_000_000) return <>{(n / 1_000_000).toFixed(0)}M/wk</>;
  if (n >= 1_000) return <>{(n / 1_000).toFixed(0)}K/wk</>;
  return <>{n}/wk</>;
}

export default async function HomePage() {
  const packages = await getPackages();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📦</span>
            <span className="font-bold text-slate-900 text-lg">pkgdocs</span>
            <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
              beta
            </span>
          </div>
          <span className="text-sm text-slate-400">Visual package documentation</span>
        </div>
      </header>

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 py-16 text-center">
        <h1 className="text-5xl font-bold text-slate-900 mb-4 leading-tight">
          Understand any package,
          <br />
          <span className="text-indigo-600">at your level</span>
        </h1>
        <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto">
          Interactive stories, API graphs, and copy-paste recipes — for beginners
          and experts alike. No walls of text.
        </p>
      </div>

      {/* Package grid */}
      <div className="max-w-5xl mx-auto px-6 pb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-slate-700">Python packages</h2>
          <span className="text-xs text-slate-400">{packages.length} packages</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.map((p) => (
            <Link
              key={p.id}
              href={`/package/${p.id}`}
              className="bg-white border border-slate-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="font-bold font-mono text-slate-900 group-hover:text-indigo-700 transition-colors">
                  {p.name}
                </span>
                <span className="text-xs text-slate-400 font-mono">{p.ecosystem}</span>
              </div>
              <p className="text-sm text-slate-600 mb-4 leading-snug">{p.summary}</p>
              <div className="flex items-center justify-between">
                <div className="flex gap-1.5 flex-wrap">
                  {p.tags.slice(0, 2).map((t) => (
                    <span
                      key={t}
                      className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-mono"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    difficultyColor[p.difficulty]
                  }`}
                >
                  {difficultyLabel[p.difficulty]}
                </span>
              </div>
              <div className="mt-3 text-xs text-slate-400">
                ⬇ <DownloadCount n={p.meta.weekly_downloads} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
