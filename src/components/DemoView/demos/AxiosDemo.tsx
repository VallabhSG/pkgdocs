"use client";

import axios, { AxiosError } from "axios";
import { useState } from "react";

const BASE = "https://jsonplaceholder.typicode.com";

interface Post  { id: number; title: string; body: string; userId: number }
interface User  { id: number; name: string; email: string; website: string }

type Status = "idle" | "loading" | "success" | "error";

// ── Request log entry ──────────────────────────────────────────────────────────
interface LogEntry {
  method: string;
  url: string;
  status: number | null;
  ms: number | null;
  ok: boolean;
  payload?: unknown;
}

// ── GET panel ──────────────────────────────────────────────────────────────────
function GetPanel({ onLog }: { onLog: (e: LogEntry) => void }) {
  const [postId, setPostId] = useState(1);
  const [data, setData] = useState<Post | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  async function fetch() {
    setStatus("loading");
    setData(null);
    const t0 = Date.now();
    try {
      const res = await axios.get<Post>(`${BASE}/posts/${postId}`);
      setData(res.data);
      setStatus("success");
      onLog({ method: "GET", url: `/posts/${postId}`, status: res.status, ms: Date.now() - t0, ok: true });
    } catch (err) {
      setStatus("error");
      const e = err as AxiosError;
      onLog({ method: "GET", url: `/posts/${postId}`, status: e.response?.status ?? null, ms: Date.now() - t0, ok: false });
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 text-sm">axios.get()</h3>
        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-mono">GET</span>
      </div>

      <div className="flex gap-2 items-center">
        <span className="text-xs text-slate-400 font-mono shrink-0">/posts/</span>
        <input
          type="number"
          min={1}
          max={100}
          value={postId}
          onChange={(e) => setPostId(Math.max(1, Math.min(100, Number(e.target.value))))}
          className="w-16 text-sm border border-slate-200 rounded-lg px-2 py-1.5 text-center focus:outline-none focus:ring-2 focus:ring-sky-400 tabular-nums"
        />
        <button
          onClick={fetch}
          disabled={status === "loading"}
          className="flex-1 text-sm bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white py-1.5 rounded-lg transition-colors"
        >
          {status === "loading" ? "Fetching…" : "Fetch post"}
        </button>
      </div>

      {status === "success" && data && (
        <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 space-y-1.5">
          <div className="text-xs font-bold text-slate-500">id: <span className="text-slate-800">{data.id}</span></div>
          <div className="text-xs font-bold text-slate-500">title: <span className="font-normal text-slate-700">{data.title}</span></div>
          <div className="text-xs font-bold text-slate-500">body: <span className="font-normal text-slate-500 line-clamp-2">{data.body}</span></div>
        </div>
      )}

      {status === "error" && (
        <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
          Request failed — post ID out of range or network error
        </div>
      )}

      <div className="rounded-lg bg-[#0d1117] p-3 text-xs font-mono text-slate-300 space-y-0.5">
        <div><span className="text-sky-400">const</span> res = <span className="text-sky-400">await</span> axios.<span className="text-amber-400">get</span>(`/posts/<span className="text-emerald-400">${"{"}postId{"}"}</span>`);</div>
        <div>res.<span className="text-amber-400">data</span>  <span className="text-slate-500">// typed response body</span></div>
        <div>res.<span className="text-amber-400">status</span> <span className="text-slate-500">// HTTP status code</span></div>
      </div>
    </div>
  );
}

// ── POST panel ─────────────────────────────────────────────────────────────────
function PostPanel({ onLog }: { onLog: (e: LogEntry) => void }) {
  const [title, setTitle] = useState("Hello pkgdocs");
  const [body, setBody]   = useState("Axios makes HTTP requests simple.");
  const [result, setResult] = useState<Post | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setResult(null);
    const t0 = Date.now();
    try {
      const res = await axios.post<Post>(`${BASE}/posts`, { title, body, userId: 1 });
      setResult(res.data);
      setStatus("success");
      onLog({ method: "POST", url: "/posts", status: res.status, ms: Date.now() - t0, ok: true, payload: { title, body } });
    } catch (err) {
      setStatus("error");
      const e = err as AxiosError;
      onLog({ method: "POST", url: "/posts", status: e.response?.status ?? null, ms: Date.now() - t0, ok: false });
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 text-sm">axios.post()</h3>
        <span className="text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full font-mono">POST</span>
      </div>

      <form onSubmit={submit} className="space-y-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Body"
          rows={2}
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none"
        />
        <button
          type="submit"
          disabled={status === "loading" || !title.trim()}
          className="w-full text-sm bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white py-1.5 rounded-lg transition-colors"
        >
          {status === "loading" ? "Posting…" : "Post it"}
        </button>
      </form>

      {status === "success" && result && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 space-y-0.5">
          <div className="font-bold">201 Created</div>
          <div>id: <span className="font-semibold">{result.id}</span> (server-assigned)</div>
        </div>
      )}

      <div className="rounded-lg bg-[#0d1117] p-3 text-xs font-mono text-slate-300 space-y-0.5">
        <div><span className="text-sky-400">const</span> res = <span className="text-sky-400">await</span> axios.<span className="text-amber-400">post</span>(<span className="text-emerald-400">"/posts"</span>, {"{"} title, body {"}"});</div>
        <div>res.<span className="text-amber-400">status</span> <span className="text-slate-500">// 201</span></div>
        <div>res.<span className="text-amber-400">data</span>.<span className="text-amber-400">id</span>  <span className="text-slate-500">// created resource id</span></div>
      </div>
    </div>
  );
}

// ── Request log ────────────────────────────────────────────────────────────────
function RequestLog({ entries }: { entries: LogEntry[] }) {
  if (entries.length === 0) return null;
  return (
    <div className="bg-[#0d1117] rounded-xl p-4 space-y-1.5">
      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Request log</div>
      {entries.map((e, i) => (
        <div key={i} className="flex items-center gap-3 text-xs font-mono">
          <span className={`font-bold w-10 ${e.method === "GET" ? "text-emerald-400" : "text-sky-400"}`}>{e.method}</span>
          <span className="text-slate-400 flex-1 truncate">{e.url}</span>
          <span className={`font-bold ${e.ok ? "text-emerald-400" : "text-rose-400"}`}>
            {e.status ?? "ERR"}
          </span>
          {e.ms !== null && <span className="text-slate-600 tabular-nums">{e.ms}ms</span>}
        </div>
      ))}
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────────
export default function AxiosDemo() {
  const [log, setLog] = useState<LogEntry[]>([]);
  const addLog = (e: LogEntry) => setLog((prev) => [e, ...prev.slice(0, 6)]);

  return (
    <div className="h-full overflow-auto p-6">
      <p className="text-sm text-slate-500 mb-5">
        Axios wraps <code className="bg-slate-100 px-1 rounded text-xs">fetch</code> with automatic JSON serialization,
        response type inference, and interceptors.
        Requests below hit <span className="font-mono text-xs bg-slate-100 px-1 rounded">jsonplaceholder.typicode.com</span> — a real free REST API.
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GetPanel  onLog={addLog} />
        <PostPanel onLog={addLog} />
      </div>
      {log.length > 0 && (
        <div className="mt-6">
          <RequestLog entries={log} />
        </div>
      )}
    </div>
  );
}
