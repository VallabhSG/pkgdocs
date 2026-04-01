"use client";

import { useState, useEffect, useRef } from "react";
import { tokenize, type TokenType } from "./highlight";

export interface Scenario {
  id: string;
  title: string;
  description: string;
  code: string;
  output: string;
  language: "python" | "typescript" | "bash";
}

interface Props {
  scenarios: Scenario[];
}

const tokenColor: Record<TokenType, string> = {
  keyword:   "text-purple-400",
  builtin:   "text-sky-400",
  string:    "text-emerald-400",
  comment:   "text-slate-500 italic",
  number:    "text-amber-400",
  decorator: "text-rose-400",
  type:      "text-cyan-400",
  plain:     "text-slate-200",
};

function CodeBlock({ code, language }: { code: string; language: Scenario["language"] }) {
  const lines = tokenize(code, language);
  return (
    <pre className="text-sm font-mono leading-relaxed overflow-x-auto p-5">
      {lines.map((tokens, li) => (
        <div key={li} className="whitespace-pre">
          {tokens.map((tok, ti) => (
            <span key={ti} className={tokenColor[tok.type]}>
              {tok.text}
            </span>
          ))}
        </div>
      ))}
    </pre>
  );
}

function OutputBlock({ text }: { text: string }) {
  return (
    <pre className="text-sm font-mono leading-relaxed text-emerald-300 p-5 whitespace-pre-wrap">
      {text}
    </pre>
  );
}

export default function SimulatedDemo({ scenarios }: Props) {
  const [activeId, setActiveId] = useState(scenarios[0]?.id ?? "");
  const [state, setState] = useState<"idle" | "running" | "done">("idle");
  const [dots, setDots] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scenario = scenarios.find((s) => s.id === activeId) ?? scenarios[0];

  // Reset when scenario changes
  useEffect(() => {
    setState("idle");
    if (timerRef.current) clearTimeout(timerRef.current);
  }, [activeId]);

  // Animate dots while running
  useEffect(() => {
    if (state !== "running") return;
    const interval = setInterval(() => setDots((d) => (d.length >= 3 ? "" : d + ".")), 300);
    timerRef.current = setTimeout(() => {
      setState("done");
      clearInterval(interval);
      setDots("");
    }, 1200);
    return () => {
      clearInterval(interval);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [state]);

  if (!scenario) return null;

  const langLabel =
    scenario.language === "python"
      ? "Python 3.12"
      : scenario.language === "bash"
      ? "Shell"
      : "TypeScript";

  return (
    <div className="h-full overflow-auto p-6">
      {/* Scenario tabs */}
      {scenarios.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {scenarios.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveId(s.id)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                activeId === s.id
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>
      )}

      <p className="text-sm text-slate-500 mb-4">{scenario.description}</p>

      {/* Terminal window */}
      <div className="rounded-xl overflow-hidden border border-slate-700 bg-[#0d1117] shadow-xl">
        {/* Title bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#161b22] border-b border-slate-700">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/70" />
            <span className="w-3 h-3 rounded-full bg-amber-500/70" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/70" />
          </div>
          <span className="text-xs text-slate-500 font-mono">{langLabel}</span>
          <button
            onClick={() => setState("running")}
            disabled={state === "running"}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-md transition-all ${
              state === "running"
                ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-500 text-white"
            }`}
          >
            {state === "running" ? (
              <>
                <span className="inline-block w-2 h-2 rounded-full bg-slate-400 animate-pulse" />
                Running{dots}
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Run
              </>
            )}
          </button>
        </div>

        {/* Code */}
        <CodeBlock code={scenario.code} language={scenario.language} />

        {/* Output */}
        {(state === "done" || state === "running") && (
          <div className="border-t border-slate-700">
            <div className="px-5 py-2 bg-[#161b22] text-xs text-slate-500 font-mono">
              Output
            </div>
            {state === "done" ? (
              <OutputBlock text={scenario.output} />
            ) : (
              <div className="p-5 text-slate-500 text-sm font-mono">
                <span className="animate-pulse">▊</span>
              </div>
            )}
          </div>
        )}

        {state === "idle" && (
          <div className="border-t border-slate-700 px-5 py-4 text-xs text-slate-600 font-mono">
            Press Run to execute →
          </div>
        )}
      </div>
    </div>
  );
}
