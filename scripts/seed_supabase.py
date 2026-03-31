#!/usr/bin/env python3
"""
Seed Supabase with all package JSONs from public/data/packages/.

Usage:
    python seed_supabase.py
    python seed_supabase.py --dir ../public/data/packages
    python seed_supabase.py --dry-run

Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in environment
or a .env.local file in the project root.
"""
import json
import os
import sys
from pathlib import Path

import click
import httpx
from dotenv import load_dotenv

# Load .env.local from project root
env_path = Path(__file__).parent.parent / ".env.local"
load_dotenv(env_path)


def get_supabase_config():
    url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL") or os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        click.secho(
            "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n"
            "Add them to .env.local in the project root.",
            fg="red",
        )
        sys.exit(1)
    return url.rstrip("/"), key


def upsert_package(pkg: dict, url: str, key: str, client: httpx.Client) -> dict:
    """Upsert a single package row via Supabase REST API."""
    row = {
        "id": pkg["id"],
        "ecosystem": pkg.get("ecosystem", "pypi"),
        "name": pkg["name"],
        "summary": pkg.get("summary", ""),
        "tags": pkg.get("tags", []),
        "difficulty": pkg.get("difficulty", 1),
        "weekly_downloads": pkg.get("meta", {}).get("weekly_downloads", 0),
        "version": pkg.get("meta", {}).get("version", ""),
        "data": pkg,
    }

    r = client.post(
        f"{url}/rest/v1/packages",
        json=row,
        headers={
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates,return=minimal",
        },
    )
    r.raise_for_status()
    return row


@click.command()
@click.option(
    "--dir",
    "packages_dir",
    default="../public/data/packages",
    show_default=True,
    help="Directory containing package JSON files",
)
@click.option("--dry-run", is_flag=True, help="Parse and validate without writing to Supabase")
def main(packages_dir: str, dry_run: bool):
    """Seed Supabase packages table from local JSON files."""
    pkg_dir = Path(packages_dir)
    if not pkg_dir.exists():
        click.secho(f"Directory not found: {pkg_dir}", fg="red")
        sys.exit(1)

    json_files = sorted(pkg_dir.glob("*.json"))
    if not json_files:
        click.secho("No JSON files found.", fg="yellow")
        sys.exit(0)

    if not dry_run:
        supabase_url, supabase_key = get_supabase_config()
        click.echo(f"Seeding {supabase_url}")
    else:
        supabase_url = supabase_key = ""
        click.echo("Dry run — not writing to Supabase")

    click.echo(f"Found {len(json_files)} packages\n")

    ok = 0
    failed = 0

    with httpx.Client(timeout=15) as client:
        for path in json_files:
            try:
                pkg = json.loads(path.read_text(encoding="utf-8"))
                name = pkg.get("name", path.stem)

                if dry_run:
                    # Just validate required fields
                    assert pkg.get("id"), "missing id"
                    assert pkg.get("name"), "missing name"
                    click.secho(f"  OK  {name}", fg="green")
                else:
                    upsert_package(pkg, supabase_url, supabase_key, client)
                    click.secho(f"  OK  {name}", fg="green")
                ok += 1

            except Exception as e:
                click.secho(f"  FAIL  {path.name}: {e}", fg="red")
                failed += 1

    click.echo(f"\n{'-' * 40}")
    click.secho(f"Done: {ok} seeded, {failed} failed", fg="cyan" if not failed else "yellow", bold=True)


if __name__ == "__main__":
    # Add python-dotenv to requirements if missing
    try:
        import dotenv  # noqa: F401
    except ImportError:
        click.secho("Installing python-dotenv...", fg="yellow")
        import subprocess
        subprocess.run([sys.executable, "-m", "pip", "install", "python-dotenv", "-q"], check=True)
    main()
