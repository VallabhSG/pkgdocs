"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { Package, Task } from "@/lib/types";

interface Props {
  pkg: Package;
}

const difficultyConfig = {
  beginner: { label: "Beginner", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  intermediate: { label: "Intermediate", color: "bg-amber-100 text-amber-700 border-amber-200" },
  advanced: { label: "Advanced", color: "bg-rose-100 text-rose-700 border-rose-200" },
};

function TaskCard({ task }: { task: Task }) {
  const [expanded, setExpanded] = useState(false);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const cfg = difficultyConfig[task.difficulty];

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-slate-700 font-semibold">{task.title}</span>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.color}`}
          >
            {cfg.label}
          </span>
        </div>
        <motion.span
          animate={{ rotate: expanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-slate-400"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5">
              {/* Pipeline visualization */}
              <div className="flex items-center gap-2 mb-5 flex-wrap">
                {task.steps.map((step, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveStep(activeStep === i ? null : i)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                        activeStep === i
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                          : "bg-white text-slate-700 border-slate-200 hover:border-indigo-300"
                      }`}
                    >
                      <span className="text-xs opacity-60 mr-1">{i + 1}.</span>
                      {step.label}
                    </button>
                    {i < task.steps.length - 1 && (
                      <svg
                        className="w-4 h-4 text-slate-300 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    )}
                  </div>
                ))}
              </div>

              {/* Step detail */}
              <AnimatePresence mode="wait">
                {activeStep !== null && (
                  <motion.div
                    key={activeStep}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="rounded-xl overflow-hidden"
                  >
                    <div className="bg-slate-800 px-4 py-2 text-xs text-slate-400 font-mono flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                      <span className="ml-1">{task.steps[activeStep].label}</span>
                    </div>
                    <pre className="bg-slate-900 text-emerald-300 text-sm font-mono px-5 py-4 overflow-x-auto leading-6">
                      <code>{task.steps[activeStep].code}</code>
                    </pre>
                    {task.steps[activeStep].explanation && (
                      <div className="bg-indigo-50 border-t border-indigo-100 px-4 py-3 text-sm text-indigo-800">
                        💡 {task.steps[activeStep].explanation}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Full recipe fallback */}
              {activeStep === null && (
                <div className="rounded-xl overflow-hidden">
                  <div className="bg-slate-800 px-4 py-2 text-xs text-slate-400 font-mono flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                    <span className="ml-1">Full recipe — click a step above for detail</span>
                  </div>
                  <pre className="bg-slate-900 text-emerald-300 text-sm font-mono px-5 py-4 overflow-x-auto leading-6">
                    <code>{task.steps.map((s) => s.code).join("\n")}</code>
                  </pre>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TaskFlowView({ pkg }: Props) {
  const [filter, setFilter] = useState<"all" | "beginner" | "intermediate" | "advanced">("all");

  const filtered =
    filter === "all" ? pkg.tasks : pkg.tasks.filter((t) => t.difficulty === filter);

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Task Recipes</h2>
        <p className="text-slate-500 text-sm">
          Step-by-step flows for common things you do with{" "}
          <span className="font-mono font-semibold">{pkg.name}</span>.
        </p>
      </div>

      {/* Difficulty filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(["all", "beginner", "intermediate", "advanced"] as const).map((d) => (
          <button
            key={d}
            onClick={() => setFilter(d)}
            className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-all ${
              filter === d
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {d.charAt(0).toUpperCase() + d.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}
