"use client";

import Link from "next/link";
import { Download, ArrowRight, CheckCircle2, XCircle, Zap, BookOpen } from "lucide-react";
import type { Package } from "@/lib/types";

interface Props {
  a: Package;
  b: Package;
}

const DIFFICULTY_LABEL: Record<number, string> = { 1: "Beginner", 2: "Intermediate", 3: "Advanced" };
const DIFFICULTY_CLS: Record<number, string> = {
  1: "bg-emerald-100 text-emerald-700 border-emerald-200",
  2: "bg-amber-100 text-amber-700 border-amber-200",
  3: "bg-rose-100 text-rose-700 border-rose-200",
};

function EcoBadge({ ecosystem }: { ecosystem: string }) {
  const isNpm = ecosystem === "npm";
  return (
    <span className={`inline-flex text-[10px] font-bold px-2 py-0.5 rounded border ${
      isNpm ? "bg-rose-50 text-rose-600 border-rose-200" : "bg-blue-50 text-blue-600 border-blue-200"
    }`}>
      {isNpm ? "npm" : "Python"}
    </span>
  );
}

function Downloads({ n }: { n: number }) {
  if (n >= 1_000_000) return <>{(n / 1_000_000).toFixed(1)}M</>;
  if (n >= 1_000) return <>{(n / 1_000).toFixed(0)}K</>;
  return <>{n}</>;
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[10px] font-bold uppercase tracking-widest text-warm-400 mb-4">{children}</h2>
  );
}

function Col({ pkg, highlight }: { pkg: Package; highlight?: boolean }) {
  return (
    <div className={`flex-1 min-w-0 rounded-2xl border p-5 transition-all ${
      highlight ? "border-accent/30 bg-accent-light/30" : "border-warm-200 bg-white"
    }`}>
      <div className="mb-1"><EcoBadge ecosystem={pkg.ecosystem} /></div>
      <h3 className="text-xl font-bold font-mono text-warm-950 mb-1 tracking-tight">{pkg.name}</h3>
      <p className="text-sm text-warm-500 leading-snug mb-4">{pkg.summary}</p>

      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5 text-emerald-600">
          <Download className="w-3 h-3" />
          <span className="font-semibold tabular-nums"><Downloads n={pkg.meta.weekly_downloads} /></span>
          <span className="text-warm-400">/ wk</span>
        </div>
        <span className="text-warm-400 font-mono">v{pkg.meta.version}</span>
      </div>
    </div>
  );
}

export default function CompareView({ a, b }: Props) {
  const sharedTags = a.tags.filter((t) => b.tags.includes(t));
  const onlyA = a.tags.filter((t) => !b.tags.includes(t));
  const onlyB = b.tags.filter((t) => !a.tags.includes(t));

  // Winner heuristics (simple signals, not definitive)
  const downloadsWinner = a.meta.weekly_downloads > b.meta.weekly_downloads ? "a" : "b";
  const difficultyWinner = a.difficulty < b.difficulty ? "a" : a.difficulty > b.difficulty ? "b" : null;
  const recipesWinner = a.tasks.length > b.tasks.length ? "a" : a.tasks.length < b.tasks.length ? "b" : null;

  return (
    <div className="min-h-screen bg-warm-50">

      {/* Nav */}
      <div className="bg-white border-b border-warm-200 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link href="/" className="text-warm-400 hover:text-warm-700 text-sm transition-colors">pkgdocs</Link>
          <span className="text-warm-300">/</span>
          <span className="text-warm-500 text-sm">compare</span>
          <span className="text-warm-300">/</span>
          <span className="text-warm-800 text-sm font-mono font-semibold">{a.name} vs {b.name}</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-10">

        {/* Hero — side by side */}
        <div>
          <p className="text-xs text-warm-400 font-semibold uppercase tracking-widest mb-4 text-center">Comparing</p>
          <div className="flex gap-4 items-stretch">
            <Col pkg={a} highlight={downloadsWinner === "a"} />
            <div className="flex items-center flex-shrink-0">
              <span className="text-2xl font-black text-warm-300">vs</span>
            </div>
            <Col pkg={b} highlight={downloadsWinner === "b"} />
          </div>
        </div>

        {/* Quick stats table */}
        <div className="bg-white rounded-2xl border border-warm-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-warm-100 bg-warm-50">
                <th className="text-left px-5 py-3 text-xs font-bold text-warm-400 uppercase tracking-widest w-1/3">Metric</th>
                <th className="text-center px-5 py-3 text-xs font-bold text-warm-700 font-mono">{a.name}</th>
                <th className="text-center px-5 py-3 text-xs font-bold text-warm-700 font-mono">{b.name}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-100">
              <tr>
                <td className="px-5 py-3 text-warm-500">Ecosystem</td>
                <td className="px-5 py-3 text-center"><EcoBadge ecosystem={a.ecosystem} /></td>
                <td className="px-5 py-3 text-center"><EcoBadge ecosystem={b.ecosystem} /></td>
              </tr>
              <tr>
                <td className="px-5 py-3 text-warm-500">Difficulty</td>
                <td className="px-5 py-3 text-center">
                  <span className={`inline-flex text-xs font-semibold px-2 py-0.5 rounded border ${DIFFICULTY_CLS[a.difficulty]}`}>
                    {DIFFICULTY_LABEL[a.difficulty]}
                    {difficultyWinner === "a" && " ✓"}
                  </span>
                </td>
                <td className="px-5 py-3 text-center">
                  <span className={`inline-flex text-xs font-semibold px-2 py-0.5 rounded border ${DIFFICULTY_CLS[b.difficulty]}`}>
                    {DIFFICULTY_LABEL[b.difficulty]}
                    {difficultyWinner === "b" && " ✓"}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-5 py-3 text-warm-500">Weekly downloads</td>
                <td className={`px-5 py-3 text-center font-semibold tabular-nums ${downloadsWinner === "a" ? "text-emerald-600" : "text-warm-600"}`}>
                  <Downloads n={a.meta.weekly_downloads} />
                  {downloadsWinner === "a" && <span className="ml-1 text-xs">↑</span>}
                </td>
                <td className={`px-5 py-3 text-center font-semibold tabular-nums ${downloadsWinner === "b" ? "text-emerald-600" : "text-warm-600"}`}>
                  <Downloads n={b.meta.weekly_downloads} />
                  {downloadsWinner === "b" && <span className="ml-1 text-xs">↑</span>}
                </td>
              </tr>
              <tr>
                <td className="px-5 py-3 text-warm-500">Latest version</td>
                <td className="px-5 py-3 text-center font-mono text-warm-600 text-xs">v{a.meta.version}</td>
                <td className="px-5 py-3 text-center font-mono text-warm-600 text-xs">v{b.meta.version}</td>
              </tr>
              <tr>
                <td className="px-5 py-3 text-warm-500">Recipes</td>
                <td className={`px-5 py-3 text-center font-semibold ${recipesWinner === "a" ? "text-accent" : "text-warm-600"}`}>
                  {a.tasks.length}
                  {recipesWinner === "a" && <span className="ml-1 text-xs">↑</span>}
                </td>
                <td className={`px-5 py-3 text-center font-semibold ${recipesWinner === "b" ? "text-accent" : "text-warm-600"}`}>
                  {b.tasks.length}
                  {recipesWinner === "b" && <span className="ml-1 text-xs">↑</span>}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Tags */}
        <div>
          <SectionHeading>Tags</SectionHeading>
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div>
              <p className="font-semibold text-warm-600 mb-2 font-mono">{a.name} only</p>
              <div className="flex flex-wrap gap-1">
                {onlyA.length > 0 ? onlyA.map((t) => (
                  <span key={t} className="bg-rose-50 text-rose-600 border border-rose-200 px-2 py-0.5 rounded font-mono">{t}</span>
                )) : <span className="text-warm-400">—</span>}
              </div>
            </div>
            <div>
              <p className="font-semibold text-accent mb-2 text-center">Shared</p>
              <div className="flex flex-wrap gap-1 justify-center">
                {sharedTags.length > 0 ? sharedTags.map((t) => (
                  <span key={t} className="bg-accent-light text-accent border border-accent/20 px-2 py-0.5 rounded font-mono">{t}</span>
                )) : <span className="text-warm-400">none</span>}
              </div>
            </div>
            <div>
              <p className="font-semibold text-warm-600 mb-2 text-right font-mono">{b.name} only</p>
              <div className="flex flex-wrap gap-1 justify-end">
                {onlyB.length > 0 ? onlyB.map((t) => (
                  <span key={t} className="bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded font-mono">{t}</span>
                )) : <span className="text-warm-400">—</span>}
              </div>
            </div>
          </div>
        </div>

        {/* When to use */}
        <div>
          <SectionHeading>When to use each</SectionHeading>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-warm-200 p-5">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-bold text-warm-800 font-mono">{a.name}</span>
              </div>
              <p className="text-sm text-warm-600 leading-relaxed">{a.story.when_to_use}</p>
            </div>
            <div className="bg-white rounded-xl border border-warm-200 p-5">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-bold text-warm-800 font-mono">{b.name}</span>
              </div>
              <p className="text-sm text-warm-600 leading-relaxed">{b.story.when_to_use}</p>
            </div>
          </div>
        </div>

        {/* When NOT to use */}
        {(a.story.when_not_to_use || b.story.when_not_to_use) && (
          <div>
            <SectionHeading>When to skip each</SectionHeading>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-rose-50 rounded-xl border border-rose-100 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="w-4 h-4 text-rose-400" />
                  <span className="text-sm font-bold text-warm-800 font-mono">{a.name}</span>
                </div>
                <p className="text-sm text-warm-600 leading-relaxed">
                  {a.story.when_not_to_use ?? <span className="text-warm-400 italic">No caveats documented.</span>}
                </p>
              </div>
              <div className="bg-rose-50 rounded-xl border border-rose-100 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="w-4 h-4 text-rose-400" />
                  <span className="text-sm font-bold text-warm-800 font-mono">{b.name}</span>
                </div>
                <p className="text-sm text-warm-600 leading-relaxed">
                  {b.story.when_not_to_use ?? <span className="text-warm-400 italic">No caveats documented.</span>}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Top recipes side by side */}
        <div>
          <SectionHeading>Sample recipes</SectionHeading>
          <div className="grid grid-cols-2 gap-4">
            {[{ pkg: a, side: "a" }, { pkg: b, side: "b" }].map(({ pkg }) => (
              <div key={pkg.id} className="bg-white rounded-xl border border-warm-200 p-5">
                <p className="text-xs font-bold text-warm-400 font-mono mb-3">{pkg.name}</p>
                <ul className="space-y-1.5">
                  {pkg.tasks.slice(0, 4).map((t) => (
                    <li key={t.id} className="flex items-start gap-2 text-xs text-warm-600">
                      <Zap className="w-3 h-3 text-accent mt-0.5 flex-shrink-0" />
                      {t.title}
                    </li>
                  ))}
                </ul>
                {pkg.tasks.length > 4 && (
                  <p className="text-xs text-warm-400 mt-2">+{pkg.tasks.length - 4} more</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA links */}
        <div className="grid grid-cols-2 gap-4">
          {[a, b].map((pkg) => (
            <Link
              key={pkg.id}
              href={`/package/${pkg.id}`}
              className="group flex items-center justify-between bg-white hover:bg-accent-light border border-warm-200 hover:border-accent/30 rounded-xl px-5 py-4 transition-all"
            >
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <BookOpen className="w-3.5 h-3.5 text-accent" />
                  <span className="text-xs text-warm-400">Full docs</span>
                </div>
                <span className="font-bold font-mono text-warm-800 group-hover:text-accent transition-colors">{pkg.name}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-warm-300 group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
