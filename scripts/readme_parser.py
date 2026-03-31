"""
Parse a README.md into structured sections and extract tasks/story fields.
"""
import re
from dataclasses import dataclass, field


@dataclass
class Section:
    heading: str
    level: int
    content: str
    code_blocks: list[str] = field(default_factory=list)


def parse_sections(markdown: str) -> list[Section]:
    """Split markdown into heading-delimited sections."""
    sections = []
    current_heading = "Introduction"
    current_level = 1
    current_lines: list[str] = []

    for line in markdown.splitlines():
        m = re.match(r"^(#{1,4})\s+(.+)", line)
        if m:
            if current_lines:
                content = "\n".join(current_lines).strip()
                sections.append(
                    Section(
                        heading=current_heading,
                        level=current_level,
                        content=content,
                        code_blocks=extract_code_blocks(content),
                    )
                )
            current_heading = m.group(2).strip()
            current_level = len(m.group(1))
            current_lines = []
        else:
            current_lines.append(line)

    if current_lines:
        content = "\n".join(current_lines).strip()
        sections.append(
            Section(
                heading=current_heading,
                level=current_level,
                content=content,
                code_blocks=extract_code_blocks(content),
            )
        )
    return sections


def extract_code_blocks(text: str) -> list[str]:
    """Extract fenced code blocks (```...```)."""
    return re.findall(r"```(?:python|py|bash|sh)?\n(.*?)```", text, re.DOTALL)


def clean_text(text: str, max_chars: int = 400) -> str:
    """Strip markdown syntax and truncate."""
    # Remove badges
    text = re.sub(r"!\[.*?\]\(.*?\)", "", text)
    # Remove links but keep text
    text = re.sub(r"\[([^\]]+)\]\([^\)]+\)", r"\1", text)
    # Remove inline code backticks
    text = re.sub(r"`([^`]+)`", r"\1", text)
    # Remove HTML tags
    text = re.sub(r"<[^>]+>", "", text)
    # Collapse whitespace
    text = re.sub(r"\n{3,}", "\n\n", text).strip()
    if len(text) > max_chars:
        text = text[:max_chars].rsplit(" ", 1)[0] + "…"
    return text


# Heading keywords for matching sections
PROBLEM_KEYWORDS = {"why", "motivation", "problem", "background", "about", "what", "overview"}
INSTALL_KEYWORDS = {"install", "installation", "getting started", "quickstart", "quick start", "setup"}
USAGE_KEYWORDS = {"usage", "use", "example", "examples", "basic usage", "tutorial", "guide"}
ALT_KEYWORDS = {"comparison", "alternative", "versus", "vs", "similar", "related"}
FEATURE_KEYWORDS = {"feature", "features", "highlights", "capabilities"}


def heading_matches(heading: str, keywords: set[str]) -> bool:
    h = heading.lower()
    return any(k in h for k in keywords)


def extract_story_fields(sections: list[Section]) -> dict:
    """
    Heuristically extract story fields from README sections.
    Returns partial story dict.
    """
    problem = ""
    mental_model = ""
    when_to_use = ""
    alternatives: list[dict] = []

    # Intro / first section with real text → problem
    for s in sections[:3]:
        cleaned = clean_text(s.content, max_chars=500)
        if len(cleaned) > 80:
            problem = cleaned
            break

    # Look for feature/highlights section → mental model
    for s in sections:
        if heading_matches(s.heading, FEATURE_KEYWORDS | {"design", "philosophy"}):
            mental_model = clean_text(s.content, max_chars=400)
            break

    # Look for usage section → when_to_use
    for s in sections:
        if heading_matches(s.heading, USAGE_KEYWORDS | {"when", "use case", "use cases"}):
            when_to_use = clean_text(s.content, max_chars=350)
            break

    # Alternatives section
    for s in sections:
        if heading_matches(s.heading, ALT_KEYWORDS):
            # Extract package name patterns like "**requests**" or "- requests:"
            names = re.findall(
                r"\*\*([a-zA-Z0-9_\-]+)\*\*|^[-*]\s+`?([a-zA-Z0-9_\-]+)`?",
                s.content,
                re.MULTILINE,
            )
            for groups in names[:4]:
                name = next(g for g in groups if g)
                if name.lower() not in ("true", "false", "none", "yes", "no"):
                    alternatives.append({"name": name, "reason": "See README for comparison"})
            break

    return {
        "problem": problem,
        "mental_model": mental_model,
        "when_to_use": when_to_use,
        "when_not_to_use": "",
        "alternatives": alternatives,
    }


def extract_tasks(sections: list[Section], package_name: str) -> list[dict]:
    """
    Extract tasks from README code blocks, grouped by section.
    Each section with code blocks becomes a task.
    """
    tasks = []
    seen_ids = set()

    for section in sections:
        if not section.code_blocks:
            continue
        if heading_matches(section.heading, {"changelog", "license", "contributing", "author"}):
            continue

        # Generate a slug id
        slug = re.sub(r"[^a-z0-9]+", "-", section.heading.lower()).strip("-")
        if slug in seen_ids:
            slug = f"{slug}-{len(tasks)}"
        seen_ids.add(slug)

        # Infer difficulty from heading
        difficulty = "beginner"
        if any(
            k in section.heading.lower()
            for k in ("advanced", "custom", "extend", "plugin", "async", "concurrent")
        ):
            difficulty = "advanced"
        elif any(
            k in section.heading.lower()
            for k in ("session", "auth", "config", "middleware", "hook", "retry")
        ):
            difficulty = "intermediate"

        steps = []
        for i, code in enumerate(section.code_blocks[:4]):
            code = code.strip()
            if not code:
                continue
            # Label by content heuristic
            if "install" in code or "pip " in code:
                label = "Install"
            elif i == 0:
                label = "Import"
            else:
                label = f"Step {i + 1}"
            steps.append({"label": label, "code": code})

        if steps:
            tasks.append({
                "id": slug,
                "title": section.heading,
                "difficulty": difficulty,
                "steps": steps,
            })

    return tasks[:6]  # max 6 tasks per package
