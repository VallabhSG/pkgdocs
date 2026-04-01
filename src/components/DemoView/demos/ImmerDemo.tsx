"use client";

import { useState } from "react";
import { produce } from "immer";

interface Address { street: string; city: string; zip: string; }
interface User { name: string; age: number; role: "admin" | "user"; address: Address; tags: string[]; }

const INITIAL: User = {
  name: "Alice Johnson",
  age: 30,
  role: "user",
  address: { street: "123 Main St", city: "Portland", zip: "97201" },
  tags: ["typescript", "react"],
};

type Op =
  | { type: "setName"; value: string }
  | { type: "incrementAge" }
  | { type: "promoteToAdmin" }
  | { type: "updateCity"; value: string }
  | { type: "addTag"; value: string }
  | { type: "removeTag"; value: string };

function applyOp(state: User, op: Op): User {
  return produce(state, (draft) => {
    if (op.type === "setName") draft.name = op.value;
    if (op.type === "incrementAge") draft.age++;
    if (op.type === "promoteToAdmin") draft.role = "admin";
    if (op.type === "updateCity") draft.address.city = op.value;
    if (op.type === "addTag" && op.value && !draft.tags.includes(op.value)) draft.tags.push(op.value);
    if (op.type === "removeTag") draft.tags = draft.tags.filter((t) => t !== op.value);
  });
}

function diff(a: User, b: User): Set<string> {
  const changed = new Set<string>();
  if (a.name !== b.name) changed.add("name");
  if (a.age !== b.age) changed.add("age");
  if (a.role !== b.role) changed.add("role");
  if (a.address.city !== b.address.city) changed.add("address.city");
  if (JSON.stringify(a.tags) !== JSON.stringify(b.tags)) changed.add("tags");
  return changed;
}

export default function ImmerDemo() {
  const [current, setCurrent] = useState<User>(INITIAL);
  const [prev, setPrev] = useState<User>(INITIAL);
  const [newTag, setNewTag] = useState("");
  const [history, setHistory] = useState<string[]>([]);

  function apply(op: Op, label: string) {
    const next = applyOp(current, op);
    setPrev(current);
    setCurrent(next);
    setHistory((h) => [label, ...h].slice(0, 6));
  }

  const changed = diff(prev, current);
  const sameRef = current === prev;

  return (
    <div className="h-full overflow-auto p-6">
      <p className="text-sm text-slate-500 mb-5">
        Immer lets you write mutating code that produces immutable results.
        The draft is a proxy — your changes are recorded and applied to a new object.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Operations */}
        <div className="space-y-4">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Operations (feel like mutations, produce new objects)
            </div>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="New name..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      apply({ type: "setName", value: e.currentTarget.value }, `name → "${e.currentTarget.value}"`);
                      e.currentTarget.value = "";
                    }
                  }}
                />
                <span className="text-xs text-slate-400 self-center">↵ Enter</span>
              </div>
              <div className="flex gap-2">
                <input
                  className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="New city..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      apply({ type: "updateCity", value: e.currentTarget.value }, `city → "${e.currentTarget.value}"`);
                      e.currentTarget.value = "";
                    }
                  }}
                />
                <span className="text-xs text-slate-400 self-center">↵ Enter</span>
              </div>
              <div className="flex gap-2">
                <input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="Add tag..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newTag.trim()) {
                      apply({ type: "addTag", value: newTag.trim() }, `add tag "${newTag.trim()}"`);
                      setNewTag("");
                    }
                  }}
                />
                <button
                  onClick={() => { if (newTag.trim()) { apply({ type: "addTag", value: newTag.trim() }, `add tag "${newTag.trim()}"`); setNewTag(""); } }}
                  className="text-xs bg-indigo-600 text-white px-3 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Add tag
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => apply({ type: "incrementAge" }, "age++")} className="text-xs border border-slate-200 rounded-lg py-2 hover:bg-indigo-50 hover:border-indigo-300 transition-all">
                  draft.age++
                </button>
                <button onClick={() => apply({ type: "promoteToAdmin" }, 'role → "admin"')} disabled={current.role === "admin"} className="text-xs border border-slate-200 rounded-lg py-2 hover:bg-indigo-50 hover:border-indigo-300 transition-all disabled:opacity-40">
                  draft.role = "admin"
                </button>
              </div>
            </div>
          </div>

          {/* Code */}
          <div className="rounded-xl bg-[#0d1117] border border-slate-700 p-4 text-xs font-mono leading-relaxed">
            <div className="text-slate-500 mb-1">// Immer: write mutations, get immutability</div>
            <div><span className="text-purple-400">const</span><span className="text-slate-200"> next = </span><span className="text-sky-400">produce</span><span className="text-slate-200">(state, (</span><span className="text-amber-400">draft</span><span className="text-slate-200">) =&gt; {"{"}</span></div>
            <div className="pl-4"><span className="text-amber-400">draft</span><span className="text-slate-200">.age</span><span className="text-slate-300">++</span><span className="text-slate-400">; // mutate freely</span></div>
            <div className="pl-4"><span className="text-amber-400">draft</span><span className="text-slate-200">.address.city = </span><span className="text-emerald-400">"Seattle"</span><span className="text-slate-200">;</span></div>
            <div className="pl-4"><span className="text-amber-400">draft</span><span className="text-slate-200">.tags.</span><span className="text-sky-400">push</span><span className="text-slate-200">(</span><span className="text-emerald-400">"new-tag"</span><span className="text-slate-200">);</span></div>
            <div><span className="text-slate-200">{"}"}</span><span className="text-slate-200">);</span></div>
            <div className="mt-2 text-emerald-400">// state unchanged · next is a new object</div>
          </div>

          {history.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">History</div>
              <div className="space-y-1">
                {history.map((h, i) => (
                  <div key={i} className="text-xs text-slate-500 font-mono flex items-center gap-2">
                    <span className="text-slate-300">→</span> {h}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* State view */}
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Current state {!sameRef && <span className="text-emerald-500 font-normal ml-1">← new object</span>}
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 font-mono text-xs space-y-1">
            {(Object.entries(current) as [string, unknown][]).map(([key, value]) => {
              const fieldKey = key === "address" ? "address.city" : key;
              const isChanged = changed.has(key) || (key === "address" && changed.has("address.city"));
              return (
                <div key={key} className={`flex gap-2 items-start rounded px-1 -mx-1 transition-colors ${isChanged ? "bg-emerald-50" : ""}`}>
                  <span className="text-slate-400">{key}:</span>
                  <span className={isChanged ? "text-emerald-700 font-semibold" : "text-slate-700"}>
                    {typeof value === "object" && !Array.isArray(value)
                      ? JSON.stringify(value)
                      : Array.isArray(value)
                      ? `[${(value as string[]).map((t) => `"${t}"`).join(", ")}]`
                      : typeof value === "string" ? `"${value}"` : String(value)}
                  </span>
                  {isChanged && <span className="text-emerald-400 text-xs">← changed</span>}
                </div>
              );
            })}
          </div>
          <div className="mt-3 text-xs text-slate-400">
            {sameRef
              ? "Make a change above to see Immer produce a new object"
              : "Immer created a new object with structural sharing — unchanged parts are the same reference"}
          </div>
        </div>
      </div>
    </div>
  );
}
