"use client";

import { useInView } from "react-intersection-observer";
import { motion } from "motion/react";
import type { Package } from "@/lib/types";
import CopyButton from "@/components/CopyButton";

interface Props {
  pkg: Package;
  onNodeFocus?: (nodeId: string) => void;
}

function StorySection({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15 });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className="mb-12"
    >
      {children}
    </motion.div>
  );
}

export default function StoryView({ pkg, onNodeFocus }: Props) {
  const difficultyLabel = ["", "Beginner-friendly", "Intermediate", "Advanced"];
  const difficultyColor = [
    "",
    "bg-emerald-100 text-emerald-800",
    "bg-amber-100 text-amber-800",
    "bg-rose-100 text-rose-800",
  ];

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      {/* Header */}
      <StorySection>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-xs font-mono uppercase tracking-widest text-slate-400">
            {pkg.ecosystem}
          </span>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              difficultyColor[pkg.difficulty]
            }`}
          >
            {difficultyLabel[pkg.difficulty]}
          </span>
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">{pkg.name}</h1>
        <p className="text-xl text-slate-600 mb-4">{pkg.summary}</p>
        <div className="flex flex-wrap gap-2">
          {pkg.tags.map((t) => (
            <span
              key={t}
              className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-mono"
            >
              {t}
            </span>
          ))}
        </div>
      </StorySection>

      {/* Problem */}
      <StorySection delay={0.05}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🔥</span>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">
            The Problem
          </h2>
        </div>
        <p className="text-slate-700 leading-relaxed">{pkg.story.problem}</p>
      </StorySection>

      {/* Mental model */}
      <StorySection delay={0.1}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🧠</span>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">
            Mental Model
          </h2>
        </div>
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5">
          <p className="text-indigo-900 leading-relaxed">{pkg.story.mental_model}</p>
        </div>
      </StorySection>

      {/* Quick start */}
      <StorySection delay={0.15}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">⚡</span>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">
            60-second start
          </h2>
        </div>
        {pkg.tasks
          .filter((t) => t.difficulty === "beginner")
          .slice(0, 1)
          .map((task) => {
            const fullCode = task.steps.map((s) => s.code).join("\n");
            return (
              <div key={task.id} className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-800 px-4 py-2 text-xs text-slate-400 font-mono flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500/70" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
                  <span className="w-3 h-3 rounded-full bg-green-500/70" />
                  <span className="ml-2 flex-1">{task.title}</span>
                  <CopyButton text={fullCode} />
                </div>
                <div className="bg-slate-900 px-4 py-4 space-y-1">
                  {task.steps.map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-slate-500 text-xs font-mono mt-1 select-none w-4">
                        {i + 1}
                      </span>
                      <code className="text-sm text-emerald-300 font-mono whitespace-pre leading-6">
                        {step.code}
                      </code>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
      </StorySection>

      {/* When to use / not use */}
      <StorySection delay={0.2}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">✅</span>
              <h3 className="text-sm font-semibold text-emerald-800">Use it when</h3>
            </div>
            <p className="text-sm text-emerald-900 leading-relaxed">{pkg.story.when_to_use}</p>
          </div>
          {pkg.story.when_not_to_use && (
            <div className="bg-rose-50 border border-rose-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">⚠️</span>
                <h3 className="text-sm font-semibold text-rose-800">Skip it when</h3>
              </div>
              <p className="text-sm text-rose-900 leading-relaxed">
                {pkg.story.when_not_to_use}
              </p>
            </div>
          )}
        </div>
      </StorySection>

      {/* Alternatives */}
      <StorySection delay={0.25}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🔀</span>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">
            Alternatives
          </h2>
        </div>
        <div className="space-y-3">
          {pkg.story.alternatives.map((alt) => (
            <div
              key={alt.name}
              className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors"
            >
              <span className="font-mono font-bold text-slate-800 text-sm mt-0.5 min-w-[80px]">
                {alt.name}
              </span>
              <span className="text-sm text-slate-600">{alt.reason}</span>
            </div>
          ))}
        </div>
      </StorySection>

      {/* Explore API */}
      <StorySection delay={0.3}>
        <div className="text-center py-6 border-t border-slate-100">
          <p className="text-slate-500 text-sm mb-4">
            Ready to go deeper? Explore the full API surface →
          </p>
          <button
            onClick={() => onNodeFocus?.(pkg.id)}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            Open API Map
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </StorySection>
    </div>
  );
}
