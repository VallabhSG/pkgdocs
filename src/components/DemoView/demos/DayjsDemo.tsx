"use client";

import { useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import duration from "dayjs/plugin/duration";

dayjs.extend(relativeTime);
dayjs.extend(duration);

const FORMATS = [
  { label: "Full date", fmt: "MMMM D, YYYY" },
  { label: "Short date", fmt: "MMM D, YYYY" },
  { label: "ISO 8601", fmt: "YYYY-MM-DD" },
  { label: "With time", fmt: "YYYY-MM-DD HH:mm:ss" },
  { label: "US format", fmt: "MM/DD/YYYY" },
  { label: "Day + time", fmt: "dddd, h:mm A" },
];

const OPS = [
  { label: "+1 day", fn: (d: dayjs.Dayjs) => d.add(1, "day") },
  { label: "+1 week", fn: (d: dayjs.Dayjs) => d.add(1, "week") },
  { label: "+1 month", fn: (d: dayjs.Dayjs) => d.add(1, "month") },
  { label: "-1 day", fn: (d: dayjs.Dayjs) => d.subtract(1, "day") },
  { label: "Start of month", fn: (d: dayjs.Dayjs) => d.startOf("month") },
  { label: "End of month", fn: (d: dayjs.Dayjs) => d.endOf("month") },
];

export default function DayjsDemo() {
  const [input, setInput] = useState(dayjs().format("YYYY-MM-DD"));
  const [format, setFormat] = useState(FORMATS[0].fmt);
  const [history, setHistory] = useState<{ label: string; result: string }[]>([]);

  const base = dayjs(input);
  const isValid = base.isValid();

  function applyOp(label: string, fn: (d: dayjs.Dayjs) => dayjs.Dayjs) {
    if (!isValid) return;
    const result = fn(base).format(format);
    setHistory((h) => [{ label, result }, ...h].slice(0, 8));
  }

  return (
    <div className="h-full overflow-auto p-6">
      <p className="text-sm text-slate-500 mb-5">
        Day.js is a 2KB immutable date library. Every operation returns a new instance — the original is never modified.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-5">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
              Input date
            </label>
            <input
              type="date"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
              Format string
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {FORMATS.map(({ label, fmt }) => (
                <button
                  key={fmt}
                  onClick={() => setFormat(fmt)}
                  className={`text-xs px-2.5 py-1 rounded-full transition-all ${
                    format === fmt
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Operations (immutable — each returns new instance)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {OPS.map(({ label, fn }) => (
                <button
                  key={label}
                  onClick={() => applyOp(label, fn)}
                  disabled={!isValid}
                  className="text-xs px-3 py-2 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition-all disabled:opacity-40 text-left font-mono"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Output */}
        <div className="space-y-4">
          {/* Current */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
            <div className="text-xs text-indigo-400 font-semibold mb-1">dayjs(input).format(fmt)</div>
            <div className="text-2xl font-bold text-indigo-800 font-mono break-all">
              {isValid ? base.format(format) : <span className="text-rose-500 text-base">Invalid date</span>}
            </div>
            {isValid && (
              <div className="mt-2 space-y-0.5 text-xs text-indigo-600">
                <div>Relative: <span className="font-semibold">{base.fromNow()}</span></div>
                <div>Day of year: <span className="font-semibold">{base.diff(base.startOf("year"), "day") + 1}</span></div>
                <div>Unix timestamp: <span className="font-mono font-semibold">{base.unix()}</span></div>
              </div>
            )}
          </div>

          {/* Operation history */}
          {history.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Operation history
              </div>
              <div className="space-y-1.5">
                {history.map((h, i) => (
                  <div key={i} className="flex items-center justify-between bg-white border border-slate-100 rounded-lg px-3 py-2">
                    <span className="text-xs text-slate-500 font-mono">.{h.label.toLowerCase().replace(/\s+/g, "").replace("+", "add(").replace("-", "subtract(")}</span>
                    <span className="text-xs font-semibold text-slate-800 font-mono">{h.result}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Immutability proof */}
          <div className="rounded-xl bg-[#0d1117] border border-slate-700 p-4 text-xs font-mono">
            <div className="text-slate-500 mb-2">// Immutability — original never changes</div>
            <div><span className="text-purple-400">const</span><span className="text-slate-200"> original = </span><span className="text-sky-400">dayjs</span><span className="text-slate-200">(</span><span className="text-emerald-400">{`'${input}'`}</span><span className="text-slate-200">);</span></div>
            <div><span className="text-purple-400">const</span><span className="text-slate-200"> next = original.</span><span className="text-sky-400">add</span><span className="text-slate-200">(</span><span className="text-amber-400">1</span><span className="text-slate-200">, </span><span className="text-emerald-400">'month'</span><span className="text-slate-200">);</span></div>
            <div className="mt-2 text-slate-400">original.format() <span className="text-emerald-400">// {isValid ? base.format("YYYY-MM-DD") : "—"} ← unchanged</span></div>
            <div className="text-slate-400">next.format()     <span className="text-emerald-400">// {isValid ? base.add(1, "month").format("YYYY-MM-DD") : "—"} ← new instance</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
