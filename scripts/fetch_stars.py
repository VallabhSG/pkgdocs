"""
Fetch GitHub star counts for all packages and write to public/data/stars.json.
Run: python scripts/fetch_stars.py [--token GITHUB_TOKEN]
Unauthenticated: 60 req/hr  |  Authenticated: 5000 req/hr
"""

import json
import os
import re
import sys
import time
import urllib.request
import urllib.error
from pathlib import Path
from typing import Optional

ROOT = Path(__file__).parent.parent
PACKAGES_DIR = ROOT / "public" / "data" / "packages"
OUT_FILE = ROOT / "public" / "data" / "stars.json"

# Optional token from arg or env
token = None
for i, arg in enumerate(sys.argv[1:]):
    if arg == "--token" and i + 1 < len(sys.argv[1:]):
        token = sys.argv[i + 2]
if not token:
    token = os.environ.get("GITHUB_TOKEN")

def gh_stars(repo_url: str) -> Optional[int]:
    m = re.match(r"https://github\.com/([^/]+/[^/]+?)(?:\.git)?/?$", repo_url)
    if not m:
        return None
    api_url = f"https://api.github.com/repos/{m.group(1)}"
    req = urllib.request.Request(api_url, headers={"Accept": "application/vnd.github+json"})
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read())
            return data.get("stargazers_count")
    except urllib.error.HTTPError as e:
        print(f"  HTTP {e.code} for {repo_url}", file=sys.stderr)
        return None
    except Exception as e:
        print(f"  Error for {repo_url}: {e}", file=sys.stderr)
        return None

stars = {}  # type: dict
files = sorted(PACKAGES_DIR.glob("*.json"))
print(f"Fetching stars for {len(files)} packages...")

for i, f in enumerate(files):
    pkg = json.loads(f.read_text(encoding="utf-8"))
    repo_url = pkg.get("meta", {}).get("repo_url", "")
    slug = f.stem
    if not repo_url:
        print(f"  [{i+1}/{len(files)}] {slug}: no repo_url")
        continue
    count = gh_stars(repo_url)
    if count is not None:
        stars[slug] = count
        print(f"  [{i+1}/{len(files)}] {slug}: {count:,}")
    else:
        print(f"  [{i+1}/{len(files)}] {slug}: skipped")
    # Respect rate limit — 1 req/s without token
    if not token:
        time.sleep(1)

OUT_FILE.write_text(json.dumps(stars, indent=2), encoding="utf-8")
print(f"\nWrote {len(stars)} entries to {OUT_FILE}")
