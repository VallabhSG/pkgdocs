"use client";

import { useState } from "react";
import { create } from "zustand";

// ── Counter store ─────────────────────────────────────────────────────────────
interface CounterStore {
  count: number;
  step: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
  setStep: (step: number) => void;
}

const useCounter = create<CounterStore>((set) => ({
  count: 0,
  step: 1,
  increment: () => set((s) => ({ count: s.count + s.step })),
  decrement: () => set((s) => ({ count: s.count - s.step })),
  reset: () => set({ count: 0 }),
  setStep: (step) => set({ step }),
}));

// ── Todo store ────────────────────────────────────────────────────────────────
interface Todo { id: number; text: string; done: boolean }
interface TodoStore {
  todos: Todo[];
  add: (text: string) => void;
  toggle: (id: number) => void;
  remove: (id: number) => void;
}

const useTodos = create<TodoStore>((set) => ({
  todos: [
    { id: 1, text: "Read the Zustand docs", done: true },
    { id: 2, text: "Replace Redux with Zustand", done: false },
  ],
  add: (text) =>
    set((s) => ({
      todos: [...s.todos, { id: Date.now(), text, done: false }],
    })),
  toggle: (id) =>
    set((s) => ({
      todos: s.todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    })),
  remove: (id) =>
    set((s) => ({ todos: s.todos.filter((t) => t.id !== id) })),
}));

// ── Counter panel ─────────────────────────────────────────────────────────────
function CounterPanel() {
  const { count, step, increment, decrement, reset, setStep } = useCounter();

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 text-sm">Counter store</h3>
        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-mono">useCounter()</span>
      </div>

      <div className="flex items-center gap-4 justify-center py-3">
        <button
          onClick={decrement}
          className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xl font-bold transition-colors flex items-center justify-center"
        >
          −
        </button>
        <span className="text-5xl font-bold text-indigo-600 w-24 text-center tabular-nums">{count}</span>
        <button
          onClick={increment}
          className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xl font-bold transition-colors flex items-center justify-center"
        >
          +
        </button>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
          Step: {step}
        </label>
        <input
          type="range"
          min={1}
          max={10}
          value={step}
          onChange={(e) => setStep(Number(e.target.value))}
          className="w-full accent-indigo-600"
        />
      </div>

      <button
        onClick={reset}
        className="w-full text-xs border border-slate-200 hover:border-slate-300 text-slate-600 py-1.5 rounded-lg transition-colors"
      >
        Reset
      </button>

      {/* Store snapshot */}
      <div className="rounded-lg bg-[#0d1117] p-3 text-xs font-mono text-slate-300">
        <span className="text-slate-500">// store state</span>
        <br />
        {"{"} count: <span className="text-amber-400">{count}</span>, step: <span className="text-amber-400">{step}</span> {"}"}
      </div>
    </div>
  );
}

// ── Todo panel ────────────────────────────────────────────────────────────────
function TodoPanel() {
  const { todos, add, toggle, remove } = useTodos();
  const [draft, setDraft] = useState("");

  const done = todos.filter((t) => t.done).length;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (draft.trim()) {
      add(draft.trim());
      setDraft("");
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 text-sm">Todo store</h3>
        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-mono">useTodos()</span>
      </div>

      <div className="text-xs text-slate-500">
        {done}/{todos.length} completed
        <div className="mt-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all"
            style={{ width: todos.length ? `${(done / todos.length) * 100}%` : "0%" }}
          />
        </div>
      </div>

      <ul className="space-y-1.5 max-h-40 overflow-y-auto">
        {todos.map((t) => (
          <li key={t.id} className="flex items-center gap-2 group">
            <button
              onClick={() => toggle(t.id)}
              className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
                t.done ? "bg-indigo-600 border-indigo-600" : "border-slate-300 hover:border-indigo-400"
              }`}
            >
              {t.done && (
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10">
                  <path d="M1.5 5L3.5 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
            <span className={`text-sm flex-1 ${t.done ? "line-through text-slate-400" : "text-slate-700"}`}>
              {t.text}
            </span>
            <button
              onClick={() => remove(t.id)}
              className="text-slate-300 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all text-xs"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={submit} className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a todo…"
          className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <button
          type="submit"
          disabled={!draft.trim()}
          className="text-sm bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white px-3 py-2 rounded-lg transition-colors"
        >
          Add
        </button>
      </form>

      {/* Store snapshot */}
      <div className="rounded-lg bg-[#0d1117] p-3 text-xs font-mono text-slate-300 overflow-x-auto">
        <span className="text-slate-500">// store.todos</span>
        <br />
        {todos.map((t) => (
          <div key={t.id}>
            {"  "}{"{"} id: <span className="text-amber-400">{t.id}</span>, done: <span className={t.done ? "text-emerald-400" : "text-rose-400"}>{String(t.done)}</span> {"}"}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function ZustandDemo() {
  return (
    <div className="h-full overflow-auto p-6">
      <p className="text-sm text-slate-500 mb-5">
        Zustand stores are created with <code className="bg-slate-100 px-1 rounded text-xs">create()</code> and accessed with the returned hook.
        No providers, no boilerplate — the store lives outside React and updates only subscribed components.
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CounterPanel />
        <TodoPanel />
      </div>
    </div>
  );
}
