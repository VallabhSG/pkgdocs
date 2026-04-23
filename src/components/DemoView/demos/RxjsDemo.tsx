"use client";

import { useEffect, useRef, useState } from "react";
import {
  Subject,
  fromEvent,
  debounceTime,
  distinctUntilChanged,
  map,
  scan,
  filter,
  take,
  interval,
  takeUntil,
  share,
} from "rxjs";

// ── Debounce / search panel ────────────────────────────────────────────────────
const FRUITS = [
  "Apple", "Apricot", "Avocado", "Banana", "Blueberry", "Cherry",
  "Coconut", "Grape", "Kiwi", "Lemon", "Lime", "Mango", "Orange",
  "Papaya", "Peach", "Pear", "Pineapple", "Plum", "Raspberry", "Strawberry",
];

function DebouncePanel() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [results, setResults] = useState<string[]>([]);
  const [log, setLog] = useState<string[]>(["← type to search (debounced 400 ms)"]);

  useEffect(() => {
    if (!inputRef.current) return;
    const sub = fromEvent<Event>(inputRef.current, "input")
      .pipe(
        map((e) => (e.target as HTMLInputElement).value.trim()),
        debounceTime(400),
        distinctUntilChanged(),
      )
      .subscribe((val) => {
        const matches = val
          ? FRUITS.filter((f) => f.toLowerCase().includes(val.toLowerCase()))
          : [];
        setResults(matches);
        setLog((prev) => [
          `emit: "${val}" → ${matches.length} match(es)`,
          ...prev.slice(0, 4),
        ]);
      });
    return () => sub.unsubscribe();
  }, []);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 text-sm">debounceTime + distinctUntilChanged</h3>
        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-mono">fromEvent</span>
      </div>

      <input
        ref={inputRef}
        type="text"
        placeholder="Search fruits…"
        className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
      />

      <ul className="min-h-8 space-y-1">
        {results.map((r) => (
          <li key={r} className="text-sm text-slate-700 px-2 py-0.5 bg-orange-50 rounded">
            {r}
          </li>
        ))}
        {results.length === 0 && inputRef.current?.value && (
          <li className="text-sm text-slate-400 italic">No matches</li>
        )}
      </ul>

      <div className="rounded-lg bg-[#0d1117] p-3 text-xs font-mono text-slate-300 space-y-0.5 min-h-[72px]">
        <div className="text-slate-500 mb-1">// emissions log</div>
        {log.map((line, i) => (
          <div key={i} className={i === 0 ? "text-emerald-400" : "text-slate-500"}>
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Click stream / scan panel ──────────────────────────────────────────────────
function ScanPanel() {
  const subject = useRef(new Subject<"click">());
  const [clicks, setClicks] = useState(0);
  const [streak, setStreak] = useState<number[]>([]);
  const [lastBurst, setLastBurst] = useState<number | null>(null);

  useEffect(() => {
    // scan accumulates; we buffer bursts via debounceTime
    const shared = subject.current.pipe(share());

    // total count
    const countSub = shared
      .pipe(scan((acc) => acc + 1, 0))
      .subscribe(setClicks);

    // burst detection: count clicks within 600 ms windows
    const burstSub = shared
      .pipe(
        scan((acc: number[]) => [...acc, Date.now()], [] as number[]),
        map((times) => times.filter((t) => Date.now() - t < 600).length),
        debounceTime(700),
      )
      .subscribe((burst) => {
        if (burst > 1) setLastBurst(burst);
        setStreak([]);
      });

    return () => {
      countSub.unsubscribe();
      burstSub.unsubscribe();
    };
  }, []);

  function handleClick() {
    subject.current.next("click");
    setStreak((s) => [...s, Date.now()]);
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 text-sm">Subject + scan + share</h3>
        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-mono">scan()</span>
      </div>

      <button
        onClick={handleClick}
        className="w-full py-8 bg-orange-50 hover:bg-orange-100 active:scale-95 border-2 border-dashed border-orange-200 hover:border-orange-400 rounded-xl text-slate-600 font-medium text-sm transition-all select-none"
      >
        Click me fast! {streak.length > 1 && `(${streak.length} burst)`}
      </button>

      <div className="grid grid-cols-2 gap-3 text-center">
        <div className="bg-slate-50 rounded-lg py-3">
          <div className="text-2xl font-bold text-orange-600 tabular-nums">{clicks}</div>
          <div className="text-xs text-slate-500 mt-0.5">total clicks</div>
        </div>
        <div className="bg-slate-50 rounded-lg py-3">
          <div className="text-2xl font-bold text-amber-600 tabular-nums">{lastBurst ?? "—"}</div>
          <div className="text-xs text-slate-500 mt-0.5">last burst</div>
        </div>
      </div>

      <div className="rounded-lg bg-[#0d1117] p-3 text-xs font-mono text-slate-300 space-y-0.5">
        <div className="text-slate-500">// pipeline</div>
        <div>subject.<span className="text-orange-400">pipe</span>(</div>
        <div>{"  "}<span className="text-sky-400">scan</span>((acc) =&gt; acc + 1, 0)</div>
        <div>)</div>
      </div>
    </div>
  );
}

// ── Interval / takeUntil panel ─────────────────────────────────────────────────
function IntervalPanel() {
  const [running, setRunning] = useState(false);
  const [count, setCount] = useState(0);
  const [history, setHistory] = useState<number[]>([]);
  const stopRef = useRef(new Subject<void>());

  function start() {
    stopRef.current = new Subject<void>();
    setCount(0);
    setHistory([]);
    setRunning(true);

    interval(600)
      .pipe(
        map((i) => (i + 1) * 7 % 100),
        filter((v) => v % 2 !== 0),   // odd only
        take(8),
        takeUntil(stopRef.current),
      )
      .subscribe({
        next: (v) => {
          setCount((c) => c + 1);
          setHistory((h) => [...h, v]);
        },
        complete: () => setRunning(false),
      });
  }

  function stop() {
    stopRef.current.next();
    stopRef.current.complete();
    setRunning(false);
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 text-sm">interval + filter + take + takeUntil</h3>
        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-mono">interval()</span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={start}
          disabled={running}
          className="flex-1 text-sm bg-orange-600 hover:bg-orange-700 disabled:opacity-40 text-white py-2 rounded-lg transition-colors"
        >
          {running ? "Running…" : "Start stream"}
        </button>
        <button
          onClick={stop}
          disabled={!running}
          className="flex-1 text-sm border border-slate-200 hover:border-red-300 hover:text-red-600 disabled:opacity-40 text-slate-600 py-2 rounded-lg transition-colors"
        >
          Stop early
        </button>
      </div>

      <div className="min-h-10 flex flex-wrap gap-2">
        {history.map((v, i) => (
          <span
            key={i}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-orange-50 text-orange-700 font-bold text-sm border border-orange-200"
          >
            {v}
          </span>
        ))}
        {history.length === 0 && (
          <span className="text-sm text-slate-400 italic">press Start</span>
        )}
      </div>

      <div className="text-xs text-slate-500">
        Emitting every 600 ms, <strong>filter(odd)</strong>, stops after 8 values or on takeUntil.
      </div>

      <div className="rounded-lg bg-[#0d1117] p-3 text-xs font-mono text-slate-300 space-y-0.5">
        <div>interval(<span className="text-amber-400">600</span>).pipe(</div>
        <div>{"  "}<span className="text-sky-400">map</span>(i =&gt; (i+1)*7 % 100),</div>
        <div>{"  "}<span className="text-sky-400">filter</span>(v =&gt; v % 2 !== 0),</div>
        <div>{"  "}<span className="text-sky-400">take</span>(<span className="text-amber-400">8</span>),</div>
        <div>{"  "}<span className="text-sky-400">takeUntil</span>(stop$),</div>
        <div>)</div>
      </div>
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────────
export default function RxjsDemo() {
  return (
    <div className="h-full overflow-auto p-6">
      <p className="text-sm text-slate-500 mb-5">
        RxJS models asynchronous events as <strong>Observable streams</strong>.
        Operators like <code className="bg-slate-100 px-1 rounded text-xs">debounceTime</code>,{" "}
        <code className="bg-slate-100 px-1 rounded text-xs">scan</code>, and{" "}
        <code className="bg-slate-100 px-1 rounded text-xs">filter</code> are composed in a{" "}
        <code className="bg-slate-100 px-1 rounded text-xs">pipe()</code> chain — each one transforms the stream
        without mutating any state.
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DebouncePanel />
        <ScanPanel />
        <div className="lg:col-span-2">
          <IntervalPanel />
        </div>
      </div>
    </div>
  );
}
