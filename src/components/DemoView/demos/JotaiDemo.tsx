"use client";

import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { useState } from "react";

// ── Atoms ──────────────────────────────────────────────────────────────────────
const countAtom = atom(0);
const stepAtom = atom(1);
// Derived atom — computed from two base atoms
const nextCountAtom = atom((get) => get(countAtom) + get(stepAtom));

interface CartItem { id: number; name: string; qty: number; price: number }
const cartAtom = atom<CartItem[]>([
  { id: 1, name: "Jotai T-shirt", qty: 1, price: 29 },
  { id: 2, name: "Atomic Mug", qty: 2, price: 14 },
]);
// Derived: total
const totalAtom = atom((get) =>
  get(cartAtom).reduce((sum, item) => sum + item.qty * item.price, 0)
);

// ── Counter panel ──────────────────────────────────────────────────────────────
function CounterPanel() {
  const [count, setCount] = useAtom(countAtom);
  const [step, setStep] = useAtom(stepAtom);
  const next = useAtomValue(nextCountAtom);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 text-sm">Base + derived atoms</h3>
        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-mono">atom()</span>
      </div>

      <div className="flex items-center gap-4 justify-center py-3">
        <button
          onClick={() => setCount((c) => c - step)}
          className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xl font-bold transition-colors flex items-center justify-center"
        >
          −
        </button>
        <span className="text-5xl font-bold text-violet-600 w-24 text-center tabular-nums">{count}</span>
        <button
          onClick={() => setCount((c) => c + step)}
          className="w-10 h-10 rounded-full bg-violet-600 hover:bg-violet-700 text-white text-xl font-bold transition-colors flex items-center justify-center"
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
          className="w-full accent-violet-600"
        />
      </div>

      <button
        onClick={() => setCount(0)}
        className="w-full text-xs border border-slate-200 hover:border-slate-300 text-slate-600 py-1.5 rounded-lg transition-colors"
      >
        Reset
      </button>

      <div className="rounded-lg bg-[#0d1117] p-3 text-xs font-mono text-slate-300 space-y-1">
        <div><span className="text-slate-500">// base atoms</span></div>
        <div>countAtom <span className="text-slate-500">=</span> <span className="text-amber-400">{count}</span></div>
        <div>stepAtom <span className="text-slate-500">=</span> <span className="text-amber-400">{step}</span></div>
        <div className="pt-1"><span className="text-slate-500">// derived (read-only)</span></div>
        <div>nextCountAtom <span className="text-slate-500">=</span> <span className="text-emerald-400">{next}</span></div>
      </div>
    </div>
  );
}

// ── Cart panel ─────────────────────────────────────────────────────────────────
function CartPanel() {
  const [cart, setCart] = useAtom(cartAtom);
  const total = useAtomValue(totalAtom);
  const [newName, setNewName] = useState("");

  function updateQty(id: number, delta: number) {
    setCart((items) =>
      items
        .map((item) => item.id === id ? { ...item, qty: Math.max(0, item.qty + delta) } : item)
        .filter((item) => item.qty > 0)
    );
  }

  function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCart((items) => [
      ...items,
      { id: Date.now(), name: newName.trim(), qty: 1, price: Math.floor(Math.random() * 40) + 5 },
    ]);
    setNewName("");
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 text-sm">Cart with derived total</h3>
        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-mono">atom(get =&gt; …)</span>
      </div>

      <ul className="space-y-2 max-h-44 overflow-y-auto">
        {cart.map((item) => (
          <li key={item.id} className="flex items-center gap-2 text-sm">
            <span className="flex-1 text-slate-700 truncate">{item.name}</span>
            <span className="text-slate-400 text-xs">${item.price}</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => updateQty(item.id, -1)}
                className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs flex items-center justify-center transition-colors"
              >
                −
              </button>
              <span className="w-5 text-center tabular-nums text-slate-800 font-semibold text-xs">{item.qty}</span>
              <button
                onClick={() => updateQty(item.id, 1)}
                className="w-5 h-5 rounded bg-violet-100 hover:bg-violet-200 text-violet-700 text-xs flex items-center justify-center transition-colors"
              >
                +
              </button>
            </div>
            <span className="text-slate-800 font-semibold w-12 text-right tabular-nums text-xs">
              ${(item.qty * item.price).toFixed(0)}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between border-t border-slate-100 pt-2">
        <span className="text-xs text-slate-500">Total (derived atom)</span>
        <span className="font-bold text-violet-700 tabular-nums">${total}</span>
      </div>

      <form onSubmit={addItem} className="flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Add item…"
          className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-400"
        />
        <button
          type="submit"
          disabled={!newName.trim()}
          className="text-sm bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white px-3 py-2 rounded-lg transition-colors"
        >
          Add
        </button>
      </form>
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────────
export default function JotaiDemo() {
  return (
    <div className="h-full overflow-auto p-6">
      <p className="text-sm text-slate-500 mb-5">
        Jotai takes an <strong>atomic</strong> approach: each piece of state is an <code className="bg-slate-100 px-1 rounded text-xs">atom</code>.
        Derived atoms compose base atoms with <code className="bg-slate-100 px-1 rounded text-xs">atom(get =&gt; …)</code> and
        re-compute automatically. No context providers, no selectors.
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CounterPanel />
        <CartPanel />
      </div>
    </div>
  );
}
