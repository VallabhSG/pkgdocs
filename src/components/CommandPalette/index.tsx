"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";

interface PkgCard {
  id: string;
  ecosystem: string;
  name: string;
  summary: string;
  tags: string[];
  difficulty: number;
}

let cachedPackages: PkgCard[] | null = null;

function score(pkg: PkgCard, q: string): number {
  const lq = q.toLowerCase();
  let s = 0;
  if (pkg.name.toLowerCase().startsWith(lq)) s += 10;
  else if (pkg.name.toLowerCase().includes(lq)) s += 6;
  if (pkg.summary.toLowerCase().includes(lq)) s += 3;
  if (pkg.tags.some((t) => t.includes(lq))) s += 4;
  return s;
}

const ecosystemColor: Record<string, string> = {
  pypi: "bg-blue-100 text-blue-600",
  npm: "bg-rose-100 text-rose-500",
};
const diffLabel = ["", "Beginner", "Intermediate", "Advanced"];
const diffColor = [
  "",
  "text-emerald-600",
  "text-amber-600",
  "text-rose-600",
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [packages, setPackages] = useState<PkgCard[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const fetchedRef = useRef(false);

  const fetchPackages = useCallback(async () => {
    if (cachedPackages) {
      setPackages(cachedPackages);
      return;
    }
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    setLoading(true);
    try {
      const res = await fetch("/api/packages");
      const data = await res.json();
      cachedPackages = data;
      setPackages(data);
    } finally {
      setLoading(false);
    }
  }, []);

  // Global keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => {
          if (!prev) fetchPackages();
          return !prev;
        });
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [fetchPackages]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const results =
    query.trim().length === 0
      ? packages.slice(0, 8)
      : packages
          .map((p) => ({ pkg: p, s: score(p, query.trim()) }))
          .filter((x) => x.s > 0)
          .sort((a, b) => b.s - a.s)
          .slice(0, 8)
          .map((x) => x.pkg);

  const navigate = useCallback(
    (pkg: PkgCard) => {
      setOpen(false);
      router.push(`/package/${pkg.id}`);
    },
    [router]
  );

  // Keyboard navigation inside palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (results[activeIdx]) navigate(results[activeIdx]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${activeIdx}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIdx]);

  if (typeof window === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="fixed left-1/2 top-[15vh] -translate-x-1/2 z-50 w-full max-w-xl bg-white rounded-2xl shadow-2xl shadow-slate-900/20 border border-slate-200 overflow-hidden"
            onKeyDown={handleKeyDown}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
              <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setActiveIdx(0); }}
                placeholder="Search packages…"
                className="flex-1 text-sm text-slate-800 placeholder-slate-400 outline-none bg-transparent"
              />
              {query && (
                <button onClick={() => setQuery("")} className="text-slate-300 hover:text-slate-500 text-xs">
                  ✕
                </button>
              )}
              <kbd className="text-xs text-slate-300 border border-slate-200 rounded px-1.5 py-0.5 font-mono">esc</kbd>
            </div>

            {/* Results */}
            <div ref={listRef} className="max-h-[min(400px,60vh)] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-10 text-sm text-slate-400 gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Loading packages…
                </div>
              ) : results.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-400">
                  No packages match &ldquo;{query}&rdquo;
                </div>
              ) : (
                results.map((pkg, idx) => (
                  <button
                    key={pkg.id}
                    data-idx={idx}
                    onClick={() => navigate(pkg)}
                    onMouseEnter={() => setActiveIdx(idx)}
                    className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors ${
                      idx === activeIdx ? "bg-indigo-50" : "hover:bg-slate-50"
                    }`}
                  >
                    <span className={`mt-0.5 text-xs px-1.5 py-0.5 rounded-full font-semibold shrink-0 ${ecosystemColor[pkg.ecosystem] ?? "bg-slate-100 text-slate-500"}`}>
                      {pkg.ecosystem === "pypi" ? "py" : "js"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className={`text-sm font-bold font-mono ${idx === activeIdx ? "text-indigo-700" : "text-slate-900"}`}>
                          {pkg.name}
                        </span>
                        <span className={`text-xs ${diffColor[pkg.difficulty]}`}>
                          {diffLabel[pkg.difficulty]}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{pkg.summary}</p>
                      {pkg.tags.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {pkg.tags.slice(0, 3).map((t) => (
                            <span key={t} className="text-xs font-mono bg-slate-100 text-slate-400 px-1 rounded">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    {idx === activeIdx && (
                      <kbd className="text-xs text-slate-300 border border-slate-200 rounded px-1.5 py-0.5 font-mono shrink-0 self-center">↵</kbd>
                    )}
                  </button>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-400">
              <div className="flex items-center gap-3">
                <span><kbd className="border border-slate-200 rounded px-1 font-mono bg-white">↑↓</kbd> navigate</span>
                <span><kbd className="border border-slate-200 rounded px-1 font-mono bg-white">↵</kbd> open</span>
              </div>
              <span>{packages.length} packages</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
