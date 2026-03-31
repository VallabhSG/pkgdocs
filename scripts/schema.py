"""
Canonical output schema — mirrors public/data/packages/*.json
"""
from dataclasses import dataclass, field
from typing import Optional
import json


@dataclass
class Alternative:
    name: str
    reason: str


@dataclass
class PackageStory:
    problem: str = ""
    mental_model: str = ""
    when_to_use: str = ""
    when_not_to_use: str = ""
    alternatives: list[Alternative] = field(default_factory=list)


@dataclass
class GraphNode:
    id: str
    type: str  # module | class | function | concept | exception
    label: str
    summary: str
    difficulty: int = 1
    signature: str = ""
    tags: list[str] = field(default_factory=list)


@dataclass
class GraphEdge:
    id: str
    from_node: str
    to_node: str
    label: str  # contains | returns | uses | inherits | depends_on


@dataclass
class TaskStep:
    label: str
    code: str
    explanation: str = ""


@dataclass
class Task:
    id: str
    title: str
    difficulty: str  # beginner | intermediate | advanced
    steps: list[TaskStep] = field(default_factory=list)


@dataclass
class PackageMeta:
    repo_url: str = ""
    pypi_url: str = ""
    docs_url: str = ""
    weekly_downloads: int = 0
    version: str = ""
    license: str = ""


@dataclass
class Package:
    id: str
    ecosystem: str
    name: str
    summary: str
    tags: list[str]
    difficulty: int
    story: PackageStory
    graph_nodes: list[GraphNode]
    graph_edges: list[GraphEdge]
    tasks: list[Task]
    meta: PackageMeta

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "ecosystem": self.ecosystem,
            "name": self.name,
            "summary": self.summary,
            "tags": self.tags,
            "difficulty": self.difficulty,
            "story": {
                "problem": self.story.problem,
                "mental_model": self.story.mental_model,
                "when_to_use": self.story.when_to_use,
                "when_not_to_use": self.story.when_not_to_use,
                "alternatives": [
                    {"name": a.name, "reason": a.reason}
                    for a in self.story.alternatives
                ],
            },
            "graph": {
                "nodes": [
                    {
                        "id": n.id,
                        "type": n.type,
                        "label": n.label,
                        "summary": n.summary,
                        "difficulty": n.difficulty,
                        **({"signature": n.signature} if n.signature else {}),
                        **({"tags": n.tags} if n.tags else {}),
                    }
                    for n in self.graph_nodes
                ],
                "edges": [
                    {
                        "id": e.id,
                        "from": e.from_node,
                        "to": e.to_node,
                        "label": e.label,
                    }
                    for e in self.graph_edges
                ],
            },
            "tasks": [
                {
                    "id": t.id,
                    "title": t.title,
                    "difficulty": t.difficulty,
                    "steps": [
                        {
                            "label": s.label,
                            "code": s.code,
                            **({"explanation": s.explanation} if s.explanation else {}),
                        }
                        for s in t.steps
                    ],
                }
                for t in self.tasks
            ],
            "meta": {
                "pypi_url": self.meta.pypi_url,
                "repo_url": self.meta.repo_url,
                "docs_url": self.meta.docs_url,
                "weekly_downloads": self.meta.weekly_downloads,
                "version": self.meta.version,
                "license": self.meta.license,
            },
        }

    def to_json(self, indent: int = 2) -> str:
        return json.dumps(self.to_dict(), indent=indent, ensure_ascii=False)
