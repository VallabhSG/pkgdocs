"""
LLM enrichment layer — fills in story fields and node summaries
using the Claude API. Called only when --enrich flag is passed.

Requires ANTHROPIC_API_KEY in environment or .env.local.
"""
import json
import os
import re
from pathlib import Path

import anthropic
from dotenv import load_dotenv

from schema import Package, PackageStory, Alternative, GraphNode

# Load .env.local from project root
load_dotenv(Path(__file__).parent.parent / ".env.local")


SYSTEM_PROMPT = """You are a technical writer for pkgdocs — a visual, interactive
documentation companion for software packages.

Given raw package metadata and a README excerpt, return a JSON object with enriched
documentation fields. Be concise, opinionated, and developer-focused.
Write for three audiences: beginners (clear analogies), intermediates (API focus),
advanced (patterns and tradeoffs).

Return ONLY valid JSON — no markdown fences, no explanation."""

USER_TEMPLATE = """Package: {name} ({ecosystem})
PyPI summary: {summary}
Tags: {tags}
README excerpt (first 3000 chars):
---
{readme}
---
Current graph nodes (ids only): {node_ids}

Return JSON with this exact shape:
{{
  "story": {{
    "problem": "2-3 sentences: what painful problem did this package solve?",
    "mental_model": "1-2 sentences: the core intuition — use a concrete analogy",
    "when_to_use": "1-2 sentences: concrete scenarios where this is the right choice",
    "when_not_to_use": "1-2 sentences: when you should reach for something else",
    "alternatives": [
      {{"name": "package-name", "reason": "one sentence why you'd pick it instead"}}
    ]
  }},
  "node_summaries": {{
    "<node_id>": "one sentence description of this API symbol"
  }},
  "suggested_tags": ["tag1", "tag2"]
}}

Rules:
- alternatives: 2-4 items, only real packages
- node_summaries: only for nodes that need a better description (skip if good already)
- suggested_tags: only add tags not already present, max 3
- all text fields: plain prose, no markdown, no backticks around package names
- when_not_to_use: be honest about real limitations, not generic disclaimers"""


def _clean_readme(text: str, max_chars: int = 3000) -> str:
    """Strip badge lines and leading blank lines, then truncate."""
    badge_re = re.compile(r"^\s*\[!?\[.*?\]\(.*?\)\]\(.*?\)\s*$|^\s*\[!\[.*?\]\(.*?\)\s*$")
    lines = []
    for line in text.splitlines():
        if badge_re.match(line):
            continue
        # Also drop bare image/link-only lines like [](url)
        if re.match(r"^\s*\[.*?\]\(.*?\)\s*$", line) and len(line.strip()) < 120:
            continue
        lines.append(line)
    cleaned = "\n".join(lines).strip()
    return cleaned[:max_chars]


def enrich(pkg: Package, readme_text: str, verbose: bool = False) -> Package:
    """
    Call Claude to enrich story fields and node summaries.
    Returns a new Package with enriched fields merged in.
    Falls back to original if API call fails.
    """
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        if verbose:
            print("  [enrich] ANTHROPIC_API_KEY not set — skipping enrichment")
        return pkg

    client = anthropic.Anthropic(api_key=api_key)

    node_ids = [n.id for n in pkg.graph_nodes if n.id != pkg.id]
    readme_excerpt = _clean_readme(readme_text) if readme_text else "(no README available)"

    user_msg = USER_TEMPLATE.format(
        name=pkg.name,
        ecosystem=pkg.ecosystem,
        summary=pkg.summary,
        tags=", ".join(pkg.tags),
        readme=readme_excerpt,
        node_ids=", ".join(node_ids[:20]),
    )

    try:
        if verbose:
            print(f"  [enrich] Calling Claude for {pkg.name}...")

        message = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=1500,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": user_msg}],
        )

        raw = message.content[0].text.strip()

        # Strip accidental markdown fences
        raw = re.sub(r"^```(?:json)?\s*", "", raw)
        raw = re.sub(r"\s*```$", "", raw)

        data = json.loads(raw)

    except json.JSONDecodeError as e:
        if verbose:
            print(f"  [enrich] JSON parse error: {e} — skipping enrichment")
        return pkg
    except Exception as e:
        if verbose:
            print(f"  [enrich] API error: {e} — skipping enrichment")
        return pkg

    # ── Merge story ───────────────────────────────────────────────────────────
    story_data = data.get("story", {})
    enriched_story = PackageStory(
        problem=story_data.get("problem") or pkg.story.problem,
        mental_model=story_data.get("mental_model") or pkg.story.mental_model,
        when_to_use=story_data.get("when_to_use") or pkg.story.when_to_use,
        when_not_to_use=story_data.get("when_not_to_use") or pkg.story.when_not_to_use,
        alternatives=[
            Alternative(name=a["name"], reason=a["reason"])
            for a in story_data.get("alternatives", [])
            if a.get("name") and a.get("reason")
        ] or pkg.story.alternatives,
    )

    # ── Merge node summaries ──────────────────────────────────────────────────
    node_summaries: dict[str, str] = data.get("node_summaries", {})
    enriched_nodes = []
    for node in pkg.graph_nodes:
        if node.id in node_summaries:
            enriched_nodes.append(GraphNode(
                id=node.id,
                type=node.type,
                label=node.label,
                summary=node_summaries[node.id],
                difficulty=node.difficulty,
                signature=node.signature,
                tags=node.tags,
            ))
        else:
            enriched_nodes.append(node)

    # ── Merge suggested tags ──────────────────────────────────────────────────
    new_tags = data.get("suggested_tags", [])
    merged_tags = list(dict.fromkeys(pkg.tags + [t for t in new_tags if t not in pkg.tags]))[:10]

    if verbose:
        filled = sum(1 for f in [
            enriched_story.problem, enriched_story.mental_model,
            enriched_story.when_to_use, enriched_story.when_not_to_use
        ] if f)
        print(f"  [enrich] OK — {filled}/4 story fields, "
              f"{len(node_summaries)} node summaries, "
              f"{len(new_tags)} new tags")

    return Package(
        id=pkg.id,
        ecosystem=pkg.ecosystem,
        name=pkg.name,
        summary=pkg.summary,
        tags=merged_tags,
        difficulty=pkg.difficulty,
        story=enriched_story,
        graph_nodes=enriched_nodes,
        graph_edges=pkg.graph_edges,
        tasks=pkg.tasks,
        meta=pkg.meta,
    )
