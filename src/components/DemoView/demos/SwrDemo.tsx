"use client";

import useSWR, { mutate } from "swr";
import { useState } from "react";

const BASE = "https://jsonplaceholder.typicode.com";

interface Post { id: number; title: string; userId: number }
interface Todo { id: number; title: string; completed: boolean; userId: number }

const fetcher = (url: string) => fetch(url).then((r) => r.json());

// ── Single post with manual revalidation ──────────────────────────────────────
function PostFetcher() {
  const [postId, setPostId] = useState(1);
  const key = `${BASE}/posts/${postId}`;
  const { data, error, isLoading, isValidating } = useSWR<Post>(key, fetcher);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 text-sm">useSWR — fetch + revalidate</h3>
        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-mono">useSWR()</span>
      </div>

      <div className="flex gap-2 items-center">
        <span className="text-xs text-slate-400 font-mono shrink-0">/posts/</span>
        <input
          type="number"
          min={1}
          max={100}
          value={postId}
          onChange={(e) => setPostId(Math.max(1, Math.min(100, Number(e.target.value))))}
          className="w-16 text-sm border border-slate-200 rounded-lg px-2 py-1.5 text-center focus:outline-none focus:ring-2 focus:ring-indigo-400 tabular-nums"
        />
        <button
          onClick={() => mutate(key)}
          disabled={isValidating}
          className="flex-1 text-sm border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-50 text-slate-600 py-1.5 rounded-lg transition-colors"
        >
          {isValidating ? "Revalidating…" : "Revalidate"}
        </button>
      </div>

      {/* Status strip */}
      <div className="flex gap-2 text-xs">
        <span className={`px-2 py-0.5 rounded-full font-semibold border ${isLoading ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-slate-50 text-slate-400 border-slate-200"}`}>
          loading
        </span>
        <span className={`px-2 py-0.5 rounded-full font-semibold border ${isValidating && !isLoading ? "bg-sky-50 text-sky-700 border-sky-200" : "bg-slate-50 text-slate-400 border-slate-200"}`}>
          validating
        </span>
        <span className={`px-2 py-0.5 rounded-full font-semibold border ${error ? "bg-rose-50 text-rose-600 border-rose-200" : data ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-400 border-slate-200"}`}>
          {error ? "error" : data ? "data ✓" : "idle"}
        </span>
      </div>

      {data && (
        <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 space-y-1">
          <div className="text-xs text-slate-500">id: <span className="text-slate-800 font-semibold">{data.id}</span></div>
          <div className="text-xs text-slate-500">title: <span className="text-slate-700 font-normal">{data.title}</span></div>
        </div>
      )}

      <div className="rounded-lg bg-[#0d1117] p-3 text-xs font-mono text-slate-300 space-y-0.5">
        <div><span className="text-sky-400">const</span> {"{ data, error, isLoading }"} =</div>
        <div>{"  "}<span className="text-amber-400">useSWR</span>(`/posts/<span className="text-emerald-400">${"{"}id{"}"}</span>`, fetcher);</div>
        <div className="text-slate-500 pt-1">// returns cached data instantly,</div>
        <div className="text-slate-500">// revalidates in the background</div>
      </div>
    </div>
  );
}

// ── List with optimistic mutation ──────────────────────────────────────────────
function TodoList() {
  const { data: todos, isLoading } = useSWR<Todo[]>(
    `${BASE}/todos?userId=1&_limit=6`,
    fetcher
  );
  const [localTodos, setLocalTodos] = useState<Todo[] | null>(null);
  const [draft, setDraft] = useState("");
  const display = localTodos ?? todos ?? [];

  function addOptimistic(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim() || !display.length) return;
    const fake: Todo = { id: Date.now(), title: draft.trim(), completed: false, userId: 1 };
    setLocalTodos([fake, ...display]);
    setDraft("");
  }

  function toggle(id: number) {
    setLocalTodos(display.map((t) => t.id === id ? { ...t, completed: !t.completed } : t));
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 text-sm">SWR + optimistic update</h3>
        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-mono">mutate()</span>
      </div>

      <form onSubmit={addOptimistic} className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a todo (optimistic)…"
          disabled={isLoading}
          className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!draft.trim() || isLoading}
          className="text-sm bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white px-3 py-2 rounded-lg transition-colors"
        >
          Add
        </button>
      </form>

      {isLoading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-7 rounded-lg bg-slate-100 animate-pulse" />
          ))}
        </div>
      )}

      <ul className="space-y-1.5 max-h-44 overflow-y-auto">
        {display.map((t) => (
          <li
            key={t.id}
            onClick={() => toggle(t.id)}
            className="flex items-center gap-2 text-sm cursor-pointer group"
          >
            <span className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
              t.completed ? "bg-indigo-600 border-indigo-600" : "border-slate-300 group-hover:border-indigo-400"
            }`}>
              {t.completed && (
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10">
                  <path d="M1.5 5L3.5 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </span>
            <span className={`flex-1 transition-colors ${t.completed ? "line-through text-slate-400" : "text-slate-700"}`}>
              {t.title}
            </span>
            {t.id > 1000000 && (
              <span className="text-[10px] text-indigo-400 font-semibold">optimistic</span>
            )}
          </li>
        ))}
      </ul>

      <div className="rounded-lg bg-[#0d1117] p-3 text-xs font-mono text-slate-300 space-y-0.5">
        <div className="text-slate-500">// optimistic update pattern</div>
        <div><span className="text-amber-400">mutate</span>(key, {"{ ...data, newItem }"}, {"{"}</div>
        <div>{"  "}optimisticData: localState,</div>
        <div>{"  "}rollbackOnError: <span className="text-amber-400">true</span></div>
        <div>{"}"});</div>
      </div>
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────────
export default function SwrDemo() {
  return (
    <div className="h-full overflow-auto p-6">
      <p className="text-sm text-slate-500 mb-5">
        SWR follows the <strong>stale-while-revalidate</strong> strategy: serve cached data immediately,
        then revalidate in the background. The hook returns <code className="bg-slate-100 px-1 rounded text-xs">data</code>,{" "}
        <code className="bg-slate-100 px-1 rounded text-xs">error</code>, and{" "}
        <code className="bg-slate-100 px-1 rounded text-xs">isLoading</code> — all managed automatically.
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PostFetcher />
        <TodoList />
      </div>
    </div>
  );
}
