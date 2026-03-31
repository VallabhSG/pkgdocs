"use client";

import Link from "next/link";
import type { Package, ViewMode } from "@/lib/types";

interface Props {
  pkg: Package;
  activeView: ViewMode;
  onViewChange: (v: ViewMode) => void;
}

const views: { id: ViewMode; label: string; icon: string; hint: string }[] = [
  { id: "story", label: "Story", icon: "📖", hint: "Big picture" },
  { id: "graph", label: "API Map", icon: "🗺", hint: "Graph" },
  { id: "tasks", label: "Recipes", icon: "⚡", hint: "Copy-paste" },
];

function DownloadCount({ n }: { n: number }) {
  if (n >= 1_000_000) return <span>{(n / 1_000_000).toFixed(0)}M / wk</span>;
  if (n >= 1_000) return <span>{(n / 1_000).toFixed(0)}K / wk</span>;
  return <span>{n} / wk</span>;
}

function DifficultyMeter({ level }: { level: 1 | 2 | 3 }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className={`h-1.5 w-6 rounded-full ${
            i <= level ? "bg-indigo-500" : "bg-slate-200"
          }`}
        />
      ))}
    </div>
  );
}

export default function PackageSidebar({ pkg, activeView, onViewChange }: Props) {
  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-200 h-full flex flex-col bg-white">
      {/* Back nav */}
      <div className="px-5 pt-4 pb-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-600 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          All packages
        </Link>
      </div>

      {/* Package identity */}
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="text-xs font-mono text-slate-400 mb-1 uppercase tracking-widest">
          {pkg.ecosystem}
        </div>
        <h1 className="text-xl font-bold text-slate-900 font-mono mb-1">{pkg.name}</h1>
        <p className="text-xs text-slate-500 leading-snug mb-3">{pkg.summary}</p>

        <div className="space-y-2 text-xs text-slate-600">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Downloads</span>
            <span className="font-semibold text-emerald-600">
              <DownloadCount n={pkg.meta.weekly_downloads} />
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Version</span>
            <span className="font-mono font-semibold">{pkg.meta.version}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Complexity</span>
            <DifficultyMeter level={pkg.difficulty} />
          </div>
        </div>
      </div>

      {/* Audience entry points */}
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
          Start here
        </div>
        <div className="space-y-1.5">
          <button
            onClick={() => onViewChange("story")}
            className="w-full text-left text-xs px-3 py-2 rounded-lg hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 transition-colors"
          >
            🆕 <span className="font-medium">New to {pkg.name}?</span> Read the story
          </button>
          <button
            onClick={() => onViewChange("graph")}
            className="w-full text-left text-xs px-3 py-2 rounded-lg hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 transition-colors"
          >
            🔍 <span className="font-medium">Already using it?</span> Explore API map
          </button>
          <button
            onClick={() => onViewChange("tasks")}
            className="w-full text-left text-xs px-3 py-2 rounded-lg hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 transition-colors"
          >
            ⚡ <span className="font-medium">In a hurry?</span> Copy a recipe
          </button>
        </div>
      </div>

      {/* View switcher */}
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
          Views
        </div>
        <nav className="space-y-1">
          {views.map((v) => (
            <button
              key={v.id}
              onClick={() => onViewChange(v.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                activeView === v.id
                  ? "bg-indigo-50 text-indigo-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span>{v.icon}</span>
              <span>{v.label}</span>
              <span className="ml-auto text-xs text-slate-400">{v.hint}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tags */}
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
          Tags
        </div>
        <div className="flex flex-wrap gap-1.5">
          {pkg.tags.map((t) => (
            <span
              key={t}
              className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-mono"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* External links */}
      <div className="px-5 py-4 mt-auto">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
          Links
        </div>
        <div className="space-y-1.5">
          {pkg.meta.docs_url && (
            <a
              href={pkg.meta.docs_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Official Docs
            </a>
          )}
          <a
            href={pkg.meta.repo_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            GitHub
          </a>
          {pkg.meta.pypi_url && (
            <a
              href={pkg.meta.pypi_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              PyPI
            </a>
          )}
        </div>
      </div>
    </aside>
  );
}
