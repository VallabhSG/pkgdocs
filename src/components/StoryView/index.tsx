"use client";

import { useInView } from "react-intersection-observer";
import { motion } from "motion/react";
import { Flame, Brain, Zap, CheckCircle2, XCircle, Shuffle, ArrowRight, ChevronRight } from "lucide-react";
import type { Package } from "@/lib/types";
import CodeBlock from "@/components/CodeBlock";

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
      <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-warm-100 text-warm-500">
        {icon}
      </div>
      <span className="text-xs font-bold uppercase tracking-widest text-warm-400">{label}</span>
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
  const codeLang = isNpm ? "typescript" : "python";

  return (
    <div className="h-full">
      {/* ── Package hero header — clean white ── */}
      <div className="bg-white border-b border-warm-200 px-8 pt-8 pb-7">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded border ${
              isNpm
                ? "bg-rose-50 text-rose-600 border-rose-200"
                : "bg-blue-50 text-blue-600 border-blue-200"
            }`}>
              {isNpm ? "npm" : "Python"}
            </span>
            {badge && (
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded border ${badge.cls}`}>
                {badge.label}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold text-warm-950 font-mono mb-2 tracking-tight">{pkg.name}</h1>
          <p className="text-warm-500 leading-relaxed mb-4 max-w-xl">{pkg.summary}</p>
          <div className="flex flex-wrap gap-1.5">
            {pkg.tags.map((t) => (
              <span key={t} className="text-xs bg-warm-100 text-warm-500 border border-warm-200 px-2 py-0.5 rounded font-mono">
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
          <p className="text-warm-700 leading-relaxed text-[15px]">{pkg.story.problem}</p>
        </Section>

        {/* Mental model */}
        <Section delay={0.1}>
          <SectionLabel icon={<Brain className="w-4 h-4" />} label="Mental Model" />
          <div className="pl-5 border-l-4 border-accent bg-accent-light rounded-r-xl px-5 py-4">
            <p className="text-warm-800 leading-relaxed text-[15px]">{pkg.story.mental_model}</p>
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
                <div key={task.id}>
                  <p className="text-xs text-warm-400 font-mono mb-2">{task.title}</p>
                  <CodeBlock code={fullCode} lang={codeLang} />
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
                className="group flex items-start gap-4 p-4 rounded-xl border border-warm-200 hover:border-accent/30 hover:bg-accent-light/50 transition-all"
              >
                <span className="font-mono font-bold text-warm-800 text-sm mt-0.5 min-w-[90px] group-hover:text-accent transition-colors">
                  {alt.name}
                </span>
                <ChevronRight className="w-4 h-4 text-warm-300 mt-0.5 flex-shrink-0 group-hover:text-accent transition-colors" />
                <span className="text-sm text-warm-600 leading-snug">{alt.reason}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* CTA */}
        <Section delay={0.3}>
          <div className="rounded-2xl bg-accent-light border border-accent/20 p-6 text-center">
            <p className="text-sm font-semibold text-warm-800 mb-1">Ready to explore the full API?</p>
            <p className="text-xs text-warm-500 mb-5">
              See every class, function, and relationship in an interactive graph.
            </p>
            <button
              onClick={() => onNodeFocus?.(pkg.id)}
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dark text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors"
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
