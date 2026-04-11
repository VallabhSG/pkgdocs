import re
from pathlib import Path

scenarios_file = Path("src/components/DemoView/scenarios.ts")
content = scenarios_file.read_text(encoding="utf-8")

# Extract top-level keys — lines that start with exactly 2 spaces then a valid package name then ": ["
pattern = re.compile(r'^  "?([a-z][a-z0-9._-]+)"?: \[', re.MULTILINE)
scenario_pkgs = set(m.group(1) for m in pattern.finditer(content))

live_pkgs = {"pretext", "zod", "dayjs", "uuid", "immer", "lodash"}
has_demo = scenario_pkgs | live_pkgs

all_pkgs = {f.stem for f in Path("public/data/packages").glob("*.json")}

missing = sorted(all_pkgs - has_demo)
covered = sorted(all_pkgs & has_demo)

print("Covered (%d):" % len(covered))
for p in covered:
    tag = "[LIVE]" if p in live_pkgs else "[sim]"
    print("  %s %s" % (tag, p))

print()
print("MISSING DEMO (%d):" % len(missing))
for p in missing:
    print("  " + p)
