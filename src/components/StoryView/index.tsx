"use client";

import { useInView } from "react-intersection-observer";
import { motion } from "motion/react";
import { Flame, Brain, Zap, CheckCircle2, XCircle, Shuffle, ArrowRight, ChevronRight } from "lucide-react";
import type { Package } from "@/lib/types";
import CopyButton from "@/components/CopyButton";

interface Props {
  pkg: Package;
  onNodeFocus?: (nodeId: string) => void;
}

function Section({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay, ease: "easeOut" }}
      className="mb-10"
    >
      {children}
    </motion.div>
  );
}

function SectionLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-500">
        {icon}
      </div>
      <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{label}</span>
    </div>
  );
}

const difficultyBadge: Record<number, { label: string; cls: string }> = {
  1: { label: "Beginner-friendly", cls: "bg-emerald-100 text-emerald-700 border border-emerald-200" },
  2: { label: "Intermediate",      cls: "bg-amber-100 text-amber-700 border border-amber-200" },
  3: { label: "Advanced",          cls: "bg-rose-100 text-rose-700 border border-rose-200" },
};

export default function StoryView({ pkg, onNodeFocus }: Props) {
  const badge = difficultyBadge[pkg.difficulty];
  const isNpm = pkg.ecosystem === "npm";

  return (
    <div className="h-full">
      {/* ── Package hero header ── */}
      <div className="relative bg-slate-950 overflow-hidden px-8 pt-8 pb-7">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(99,102,241,0.18),transparent)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_100%_at_100%_50%,rgba(139,92,246,0.08),transparent)] pointer-events-none" />
        <div className="relative max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
              isNpm
                ? "bg-rose-900/40 text-rose-300 border-rose-700/50"
                : "bg-blue-900/40 text-blue-300 border-blue-700/50"
            }`}>
              {isNpm ? "npm" : "Python"}
            </span>
            {badge && (
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${badge.cls}`}>
                {badge.label}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold text-white font-mono mb-2 tracking-tight">{pkg.name}</h1>
          <p className="text-slate-400 leading-relaxed mb-4 max-w-xl">{pkg.summary}</p>
          <div className="flex flex-wrap gap-1.5">
            {pkg.tags.map((t) => (
              <span key={t} className="text-xs bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded-md font-mono">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Story content ── */}
      <div className="max-w-2xl mx-auto py-8 px-6 sm:px-8">

        {/* Problem */}
        <Section delay={0.05}>
          <SectionLabel icon={<Flame className="w-4 h-4" />} label="The Problem" />
          <p className="text-slate-700 leading-relaxed text-[15px]">{pkg.story.problem}</p>
        </Section>

        {/* Mental model */}
        <Section delay={0.1}>
          <SectionLabel icon={<Brain className="w-4 h-4" />} label="Mental Model" />
          <div className="relative pl-5 border-l-4 border-indigo-400 bg-indigo-50 rounded-r-xl px-5 py-4">
            <p className="text-indigo-900 leading-relaxed text-[15px]">{pkg.story.mental_model}</p>
          </div>
        </Section>

        {/* Quick start */}
        <Section delay={0.15}>
          <SectionLabel icon={<Zap className="w-4 h-4" />} label="60-second start" />
          {pkg.tasks
            .filter((t) => t.difficulty === "beginner")
            .slice(0, 1)
            .map((task) => {
              const fullCode = task.steps.map((s) => s.code).join("\n");
              return (
                <div key={task.id} className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="bg-slate-800 px-4 py-2.5 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500/70" />
                    <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
                    <span className="w-3 h-3 rounded-full bg-green-500/70" />
                    <span className="ml-2 flex-1 text-xs text-slate-400 font-mono">{task.title}</span>
                    <CopyButton text={fullCode} />
                  </div>
                  <div className="bg-slate-900 px-5 py-4 space-y-1.5">
                    {task.steps.map((step, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="text-slate-600 text-xs font-mono mt-1 select-none w-4 flex-shrink-0">{i + 1}</span>
                        <code className="text-sm text-emerald-300 font-mono whitespace-pre leading-6">{step.code}</code>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
        </Section>

        {/* Use / Skip */}
        <Section delay={0.2}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-emerald-800">Use it when</h3>
              </div>
              <p className="text-sm text-emerald-900 leading-relaxed">{pkg.story.when_to_use}</p>
            </div>
            {pkg.story.when_not_to_use && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <h3 className="text-sm font-bold text-rose-800">Skip it when</h3>
                </div>
                <p className="text-sm text-rose-900 leading-relaxed">{pkg.story.when_not_to_use}</p>
              </div>
            )}
          </div>
        </Section>

        {/* Alternatives */}
        <Section delay={0.25}>
          <SectionLabel icon={<Shuffle className="w-4 h-4" />} label="Alternatives" />
          <div className="space-y-2">
            {pkg.story.alternatives.map((alt) => (
              <div
                key={alt.name}
                className="group flex items-start gap-4 p-4 rounded-xl border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all"
              >
                <span className="font-mono font-bold text-slate-800 text-sm mt-0.5 min-w-[90px] group-hover:text-indigo-700 transition-colors">
                  {alt.name}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-300 mt-0.5 flex-shrink-0 group-hover:text-indigo-400 transition-colors" />
                <span className="text-sm text-slate-600 leading-snug">{alt.reason}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* CTA */}
        <Section delay={0.3}>
          <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 p-6 text-center">
            <p className="text-sm font-semibold text-slate-700 mb-1">Ready to explore the full API?</p>
            <p className="text-xs text-slate-500 mb-5">
              See every class, function, and relationship in an interactive graph.
            </p>
            <button
              onClick={() => onNodeFocus?.(pkg.id)}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors shadow-sm shadow-indigo-200"
            >
              Open API Map
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </Section>

      </div>
    </div>
  );
}
