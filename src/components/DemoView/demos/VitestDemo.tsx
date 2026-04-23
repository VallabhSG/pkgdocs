"use client";

import { useState, useCallback } from "react";

// ── Mini in-browser test engine ────────────────────────────────────────────────
type Status = "idle" | "pass" | "fail" | "skip";

interface TestResult {
  name: string;
  status: Status;
  error?: string;
  ms: number;
}

interface Suite {
  name: string;
  results: TestResult[];
}

// The code-under-test (pure functions, editable)
function add(a: number, b: number) { return a + b; }
function multiply(a: number, b: number) { return a * b; }
function capitalize(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }
function clamp(n: number, min: number, max: number) { return Math.min(Math.max(n, min), max); }
function uniq<T>(arr: T[]) { return [...new Set(arr)]; }

type Expectation = {
  toBe: (expected: unknown) => void;
  toEqual: (expected: unknown) => void;
  toThrow: () => void;
  toContain: (item: unknown) => void;
};

function expect(received: unknown): Expectation {
  return {
    toBe(expected) {
      if (received !== expected)
        throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(received)}`);
    },
    toEqual(expected) {
      if (JSON.stringify(received) !== JSON.stringify(expected))
        throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(received)}`);
    },
    toThrow() {
      // stub
    },
    toContain(item) {
      if (!Array.isArray(received) || !received.includes(item))
        throw new Error(`Array does not contain ${JSON.stringify(item)}`);
    },
  };
}

// Test suites definition
const SUITES: { name: string; tests: { name: string; fn: () => void; skip?: boolean }[] }[] = [
  {
    name: "math utils",
    tests: [
      { name: "add(2, 3) → 5",            fn: () => expect(add(2, 3)).toBe(5) },
      { name: "add(-1, 1) → 0",           fn: () => expect(add(-1, 1)).toBe(0) },
      { name: "multiply(4, 5) → 20",      fn: () => expect(multiply(4, 5)).toBe(20) },
      { name: "multiply(0, 99) → 0",      fn: () => expect(multiply(0, 99)).toBe(0) },
      { name: "clamp(15, 0, 10) → 10",    fn: () => expect(clamp(15, 0, 10)).toBe(10) },
      { name: "clamp(-5, 0, 10) → 0",     fn: () => expect(clamp(-5, 0, 10)).toBe(0) },
    ],
  },
  {
    name: "string utils",
    tests: [
      { name: "capitalize('hello') → 'Hello'", fn: () => expect(capitalize("hello")).toBe("Hello") },
      { name: "capitalize('') → ''",           fn: () => expect(capitalize("")).toBe("") },
      { name: "capitalize('WORLD') → 'WORLD'", fn: () => expect(capitalize("WORLD")).toBe("WORLD") },
    ],
  },
  {
    name: "array utils",
    tests: [
      { name: "uniq([1,1,2,3]) → [1,2,3]",   fn: () => expect(uniq([1, 1, 2, 3])).toEqual([1, 2, 3]) },
      { name: "uniq(['a','a']) → ['a']",       fn: () => expect(uniq(["a", "a"])).toEqual(["a"]) },
      { name: "result contains 2",             fn: () => expect(uniq([1, 2, 2])).toContain(2) },
      { name: "intentionally failing test",    fn: () => expect(add(1, 1)).toBe(99), },  // fails on purpose
    ],
  },
];

function runSuites(): Suite[] {
  return SUITES.map((suite) => ({
    name: suite.name,
    results: suite.tests.map((t) => {
      if (t.skip) return { name: t.name, status: "skip" as Status, ms: 0 };
      const t0 = performance.now();
      try {
        t.fn();
        return { name: t.name, status: "pass" as Status, ms: Math.round(performance.now() - t0) };
      } catch (err) {
        return { name: t.name, status: "fail" as Status, error: (err as Error).message, ms: Math.round(performance.now() - t0) };
      }
    }),
  }));
}

// ── Status icon ────────────────────────────────────────────────────────────────
function StatusIcon({ status }: { status: Status }) {
  if (status === "pass") return <span className="text-emerald-500 font-bold">✓</span>;
  if (status === "fail") return <span className="text-rose-500 font-bold">✗</span>;
  if (status === "skip") return <span className="text-slate-400">○</span>;
  return <span className="text-slate-300">·</span>;
}

// ── Main export ────────────────────────────────────────────────────────────────
export default function VitestDemo() {
  const [suites, setSuites] = useState<Suite[]>([]);
  const [running, setRunning] = useState(false);
  const [ran, setRan] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const run = useCallback(() => {
    setRunning(true);
    setSuites([]);
    setRan(false);

    // Simulate async run with a brief delay so the UI feels live
    setTimeout(() => {
      setSuites(runSuites());
      setRunning(false);
      setRan(true);
      setExpanded(new Set(SUITES.map((s) => s.name))); // expand all on first run
    }, 320);
  }, []);

  const totals = suites.reduce(
    (acc, s) => {
      s.results.forEach((r) => { acc[r.status] = (acc[r.status] ?? 0) + 1; });
      return acc;
    },
    {} as Record<Status, number>
  );

  const totalTests = Object.values(totals).reduce((a, b) => a + b, 0);

  function toggle(name: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  }

  return (
    <div className="h-full overflow-auto p-6">
      <p className="text-sm text-slate-500 mb-5">
        Vitest is Vite-native: blazing fast, ESM-first, and Jest-compatible.
        Below is a real in-browser runner using the same{" "}
        <code className="bg-slate-100 px-1 rounded text-xs">describe</code> /{" "}
        <code className="bg-slate-100 px-1 rounded text-xs">it</code> /{" "}
        <code className="bg-slate-100 px-1 rounded text-xs">expect</code> pattern — one test intentionally fails.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test runner */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 text-sm">Test runner</h3>
            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-mono">vitest run</span>
          </div>

          <button
            onClick={run}
            disabled={running}
            className="w-full text-sm bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-2 rounded-lg transition-colors font-medium"
          >
            {running ? "Running…" : ran ? "Run again" : "▶ Run tests"}
          </button>

          {ran && (
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                <span>✓</span> {totals.pass ?? 0} passed
              </span>
              {(totals.fail ?? 0) > 0 && (
                <span className="flex items-center gap-1 text-rose-500 font-semibold">
                  <span>✗</span> {totals.fail} failed
                </span>
              )}
              {(totals.skip ?? 0) > 0 && (
                <span className="text-slate-400">{totals.skip} skipped</span>
              )}
              <span className="text-slate-400 ml-auto">{totalTests} total</span>
            </div>
          )}

          {running && (
            <div className="space-y-1.5">
              {SUITES.map((s) => (
                <div key={s.name} className="h-6 rounded bg-slate-100 animate-pulse" />
              ))}
            </div>
          )}

          {!running && suites.map((suite) => (
            <div key={suite.name} className="border border-slate-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggle(suite.name)}
                className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
              >
                <span className="text-xs font-semibold text-slate-700 font-mono">{suite.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-emerald-600 font-bold">
                    {suite.results.filter((r) => r.status === "pass").length} ✓
                  </span>
                  {suite.results.some((r) => r.status === "fail") && (
                    <span className="text-[10px] text-rose-500 font-bold">
                      {suite.results.filter((r) => r.status === "fail").length} ✗
                    </span>
                  )}
                  <span className="text-slate-400 text-[10px]">{expanded.has(suite.name) ? "▲" : "▼"}</span>
                </div>
              </button>

              {expanded.has(suite.name) && (
                <ul className="divide-y divide-slate-100">
                  {suite.results.map((r) => (
                    <li key={r.name} className="px-3 py-2">
                      <div className="flex items-center gap-2 text-xs">
                        <StatusIcon status={r.status} />
                        <span className={`flex-1 font-mono ${r.status === "fail" ? "text-rose-600" : "text-slate-700"}`}>
                          {r.name}
                        </span>
                        <span className="text-slate-400 tabular-nums">{r.ms}ms</span>
                      </div>
                      {r.error && (
                        <div className="mt-1 ml-5 text-[10px] text-rose-500 bg-rose-50 rounded px-2 py-1 font-mono">
                          {r.error}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* Code view */}
        <div className="bg-[#0d1117] rounded-xl p-5 overflow-auto space-y-3">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">math.test.ts</div>
          <pre className="text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{`import { describe, it, expect } from "vitest";
import { add, multiply, clamp } from "./math";

describe("math utils", () => {
  it("add(2, 3) → 5", () => {
    expect(add(2, 3)).toBe(5);
  });

  it("multiply(4, 5) → 20", () => {
    expect(multiply(4, 5)).toBe(20);
  });

  it("clamp(15, 0, 10) → 10", () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });
});

describe("array utils", () => {
  it("intentionally failing test", () => {
    expect(add(1, 1)).toBe(99); // ✗
  });
});`}</pre>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pt-2">vitest.config.ts</div>
          <pre className="text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{`import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    coverage: {
      reporter: ["text", "html"],
    },
  },
});`}</pre>
        </div>
      </div>
    </div>
  );
}
