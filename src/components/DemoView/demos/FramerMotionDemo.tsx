"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

type Preset = {
  label: string;
  initial: Record<string, number | string>;
  animate: Record<string, number | string>;
  transition: Record<string, number | string>;
};

const PRESETS: Preset[] = [
  {
    label: "Fade in",
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.5 },
  },
  {
    label: "Slide up",
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: "easeOut" },
  },
  {
    label: "Scale in",
    initial: { opacity: 0, scale: 0.6 },
    animate: { opacity: 1, scale: 1 },
    transition: { type: "spring", stiffness: 300, damping: 20 },
  },
  {
    label: "Bounce",
    initial: { opacity: 0, y: -60 },
    animate: { opacity: 1, y: 0 },
    transition: { type: "spring", stiffness: 400, damping: 10 },
  },
  {
    label: "Slide left",
    initial: { opacity: 0, x: -60 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.35 },
  },
  {
    label: "Flip",
    initial: { opacity: 0, rotateY: 90 },
    animate: { opacity: 1, rotateY: 0 },
    transition: { duration: 0.45 },
  },
];

const STAGGER_ITEMS = ["Alpha", "Beta", "Gamma", "Delta", "Epsilon"];

export default function FramerMotionDemo() {
  const [preset, setPreset] = useState<Preset>(PRESETS[0]);
  const [key, setKey] = useState(0);
  const [listKey, setListKey] = useState(0);
  const [items, setItems] = useState(STAGGER_ITEMS);

  function replay() {
    setKey((k) => k + 1);
  }

  function shuffleList() {
    setItems((prev) => [...prev].sort(() => Math.random() - 0.5));
    setListKey((k) => k + 1);
  }

  function removeItem(item: string) {
    setItems((prev) => prev.filter((i) => i !== item));
  }

  function restoreItems() {
    setItems(STAGGER_ITEMS);
    setListKey((k) => k + 1);
  }

  return (
    <div className="h-full overflow-auto p-6">
      <p className="text-sm text-slate-500 mb-5">
        Framer Motion (now <code className="bg-slate-100 px-1 rounded text-xs">motion</code>) wraps HTML elements with
        animation primitives. Declare <code className="bg-slate-100 px-1 rounded text-xs">initial</code> and{" "}
        <code className="bg-slate-100 px-1 rounded text-xs">animate</code> — Motion handles the rest.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Preset playground */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-slate-800 text-sm">Animation presets</h3>

          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => { setPreset(p); setKey((k) => k + 1); }}
                className={`text-xs px-2.5 py-1 rounded-full transition-all ${
                  preset.label === p.label
                    ? "bg-fuchsia-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Stage */}
          <div className="h-32 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center overflow-hidden">
            <motion.div
              key={key}
              initial={preset.initial}
              animate={preset.animate}
              transition={preset.transition}
              className="bg-fuchsia-600 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-lg"
            >
              {preset.label}
            </motion.div>
          </div>

          <button
            onClick={replay}
            className="w-full text-xs border border-slate-200 hover:border-fuchsia-300 hover:text-fuchsia-700 text-slate-600 py-2 rounded-lg transition-colors"
          >
            ↺ Replay
          </button>

          {/* Code */}
          <div className="rounded-xl bg-[#0d1117] p-4 text-xs font-mono text-slate-300 overflow-x-auto">
            <div className="text-slate-500 mb-1">{`// motion/react`}</div>
            <div>
              <span className="text-purple-400">&lt;motion.div</span>
            </div>
            <div className="pl-4">
              <span className="text-sky-400">initial</span>
              <span className="text-slate-400">{"={"}</span>
              <span className="text-emerald-400">{JSON.stringify(preset.initial)}</span>
              <span className="text-slate-400">{"}"}</span>
            </div>
            <div className="pl-4">
              <span className="text-sky-400">animate</span>
              <span className="text-slate-400">{"={"}</span>
              <span className="text-emerald-400">{JSON.stringify(preset.animate)}</span>
              <span className="text-slate-400">{"}"}</span>
            </div>
            <div className="pl-4">
              <span className="text-sky-400">transition</span>
              <span className="text-slate-400">{"={"}</span>
              <span className="text-amber-400">{JSON.stringify(preset.transition)}</span>
              <span className="text-slate-400">{"}"}</span>
            </div>
            <div>
              <span className="text-purple-400">/&gt;</span>
            </div>
          </div>
        </div>

        {/* List animations */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 text-sm">AnimatePresence — list</h3>
            <span className="text-xs text-slate-400">Exit animations on remove</span>
          </div>

          <AnimatePresence mode="popLayout" key={listKey}>
            {items.map((item) => (
              <motion.div
                key={item}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
                transition={{ duration: 0.25 }}
                className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-lg px-4 py-2.5"
              >
                <span className="text-sm text-slate-700 font-medium">{item}</span>
                <button
                  onClick={() => removeItem(item)}
                  className="text-xs text-slate-300 hover:text-rose-400 transition-colors"
                >
                  ✕
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {items.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-slate-400 text-center py-4"
            >
              All removed
            </motion.div>
          )}

          <div className="flex gap-2">
            <button
              onClick={shuffleList}
              className="flex-1 text-xs border border-slate-200 hover:border-fuchsia-300 hover:text-fuchsia-700 text-slate-600 py-2 rounded-lg transition-colors"
            >
              Shuffle
            </button>
            <button
              onClick={restoreItems}
              className="flex-1 text-xs border border-slate-200 hover:border-slate-300 text-slate-600 py-2 rounded-lg transition-colors"
            >
              Restore
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
