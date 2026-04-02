"""Append missing demo scenarios to scenarios.ts via a separate fragment file."""
import pathlib

SCENARIOS_FILE = pathlib.Path(__file__).parent.parent / "src/components/DemoView/scenarios.ts"
FRAGMENT_FILE  = pathlib.Path(__file__).parent / "scenarios_fragment.ts"

fragment = FRAGMENT_FILE.read_text(encoding="utf-8")
content  = SCENARIOS_FILE.read_text(encoding="utf-8")

assert content.rstrip().endswith("};"), f"Unexpected ending: {repr(content[-40:])}"

# Remove closing }; and append fragment
base = content.rstrip()[:-2].rstrip()
new_content = base + "\n\n" + fragment
SCENARIOS_FILE.write_text(new_content, encoding="utf-8")
print(f"Done — appended {len(fragment)} chars, file now {len(new_content)} chars")
