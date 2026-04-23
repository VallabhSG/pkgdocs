"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// ── Sample data ────────────────────────────────────────────────────────────────
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

function makeBarData() {
  return MONTHS.map((month) => ({
    month,
    revenue: Math.floor(Math.random() * 8000) + 2000,
    costs: Math.floor(Math.random() * 4000) + 1000,
  }));
}

function makeLineData() {
  let value = 50;
  return MONTHS.map((month) => {
    value = Math.max(10, Math.min(100, value + (Math.random() - 0.45) * 20));
    return { month, score: Math.round(value) };
  });
}

const PIE_DATA = [
  { name: "Direct", value: 38 },
  { name: "Organic", value: 27 },
  { name: "Social", value: 19 },
  { name: "Referral", value: 16 },
];
const PIE_COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd"];

// ── Bar chart panel ────────────────────────────────────────────────────────────
function BarPanel() {
  const [data, setData] = useState(makeBarData);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 text-sm">Revenue vs Costs</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-mono">BarChart</span>
          <button
            onClick={() => setData(makeBarData())}
            className="text-xs border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 text-slate-500 px-2 py-0.5 rounded-lg transition-colors"
          >
            Randomize
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
            formatter={(v) => [`$${Number(v).toLocaleString()}`, undefined]}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
          <Bar dataKey="costs" fill="#a78bfa" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Line chart panel ───────────────────────────────────────────────────────────
function LinePanel() {
  const [data, setData] = useState(makeLineData);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 text-sm">NPS Score trend</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-mono">LineChart</span>
          <button
            onClick={() => setData(makeLineData())}
            className="text-xs border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 text-slate-500 px-2 py-0.5 rounded-lg transition-colors"
          >
            Regenerate
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#6366f1"
            strokeWidth={2}
            dot={{ fill: "#6366f1", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Pie chart panel ────────────────────────────────────────────────────────────
function PiePanel() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 text-sm">Traffic sources</h3>
        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-mono">PieChart</span>
      </div>

      <div className="flex items-center gap-4">
        <ResponsiveContainer width="60%" height={180}>
          <PieChart>
            <Pie
              data={PIE_DATA}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={75}
              dataKey="value"
              onMouseEnter={(_, i) => setActive(PIE_DATA[i].name)}
              onMouseLeave={() => setActive(null)}
            >
              {PIE_DATA.map((entry, i) => (
                <Cell
                  key={entry.name}
                  fill={PIE_COLORS[i]}
                  opacity={active === null || active === entry.name ? 1 : 0.4}
                  style={{ cursor: "pointer", transition: "opacity 0.2s" }}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
              formatter={(v) => [`${v}%`, "Share"]}
            />
          </PieChart>
        </ResponsiveContainer>

        <ul className="flex-1 space-y-2">
          {PIE_DATA.map((entry, i) => (
            <li
              key={entry.name}
              className="flex items-center gap-2 text-sm"
              onMouseEnter={() => setActive(entry.name)}
              onMouseLeave={() => setActive(null)}
            >
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ background: PIE_COLORS[i] }}
              />
              <span className={`flex-1 transition-colors ${active === entry.name ? "text-slate-900 font-medium" : "text-slate-600"}`}>
                {entry.name}
              </span>
              <span className="font-semibold text-slate-800 tabular-nums">{entry.value}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────────
export default function RechartsDemo() {
  return (
    <div className="h-full overflow-auto p-6">
      <p className="text-sm text-slate-500 mb-5">
        Recharts wraps D3 in composable React components.
        Pass <code className="bg-slate-100 px-1 rounded text-xs">data</code> to the chart root and declare each axis/series as a child —
        the library handles scaling, layout, and responsiveness automatically.
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarPanel />
        <LinePanel />
        <div className="lg:col-span-2">
          <PiePanel />
        </div>
      </div>
    </div>
  );
}
