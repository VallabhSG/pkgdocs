"use client";

import { useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { BookOpen, Play, Map, Zap, ChevronLeft, Copy, Check } from "lucide-react";
import type { Package, ViewMode } from "@/lib/types";
import PackageSidebar from "@/components/PackageSidebar";
import StoryView from "@/components/StoryView";
import TaskFlowView from "@/components/TaskFlowView";
import dynamic from "next/dynamic";

const ApiMapView = dynamic(() => import("@/components/ApiMapView"), { ssr: false });
const DemoView   = dynamic(() => import("@/components/DemoView"),   { ssr: false });

// ease-out-expo for natural deceleration (no bounce)
const EASE_OUT = [0.16, 1, 0.3, 1] as const;

const viewVariants = {
  enter:  (dir: number) => ({ opacity: 0, x: dir * 24, filter: "blur(3px)" }),
  center: { opacity: 1, x: 0, filter: "blur(0px)" },
  exit:   (dir: number) => ({ opacity: 0, x: dir * -16, filter: "blur(2px)" }),
};

const viewOrder: ViewMode[] = ["story", "demo", "graph", "tasks"];

const mobileViewConfig: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
  { id: "story", label: "Story",   icon: <BookOpen className="w-4 h-4" /> },
  { id: "demo",  label: "Demo",    icon: <Play className="w-4 h-4" /> },
  { id: "graph", label: "API Map", icon: <Map className="w-4 h-4" /> },
  { id: "tasks", label: "Recipes", icon: <Zap className="w-4 h-4" /> },
];

interface RelatedCard {
  id: string;
  name: string;
  ecosystem: string;
  summary: string;
  tags: string[];
}

interface Props {
  pkg: Package;
  related: RelatedCard[];
}

const VALID_VIEWS = new Set<ViewMode>(["story", "demo", "graph", "tasks"]);

function hashToView(hash: string): ViewMode {
  const v = hash.replace("#", "") as ViewMode;
  return VALID_VIEWS.has(v) ? v : "story";
}

export default function PackagePageClient({ pkg, related }: Props) {
  const [activeView, setActiveView] = useState<ViewMode>("story");
  const [prevView,   setPrevView]   = useState<ViewMode>("story");
  const [focusNodeId, setFocusNodeId] = useState<string | null>(null);
  const [mobileCopied, setMobileCopied] = useState(false);

  const installCmd = pkg.ecosystem === "npm" ? `npm install ${pkg.name}` : `pip install ${pkg.name}`;

  function copyInstall() {
    navigator.clipboard.writeText(installCmd).then(() => {
      setMobileCopied(true);
      setTimeout(() => setMobileCopied(false), 2000);
    });
  }

  // Sync initial view from URL hash
  useEffect(() => {
    const v = hashToView(window.location.hash);
    if (v !== "story") {
      setActiveView(v);
      setPrevView(v);
    }
  }, []);

  const changeView = useCallback((v: ViewMode) => {
    setPrevView(activeView);
    setActiveView(v);
    window.history.replaceState(null, "", "#" + v);
  }, [activeView]);

  const handleNodeFocus = useCallback((nodeId: string) => {
    setFocusNodeId(nodeId);
    changeView("graph");
  }, [changeView]);

  const direction = viewOrder.indexOf(activeView) > viewOrder.indexOf(prevView) ? 1 : -1;

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-warm-50">

      {/* Sidebar (desktop) */}
      <div className="hidden md:block">
        <PackageSidebar pkg={pkg} activeView={activeView} onViewChange={changeView} related={related} />
      </div>

      {/* Mobile top bar — clean white, no dark background */}
      <div className="md:hidden flex-shrink-0 bg-white border-b border-warm-200">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-warm-100">
          <Link href="/" className="text-warm-400 hover:text-warm-800 transition-colors" aria-label="Back">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded border ${
              pkg.ecosystem === "npm"
                ? "bg-rose-50 text-rose-600 border-rose-200"
                : "bg-blue-50 text-blue-600 border-blue-200"
            }`}>
              {pkg.ecosystem === "npm" ? "npm" : "Python"}
            </span>
            <span className="font-bold font-mono text-sm text-warm-950 truncate">{pkg.name}</span>
            <span className="text-xs text-warm-400 font-mono flex-shrink-0">v{pkg.meta.version}</span>
          </div>
          <button
            onClick={copyInstall}
            className="flex-shrink-0 flex items-center gap-1.5 text-xs text-warm-400 hover:text-accent bg-warm-50 hover:bg-accent-light border border-warm-200 rounded-lg px-2.5 py-1.5 transition-all"
            title={installCmd}
          >
            {mobileCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="font-mono text-[11px]">{mobileCopied ? "Copied!" : "Install"}</span>
          </button>
        </div>
        <div className="flex">
          {mobileViewConfig.map((v) => (
            <button
              key={v.id}
              onClick={() => changeView(v.id)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-all relative ${
                activeView === v.id ? "text-accent" : "text-warm-400 hover:text-warm-700"
              }`}
            >
              {activeView === v.id && (
                <motion.div
                  layoutId="mobile-tab-indicator"
                  className="absolute bottom-0 left-1 right-1 h-0.5 bg-accent rounded-full"
                />
              )}
              {v.icon}
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main content area */}
      <main className="flex-1 overflow-hidden relative">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={activeView}
            custom={direction}
            variants={viewVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: EASE_OUT }}
            className="absolute inset-0 overflow-auto"
          >
            {activeView === "story" && <StoryView pkg={pkg} onNodeFocus={handleNodeFocus} />}

            {activeView === "graph" && (
              <>
                <div className="hidden md:block h-full p-4">
                  <ApiMapView pkg={pkg} focusNodeId={focusNodeId} />
                </div>
                <div className="md:hidden flex flex-col items-center justify-center h-full px-8 text-center gap-5">
                  <div className="w-14 h-14 bg-accent-light rounded-xl flex items-center justify-center">
                    <Map className="w-7 h-7 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-bold text-warm-900 mb-1">API Map needs a bigger screen</h3>
                    <p className="text-sm text-warm-500 max-w-xs">
                      The interactive graph works best on desktop. Try Recipes for copy-paste code on mobile.
                    </p>
                  </div>
                  <button
                    onClick={() => changeView("tasks")}
                    className="bg-accent hover:bg-accent-dark text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
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
