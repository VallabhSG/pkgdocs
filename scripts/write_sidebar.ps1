$content = @'
"use client";

import Link from "next/link";
import { ExternalLink, ChevronLeft, Download, Tag, BookOpen, Play, Map, Zap } from "lucide-react";
import type { Package, ViewMode } from "@/lib/types";

interface RelatedCard {
  id: string;
  name: string;
  ecosystem: string;
  summary: string;
  tags: string[];
}

interface Props {
  pkg: Package;
  activeView: ViewMode;
  onViewChange: (v: ViewMode) => void;
  related?: RelatedCard[];
}

const views: { id: ViewMode; label: string; icon: React.ReactNode; hint: string }[] = [
  { id: "story", label: "Story",   icon: <BookOpen className="w-4 h-4" />, hint: "Big picture" },
  { id: "demo",  label: "Demo",    icon: <Play className="w-4 h-4" />,     hint: "Interactive" },
  { id: "graph", label: "API Map", icon: <Map className="w-4 h-4" />,      hint: "Graph" },
  { id: "tasks", label: "Recipes", icon: <Zap className="w-4 h-4" />,      hint: "Copy-paste" },
];

function DownloadCount({ n }: { n: number }) {
  if (n >= 1_000_000) return <>{(n / 1_000_000).toFixed(1)}M</>;
  if (n >= 1_000)     return <>{(n / 1_000).toFixed(0)}K</>;
  return <>{n}</>;
}

function DifficultyBar({ level }: { level: 1 | 2 | 3 }) {
  const colors = ["bg-emerald-400", "bg-amber-400", "bg-rose-400"];
  const labels = ["", "Beginner", "Intermediate", "Advanced"];
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`h-1 w-5 rounded-full transition-colors ${i <= level ? colors[level - 1] : "bg-warm-200"}`} />
        ))}
      </div>
      <span className="text-xs text-warm-400">{labels[level]}</span>
    </div>
  );
}

export default function PackageSidebar({ pkg, activeView, onViewChange, related = [] }: Props) {
  const isNpm = pkg.ecosystem === "npm";

  return (
    <aside className="w-64 flex-shrink-0 border-r border-warm-200 h-full flex flex-col bg-white overflow-y-auto">

      {/* Clean header — no dark background, no glow */}
      <div className="px-5 pt-5 pb-4 border-b border-warm-100">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs text-warm-400 hover:text-warm-700 transition-colors mb-4"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          All packages
        </Link>

        {/* Ecosystem badge */}
        <div className="mb-2.5">
          <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded border ${
            isNpm
              ? "bg-rose-50 text-rose-600 border-rose-200"
              : "bg-blue-50 text-blue-600 border-blue-200"
          }`}>
            {isNpm ? "npm" : "Python"}
          </span>
        </div>

        {/* Package name — large, confident */}
        <h1 className="text-[1.375rem] font-bold text-warm-950 font-mono leading-tight mb-2 tracking-tight">
          {pkg.name}
        </h1>
        <p className="text-xs text-warm-500 leading-snug mb-4">
          {pkg.summary}
        </p>

        {/* Stats row */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-emerald-600">
            <Download className="w-3.5 h-3.5" />
            <span className="font-semibold tabular-nums"><DownloadCount n={pkg.meta.weekly_downloads} /></span>
            <span className="text-warm-400">/ wk</span>
          </div>
          <span className="text-warm-400 font-mono">v{pkg.meta.version}</span>
        </div>
      </div>

      {/* Difficulty */}
      <div className="px-5 py-3 border-b border-warm-100">
        <DifficultyBar level={pkg.difficulty as 1 | 2 | 3} />
      </div>

      {/* View switcher */}
      <div className="px-3 py-3 border-b border-warm-100">
        <p className="px-2 text-[10px] font-bold text-warm-400 uppercase tracking-widest mb-1.5">Views</p>
        <nav className="space-y-0.5">
          {views.map((v) => (
            <button
              key={v.id}
              onClick={() => onViewChange(v.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all ${
                activeView === v.id
                  ? "bg-accent-light text-accent font-semibold border-l-2 border-accent"
                  : "text-warm-600 hover:bg-warm-50 border-l-2 border-transparent"
              }`}
            >
              <span className={activeView === v.id ? "text-accent" : "text-warm-400"}>{v.icon}</span>
              <span>{v.label}</span>
              <span className="ml-auto text-[11px] text-warm-400">{v.hint}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Start here shortcuts */}
      <div className="px-3 py-3 border-b border-warm-100">
        <p className="px-2 text-[10px] font-bold text-warm-400 uppercase tracking-widest mb-1.5">Start here</p>
        <div className="space-y-0.5">
          {[
            { icon: "🆕", bold: `New to ${pkg.name}?`, rest: "Read the story",  view: "story" as ViewMode },
            { icon: "🔍", bold: "Already using it?",   rest: "Explore API map", view: "graph" as ViewMode },
            { icon: "▶",  bold: "Want to try it?",     rest: "Open the demo",   view: "demo"  as ViewMode },
            { icon: "⚡", bold: "In a hurry?",         rest: "Copy a recipe",   view: "tasks" as ViewMode },
          ].map(({ icon, bold, rest, view }) => (
            <button
              key={view}
              onClick={() => onViewChange(view)}
              className="w-full text-left text-xs px-3 py-2 rounded-lg hover:bg-accent-light text-warm-500 hover:text-accent transition-colors"
            >
              {icon} <span className="font-semibold text-warm-700">{bold}</span> {rest}
            </button>
          ))}
        </div>
      </div>

      {/* Tags */}
      {pkg.tags.length > 0 && (
        <div className="px-5 py-3 border-b border-warm-100">
          <p className="flex items-center gap-1.5 text-[10px] font-bold text-warm-400 uppercase tracking-widest mb-2">
            <Tag className="w-3 h-3" /> Tags
          </p>
          <div className="flex flex-wrap gap-1.5">
            {pkg.tags.map((t) => (
              <span key={t} className="text-xs bg-warm-100 hover:bg-accent-light hover:text-accent text-warm-500 px-2 py-0.5 rounded font-mono transition-colors cursor-default">
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Related packages */}
      {related.length > 0 && (
        <div className="px-5 py-3 border-b border-warm-100">
          <p className="text-[10px] font-bold text-warm-400 uppercase tracking-widest mb-2">See also</p>
          <div className="space-y-1.5">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/package/${r.id}`}
                className="flex items-start gap-2 group rounded-lg p-2 hover:bg-accent-light transition-colors"
              >
                <span className={`mt-0.5 shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded ${
                  r.ecosystem === "npm" ? "bg-rose-100 text-rose-500" : "bg-blue-100 text-blue-500"
                }`}>
                  {r.ecosystem === "npm" ? "js" : "py"}
                </span>
                <div className="min-w-0">
                  <div className="text-xs font-bold font-mono text-warm-700 group-hover:text-accent transition-colors truncate">{r.name}</div>
                  <div className="text-[11px] text-warm-400 leading-snug line-clamp-1">{r.summary}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* External links */}
      <div className="px-5 py-3 mt-auto">
        <p className="text-[10px] font-bold text-warm-400 uppercase tracking-widest mb-2">Links</p>
        <div className="space-y-2">
          {pkg.meta.docs_url && (
            <a href={pkg.meta.docs_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-accent hover:text-accent-dark transition-colors group">
              <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              Official Docs
            </a>
          )}
          {pkg.meta.repo_url && (
            <a href={pkg.meta.repo_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-accent hover:text-accent-dark transition-colors group">
              <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              GitHub
            </a>
          )}
          {pkg.meta.pypi_url && (
            <a href={pkg.meta.pypi_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-accent hover:text-accent-dark transition-colors group">
              <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              PyPI
            </a>
          )}
        </div>
      </div>

    </aside>
  );
}
'@

Set-Content -Path 'e:\Java WorkSpace\pkgdocs\src\components\PackageSidebar\index.tsx' -Encoding UTF8 -Value $content
Write-Output "done"
