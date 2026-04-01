"use client";

import { useState } from "react";
import chunk from "lodash/chunk";
import uniq from "lodash/uniq";
import groupBy from "lodash/groupBy";
import sortBy from "lodash/sortBy";
import flatten from "lodash/flatten";
import debounce from "lodash/debounce";
import pick from "lodash/pick";
import omit from "lodash/omit";

const DEMO_DATA = {
  numbers: [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5],
  words: ["apple", "banana", "cherry", "apple", "date", "banana", "elderberry"],
  nested: [[1, 2], [3, 4], [5, [6, 7]]],
  users: [
    { name: "Alice", dept: "Eng", level: 3 },
    { name: "Bob", dept: "HR", level: 2 },
    { name: "Charlie", dept: "Eng", level: 2 },
    { name: "Diana", dept: "HR", level: 3 },
    { name: "Eve", dept: "Eng", level: 1 },
  ],
};

type OpKey = "chunk" | "uniq" | "sortBy" | "groupBy" | "flatten" | "pick" | "omit";

const OPS: { id: OpKey; label: string; description: string; dataKey: keyof typeof DEMO_DATA }[] = [
  { id: "chunk", label: "_.chunk(arr, 3)", description: "Split array into chunks of size 3", dataKey: "numbers" },
  { id: "uniq", label: "_.uniq(arr)", description: "Remove duplicate values", dataKey: "words" },
  { id: "sortBy", label: "_.sortBy(users, 'level')", description: "Sort objects by property", dataKey: "users" },
  { id: "groupBy", label: "_.groupBy(users, 'dept')", description: "Group objects by key value", dataKey: "users" },
  { id: "flatten", label: "_.flatten(arr)", description: "Flatten one level of nesting", dataKey: "nested" },
  { id: "pick", label: "_.pick(user, ['name','dept'])", description: "Pick specific keys from object", dataKey: "users" },
  { id: "omit", label: "_.omit(user, ['level'])", description: "Omit specific keys from object", dataKey: "users" },
];

function runOp(op: OpKey) {
  switch (op) {
    case "chunk": return chunk(DEMO_DATA.numbers, 3);
    case "uniq": return uniq(DEMO_DATA.words);
    case "sortBy": return sortBy(DEMO_DATA.users, "level");
    case "groupBy": return groupBy(DEMO_DATA.users, "dept");
    case "flatten": return flatten(DEMO_DATA.nested);
    case "pick": return DEMO_DATA.users.map((u) => pick(u, ["name", "dept"]));
    case "omit": return DEMO_DATA.users.map((u) => omit(u, ["level"]));
  }
}

export default function LodashDemo() {
  const [active, setActive] = useState<OpKey>("chunk");

  const op = OPS.find((o) => o.id === active)!;
  const input = DEMO_DATA[op.dataKey];
  const result = runOp(active);

  return (
    <div className="h-full overflow-auto p-6">
      <p className="text-sm text-slate-500 mb-5">
        Lodash is the standard library JavaScript never had — 200+ utility functions for arrays, objects, and collections.
        Import only what you need: <code className="bg-slate-100 px-1 rounded">import chunk from 'lodash/chunk'</code>
      </p>

      <div className="flex flex-wrap gap-1.5 mb-5">
        {OPS.map((o) => (
          <button
            key={o.id}
            onClick={() => setActive(o.id)}
            className={`text-xs font-mono px-3 py-1.5 rounded-lg transition-all ${
              active === o.id
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {o.id}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Input */}
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Input data
          </div>
          <div className="rounded-xl bg-[#0d1117] border border-slate-700 p-4">
            <div className="text-xs text-slate-500 font-mono mb-2">{op.description}</div>
            <div className="text-xs font-semibold text-slate-400 mb-1 font-mono">// {op.label}</div>
            <pre className="text-sm font-mono text-slate-300 whitespace-pre-wrap break-all">
              {JSON.stringify(input, null, 2)}
            </pre>
          </div>
        </div>

        {/* Output */}
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Result
          </div>
          <div className="rounded-xl bg-emerald-950 border border-emerald-900 p-4">
            <div className="text-xs text-emerald-600 font-mono mb-2">{op.label}</div>
            <pre className="text-sm font-mono text-emerald-300 whitespace-pre-wrap break-all">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        </div>
      </div>

      {/* Tree-shaking note */}
      <div className="mt-5 rounded-xl bg-amber-50 border border-amber-100 p-4 text-xs text-amber-700">
        <span className="font-semibold">Bundle tip:</span> Import individual functions to keep bundle size minimal:
        <code className="block mt-1 bg-amber-100 rounded px-3 py-1.5 font-mono">
          import chunk from 'lodash/chunk'; &nbsp;// ~1KB<br />
          import {"{ chunk }"} from 'lodash'; &nbsp;&nbsp;&nbsp;&nbsp;// ~72KB (whole library)
        </code>
      </div>
    </div>
  );
}
