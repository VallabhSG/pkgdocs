"use client";

import { useEffect, useState } from "react";

export default function CmdKTrigger() {
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().includes("MAC"));
  }, []);

  const open = () => {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }));
  };

  return (
    <button
      onClick={open}
      className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg px-3 py-1.5 transition-colors group"
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
      </svg>
      <span className="text-slate-500 group-hover:text-slate-700 transition-colors">Search packages…</span>
      <span className="flex items-center gap-0.5 ml-1">
        <kbd className="text-slate-400 font-mono">{isMac ? "⌘" : "Ctrl"}</kbd>
        <kbd className="text-slate-400 font-mono">K</kbd>
      </span>
    </button>
  );
}
