"use client";

import { useState, useEffect, useMemo } from "react";
import { prepareWithSegments, layout, layoutWithLines } from "@chenglou/pretext";

const SAMPLE_TEXTS = [
  "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.",
  "JavaScript's built-in Date is broken — months are zero-indexed, it mutates, and timezone support is a disaster.",
  "Zod is a TypeScript-first schema declaration and validation library. Define your schema once and get both static types and runtime validation from the same source.",
  "Custom text here — type anything and watch it reflow in real time as you drag the width slider below.",
];

export default function PretextDemo() {
  const [text, setText] = useState(SAMPLE_TEXTS[0]);
  const [width, setWidth] = useState(320);
  const [font, setFont] = useState("16px ui-sans-serif");
  const [lineHeight, setLineHeight] = useState(26);

  const result = useMemo(() => {
    if (!text.trim()) return null;
    try {
      const prepared = prepareWithSegments(text, font);
      const { height, lineCount, lines } = layoutWithLines(prepared, width, lineHeight);
      return { height, lineCount, lines };
    } catch {
      return null;
    }
  }, [text, font, width, lineHeight]);

  return (
    <div className="h-full overflow-auto p-6">
      <p className="text-sm text-slate-500 mb-5">
        pretext measures text via Canvas — no DOM access, no layout reflow.
        Drag the width slider and watch line counts update instantly.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
              Text
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {SAMPLE_TEXTS.map((t, i) => (
                <button
                  key={i}
                  onClick={() => setText(t)}
                  className={`text-xs px-2.5 py-1 rounded-full transition-all ${
                    text === t
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Sample {i + 1}
                </button>
              ))}
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              className="w-full text-sm border border-slate-200 rounded-lg p-3 font-mono resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
              Container width: <span className="text-indigo-600 font-mono">{width}px</span>
            </label>
            <input
              type="range"
              min={80}
              max={700}
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                Font
              </label>
              <select
                value={font}
                onChange={(e) => setFont(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="12px ui-sans-serif">12px sans</option>
                <option value="14px ui-sans-serif">14px sans</option>
                <option value="16px ui-sans-serif">16px sans</option>
                <option value="18px ui-sans-serif">18px sans</option>
                <option value="14px ui-monospace">14px mono</option>
                <option value="16px Georgia, serif">16px serif</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                Line height: <span className="text-indigo-600 font-mono">{lineHeight}px</span>
              </label>
              <input
                type="range"
                min={16}
                max={48}
                value={lineHeight}
                onChange={(e) => setLineHeight(Number(e.target.value))}
                className="w-full accent-indigo-600 mt-2"
              />
            </div>
          </div>
        </div>

        {/* Output */}
        <div className="space-y-4">
          {/* Metrics */}
          {result && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Lines", value: result.lineCount },
                { label: "Height", value: `${result.height}px` },
                { label: "Width", value: `${width}px` },
              ].map(({ label, value }) => (
                <div key={label} className="bg-indigo-50 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-indigo-700 font-mono">{value}</div>
                  <div className="text-xs text-indigo-400 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Visual container */}
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Visual — rendered at {width}px
            </div>
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-3 overflow-x-auto">
              <div
                style={{ width: `${width}px`, minWidth: "60px" }}
                className="bg-indigo-50 rounded-lg p-3 relative"
              >
                <p
                  style={{ font, lineHeight: `${lineHeight}px`, wordBreak: "break-word" }}
                  className="text-slate-800 whitespace-pre-wrap"
                >
                  {text}
                </p>
                {/* Width ruler */}
                <div className="absolute -bottom-5 left-0 right-0 flex items-center">
                  <div className="flex-1 h-px bg-slate-300" />
                  <span className="text-xs text-slate-400 px-1 font-mono">{width}px</span>
                  <div className="flex-1 h-px bg-slate-300" />
                </div>
              </div>
            </div>
          </div>

          {/* Per-line breakdown */}
          {result && result.lines.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Per-line widths (from layoutWithLines)
              </div>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {result.lines.map((line, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-mono w-5 text-right">{i + 1}</span>
                    <div
                      className="h-5 bg-indigo-200 rounded text-xs flex items-center px-1.5 text-indigo-700 font-mono truncate"
                      style={{ width: `${Math.max(4, (line.width / width) * 100)}%` }}
                    >
                      {line.width.toFixed(0)}px
                    </div>
                    <span className="text-xs text-slate-500 truncate flex-1 min-w-0">{line.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Code snippet */}
      <div className="mt-6 rounded-xl bg-[#0d1117] border border-slate-700 p-4 text-sm font-mono">
        <div className="text-xs text-slate-500 mb-2">Generated code</div>
        <div className="text-slate-300">
          <span className="text-purple-400">import</span>
          <span className="text-slate-200"> {"{ prepareWithSegments, layoutWithLines }"} </span>
          <span className="text-purple-400">from</span>
          <span className="text-emerald-400"> {'\'@chenglou/pretext\''}</span>
          <span className="text-slate-200">;</span>
        </div>
        <div className="text-slate-600 mt-1">{"// One-time measurement (Canvas, ~0.1ms)"}</div>
        <div className="text-slate-300">
          <span className="text-purple-400">const</span>
          <span className="text-slate-200"> prepared = </span>
          <span className="text-sky-400">prepareWithSegments</span>
          <span className="text-slate-200">(text, </span>
          <span className="text-emerald-400">{`'${font}'`}</span>
          <span className="text-slate-200">);</span>
        </div>
        <div className="text-slate-600">{"// Fast arithmetic, no DOM"}</div>
        <div className="text-slate-300">
          <span className="text-purple-400">const</span>
          <span className="text-slate-200"> {"{ height, lineCount, lines }"} = </span>
          <span className="text-sky-400">layoutWithLines</span>
          <span className="text-slate-200">(prepared, </span>
          <span className="text-amber-400">{width}</span>
          <span className="text-slate-200">, </span>
          <span className="text-amber-400">{lineHeight}</span>
          <span className="text-slate-200">);</span>
        </div>
        <div className="text-slate-600 mt-1">
          {`// → { height: ${result?.height ?? "?"}, lineCount: ${result?.lineCount ?? "?"}, lines: [...] }`}
        </div>
      </div>
    </div>
  );
}
