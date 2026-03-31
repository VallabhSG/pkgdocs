"use client";

import { useCallback, useMemo, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeTypes,
  Handle,
  Position,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { motion } from "motion/react";
import type { Package, GraphNode, NodeType } from "@/lib/types";

// ─── Node colour config ───────────────────────────────────────────────────────

const nodeTypeConfig: Record<NodeType, { bg: string; border: string; badge: string }> = {
  module: { bg: "#eef2ff", border: "#818cf8", badge: "MOD" },
  class: { bg: "#f0fdf4", border: "#4ade80", badge: "CLS" },
  function: { bg: "#fefce8", border: "#facc15", badge: "FN" },
  concept: { bg: "#fdf4ff", border: "#c084fc", badge: "IDX" },
  exception: { bg: "#fff1f2", border: "#fb7185", badge: "ERR" },
};

const difficultyDot = ["", "bg-emerald-400", "bg-amber-400", "bg-rose-400"];

// ─── Custom node component ────────────────────────────────────────────────────

function PkgNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as GraphNode & { highlighted?: boolean };
  const cfg = nodeTypeConfig[nodeData.type];

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{
        scale: selected || nodeData.highlighted ? 1.05 : 1,
        opacity: 1,
        boxShadow: selected
          ? "0 0 0 2px #6366f1, 0 4px 20px rgba(99,102,241,0.3)"
          : nodeData.highlighted
          ? "0 0 0 2px #f59e0b, 0 4px 20px rgba(245,158,11,0.2)"
          : "0 1px 4px rgba(0,0,0,0.08)",
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      style={{
        background: cfg.bg,
        border: `1.5px solid ${cfg.border}`,
        borderRadius: 10,
        padding: "10px 14px",
        minWidth: 130,
        maxWidth: 200,
        cursor: "pointer",
      }}
    >
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <div className="flex items-center gap-1.5 mb-1">
        <span
          style={{ borderColor: cfg.border }}
          className="text-[9px] font-bold font-mono border rounded px-1 py-0.5 text-slate-600"
        >
          {cfg.badge}
        </span>
        <span
          className={`w-2 h-2 rounded-full ${difficultyDot[nodeData.difficulty as number]}`}
        />
      </div>
      <div className="text-sm font-semibold text-slate-800 font-mono leading-tight mb-1">
        {nodeData.label}
      </div>
      {nodeData.signature && (
        <div className="text-[10px] text-slate-400 font-mono leading-tight mb-1 truncate">
          {nodeData.signature}
        </div>
      )}
      <div className="text-[11px] text-slate-500 leading-snug">{nodeData.summary}</div>
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </motion.div>
  );
}

const nodeTypes: NodeTypes = { pkgNode: PkgNode };

// ─── Layout: simple hierarchical by type ─────────────────────────────────────

function buildLayout(pkg: Package): { nodes: Node[]; edges: Edge[] } {
  const typeOrder: NodeType[] = ["module", "class", "function", "concept", "exception"];
  const groups: Record<string, GraphNode[]> = {};

  for (const n of pkg.graph.nodes) {
    if (!groups[n.type]) groups[n.type] = [];
    groups[n.type].push(n);
  }

  const nodes: Node[] = [];
  let y = 0;

  for (const type of typeOrder) {
    const group = groups[type] ?? [];
    if (!group.length) continue;
    const totalW = group.length * 220;
    group.forEach((n, i) => {
      const x = i * 220 - totalW / 2 + 110;
      nodes.push({
        id: n.id,
        type: "pkgNode",
        position: { x, y },
        data: { ...n },
      });
    });
    y += 180;
  }

  const edges: Edge[] = pkg.graph.edges.map((e) => ({
    id: e.id,
    source: e.from,
    target: e.to,
    label: e.label,
    type: "smoothstep",
    animated: e.label === "returns",
    style: {
      stroke:
        e.label === "returns"
          ? "#6366f1"
          : e.label === "inherits"
          ? "#fb7185"
          : e.label === "contains"
          ? "#94a3b8"
          : "#cbd5e1",
      strokeWidth: e.label === "returns" ? 2 : 1.5,
    },
    labelStyle: { fontSize: 10, fill: "#94a3b8" },
    labelBgStyle: { fill: "#f8fafc", opacity: 0.9 },
  }));

  return { nodes, edges };
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  pkg: Package;
  focusNodeId?: string | null;
}

export default function ApiMapView({ pkg, focusNodeId }: Props) {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => buildLayout(pkg),
    [pkg]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  // Highlight focused node
  useEffect(() => {
    if (!focusNodeId) return;
    setNodes((ns) =>
      ns.map((n) => ({
        ...n,
        data: { ...n.data, highlighted: n.id === focusNodeId },
      }))
    );
  }, [focusNodeId, setNodes]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setNodes((ns) =>
      ns.map((n) => ({
        ...n,
        data: { ...n.data, highlighted: n.id === node.id },
      }))
    );
  }, [setNodes]);

  return (
    <div style={{ height: "100%", width: "100%" }} className="rounded-xl overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
        maxZoom={2}
      >
        <Background color="#e2e8f0" gap={20} />
        <Controls />
        <MiniMap
          nodeColor={(n) => {
            const type = (n.data as unknown as GraphNode).type;
            return nodeTypeConfig[type]?.border ?? "#94a3b8";
          }}
          maskColor="rgba(248,250,252,0.8)"
        />
      </ReactFlow>

      {/* Legend */}
      <div className="absolute bottom-16 left-4 bg-white border border-slate-200 rounded-xl p-3 shadow-sm text-xs space-y-1.5">
        {(Object.entries(nodeTypeConfig) as [NodeType, (typeof nodeTypeConfig)[NodeType]][]).map(
          ([type, cfg]) => (
            <div key={type} className="flex items-center gap-2">
              <span
                style={{ background: cfg.bg, borderColor: cfg.border }}
                className="w-3 h-3 rounded border"
              />
              <span className="text-slate-600 capitalize">{type}</span>
            </div>
          )
        )}
        <div className="border-t border-slate-100 pt-1.5 mt-1.5 space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-4 h-0.5 bg-indigo-400 inline-block" />
            <span className="text-slate-500">returns (animated)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-0.5 bg-rose-400 inline-block" />
            <span className="text-slate-500">inherits</span>
          </div>
        </div>
      </div>
    </div>
  );
}
