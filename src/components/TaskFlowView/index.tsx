"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, Lightbulb, Copy } from "lucide-react";
import type { Package, Task } from "@/lib/types";
import CopyButton from "@/components/CopyButton";

interface Props {
  pkg: Package;
}

const difficultyConfig = {
  beginner:     { label: "Beginner",     cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  intermediate: { label: "Intermediate", cls: "bg-amber-100 text-amber-700 border-amber-200" },
  advanced:     { label: "Advanced",     cls: "bg-rose-100 text-rose-700 border-rose-200" },
};

const filterConfig = [
  { id: "all",          label: "All" },
  { id: "beginner",     label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced",     label: "Advanced" },
] as const;

function TaskCard({ task, index }: { task: Task; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const cfg = difficultyConfig[task.difficulty];
  const fullCode = task.steps.map((s) => s.code).join("\n");
  const shownCode = activeStep !== null ? task.steps[activeStep].code : fullCode;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="border border-slate-200 rounded-2xl overflow-hidden hover:border-slate-300 transition-colors bg-white"
    >
      {/* Header */}
      <button
        onClick={() => { setExpanded((v) => !v); setActiveStep(null); }}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors text-left group"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold border ${cfg.cls}`}>
            {index + 1}
          </div>
          <span className="text-slate-800 font-semibold text-sm truncate">{task.title}</span>
          <span className={`hidden sm:inline-flex flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.cls}`}>
            {cfg.label}
          </span>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-slate-400 flex-shrink-0 ml-2 group-hover:text-slate-600 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-slate-100 px-5 pt-5 pb-5 space-y-4">

              {/* Step pipeline */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setActiveStep(null)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all border ${
                    activeStep === null
                      ? "bg-slate-800 text-white border-slate-800"
                      : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  All steps
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                {task.steps.map((step, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <button
                      onClick={() => setActiveStep(activeStep === i ? null : i)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all border ${
                        activeStep === i
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-200"
                          : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
                      }`}
                    >
                      <span className="opacity-50 mr-1">{i + 1}.</span>{step.label}
                    </button>
                    {i < task.steps.length - 1 && (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>

              {/* Code block */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep ?? "all"}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  className="rounded-xl overflow-hidden border border-slate-200 shadow-sm"
                >
                  <div className="bg-slate-800 px-4 py-2.5 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500/70" />
                    <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
                    <span className="w-3 h-3 rounded-full bg-green-500/70" />
                    <span className="ml-2 flex-1 text-xs text-slate-400 font-mono truncate">
                      {activeStep !== null ? task.steps[activeStep].label : `${task.title} — full recipe`}
                    </span>
                    <CopyButton text={shownCode} />
                  </div>
                  <pre className="bg-slate-900 text-emerald-300 text-sm font-mono px-5 py-4 overflow-x-auto leading-6 max-h-72">
                    <code>{shownCode}</code>
                  </pre>
                  {activeStep !== null && task.steps[activeStep].explanation && (
                    <div className="bg-amber-50 border-t border-amber-100 px-4 py-3 flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-amber-800 leading-snug">{task.steps[activeStep].explanation}</p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function TaskFlowView({ pkg }: Props) {
  const [filter, setFilter] = useState<"all" | "beginner" | "intermediate" | "advanced">("all");
  const filtered = filter === "all" ? pkg.tasks : pkg.tasks.filter((t) => t.difficulty === filter);

  return (
    <div className="h-full">
      {/* Header */}
      <div className="relative bg-slate-950 overflow-hidden px-8 pt-8 pb-7">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(245,158,11,0.12),transparent)] pointer-events-none" />
        <div className="relative max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">⚡</span>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Recipes</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">Task Recipes</h2>
          <p className="text-slate-400 text-sm">
            Step-by-step flows for common things you do with{" "}
            <span className="font-mono font-semibold text-slate-300">{pkg.name}</span>.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto py-6 px-6 sm:px-8">
        {/* Filter pills */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {filterConfig.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all ${
                filter === id
                  ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                  : "bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-700"
              }`}
            >
              {label}
              {id !== "all" && (
                <span className="ml-1.5 opacity-50">
                  {pkg.tasks.filter((t) => t.difficulty === id).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Task list */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              No {filter} recipes for {pkg.name} yet.
            </div>
          ) : (
            filtered.map((task, i) => <TaskCard key={task.id} task={task} index={i} />)
          )}
        </div>

        {/* Quick copy all footer */}
        {filtered.length > 0 && (
          <div className="mt-6 flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-500">
            <span>{filtered.length} recipe{filtered.length > 1 ? "s" : ""} · click any card to expand</span>
            <button
              onClick={async () => {
                const all = filtered.map((t) => `# ${t.title}\n${t.steps.map((s) => s.code).join("\n")}`).join("\n\n");
                await navigator.clipboard.writeText(all);
              }}
              className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              Copy all
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
