"use client";

import { useState } from "react";
import {
  format,
  addDays,
  addMonths,
  subDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  differenceInDays,
  differenceInYears,
  isWeekend,
  isToday,
  parseISO,
  formatDistanceToNow,
} from "date-fns";

const FORMATS = [
  { label: "Full date", fmt: "MMMM d, yyyy" },
  { label: "Short", fmt: "MMM d, yyyy" },
  { label: "ISO 8601", fmt: "yyyy-MM-dd" },
  { label: "With time", fmt: "yyyy-MM-dd HH:mm:ss" },
  { label: "US format", fmt: "MM/dd/yyyy" },
  { label: "Day + time", fmt: "EEEE, h:mm a" },
];

const OPS: { label: string; fn: (d: Date) => Date; code: string }[] = [
  { label: "+7 days", fn: (d) => addDays(d, 7), code: "addDays(d, 7)" },
  { label: "+1 month", fn: (d) => addMonths(d, 1), code: "addMonths(d, 1)" },
  { label: "-3 days", fn: (d) => subDays(d, 3), code: "subDays(d, 3)" },
  { label: "Start of month", fn: startOfMonth, code: "startOfMonth(d)" },
  { label: "End of month", fn: endOfMonth, code: "endOfMonth(d)" },
  { label: "Start of week", fn: (d) => startOfWeek(d, { weekStartsOn: 1 }), code: "startOfWeek(d)" },
  { label: "End of week", fn: (d) => endOfWeek(d, { weekStartsOn: 1 }), code: "endOfWeek(d)" },
];

interface HistoryEntry {
  code: string;
  result: string;
}

export default function DateFnsDemo() {
  const [input, setInput] = useState(format(new Date(), "yyyy-MM-dd"));
  const [fmt, setFmt] = useState(FORMATS[0].fmt);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [compareInput, setCompareInput] = useState(
    format(addDays(new Date(), 30), "yyyy-MM-dd")
  );

  let base: Date | null = null;
  let parseError = false;
  try {
    const parsed = parseISO(input);
    if (isNaN(parsed.getTime())) parseError = true;
    else base = parsed;
  } catch {
    parseError = true;
  }

  let compareDate: Date | null = null;
  try {
    const parsed = parseISO(compareInput);
    if (!isNaN(parsed.getTime())) compareDate = parsed;
  } catch { /* ignore */ }

  function applyOp(op: typeof OPS[number]) {
    if (!base) return;
    const result = format(op.fn(base), fmt);
    setHistory((h) => [{ code: op.code, result }, ...h].slice(0, 6));
  }

  return (
    <div className="h-full overflow-auto p-6">
      <p className="text-sm text-slate-500 mb-5">
        date-fns provides hundreds of pure functions for date manipulation — no classes, fully tree-shakeable.
        Every function takes a plain <code className="bg-slate-100 px-1 rounded text-xs">Date</code> and returns a new one.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: controls */}
        <div className="space-y-5">
          {/* Input */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
              Input date
            </label>
            <input
              type="date"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>

          {/* Format picker */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
              Format string
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {FORMATS.map(({ label, fmt: f }) => (
                <button
                  key={f}
                  onClick={() => setFmt(f)}
                  className={`text-xs px-2.5 py-1 rounded-full transition-all ${
                    fmt === f
                      ? "bg-violet-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={fmt}
              onChange={(e) => setFmt(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>

          {/* Operations */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Manipulation functions
            </label>
            <div className="grid grid-cols-2 gap-2">
              {OPS.map((op) => (
                <button
                  key={op.label}
                  onClick={() => applyOp(op)}
                  disabled={!base}
                  className="text-xs px-3 py-2 rounded-lg border border-slate-200 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 transition-all disabled:opacity-40 text-left"
                >
                  {op.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: output */}
        <div className="space-y-4">
          {/* Formatted output */}
          <div className={`rounded-xl p-4 border ${parseError ? "bg-rose-50 border-rose-200" : "bg-violet-50 border-violet-100"}`}>
            <div className="text-xs font-semibold text-violet-400 mb-1">
              format(parseISO(input), fmt)
            </div>
            {parseError ? (
              <div className="text-rose-500 text-sm font-medium">Invalid date</div>
            ) : base ? (
              <>
                <div className="text-2xl font-bold text-violet-800 font-mono break-all">
                  {format(base, fmt)}
                </div>
                <div className="mt-2 space-y-0.5 text-xs text-violet-600">
                  <div>Relative: <span className="font-semibold">{formatDistanceToNow(base, { addSuffix: true })}</span></div>
                  <div>Weekend: <span className="font-semibold">{isWeekend(base) ? "Yes" : "No"}</span></div>
                  <div>Today: <span className="font-semibold">{isToday(base) ? "Yes" : "No"}</span></div>
                </div>
              </>
            ) : null}
          </div>

          {/* Compare */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Compare dates
            </div>
            <input
              type="date"
              value={compareInput}
              onChange={(e) => setCompareInput(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
            {base && compareDate && (
              <div className="text-xs space-y-1 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">differenceInDays</span>
                  <span className="font-semibold text-slate-800">{differenceInDays(compareDate, base)} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">differenceInYears</span>
                  <span className="font-semibold text-slate-800">{differenceInYears(compareDate, base)} years</span>
                </div>
              </div>
            )}
          </div>

          {/* History */}
          {history.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Operation log
              </div>
              <div className="space-y-1.5">
                {history.map((h, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-white border border-slate-100 rounded-lg px-3 py-2"
                  >
                    <span className="text-xs text-slate-400 font-mono">{h.code}</span>
                    <span className="text-xs font-semibold text-slate-800 font-mono">{h.result}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
