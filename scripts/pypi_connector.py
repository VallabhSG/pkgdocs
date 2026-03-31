"""
Fetch package metadata from PyPI and GitHub.
"""
import re
import httpx
from typing import Optional


PYPI_API = "https://pypi.org/pypi/{name}/json"
PYPISTATS_API = "https://pypistats.org/api/packages/{name}/recent"
GITHUB_RAW = "https://raw.githubusercontent.com/{owner}/{repo}/{branch}/README.md"
GITHUB_API = "https://api.github.com/repos/{owner}/{repo}"
GITHUB_TREE = "https://api.github.com/repos/{owner}/{repo}/git/trees/{branch}?recursive=1"
GITHUB_FILE = "https://raw.githubusercontent.com/{owner}/{repo}/{branch}/{path}"


def fetch_pypi(name: str, client: httpx.Client) -> dict:
    """Fetch raw PyPI JSON for a package."""
    r = client.get(PYPI_API.format(name=name))
    r.raise_for_status()
    return r.json()


def fetch_downloads(name: str, client: httpx.Client) -> int:
    """Fetch recent weekly downloads from pypistats."""
    try:
        r = client.get(PYPISTATS_API.format(name=name.lower()), timeout=10)
        if r.status_code == 200:
            data = r.json()
            return data.get("data", {}).get("last_week", 0)
    except Exception:
        pass
    return 0


def parse_github_url(url: str) -> Optional[tuple[str, str]]:
    """Extract (owner, repo) from a GitHub URL."""
    m = re.match(r"https?://github\.com/([^/]+)/([^/\s#]+)", url or "")
    if m:
        return m.group(1), m.group(2).rstrip(".git")
    return None


def fetch_readme(owner: str, repo: str, client: httpx.Client) -> str:
    """Try to fetch README.md from main, then master branch."""
    for branch in ("main", "master"):
        try:
            url = GITHUB_RAW.format(owner=owner, repo=repo, branch=branch)
            r = client.get(url, timeout=15)
            if r.status_code == 200:
                return r.text
        except Exception:
            continue
    return ""


def fetch_github_meta(owner: str, repo: str, client: httpx.Client) -> dict:
    """Fetch GitHub repo metadata (topics, description, default branch)."""
    headers = {"Accept": "application/vnd.github.mercy-preview+json"}
    try:
        r = client.get(
            GITHUB_API.format(owner=owner, repo=repo),
            headers=headers,
            timeout=10,
        )
        if r.status_code == 200:
            return r.json()
    except Exception:
        pass
    return {}


def fetch_init_py(
    owner: str, repo: str, branch: str, client: httpx.Client
) -> str:
    """Try to fetch the top-level __init__.py from the repo."""
    # First get the tree to find the right __init__.py
    try:
        tree_url = GITHUB_TREE.format(owner=owner, repo=repo, branch=branch)
        r = client.get(tree_url, timeout=10)
        if r.status_code == 200:
            tree = r.json().get("tree", [])
            # Find top-level package __init__.py (skip tests/, docs/, etc.)
            candidates = [
                item["path"]
                for item in tree
                if item["path"].endswith("__init__.py")
                and item["path"].count("/") == 1
                and not any(
                    x in item["path"]
                    for x in ("test", "doc", "example", "sample", "bench")
                )
            ]
            if candidates:
                path = candidates[0]
                file_url = GITHUB_FILE.format(
                    owner=owner, repo=repo, branch=branch, path=path
                )
                fr = client.get(file_url, timeout=10)
                if fr.status_code == 200:
                    return fr.text
    except Exception:
        pass
    return ""


def extract_classifiers_tags(classifiers: list[str]) -> list[str]:
    """Pull meaningful tags from PyPI classifiers."""
    tags = set()
    for c in classifiers:
        parts = [p.strip().lower() for p in c.split("::")]
        # Topic :: Internet :: WWW/HTTP → http
        # Topic :: Software Development :: Libraries → library
        if len(parts) >= 2 and parts[0] == "topic":
            last = parts[-1].replace(" ", "-")
            if last not in {"python", "software-development", "internet"}:
                tags.add(last)
    return sorted(tags)[:8]


def extract_public_api(init_src: str) -> list[dict]:
    """
    Heuristically extract public symbols from __init__.py.
    Returns list of {name, type_hint}.
    """
    symbols = []

    # __all__ list
    all_match = re.search(r"__all__\s*=\s*\[([^\]]+)\]", init_src, re.DOTALL)
    if all_match:
        names = re.findall(r"['\"](\w+)['\"]", all_match.group(1))
        for name in names:
            symbols.append({"name": name, "kind": "unknown"})
        return symbols

    # Explicit class / function definitions
    for m in re.finditer(r"^class (\w+)", init_src, re.MULTILINE):
        symbols.append({"name": m.group(1), "kind": "class"})
    for m in re.finditer(r"^def (\w+)", init_src, re.MULTILINE):
        if not m.group(1).startswith("_"):
            symbols.append({"name": m.group(1), "kind": "function"})

    # from .module import X patterns
    for m in re.finditer(r"from\s+\S+\s+import\s+(.+)", init_src):
        names_part = m.group(1).split("#")[0]
        for name in re.findall(r"\b([A-Z][A-Za-z0-9]+|[a-z_]+[a-z0-9_]+)\b", names_part):
            if not name.startswith("_"):
                symbols.append({"name": name, "kind": "unknown"})

    # Deduplicate
    seen = set()
    unique = []
    for s in symbols:
        if s["name"] not in seen:
            seen.add(s["name"])
            unique.append(s)
    return unique[:20]
