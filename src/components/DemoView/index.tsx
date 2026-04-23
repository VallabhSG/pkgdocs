"use client";

import dynamic from "next/dynamic";
import type { Package } from "@/lib/types";
import { SCENARIOS } from "./scenarios";

const SimulatedDemo      = dynamic(() => import("./SimulatedDemo"),               { ssr: false });
const PretextDemo        = dynamic(() => import("./demos/PretextDemo"),            { ssr: false });
const ZodDemo            = dynamic(() => import("./demos/ZodDemo"),                { ssr: false });
const DayjsDemo          = dynamic(() => import("./demos/DayjsDemo"),              { ssr: false });
const UuidDemo           = dynamic(() => import("./demos/UuidDemo"),               { ssr: false });
const ImmerDemo          = dynamic(() => import("./demos/ImmerDemo"),              { ssr: false });
const LodashDemo         = dynamic(() => import("./demos/LodashDemo"),             { ssr: false });
const DateFnsDemo        = dynamic(() => import("./demos/DateFnsDemo"),            { ssr: false });
const ZustandDemo        = dynamic(() => import("./demos/ZustandDemo"),            { ssr: false });
const ReactHookFormDemo  = dynamic(() => import("./demos/ReactHookFormDemo"),      { ssr: false });
const FramerMotionDemo   = dynamic(() => import("./demos/FramerMotionDemo"),       { ssr: false });
const RechartsDemo       = dynamic(() => import("./demos/RechartsDemo"),            { ssr: false });
const JotaiDemo          = dynamic(() => import("./demos/JotaiDemo"),               { ssr: false });
const RxjsDemo           = dynamic(() => import("./demos/RxjsDemo"),                { ssr: false });
const AxiosDemo          = dynamic(() => import("./demos/AxiosDemo"),               { ssr: false });
const SwrDemo            = dynamic(() => import("./demos/SwrDemo"),                 { ssr: false });
const ReactQueryDemo     = dynamic(() => import("./demos/ReactQueryDemo"),          { ssr: false });
const GsapDemo           = dynamic(() => import("./demos/GsapDemo"),               { ssr: false });
const TailwindDemo       = dynamic(() => import("./demos/TailwindDemo"),            { ssr: false });
const VitestDemo         = dynamic(() => import("./demos/VitestDemo"),              { ssr: false });

// Packages with custom live demos
const LIVE: Record<string, React.ComponentType> = {
  pretext:          PretextDemo,
  zod:              ZodDemo,
  dayjs:            DayjsDemo,
  uuid:             UuidDemo,
  immer:            ImmerDemo,
  lodash:           LodashDemo,
  "date-fns":       DateFnsDemo,
  zustand:          ZustandDemo,
  "react-hook-form": ReactHookFormDemo,
  "framer-motion":  FramerMotionDemo,
  recharts:         RechartsDemo,
  jotai:            JotaiDemo,
  rxjs:             RxjsDemo,
  axios:            AxiosDemo,
  swr:              SwrDemo,
  "react-query":    ReactQueryDemo,
  gsap:             GsapDemo,
  tailwindcss:      TailwindDemo,
  vitest:           VitestDemo,
};

interface Props { pkg: Package }

export default function DemoView({ pkg }: Props) {
  const Live = LIVE[pkg.id];

  if (Live) {
    return (
      <div className="h-full overflow-auto">
        <div className="max-w-4xl mx-auto px-6 pt-6 pb-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase tracking-wide">
              Live
            </span>
            <h2 className="text-sm font-semibold text-slate-700">
              Interactive {pkg.name} playground
            </h2>
          </div>
        </div>
        <div className="max-w-4xl mx-auto">
          <Live />
        </div>
      </div>
    );
  }

  const scenarios = SCENARIOS[pkg.id];
  if (scenarios && scenarios.length > 0) {
    return (
      <div className="h-full overflow-auto">
        <div className="max-w-3xl mx-auto px-6 pt-6 pb-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase tracking-wide">
              Simulated
            </span>
            <h2 className="text-sm font-semibold text-slate-700">
              {pkg.name} — code + expected output
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            This is a Python/server package — code runs on your machine, not in the browser.
            Press Run to reveal the expected output.
          </p>
        </div>
        <div className="max-w-3xl mx-auto">
          <SimulatedDemo scenarios={scenarios} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center gap-4 text-slate-400">
      <div className="text-4xl">🚧</div>
      <p className="font-medium text-slate-500">Demo coming soon for {pkg.name}</p>
      <p className="text-sm max-w-xs">Check the Recipes tab for copy-paste code examples.</p>
    </div>
  );
}
