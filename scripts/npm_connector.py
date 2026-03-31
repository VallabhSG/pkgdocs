"""
npm registry connector — mirrors pypi_connector.py for the npm ecosystem.
"""
import re
import base64
import httpx
from typing import Optional

NPM_REGISTRY = "https://registry.npmjs.org/{name}/latest"
NPM_FULL = "https://registry.npmjs.org/{name}"
NPM_DOWNLOADS = "https://api.npmjs.org/downloads/point/last-week/{name}"
GITHUB_RAW = "https://raw.githubusercontent.com/{owner}/{repo}/{branch}/README.md"
GITHUB_API = "https://api.github.com/repos/{owner}/{repo}"


def fetch_npm(name: str, client: httpx.Client) -> dict:
    """Fetch latest version metadata from npm registry."""
    r = client.get(NPM_REGISTRY.format(name=name))
    r.raise_for_status()
    return r.json()


def fetch_npm_readme(name: str, client: httpx.Client) -> str:
    """Fetch README from the full npm registry response."""
    try:
        r = client.get(NPM_FULL.format(name=name), timeout=15)
        if r.status_code == 200:
            data = r.json()
            # npm embeds README in the full registry response
            readme = data.get("readme", "")
            if readme:
                return readme
    except Exception:
        pass
    return ""


def fetch_npm_downloads(name: str, client: httpx.Client) -> int:
    """Fetch weekly download count from npm API."""
    try:
        r = client.get(NPM_DOWNLOADS.format(name=name), timeout=10)
        if r.status_code == 200:
            return r.json().get("downloads", 0)
    except Exception:
        pass
    return 0


def parse_github_url(url: str) -> Optional[tuple[str, str]]:
    """Extract (owner, repo) from a GitHub URL."""
    m = re.match(r"https?://github\.com/([^/]+)/([^/\s#]+)", url or "")
    if m:
        return m.group(1), m.group(2).rstrip(".git")
    return None


def extract_repo_url(info: dict) -> str:
    """Extract repository URL from npm package metadata."""
    repo = info.get("repository") or {}
    if isinstance(repo, str):
        url = repo
    else:
        url = repo.get("url", "")
    # Normalise git+https://github.com/... → https://github.com/...
    url = re.sub(r"^git\+", "", url)
    url = re.sub(r"^git://", "https://", url)
    url = url.rstrip(".git")
    return url


def extract_npm_tags(keywords: list[str], info: dict) -> list[str]:
    """Build tag list from npm keywords."""
    tags = [k.lower().replace(" ", "-") for k in (keywords or []) if len(k) < 30]
    # Add ecosystem tag
    if "react" in str(info.get("peerDependencies", {})):
        tags.append("react")
    if "typescript" in str(info.get("devDependencies", {})):
        tags.append("typescript")
    return list(dict.fromkeys(tags))[:10]


def extract_npm_public_api(package_json: dict) -> list[dict]:
    """
    Heuristically extract public symbols from package.json exports or main field.
    For npm we can't easily inspect source, so we use exports map keys.
    """
    symbols = []
    exports = package_json.get("exports") or {}

    if isinstance(exports, dict):
        for key in exports.keys():
            if key.startswith(".") and key != ".":
                # e.g. "./utils" → "utils"
                name = key.lstrip("./").replace("/", "_")
                if name and not name.startswith("_"):
                    symbols.append({"name": name, "kind": "module"})

    # Named exports from package.json if listed
    named = package_json.get("namedExports") or []
    for name in named[:15]:
        symbols.append({"name": name, "kind": "unknown"})

    return symbols[:15]


def fetch_github_readme_for_npm(repo_url: str, client: httpx.Client) -> str:
    """Fetch README from GitHub for an npm package."""
    parts = parse_github_url(repo_url)
    if not parts:
        return ""
    owner, repo = parts
    for branch in ("main", "master"):
        try:
            url = GITHUB_RAW.format(owner=owner, repo=repo, branch=branch)
            r = client.get(url, timeout=15)
            if r.status_code == 200:
                return r.text
        except Exception:
            continue
    return ""
