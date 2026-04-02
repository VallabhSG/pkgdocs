"use client";

import { use, useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { BookOpen, Play, Map, Zap, ChevronLeft } from "lucide-react";
import type { Package, ViewMode } from "@/lib/types";
import PackageSidebar from "@/components/PackageSidebar";
import StoryView from "@/components/StoryView";
import TaskFlowView from "@/components/TaskFlowView";
import dynamic from "next/dynamic";

const ApiMapView = dynamic(() => import("@/components/ApiMapView"), { ssr: false });
const DemoView   = dynamic(() => import("@/components/DemoView"),   { ssr: false });

const viewVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 32, filter: "blur(4px)" }),
  center: { opacity: 1, x: 0, filter: "blur(0px)" },
  exit:  (dir: number) => ({ opacity: 0, x: dir * -32, filter: "blur(4px)" }),
};

const viewOrder: ViewMode[] = ["story", "demo", "graph", "tasks"];

const mobileViewConfig: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
  { id: "story", label: "Story",   icon: <BookOpen className="w-4 h-4" /> },
  { id: "demo",  label: "Demo",    icon: <Play className="w-4 h-4" /> },
  { id: "graph", label: "API Map", icon: <Map className="w-4 h-4" /> },
  { id: "tasks", label: "Recipes", icon: <Zap className="w-4 h-4" /> },
];

function Skeleton() {
  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-slate-50">
      {/* Sidebar skeleton */}
      <div className="hidden md:flex w-64 flex-shrink-0 flex-col bg-white border-r border-slate-200">
        <div className="bg-slate-950 px-5 pt-5 pb-6 space-y-3">
          <div className="h-3 w-20 bg-slate-800 rounded animate-pulse" />
          <div className="h-5 w-16 bg-slate-700 rounded-full animate-pulse" />
          <div className="h-6 w-32 bg-slate-700 rounded animate-pulse" />
          <div className="h-3 w-full bg-slate-800 rounded animate-pulse" />
          <div className="h-3 w-3/4 bg-slate-800 rounded animate-pulse" />
          <div className="flex gap-3 pt-1">
            <div className="h-3 w-16 bg-slate-800 rounded animate-pulse" />
            <div className="h-3 w-12 bg-slate-800 rounded animate-pulse" />
          </div>
        </div>
        <div className="px-3 py-4 space-y-2 border-b border-slate-100">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-9 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="px-5 py-4 space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-3 bg-slate-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
      {/* Content skeleton */}
      <div className="flex-1 p-8 space-y-5">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
        <div className="h-4 w-full bg-slate-100 rounded animate-pulse" />
        <div className="h-4 w-5/6 bg-slate-100 rounded animate-pulse" />
        <div className="h-4 w-4/6 bg-slate-100 rounded animate-pulse" />
        <div className="mt-8 grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

interface RelatedCard {
  id: string;
  name: string;
  ecosystem: string;
  summary: string;
  tags: string[];
}

function computeRelated(pkg: Package, all: RelatedCard[]): RelatedCard[] {
  return all
    .filter((p) => p.id !== pkg.id)
    .map((p) => ({ card: p, shared: p.tags.filter((t) => pkg.tags.includes(t)).length }))
    .filter((x) => x.shared > 0)
    .sort((a, b) => b.shared - a.shared)
    .slice(0, 4)
    .map((x) => x.card);
}

let allCardsCache: RelatedCard[] | null = null;

export default function PackagePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [pkg, setPkg] = useState<Package | null | undefined>(undefined);
  const [related, setRelated] = useState<RelatedCard[]>([]);
  const [activeView, setActiveView] = useState<ViewMode>("story");
  const [prevView, setPrevView] = useState<ViewMode>("story");
  const [focusNodeId, setFocusNodeId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/packages/${slug}`)
      .then((r) => { if (!r.ok) throw new Error("Not found"); return r.json(); })
      .then((data: Package) => {
        setPkg(data);
        // Compute related packages
        if (allCardsCache) {
          setRelated(computeRelated(data, allCardsCache));
        } else {
          fetch("/api/packages")
            .then((r) => r.json())
            .then((all: RelatedCard[]) => {
              allCardsCache = all;
              setRelated(computeRelated(data, all));
            })
            .catch(() => {});
        }
      })
      .catch(() => setPkg(null));
  }, [slug]);

  const changeView = useCallback((v: ViewMode) => {
    setPrevView(activeView);
    setActiveView(v);
  }, [activeView]);

  const handleNodeFocus = useCallback((nodeId: string) => {
    setFocusNodeId(nodeId);
    changeView("graph");
  }, [changeView]);

  const direction = viewOrder.indexOf(activeView) > viewOrder.indexOf(prevView) ? 1 : -1;

  if (pkg === undefined) return <Skeleton />;

  if (pkg === null) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-5 bg-slate-50">
        <div className="text-5xl">📦</div>
        <h1 className="text-xl font-bold text-slate-800">Package not found</h1>
        <p className="text-sm text-slate-500">
          <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">{slug}</span> doesn&apos;t exist in pkgdocs yet.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to all packages
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-slate-50">

      {/* ── Sidebar (desktop) ── */}
      <div className="hidden md:block">
        <PackageSidebar pkg={pkg} activeView={activeView} onViewChange={changeView} related={related} />
      </div>

      {/* ── Mobile top bar ── */}
      <div className="md:hidden flex-shrink-0 bg-slate-950 text-white">
        {/* Package header row */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800">
          <Link href="/" className="text-slate-400 hover:text-white transition-colors" aria-label="Back">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2 min-w-0">
            <span className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              pkg.ecosystem === "npm"
                ? "bg-rose-900/40 text-rose-300 border-rose-700/50"
                : "bg-blue-900/40 text-blue-300 border-blue-700/50"
            }`}>
              {pkg.ecosystem === "npm" ? "npm" : "Python"}
            </span>
            <span className="font-bold font-mono text-sm text-white truncate">{pkg.name}</span>
            <span className="text-xs text-slate-500 font-mono flex-shrink-0">v{pkg.meta.version}</span>
          </div>
        </div>
        {/* Mobile view tabs */}
        <div className="flex">
          {mobileViewConfig.map((v) => (
            <button
              key={v.id}
              onClick={() => changeView(v.id)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-all relative ${
                activeView === v.id
                  ? "text-indigo-400"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {activeView === v.id && (
                <motion.div
                  layoutId="mobile-tab-indicator"
                  className="absolute bottom-0 left-1 right-1 h-0.5 bg-indigo-500 rounded-full"
                />
              )}
              {v.icon}
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main content area ── */}
      <main className="flex-1 overflow-hidden relative">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={activeView}
            custom={direction}
            variants={viewVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="absolute inset-0 overflow-auto"
          >
            {activeView === "story" && (
              <StoryView pkg={pkg} onNodeFocus={handleNodeFocus} />
            )}

            {activeView === "graph" && (
              <>
                <div className="hidden md:block h-full p-4">
                  <ApiMapView pkg={pkg} focusNodeId={focusNodeId} />
                </div>
                <div className="md:hidden flex flex-col items-center justify-center h-full px-8 text-center gap-5">
                  <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center">
                    <Map className="w-8 h-8 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 mb-1">API Map needs a bigger screen</h3>
                    <p className="text-sm text-slate-500 max-w-xs">
                      The interactive graph works best on desktop. Try Recipes for copy-paste code on mobile.
                    </p>
                  </div>
                  <button
                    onClick={() => changeView("tasks")}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                  >
                    View Recipes instead
                  </button>
                </div>
              </>
            )}

            {activeView === "demo"  && <DemoView pkg={pkg} />}
            {activeView === "tasks" && <TaskFlowView pkg={pkg} />}
          </motion.div>
        </AnimatePresence>
      </main>

    </div>
  );
}
