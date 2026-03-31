"use client";

import { use, useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Package, ViewMode } from "@/lib/types";
import PackageSidebar from "@/components/PackageSidebar";
import StoryView from "@/components/StoryView";
import TaskFlowView from "@/components/TaskFlowView";
import dynamic from "next/dynamic";

// React Flow uses browser APIs — load client-side only
const ApiMapView = dynamic(() => import("@/components/ApiMapView"), { ssr: false });

const viewVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 40 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir * -40 }),
};

const viewOrder: ViewMode[] = ["story", "graph", "tasks"];

export default function PackagePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [pkg, setPkg] = useState<Package | null>(null);
  const [activeView, setActiveView] = useState<ViewMode>("story");
  const [prevView, setPrevView] = useState<ViewMode>("story");
  const [focusNodeId, setFocusNodeId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/data/packages/${slug}.json`)
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

  if (!pkg) {
    return (
      <div className="flex h-screen items-center justify-center text-slate-400">
        {pkg === null ? "Package not found." : "Loading…"}
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <PackageSidebar pkg={pkg} activeView={activeView} onViewChange={changeView} />

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
              <div className="h-full p-4">
                <ApiMapView pkg={pkg} focusNodeId={focusNodeId} />
              </div>
            )}
            {activeView === "tasks" && <TaskFlowView pkg={pkg} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
