#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")
"""
pkgdocs ingestion CLI
Usage:
    python ingest.py <package-name> [--out ../public/data/packages]
    python ingest.py requests httpx click --out ../public/data/packages --verbose
    python ingest.py lodash --ecosystem npm --enrich --verbose
"""
import json
import sys
from pathlib import Path

import click
import httpx

from schema import Package, PackageMeta, PackageStory, Alternative, Task, TaskStep
from pypi_connector import (
    fetch_pypi,
    fetch_downloads,
    fetch_readme,
    fetch_github_meta,
    fetch_init_py,
    parse_github_url,
    extract_classifiers_tags,
    extract_public_api,
)
from npm_connector import (
    fetch_npm,
    fetch_npm_readme,
    fetch_npm_downloads,
    extract_repo_url,
    extract_npm_tags,
    extract_npm_public_api,
    fetch_github_readme_for_npm,
    parse_github_url as parse_github_url_npm,
)
from readme_parser import parse_sections, extract_story_fields, extract_tasks
from graph_builder import build_graph
from difficulty import compute_difficulty


def ingest_pypi(
    name: str,
    client: httpx.Client,
    verbose: bool = False,
) -> Package:
    def log(msg: str):
        if verbose:
            click.echo(f"  {msg}")

    log(f"Fetching PyPI metadata for {name!r}...")
    pypi = fetch_pypi(name, client)
    info = pypi["info"]

    # -- Meta ------------------------------------------------------------------
    version = info.get("version", "")
    summary = (info.get("summary") or "").strip().rstrip(".")
    license_ = info.get("license") or ""
    project_urls = info.get("project_urls") or {}
    home_page = info.get("home_page") or ""

    repo_url = (
        project_urls.get("Source")
        or project_urls.get("Repository")
        or project_urls.get("Source Code")
        or project_urls.get("GitHub")
        or home_page
        or ""
    )
    docs_url = (
        project_urls.get("Documentation")
        or project_urls.get("Docs")
        or project_urls.get("Homepage")
        or ""
    )
    pypi_url = f"https://pypi.org/project/{name}/"

    log("Fetching weekly downloads...")
    weekly_downloads = fetch_downloads(name, client)

    # -- Tags ------------------------------------------------------------------
    classifiers = info.get("classifiers") or []
    tags = extract_classifiers_tags(classifiers)

    github_parts = parse_github_url(repo_url)
    gh_meta = {}
    readme_text = ""
    init_src = ""
    default_branch = "main"

    if github_parts:
        owner, repo = github_parts
        log(f"Fetching GitHub metadata for {owner}/{repo}...")
        gh_meta = fetch_github_meta(owner, repo, client)
        default_branch = gh_meta.get("default_branch", "main")

        gh_topics = gh_meta.get("topics") or []
        tags = list(dict.fromkeys(tags + gh_topics))[:10]

        log("Fetching README...")
        readme_text = fetch_readme(owner, repo, client)

        log("Fetching __init__.py for API graph...")
        init_src = fetch_init_py(owner, repo, default_branch, client)

    # -- Difficulty ------------------------------------------------------------
    requires = info.get("requires_dist") or []
    num_deps = len([r for r in requires if "extra" not in r.lower()])
    symbols = extract_public_api(init_src) if init_src else []
    has_async = "async" in (readme_text + init_src).lower()
    has_typing = "typing" in (init_src or "").lower()
    difficulty = compute_difficulty(
        num_exports=len(symbols),
        num_dependencies=num_deps,
        readme_length=len(readme_text),
        has_async=has_async,
        has_typing=has_typing,
    )

    # -- Story -----------------------------------------------------------------
    log("Parsing README for story fields...")
    sections = parse_sections(readme_text) if readme_text else []
    story_fields = extract_story_fields(sections) if sections else {}

    story = PackageStory(
        problem=story_fields.get("problem") or f"{name} is a Python library for {summary.lower()}.",
        mental_model=story_fields.get("mental_model") or "",
        when_to_use=story_fields.get("when_to_use") or f"Use {name} when you need {summary.lower()}.",
        when_not_to_use=story_fields.get("when_not_to_use") or "",
        alternatives=[
            Alternative(name=a["name"], reason=a["reason"])
            for a in story_fields.get("alternatives") or []
        ],
    )

    # -- Graph -----------------------------------------------------------------
    log(f"Building graph ({len(symbols)} symbols found)...")
    graph_nodes, graph_edges = build_graph(name, symbols, sections)

    # -- Tasks -----------------------------------------------------------------
    log("Extracting tasks from README code blocks...")
    raw_tasks = extract_tasks(sections, name) if sections else []
    tasks = [
        Task(
            id=t["id"],
            title=t["title"],
            difficulty=t["difficulty"],
            steps=[
                TaskStep(label=s["label"], code=s["code"], explanation=s.get("explanation", ""))
                for s in t["steps"]
            ],
        )
        for t in raw_tasks
    ]

    has_install = any("install" in t.id.lower() for t in tasks)
    if not has_install:
        tasks.insert(
            0,
            Task(
                id="install",
                title=f"Install {name}",
                difficulty="beginner",
                steps=[
                    TaskStep(label="Install via pip", code=f"pip install {name}"),
                    TaskStep(label="Import", code=f"import {name.replace('-', '_')}"),
                ],
            ),
        )

    return Package(
        id=name,
        ecosystem="pypi",
        name=name,
        summary=summary or name,
        tags=tags,
        difficulty=difficulty,
        story=story,
        graph_nodes=graph_nodes,
        graph_edges=graph_edges,
        tasks=tasks,
        meta=PackageMeta(
            pypi_url=pypi_url,
            repo_url=repo_url,
            docs_url=docs_url,
            weekly_downloads=weekly_downloads,
            version=version,
            license=license_,
        ),
    ), readme_text


def ingest_npm(
    name: str,
    client: httpx.Client,
    verbose: bool = False,
) -> tuple:
    def log(msg: str):
        if verbose:
            click.echo(f"  {msg}")

    log(f"Fetching npm metadata for {name!r}...")
    info = fetch_npm(name, client)

    # -- Meta ------------------------------------------------------------------
    version = info.get("version", "")
    summary = (info.get("description") or "").strip().rstrip(".")
    license_ = info.get("license") or ""

    repo_url = extract_repo_url(info)
    homepage = info.get("homepage") or ""
    docs_url = homepage if homepage and "github" not in homepage else ""
    npm_url = f"https://www.npmjs.com/package/{name}"

    log("Fetching weekly downloads...")
    weekly_downloads = fetch_npm_downloads(name, client)

    # -- Tags ------------------------------------------------------------------
    keywords = info.get("keywords") or []
    tags = extract_npm_tags(keywords, info)

    # -- README ----------------------------------------------------------------
    log("Fetching README...")
    readme_text = fetch_npm_readme(name, client)
    if not readme_text and repo_url:
        log("Falling back to GitHub README...")
        readme_text = fetch_github_readme_for_npm(repo_url, client)

    # -- GitHub metadata -------------------------------------------------------
    gh_parts = parse_github_url_npm(repo_url)
    if gh_parts:
        from pypi_connector import fetch_github_meta
        owner, repo = gh_parts
        log(f"Fetching GitHub metadata for {owner}/{repo}...")
        try:
            gh_meta = fetch_github_meta(owner, repo, client)
            gh_topics = gh_meta.get("topics") or []
            tags = list(dict.fromkeys(tags + gh_topics))[:10]
        except Exception:
            pass

    # -- Symbols & difficulty --------------------------------------------------
    symbols = extract_npm_public_api(info)
    has_async = "async" in (readme_text or "").lower() or "promise" in (readme_text or "").lower()
    has_typing = info.get("types") is not None or info.get("typings") is not None
    deps = info.get("dependencies") or {}
    num_deps = len(deps)
    difficulty = compute_difficulty(
        num_exports=len(symbols),
        num_dependencies=num_deps,
        readme_length=len(readme_text or ""),
        has_async=has_async,
        has_typing=has_typing,
    )

    # -- Story -----------------------------------------------------------------
    log("Parsing README for story fields...")
    sections = parse_sections(readme_text) if readme_text else []
    story_fields = extract_story_fields(sections) if sections else {}

    story = PackageStory(
        problem=story_fields.get("problem") or f"{name} is an npm package for {summary.lower()}.",
        mental_model=story_fields.get("mental_model") or "",
        when_to_use=story_fields.get("when_to_use") or f"Use {name} when you need {summary.lower()}.",
        when_not_to_use=story_fields.get("when_not_to_use") or "",
        alternatives=[
            Alternative(name=a["name"], reason=a["reason"])
            for a in story_fields.get("alternatives") or []
        ],
    )

    # -- Graph -----------------------------------------------------------------
    log(f"Building graph ({len(symbols)} symbols found)...")
    graph_nodes, graph_edges = build_graph(name, symbols, sections)

    # -- Tasks -----------------------------------------------------------------
    log("Extracting tasks from README code blocks...")
    raw_tasks = extract_tasks(sections, name) if sections else []
    tasks = [
        Task(
            id=t["id"],
            title=t["title"],
            difficulty=t["difficulty"],
            steps=[
                TaskStep(label=s["label"], code=s["code"], explanation=s.get("explanation", ""))
                for s in t["steps"]
            ],
        )
        for t in raw_tasks
    ]

    has_install = any("install" in t.id.lower() for t in tasks)
    if not has_install:
        tasks.insert(
            0,
            Task(
                id="install",
                title=f"Install {name}",
                difficulty="beginner",
                steps=[
                    TaskStep(label="Install via npm", code=f"npm install {name}"),
                    TaskStep(label="Import (ESM)", code=f"import {{ }} from '{name}';"),
                ],
            ),
        )

    pkg = Package(
        id=name,
        ecosystem="npm",
        name=name,
        summary=summary or name,
        tags=tags,
        difficulty=difficulty,
        story=story,
        graph_nodes=graph_nodes,
        graph_edges=graph_edges,
        tasks=tasks,
        meta=PackageMeta(
            pypi_url=npm_url,
            repo_url=repo_url,
            docs_url=docs_url,
            weekly_downloads=weekly_downloads,
            version=version,
            license=license_,
        ),
    )
    return pkg, readme_text


@click.command()
@click.argument("packages", nargs=-1, required=True)
@click.option(
    "--out",
    default="../public/data/packages",
    show_default=True,
    help="Output directory for JSON files",
)
@click.option("--verbose", "-v", is_flag=True, help="Show progress details")
@click.option(
    "--dry-run",
    is_flag=True,
    help="Print JSON to stdout instead of writing files",
)
@click.option(
    "--ecosystem",
    type=click.Choice(["pypi", "npm"], case_sensitive=False),
    default="pypi",
    show_default=True,
    help="Package ecosystem to ingest from",
)
@click.option(
    "--enrich",
    is_flag=True,
    help="Call Claude API to enrich story fields and node summaries",
)
def main(packages: tuple[str, ...], out: str, verbose: bool, dry_run: bool, ecosystem: str, enrich: bool):
    """
    Ingest one or more packages and output pkgdocs JSON.

    \b
    Examples:
        python ingest.py requests
        python ingest.py numpy scipy pandas --out ./out --verbose
        python ingest.py flask --dry-run
        python ingest.py lodash zod --ecosystem npm --verbose
        python ingest.py axios --ecosystem npm --enrich
    """
    out_dir = Path(out)
    if not dry_run:
        out_dir.mkdir(parents=True, exist_ok=True)

    # Lazy-import enricher only if needed (avoids hard dep on anthropic)
    enricher = None
    if enrich:
        try:
            from enricher import enrich as enrich_fn
            enricher = enrich_fn
        except ImportError:
            click.secho("  [enrich] anthropic package not installed — run: pip install anthropic", fg="yellow")

    with httpx.Client(
        timeout=30,
        headers={"User-Agent": "pkgdocs-ingester/1.0"},
        follow_redirects=True,
    ) as client:
        for pkg_name in packages:
            click.echo(f"\n{'-' * 50}")
            click.echo(f"[pkg]  Ingesting: {pkg_name} ({ecosystem})")
            try:
                if ecosystem == "npm":
                    pkg, readme_text = ingest_npm(pkg_name, client, verbose=verbose)
                else:
                    pkg, readme_text = ingest_pypi(pkg_name, client, verbose=verbose)

                if enricher:
                    click.echo("  [enrich] Enriching with Claude...")
                    pkg = enricher(pkg, readme_text, verbose=verbose)

                json_output = pkg.to_json()

                if dry_run:
                    click.echo(json_output)
                else:
                    out_path = out_dir / f"{pkg_name}.json"
                    out_path.write_text(json_output, encoding="utf-8")
                    click.secho(f"OK  Written -> {out_path}", fg="green")

                    click.echo(
                        f"   nodes={len(pkg.graph_nodes)}  "
                        f"tasks={len(pkg.tasks)}  "
                        f"difficulty={pkg.difficulty}  "
                        f"tags={', '.join(pkg.tags[:4])}"
                    )

            except httpx.HTTPStatusError as e:
                click.secho(f"FAIL  HTTP {e.response.status_code} for {pkg_name}", fg="red")
            except Exception as e:
                click.secho(f"FAIL  {e}", fg="red")
                if verbose:
                    import traceback
                    traceback.print_exc()

    click.echo(f"\n{'-' * 50}")
    click.secho("Done.", fg="cyan", bold=True)


if __name__ == "__main__":
    main()
