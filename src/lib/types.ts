export type Ecosystem = "pypi" | "npm";
export type Difficulty = 1 | 2 | 3; // 1=beginner, 2=intermediate, 3=advanced
export type ViewMode = "story" | "graph" | "tasks" | "demo";

// ─── Graph ───────────────────────────────────────────────────────────────────

export type NodeType = "class" | "function" | "module" | "concept" | "exception";

export interface GraphNode {
  id: string;
  type: NodeType;
  label: string;
  summary: string;
  signature?: string; // e.g. "get(url, **kwargs) -> Response"
  difficulty: Difficulty;
  tags?: string[];
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  label: "returns" | "contains" | "inherits" | "uses" | "depends_on";
}

export interface PackageGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// ─── Story ────────────────────────────────────────────────────────────────────

export interface Alternative {
  name: string;
  reason: string;
}

export interface PackageStory {
  problem: string;
  mental_model: string;
  when_to_use: string;
  when_not_to_use?: string;
  alternatives: Alternative[];
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export interface TaskStep {
  label: string;
  code: string;
  explanation?: string;
}

export interface Task {
  id: string;
  title: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  steps: TaskStep[];
}

// ─── Package ──────────────────────────────────────────────────────────────────

export interface PackageMeta {
  pypi_url?: string;
  npm_url?: string;
  repo_url: string;
  docs_url?: string;
  weekly_downloads: number;
  version: string;
  license?: string;
}

export interface Package {
  id: string;
  ecosystem: Ecosystem;
  name: string;
  summary: string;
  tags: string[];
  difficulty: Difficulty;
  story: PackageStory;
  graph: PackageGraph;
  tasks: Task[];
  meta: PackageMeta;
}
