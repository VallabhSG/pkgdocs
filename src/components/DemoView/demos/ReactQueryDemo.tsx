"use client";

import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useState } from "react";

const BASE = "https://jsonplaceholder.typicode.com";

interface Post   { id: number; title: string; body: string; userId: number }
interface Comment { id: number; postId: number; name: string; email: string; body: string }

const qc = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30_000 } } });

// ── Post query panel ───────────────────────────────────────────────────────────
function PostQuery() {
  const [postId, setPostId] = useState(1);
  const queryClient = useQueryClient();

  const { data, status, fetchStatus, dataUpdatedAt } = useQuery<Post>({
    queryKey: ["post", postId],
    queryFn: () => fetch(`${BASE}/posts/${postId}`).then((r) => r.json()),
  });

  const isFetching = fetchStatus === "fetching";

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 text-sm">useQuery</h3>
        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-mono">useQuery()</span>
      </div>

      <div className="flex gap-2 items-center">
        <span className="text-xs text-slate-400 font-mono shrink-0">/posts/</span>
        <input
          type="number"
          min={1}
          max={100}
          value={postId}
          onChange={(e) => setPostId(Math.max(1, Math.min(100, Number(e.target.value))))}
          className="w-16 text-sm border border-slate-200 rounded-lg px-2 py-1.5 text-center focus:outline-none focus:ring-2 focus:ring-violet-400 tabular-nums"
        />
        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: ["post", postId] })}
          disabled={isFetching}
          className="flex-1 text-sm border border-slate-200 hover:border-violet-300 hover:text-violet-600 disabled:opacity-50 text-slate-600 py-1.5 rounded-lg transition-colors"
        >
          {isFetching ? "Fetching…" : "Invalidate"}
        </button>
      </div>

      {/* Status chips */}
      <div className="flex flex-wrap gap-2 text-xs">
        {(["pending", "success", "error"] as const).map((s) => (
          <span key={s} className={`px-2 py-0.5 rounded-full font-semibold border transition-all ${
            status === s
              ? s === "success" ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : s === "error"   ? "bg-rose-50 text-rose-600 border-rose-200"
              :                   "bg-amber-50 text-amber-700 border-amber-200"
              : "bg-slate-50 text-slate-400 border-slate-200"
          }`}>
            {s}
          </span>
        ))}
        {isFetching && (
          <span className="px-2 py-0.5 rounded-full font-semibold border bg-sky-50 text-sky-600 border-sky-200">
            fetching
          </span>
        )}
      </div>

      {data && (
        <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 space-y-1">
          <div className="text-xs text-slate-500 truncate">
            title: <span className="text-slate-700">{data.title}</span>
          </div>
          {dataUpdatedAt > 0 && (
            <div className="text-[10px] text-slate-400">
              cached at {new Date(dataUpdatedAt).toLocaleTimeString()}
            </div>
          )}
        </div>
      )}

      <div className="rounded-lg bg-[#0d1117] p-3 text-xs font-mono text-slate-300 space-y-0.5">
        <div><span className="text-sky-400">const</span> {"{ data, status }"} = <span className="text-amber-400">useQuery</span>({"{"}</div>
        <div>{"  "}queryKey: [<span className="text-emerald-400">"post"</span>, id],</div>
        <div>{"  "}queryFn: () =&gt; fetch(...).then(r =&gt; r.json()),</div>
        <div>{"}"});</div>
      </div>
    </div>
  );
}

// ── Comments query + dependent query ──────────────────────────────────────────
function CommentsPanel() {
  const [postId, setPostId] = useState<number | null>(null);

  const postQuery = useQuery<Post>({
    queryKey: ["post-for-comments", postId],
    queryFn: () => fetch(`${BASE}/posts/${postId}`).then((r) => r.json()),
    enabled: postId !== null,
  });

  const commentsQuery = useQuery<Comment[]>({
    queryKey: ["comments", postId],
    queryFn: () => fetch(`${BASE}/posts/${postId}/comments`).then((r) => r.json()),
    enabled: postQuery.isSuccess,   // dependent: only runs after post loads
  });

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 text-sm">Dependent queries</h3>
        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-mono">enabled:</span>
      </div>

      <div className="flex gap-2">
        {[1, 3, 7].map((id) => (
          <button
            key={id}
            onClick={() => setPostId(id)}
            className={`flex-1 text-sm py-1.5 rounded-lg border transition-colors ${
              postId === id
                ? "bg-violet-600 text-white border-violet-600"
                : "border-slate-200 text-slate-600 hover:border-violet-300"
            }`}
          >
            Post {id}
          </button>
        ))}
      </div>

      {postId === null && (
        <p className="text-sm text-slate-400 italic">Select a post above to load it, then its comments.</p>
      )}

      {postQuery.isLoading && (
        <div className="space-y-2">
          <div className="h-5 rounded bg-slate-100 animate-pulse w-3/4" />
        </div>
      )}

      {postQuery.isSuccess && (
        <div className="text-xs rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-slate-700">
          Post: <span className="font-medium">{postQuery.data.title.slice(0, 55)}…</span>
        </div>
      )}

      {commentsQuery.isLoading && postQuery.isSuccess && (
        <div className="space-y-1.5">
          {[1, 2, 3].map((i) => <div key={i} className="h-7 rounded bg-slate-100 animate-pulse" />)}
        </div>
      )}

      {commentsQuery.isSuccess && (
        <ul className="space-y-1.5 max-h-36 overflow-y-auto">
          {commentsQuery.data.slice(0, 5).map((c) => (
            <li key={c.id} className="text-xs rounded-lg bg-violet-50 border border-violet-100 px-3 py-2">
              <div className="font-semibold text-violet-800 truncate">{c.name}</div>
              <div className="text-violet-600 truncate">{c.body.slice(0, 60)}…</div>
            </li>
          ))}
        </ul>
      )}

      <div className="rounded-lg bg-[#0d1117] p-3 text-xs font-mono text-slate-300 space-y-0.5">
        <div className="text-slate-500">// comments only fetch after post succeeds</div>
        <div><span className="text-amber-400">useQuery</span>({"{"} queryKey: [<span className="text-emerald-400">"comments"</span>, id],</div>
        <div>{"  "}enabled: postQuery.<span className="text-amber-400">isSuccess</span> {"}"});</div>
      </div>
    </div>
  );
}

// ── Mutation panel ─────────────────────────────────────────────────────────────
function MutationPanel() {
  const [title, setTitle] = useState("My new post");
  const [created, setCreated] = useState<Post | null>(null);

  const mutation = useMutation<Post, Error, Pick<Post, "title" | "body">>({
    mutationFn: (newPost) =>
      fetch(`${BASE}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newPost, userId: 1 }),
      }).then((r) => r.json()),
    onSuccess: (data) => setCreated(data),
  });

  return (
    <div className="bg-white border border-slate-200 rounded-xl lg:col-span-2 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 text-sm">useMutation</h3>
        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-mono">useMutation()</span>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
          <button
            onClick={() => mutation.mutate({ title, body: "Written with TanStack Query." })}
            disabled={mutation.isPending || !title.trim()}
            className="w-full text-sm bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white py-2 rounded-lg transition-colors"
          >
            {mutation.isPending ? "Posting…" : "Create post"}
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2 text-xs">
            {(["idle", "pending", "success", "error"] as const).map((s) => (
              <span key={s} className={`px-2 py-0.5 rounded-full font-semibold border transition-all ${
                mutation.status === s
                  ? s === "success" ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : s === "error"   ? "bg-rose-50 text-rose-600 border-rose-200"
                  : s === "pending" ? "bg-amber-50 text-amber-700 border-amber-200"
                  :                   "bg-slate-100 text-slate-600 border-slate-200"
                  : "bg-slate-50 text-slate-400 border-slate-200"
              }`}>
                {s}
              </span>
            ))}
          </div>
          {created && (
            <div className="text-xs bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-emerald-800">
              Created post id: <strong>{created.id}</strong>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg bg-[#0d1117] p-3 text-xs font-mono text-slate-300 space-y-0.5">
        <div><span className="text-sky-400">const</span> mutation = <span className="text-amber-400">useMutation</span>({"{ mutationFn: createPost }"});</div>
        <div>mutation.<span className="text-amber-400">mutate</span>{"({ title })"}  <span className="text-slate-500">// trigger it</span></div>
        <div>mutation.<span className="text-amber-400">status</span>       <span className="text-slate-500">// idle | pending | success | error</span></div>
      </div>
    </div>
  );
}

// ── Root with QueryClientProvider ──────────────────────────────────────────────
export default function ReactQueryDemo() {
  return (
    <QueryClientProvider client={qc}>
      <div className="h-full overflow-auto p-6">
        <p className="text-sm text-slate-500 mb-5">
          TanStack Query separates <strong>server state</strong> from client state.
          Each query has a <code className="bg-slate-100 px-1 rounded text-xs">queryKey</code> for caching and
          invalidation, a <code className="bg-slate-100 px-1 rounded text-xs">queryFn</code> for fetching,
          and automatic background refetching. Mutations get their own lifecycle states.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PostQuery />
          <CommentsPanel />
          <MutationPanel />
        </div>
      </div>
    </QueryClientProvider>
  );
}
