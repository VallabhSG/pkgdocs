import { readdir, readFile } from "fs/promises";
import path from "path";
import type { Package } from "@/lib/types";
import SearchBar from "@/components/SearchBar";

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
      <div className="max-w-5xl mx-auto px-6 py-14 text-center">
        <h1 className="text-5xl font-bold text-slate-900 mb-4 leading-tight">
          Understand any package,
          <br />
          <span className="text-indigo-600">at your level</span>
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto">
          Interactive stories, API graphs, and copy-paste recipes — for beginners
          and experts alike. No walls of text.
        </p>
      </div>

      {/* Search + grid */}
      <div className="max-w-5xl mx-auto px-6 pb-20">
        <SearchBar packages={packages} />
      </div>
    </div>
  );
}
