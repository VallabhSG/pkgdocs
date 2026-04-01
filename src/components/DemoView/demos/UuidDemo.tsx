"use client";

import { useState } from "react";
import { v4 as uuidv4, v1 as uuidv1, v5 as uuidv5, validate, version } from "uuid";

const DNS_NAMESPACE = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";

export default function UuidDemo() {
  const [uuids, setUuids] = useState<{ id: string; ver: string; ts: string }[]>([]);
  const [checkInput, setCheckInput] = useState("");
  const [v5Name, setV5Name] = useState("example.com");
  const [copied, setCopied] = useState<string | null>(null);

  function generate(ver: "v1" | "v4" | "v5") {
    const id =
      ver === "v1" ? uuidv1() :
      ver === "v4" ? uuidv4() :
      uuidv5(v5Name, DNS_NAMESPACE);
    setUuids((prev) => [{ id, ver, ts: new Date().toLocaleTimeString() }, ...prev].slice(0, 12));
  }

  function copy(id: string) {
    navigator.clipboard.writeText(id).catch(() => {});
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  }

  const checkResult = checkInput.trim()
    ? validate(checkInput.trim())
      ? `Valid UUID v${version(checkInput.trim())}`
      : "Invalid UUID"
    : null;

  return (
    <div className="h-full overflow-auto p-6">
      <p className="text-sm text-slate-500 mb-5">
        The uuid library generates RFC 4122-compliant unique identifiers. v4 is random, v1 encodes time+MAC, v5 is deterministic from a namespace and name.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-5">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Generate
            </div>
            <div className="space-y-2.5">
              <button
                onClick={() => generate("v4")}
                className="w-full flex items-start gap-3 p-3 border border-slate-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-all group"
              >
                <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full mt-0.5 group-hover:bg-indigo-200">v4</span>
                <div className="text-left">
                  <div className="text-sm font-semibold text-slate-700">Random UUID</div>
                  <div className="text-xs text-slate-500">128-bit random — use for database keys, session IDs</div>
                </div>
              </button>
              <button
                onClick={() => generate("v1")}
                className="w-full flex items-start gap-3 p-3 border border-slate-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-all group"
              >
                <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full mt-0.5 group-hover:bg-amber-200">v1</span>
                <div className="text-left">
                  <div className="text-sm font-semibold text-slate-700">Time-based UUID</div>
                  <div className="text-xs text-slate-500">Encodes timestamp + MAC — sortable but leaks time</div>
                </div>
              </button>
              <div className="border border-slate-200 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">v5</span>
                  <span className="text-sm font-semibold text-slate-700">Name-based UUID</span>
                </div>
                <div className="text-xs text-slate-500 mb-2">Deterministic: same name always gives same UUID</div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={v5Name}
                    onChange={(e) => setV5Name(e.target.value)}
                    placeholder="name to hash"
                    className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 font-mono"
                  />
                  <button
                    onClick={() => generate("v5")}
                    className="text-xs bg-rose-100 hover:bg-rose-200 text-rose-700 font-semibold px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Generate
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Validate */}
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Validate
            </div>
            <input
              type="text"
              value={checkInput}
              onChange={(e) => setCheckInput(e.target.value)}
              placeholder="Paste a UUID to check..."
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            {checkResult && (
              <p className={`text-xs mt-1.5 font-semibold ${checkResult.startsWith("Valid") ? "text-emerald-600" : "text-rose-500"}`}>
                {checkResult.startsWith("Valid") ? "✓" : "✗"} {checkResult}
              </p>
            )}
          </div>
        </div>

        {/* Generated list */}
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Generated UUIDs {uuids.length > 0 && <span className="text-slate-400 font-normal">({uuids.length})</span>}
          </div>
          {uuids.length === 0 ? (
            <div className="text-sm text-slate-400 bg-slate-50 rounded-xl p-8 text-center">
              Click a button to generate UUIDs
            </div>
          ) : (
            <div className="space-y-1.5 max-h-96 overflow-y-auto">
              {uuids.map(({ id, ver, ts }) => (
                <div key={id} className="flex items-center gap-2 bg-white border border-slate-100 rounded-lg px-3 py-2 group">
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${
                    ver === "v4" ? "bg-indigo-100 text-indigo-700" :
                    ver === "v1" ? "bg-amber-100 text-amber-700" :
                    "bg-rose-100 text-rose-700"
                  }`}>{ver}</span>
                  <span className="text-xs font-mono text-slate-700 flex-1 truncate">{id}</span>
                  <span className="text-xs text-slate-400 flex-shrink-0 hidden group-hover:inline">{ts}</span>
                  <button
                    onClick={() => copy(id)}
                    className="text-xs text-slate-400 hover:text-indigo-600 transition-colors flex-shrink-0"
                  >
                    {copied === id ? "✓" : "⎘"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
