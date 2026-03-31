"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Package } from "@/lib/types";

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

function score(pkg: Package, query: string): number {
  const q = query.toLowerCase();
  let s = 0;
  if (pkg.name.toLowerCase().startsWith(q)) s += 10;
  if (pkg.name.toLowerCase().includes(q)) s += 5;
  if (pkg.summary.toLowerCase().includes(q)) s += 3;
  if (pkg.tags.some((t) => t.includes(q))) s += 4;
  if (pkg.story.problem.toLowerCase().includes(q)) s += 1;
  if (pkg.story.when_to_use.toLowerCase().includes(q)) s += 1;
  return s;
}

interface Props {
  packages: Package[];
}

export default function SearchBar({ packages }: Props) {
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const pkg of packages) {
      for (const tag of pkg.tags) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([tag]) => tag);
  }, [packages]);

  const filtered = useMemo(() => {
    let result = packages;

    if (activeTag) {
      result = result.filter((p) => p.tags.includes(activeTag));
    }

    if (!query.trim()) return result;

    return result
      .map((p) => ({ pkg: p, score: score(p, query.trim()) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.pkg);
  }, [packages, query, activeTag]);

  return (
    <div>
      {/* Search input */}
      <div className="relative mb-4">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
          />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, tag, or goal… e.g. 'csv parsing', 'async http'"
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* Tag pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveTag(null)}
          className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
            activeTag === null
              ? "bg-indigo-600 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          All
        </button>
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            className={`text-xs px-3 py-1.5 rounded-full font-mono transition-all ${
              activeTag === tag
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-slate-500">
          {filtered.length === packages.length
            ? `${packages.length} packages`
            : `${filtered.length} of ${packages.length} packages`}
        </span>
        {(query || activeTag) && (
          <button
            onClick={() => { setQuery(""); setActiveTag(null); }}
            className="text-xs text-indigo-500 hover:text-indigo-700"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Package grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <div className="text-4xl mb-3">🔍</div>
          <p className="font-medium text-slate-500">No packages match &ldquo;{query}&rdquo;</p>
          <p className="text-sm mt-1">Try a tag, a use-case, or a package name</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
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
                    <button
                      key={t}
                      onClick={(e) => { e.preventDefault(); setActiveTag(t); }}
                      className={`text-xs px-2 py-0.5 rounded font-mono transition-colors ${
                        activeTag === t
                          ? "bg-indigo-100 text-indigo-600"
                          : "bg-slate-100 text-slate-500 hover:bg-indigo-50 hover:text-indigo-500"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${difficultyColor[p.difficulty]}`}>
                  {difficultyLabel[p.difficulty]}
                </span>
              </div>
              <div className="mt-3 text-xs text-slate-400">
                ⬇ <DownloadCount n={p.meta.weekly_downloads} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
