"""
Upsert all local package JSON files into Supabase.
Uses service role key (bypasses RLS).
Run: python scripts/push_to_supabase.py
"""

import json
import os
import sys
import urllib.request
import urllib.error
from pathlib import Path

ROOT = Path(__file__).parent.parent
PACKAGES_DIR = ROOT / "public" / "data" / "packages"

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "").rstrip("/")
SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

if not SUPABASE_URL or not SERVICE_KEY:
    # Try reading from .env.local
    env_file = ROOT / ".env.local"
    if env_file.exists():
        for line in env_file.read_text().splitlines():
            if "=" in line:
                k, _, v = line.partition("=")
                k, v = k.strip(), v.strip()
                if k == "NEXT_PUBLIC_SUPABASE_URL":
                    SUPABASE_URL = v.rstrip("/")
                elif k == "SUPABASE_SERVICE_ROLE_KEY":
                    SERVICE_KEY = v

if not SUPABASE_URL or not SERVICE_KEY:
    print("ERROR: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found")
    sys.exit(1)

API = f"{SUPABASE_URL}/rest/v1/packages"
HEADERS = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "resolution=merge-duplicates",  # upsert on conflict
}

files = sorted(PACKAGES_DIR.glob("*.json"))
print(f"Upserting {len(files)} packages to {SUPABASE_URL}...")

ok = 0
errors = 0

for f in files:
    pkg = json.loads(f.read_text(encoding="utf-8"))
    row = {
        "id": pkg["id"],
        "ecosystem": pkg["ecosystem"],
        "name": pkg["name"],
        "summary": pkg["summary"],
        "tags": pkg["tags"],
        "difficulty": pkg["difficulty"],
        "weekly_downloads": pkg["meta"]["weekly_downloads"],
        "version": pkg["meta"]["version"],
        "data": pkg,
    }
    body = json.dumps(row).encode()
    req = urllib.request.Request(API, data=body, headers=HEADERS, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            resp.read()
            print(f"  OK {pkg['id']}")
            ok += 1
    except urllib.error.HTTPError as e:
        msg = e.read().decode()
        print(f"  ERR {pkg['id']}: HTTP {e.code} - {msg[:120]}")
        errors += 1
    except Exception as e:
        print(f"  ERR {pkg['id']}: {e}")
        errors += 1

print(f"\nDone: {ok} upserted, {errors} errors")
