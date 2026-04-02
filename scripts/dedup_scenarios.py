"""Remove duplicate top-level keys from scenarios.ts, keeping first occurrence."""
import pathlib, re

f = pathlib.Path(__file__).parent.parent / "src/components/DemoView/scenarios.ts"
content = f.read_text(encoding="utf-8")
lines = content.split("\n")

# Find all top-level key positions: lines like '  "key": ['  or  '  key: ['
key_pattern = re.compile(r'^  (?:"([^"]+)"|([a-zA-Z][a-zA-Z0-9_-]*)): \[$')

seen: set[str] = set()
duplicates: list[tuple[int, str]] = []

for i, line in enumerate(lines):
    m = key_pattern.match(line)
    if m:
        key = m.group(1) or m.group(2)
        if key in seen:
            duplicates.append((i, key))
        else:
            seen.add(key)

print(f"Found {len(duplicates)} duplicate key(s):")
for lineno, key in duplicates:
    print(f"  line {lineno + 1}: {key!r}")

# For each duplicate, find its block (from key line to matching closing ],) and remove
# We need to find closing ],  at the same indent level
def find_block_end(lines, start_line):
    """Given line index of '  key: [', find the line index of closing '],'"""
    depth = 0
    for i in range(start_line, len(lines)):
        line = lines[i]
        depth += line.count("[") + line.count("{")
        depth -= line.count("]") + line.count("}")
        if i > start_line and depth == 0:
            return i
    return len(lines) - 1

# Remove duplicates in reverse order so line numbers stay valid
to_remove: list[tuple[int, int]] = []
for lineno, key in duplicates:
    end = find_block_end(lines, lineno)
    to_remove.append((lineno, end))
    print(f"  Removing lines {lineno + 1}..{end + 1} ({key})")

to_remove.sort(reverse=True)
for start, end in to_remove:
    del lines[start:end + 1]

new_content = "\n".join(lines)
f.write_text(new_content, encoding="utf-8")
print(f"\nDone — file now {len(new_content)} chars")
