# pkgdocs ingestion CLI

Rule-based Python scraper that turns a PyPI package name into a `pkgdocs` JSON file.

## Setup

```bash
cd scripts
pip install -r requirements.txt
```

## Usage

```bash
# Single package — write to default output dir
python ingest.py requests

# Multiple packages at once
python ingest.py numpy scipy pandas --verbose

# Custom output directory
python ingest.py flask --out ./out

# Preview without writing (dry run)
python ingest.py click --dry-run
```

## What it does

| Step | Source | Output |
|------|--------|--------|
| Meta | PyPI JSON API | version, license, summary, repo URL |
| Downloads | pypistats.org | weekly_downloads |
| Tags | PyPI classifiers + GitHub topics | tags[] |
| Difficulty | heuristic (API size, deps, async) | difficulty 1–3 |
| Story | README section parser | problem, when_to_use |
| Graph | `__init__.py` symbol extraction | nodes[], edges[] |
| Tasks | README fenced code blocks | tasks[] |

## Output quality

Generated JSONs are **drafts** — review before publishing:
- `story.problem` / `mental_model` may contain raw markdown artifacts
- Graph node summaries default to generic text when README doesn't mention the symbol
- Alternatives are only extracted if the README has a comparison section

The hand-crafted files in `public/data/packages/` are the gold standard to aim for when editing generated output.
