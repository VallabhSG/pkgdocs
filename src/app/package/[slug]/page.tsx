"use client";

import { use, useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import type { Package, ViewMode } from "@/lib/types";
import PackageSidebar from "@/components/PackageSidebar";
import StoryView from "@/components/StoryView";
import TaskFlowView from "@/components/TaskFlowView";
import dynamic from "next/dynamic";

const ApiMapView = dynamic(() => import("@/components/ApiMapView"), { ssr: false });
const DemoView   = dynamic(() => import("@/components/DemoView"),   { ssr: false });

const viewVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 40 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir * -40 }),
};

const viewOrder: ViewMode[] = ["story", "demo", "graph", "tasks"];

const mobileViewConfig: { id: ViewMode; label: string; icon: string }[] = [
  { id: "story", label: "Story",   icon: "📖" },
  { id: "demo",  label: "Demo",    icon: "▶" },
  { id: "graph", label: "API Map", icon: "🗺" },
  { id: "tasks", label: "Recipes", icon: "⚡" },
];

export default function PackagePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [pkg, setPkg] = useState<Package | null | undefined>(undefined);
  const [activeView, setActiveView] = useState<ViewMode>("story");
  const [prevView, setPrevView] = useState<ViewMode>("story");
  const [focusNodeId, setFocusNodeId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/packages/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then(setPkg)
      .catch(() => setPkg(null));
  }, [slug]);

  const changeView = useCallback(
    (v: ViewMode) => {
      setPrevView(activeView);
      setActiveView(v);
    },
    [activeView]
  );

  const handleNodeFocus = useCallback(
    (nodeId: string) => {
      setFocusNodeId(nodeId);
      changeView("graph");
    },
    [changeView]
  );

  const direction =
    viewOrder.indexOf(activeView) > viewOrder.indexOf(prevView) ? 1 : -1;

  if (pkg === undefined) {
    return (
      <div className="flex h-screen items-center justify-center text-slate-400 text-sm">
        Loading…
      </div>
    );
  }

  if (pkg === null) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 text-slate-400">
        <p className="text-lg font-medium">Package not found.</p>
        <Link href="/" className="text-sm text-indigo-600 hover:underline">
          ← Back to all packages
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-slate-50">
      {/* Sidebar — desktop only */}
      <div className="hidden md:block">
        <PackageSidebar pkg={pkg} activeView={activeView} onViewChange={changeView} />
      </div>

      {/* Mobile top bar */}
      <div className="md:hidden flex-shrink-0 bg-white border-b border-slate-200">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link
            href="/"
            className="text-slate-400 hover:text-slate-700 transition-colors"
            aria-label="Back to all packages"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <span className="font-bold font-mono text-slate-900">{pkg.name}</span>
          <span className="text-xs text-slate-400 font-mono">{pkg.meta.version}</span>
        </div>
        {/* Mobile view tabs */}
        <div className="flex border-t border-slate-100">
          {mobileViewConfig.map((v) => (
            <button
              key={v.id}
              onClick={() => changeView(v.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
                activeView === v.id
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <span>{v.icon}</span>
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-hidden relative">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={activeView}
            custom={direction}
            variants={viewVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="absolute inset-0 overflow-auto"
          >
            {activeView === "story" && (
              <StoryView pkg={pkg} onNodeFocus={handleNodeFocus} />
            )}

            {activeView === "graph" && (
              <>
                {/* Desktop graph */}
                <div className="hidden md:block h-full p-4">
                  <ApiMapView pkg={pkg} focusNodeId={focusNodeId} />
                </div>
                {/* Mobile fallback */}
                <div className="md:hidden flex flex-col items-center justify-center h-full px-8 text-center gap-4">
                  <div className="text-4xl">🗺</div>
                  <h3 className="font-semibold text-slate-800">API Map is best on desktop</h3>
                  <p className="text-sm text-slate-500 max-w-xs">
                    The interactive graph needs a larger screen. Switch to Recipes for copy-paste code on mobile.
                  </p>
                  <button
                    onClick={() => changeView("tasks")}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
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
