"""
Build a package graph from extracted API symbols and metadata.
"""
import re
from schema import GraphNode, GraphEdge


# Map Python naming conventions to node types
def infer_node_type(name: str, kind: str) -> str:
    if kind == "class":
        return "class"
    if kind == "function":
        return "function"
    # Heuristic from name
    if name[0].isupper():
        if "Error" in name or "Exception" in name or "Warning" in name:
            return "exception"
        return "class"
    return "function"


def infer_difficulty(name: str, node_type: str, idx: int) -> int:
    """Simple heuristic: first few exports are beginner, later ones more advanced."""
    if node_type == "exception":
        return 2
    if idx < 3:
        return 1
    if idx < 7:
        return 2
    return 3


def build_graph(
    package_name: str,
    symbols: list[dict],
    readme_sections: list,
) -> tuple[list[GraphNode], list[GraphEdge]]:
    """
    Build nodes and edges from extracted symbols.
    Always starts with a module node for the package itself.
    """
    nodes: list[GraphNode] = []
    edges: list[GraphEdge] = []

    # Module root node
    module_id = package_name.replace("-", "_")
    nodes.append(
        GraphNode(
            id=module_id,
            type="module",
            label=package_name,
            summary=f"Top-level module. Import as `import {module_id}` or `from {module_id} import ...`",
            difficulty=1,
            tags=["entry-point"],
        )
    )

    seen_ids = {module_id}
    edge_idx = 1

    for idx, sym in enumerate(symbols[:15]):
        name = sym["name"]
        kind = sym.get("kind", "unknown")

        # Skip private, dunder, and noise
        if name.startswith("_") or name in ("TYPE_CHECKING", "annotations"):
            continue

        node_type = infer_node_type(name, kind)
        node_id = name
        if node_id in seen_ids:
            continue
        seen_ids.add(node_id)

        # Try to find a description in the README for this symbol
        summary = _find_symbol_description(name, readme_sections)

        nodes.append(
            GraphNode(
                id=node_id,
                type=node_type,
                label=name,
                summary=summary or f"{node_type.capitalize()} exported from {package_name}.",
                difficulty=infer_difficulty(name, node_type, idx),
            )
        )

        # Edge: module contains this node
        edges.append(
            GraphEdge(
                id=f"e{edge_idx}",
                from_node=module_id,
                to_node=node_id,
                label="contains",
            )
        )
        edge_idx += 1

    return nodes, edges


def _find_symbol_description(name: str, sections: list) -> str:
    """Search README sections for a one-liner description of a symbol."""
    pattern = re.compile(
        rf"`{re.escape(name)}`[:\s\-–—]+([^\n.]+)", re.IGNORECASE
    )
    for section in sections:
        m = pattern.search(section.content)
        if m:
            text = m.group(1).strip().rstrip(".,;")
            if 10 < len(text) < 200:
                return text
    return ""
