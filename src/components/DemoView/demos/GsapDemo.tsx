"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

// ── Box animator ───────────────────────────────────────────────────────────────
function TimelinePanel() {
  const boxRef   = useRef<HTMLDivElement>(null);
  const tlRef    = useRef<gsap.core.Timeline | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!boxRef.current) return;

    tlRef.current = gsap.timeline({
      paused: true,
      onUpdate() {
        setProgress(Math.round((tlRef.current?.progress() ?? 0) * 100));
      },
      onComplete() { setPlaying(false); },
      onReverseComplete() { setPlaying(false); },
    })
      .to(boxRef.current, { x: 160, duration: 0.6, ease: "power2.out" })
      .to(boxRef.current, { rotate: 180, scale: 1.3, duration: 0.5, ease: "back.out(1.7)" })
      .to(boxRef.current, { backgroundColor: "#8b5cf6", duration: 0.3 }, "<")
      .to(boxRef.current, { y: -40, duration: 0.4, ease: "power1.out" })
      .to(boxRef.current, { y: 0, duration: 0.4, ease: "bounce.out" })
      .to(boxRef.current, { x: 0, rotate: 0, scale: 1, backgroundColor: "#6366f1", duration: 0.6, ease: "power2.inOut" });

    return () => { tlRef.current?.kill(); };
  }, []);

  function play() {
    if (!tlRef.current) return;
    if (tlRef.current.progress() >= 1) tlRef.current.restart();
    else tlRef.current.play();
    setPlaying(true);
  }

  function reverse() {
    tlRef.current?.reverse();
    setPlaying(true);
  }

  function pause() {
    tlRef.current?.pause();
    setPlaying(false);
  }

  function seek(v: number) {
    tlRef.current?.progress(v / 100).pause();
    setProgress(v);
    setPlaying(false);
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 text-sm">Timeline — play, pause, reverse, scrub</h3>
        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-mono">gsap.timeline()</span>
      </div>

      {/* Stage */}
      <div className="relative h-24 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden flex items-center px-6">
        <div
          ref={boxRef}
          className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-lg font-bold shadow-md"
          style={{ backgroundColor: "#6366f1" }}
        >
          G
        </div>
      </div>

      {/* Scrubber */}
      <div>
        <div className="flex justify-between text-[10px] text-slate-400 mb-1">
          <span>progress</span>
          <span className="tabular-nums">{progress}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={progress}
          onChange={(e) => seek(Number(e.target.value))}
          className="w-full accent-indigo-600"
        />
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <button
          onClick={play}
          className="flex-1 text-sm bg-indigo-600 hover:bg-indigo-700 text-white py-1.5 rounded-lg transition-colors"
        >
          ▶ Play
        </button>
        <button
          onClick={pause}
          disabled={!playing}
          className="flex-1 text-sm border border-slate-200 hover:border-slate-300 disabled:opacity-40 text-slate-600 py-1.5 rounded-lg transition-colors"
        >
          ⏸ Pause
        </button>
        <button
          onClick={reverse}
          className="flex-1 text-sm border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 text-slate-600 py-1.5 rounded-lg transition-colors"
        >
          ◀ Reverse
        </button>
      </div>

      <div className="rounded-lg bg-[#0d1117] p-3 text-xs font-mono text-slate-300 space-y-0.5">
        <div><span className="text-sky-400">const</span> tl = gsap.<span className="text-amber-400">timeline</span>{"({ paused: true })"}</div>
        <div>{"  "}.<span className="text-amber-400">to</span>(box, {"{ x: 160, ease: \"power2.out\" }"})</div>
        <div>{"  "}.<span className="text-amber-400">to</span>(box, {"{ rotate: 180, scale: 1.3 }"})</div>
        <div>{"  "}.<span className="text-amber-400">to</span>(box, {"{ y: -40 }"});</div>
        <div className="pt-1">tl.<span className="text-amber-400">play</span>() / .<span className="text-amber-400">reverse</span>() / .<span className="text-amber-400">progress</span>(0.5)</div>
      </div>
    </div>
  );
}

// ── Stagger panel ──────────────────────────────────────────────────────────────
function StaggerPanel() {
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [ease, setEase] = useState<string>("power2.out");
  const [stagger, setStagger] = useState(0.08);

  const EASES = ["power2.out", "back.out(1.7)", "elastic.out(1,0.3)", "bounce.out", "expo.out"];
  const COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe", "#ede9fe"];

  function animate() {
    const els = itemsRef.current.filter(Boolean) as HTMLDivElement[];
    gsap.fromTo(
      els,
      { opacity: 0, y: 30, scale: 0.8 },
      { opacity: 1, y: 0, scale: 1, duration: 0.5, ease, stagger }
    );
  }

  // animate on mount
  useEffect(() => { animate(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 text-sm">gsap.fromTo() with stagger</h3>
        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-mono">stagger</span>
      </div>

      {/* Stage */}
      <div className="flex items-end gap-2 h-20 px-2 py-3 bg-slate-50 border border-slate-200 rounded-xl">
        {COLORS.map((color, i) => (
          <div
            key={i}
            ref={(el) => { itemsRef.current[i] = el; }}
            className="flex-1 rounded-md"
            style={{ backgroundColor: color, height: `${40 + i * 8}px` }}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="space-y-3">
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
            Ease: <span className="text-slate-600 normal-case font-mono">{ease}</span>
          </label>
          <div className="flex flex-wrap gap-1.5">
            {EASES.map((e) => (
              <button
                key={e}
                onClick={() => setEase(e)}
                className={`text-xs px-2 py-0.5 rounded font-mono transition-colors ${
                  ease === e ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Stagger: <span className="text-slate-600 font-mono normal-case">{stagger.toFixed(2)}s</span>
          </label>
          <input
            type="range"
            min={0}
            max={0.3}
            step={0.01}
            value={stagger}
            onChange={(e) => setStagger(Number(e.target.value))}
            className="w-full accent-indigo-600"
          />
        </div>

        <button
          onClick={animate}
          className="w-full text-sm bg-indigo-600 hover:bg-indigo-700 text-white py-1.5 rounded-lg transition-colors"
        >
          Replay
        </button>
      </div>
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────────
export default function GsapDemo() {
  return (
    <div className="h-full overflow-auto p-6">
      <p className="text-sm text-slate-500 mb-5">
        GSAP animates any property on any element. A <code className="bg-slate-100 px-1 rounded text-xs">timeline</code> sequences
        tweens and exposes <code className="bg-slate-100 px-1 rounded text-xs">.play()</code>,{" "}
        <code className="bg-slate-100 px-1 rounded text-xs">.pause()</code>, and{" "}
        <code className="bg-slate-100 px-1 rounded text-xs">.progress()</code> — the scrub bar below drives it directly.
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TimelinePanel />
        <StaggerPanel />
      </div>
    </div>
  );
}
