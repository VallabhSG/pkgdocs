"use client";

import { useState } from "react";

// ── Class builder ──────────────────────────────────────────────────────────────
type Option = { label: string; value: string };

const GROUPS: { name: string; options: Option[] }[] = [
  {
    name: "Background",
    options: [
      { label: "indigo", value: "bg-indigo-500" },
      { label: "emerald", value: "bg-emerald-500" },
      { label: "rose",    value: "bg-rose-500" },
      { label: "amber",   value: "bg-amber-400" },
      { label: "slate",   value: "bg-slate-700" },
      { label: "white",   value: "bg-white border border-slate-200" },
    ],
  },
  {
    name: "Padding",
    options: [
      { label: "p-2",  value: "p-2" },
      { label: "p-4",  value: "p-4" },
      { label: "p-6",  value: "p-6" },
      { label: "p-10", value: "p-10" },
    ],
  },
  {
    name: "Rounded",
    options: [
      { label: "none",  value: "rounded-none" },
      { label: "md",    value: "rounded-md" },
      { label: "xl",    value: "rounded-xl" },
      { label: "full",  value: "rounded-full" },
    ],
  },
  {
    name: "Shadow",
    options: [
      { label: "none",  value: "" },
      { label: "sm",    value: "shadow-sm" },
      { label: "md",    value: "shadow-md" },
      { label: "xl",    value: "shadow-xl" },
    ],
  },
  {
    name: "Text",
    options: [
      { label: "xs",    value: "text-xs" },
      { label: "sm",    value: "text-sm" },
      { label: "lg",    value: "text-lg" },
      { label: "2xl",   value: "text-2xl font-bold" },
    ],
  },
];

const DEFAULTS: Record<string, string> = {
  Background: "bg-indigo-500",
  Padding: "p-4",
  Rounded: "rounded-xl",
  Shadow: "shadow-md",
  Text: "text-sm",
};

function ClassBuilder() {
  const [selections, setSelections] = useState<Record<string, string>>(DEFAULTS);

  const classes = Object.values(selections).filter(Boolean).join(" ");
  const displayClasses = Object.values(selections).filter(Boolean);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 lg:col-span-2">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 text-sm">Class builder</h3>
        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-mono">utility-first</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {GROUPS.map((g) => (
          <div key={g.name}>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{g.name}</div>
            <div className="flex flex-col gap-1">
              {g.options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSelections((s) => ({ ...s, [g.name]: opt.value }))}
                  className={`text-xs px-2 py-1 rounded font-mono text-left transition-colors ${
                    selections[g.name] === opt.value
                      ? "bg-sky-100 text-sky-700 border border-sky-300"
                      : "bg-slate-50 text-slate-500 border border-slate-200 hover:bg-sky-50 hover:text-sky-600"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Preview */}
      <div className="flex items-center justify-center min-h-28 bg-slate-100 rounded-xl border border-slate-200">
        <div className={`text-white transition-all duration-200 ${classes}`}>
          Hello, Tailwind!
        </div>
      </div>

      {/* Generated classes */}
      <div className="rounded-lg bg-[#0d1117] p-3 text-xs font-mono text-slate-300 flex flex-wrap gap-x-2 gap-y-1">
        <span className="text-slate-500">className=</span>
        <span className="text-emerald-400">&quot;</span>
        {displayClasses.map((cls, i) => (
          <span key={i} className="text-sky-300">{cls}</span>
        ))}
        <span className="text-emerald-400">&quot;</span>
      </div>
    </div>
  );
}

// ── Responsive grid demo ───────────────────────────────────────────────────────
function ResponsivePanel() {
  const [cols, setCols] = useState<"1" | "2" | "3" | "4">("3");
  const items = Array.from({ length: 6 }, (_, i) => i + 1);

  const gridClass: Record<string, string> = {
    "1": "grid-cols-1",
    "2": "grid-cols-2",
    "3": "grid-cols-3",
    "4": "grid-cols-4",
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 text-sm">Grid + responsive</h3>
        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-mono">grid-cols-*</span>
      </div>

      <div className="flex gap-2">
        {(["1", "2", "3", "4"] as const).map((c) => (
          <button
            key={c}
            onClick={() => setCols(c)}
            className={`flex-1 text-sm py-1.5 rounded-lg border transition-colors ${
              cols === c ? "bg-sky-600 text-white border-sky-600" : "border-slate-200 text-slate-600 hover:border-sky-300"
            }`}
          >
            {c} col{c !== "1" ? "s" : ""}
          </button>
        ))}
      </div>

      <div className={`grid gap-2 ${gridClass[cols]}`}>
        {items.map((n) => (
          <div
            key={n}
            className="bg-sky-100 border border-sky-200 rounded-lg p-3 text-center text-sm font-bold text-sky-700"
          >
            {n}
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-[#0d1117] p-3 text-xs font-mono text-slate-300">
        <span className="text-slate-500">{"// responsive breakpoints"}</span>
        <br />
        {"<div className=\"grid "}
        <span className="text-sky-300">grid-cols-1 sm:grid-cols-2 lg:grid-cols-{cols}</span>
        {"\">"}</div>
    </div>
  );
}

// ── Dark mode toggle ───────────────────────────────────────────────────────────
function DarkModePanel() {
  const [dark, setDark] = useState(false);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 text-sm">Dark mode variant</h3>
        <button
          onClick={() => setDark((d) => !d)}
          className={`relative w-10 h-5 rounded-full transition-colors ${dark ? "bg-indigo-600" : "bg-slate-200"}`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${dark ? "translate-x-5" : ""}`}
          />
        </button>
      </div>

      <div className={`rounded-xl p-5 transition-colors duration-300 ${dark ? "bg-slate-900" : "bg-white border border-slate-200"}`}>
        <h4 className={`font-bold mb-1 transition-colors ${dark ? "text-white" : "text-slate-900"}`}>
          Card title
        </h4>
        <p className={`text-sm transition-colors ${dark ? "text-slate-400" : "text-slate-500"}`}>
          This card uses <code className={`text-xs px-1 rounded ${dark ? "bg-slate-800 text-sky-400" : "bg-slate-100 text-slate-600"}`}>dark:</code> variants
          to swap colors automatically.
        </p>
        <button className={`mt-3 text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${
          dark ? "bg-indigo-500 text-white hover:bg-indigo-400" : "bg-indigo-600 text-white hover:bg-indigo-700"
        }`}>
          Action
        </button>
      </div>

      <div className="rounded-lg bg-[#0d1117] p-3 text-xs font-mono text-slate-300 space-y-0.5">
        <div><span className="text-slate-500">{"// dark: prefix flips on dark mode"}</span></div>
        <div>className=<span className="text-emerald-400">"</span><span className="text-sky-300">bg-white dark:bg-slate-900</span></div>
        <div>{"         "}<span className="text-sky-300">text-slate-900 dark:text-white</span><span className="text-emerald-400">"</span></div>
      </div>
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────────
export default function TailwindDemo() {
  return (
    <div className="h-full overflow-auto p-6">
      <p className="text-sm text-slate-500 mb-5">
        Tailwind CSS generates a single utility class per CSS declaration.
        Compose layout, color, spacing, and responsive behavior directly in your markup —
        no custom CSS files, no class-name collisions.
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ClassBuilder />
        <ResponsivePanel />
        <DarkModePanel />
      </div>
    </div>
  );
}
