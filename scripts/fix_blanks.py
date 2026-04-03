import re, sys

path = "e:/Java WorkSpace/pkgdocs/src/app/page.tsx"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Collapse runs of 3+ newlines down to 2 (1 blank line max between statements)
fixed = re.sub(r'\n{3,}', '\n\n', content)

# Remove the extra blank line after every import / simple statement line
# (the file has a blank line after every single line due to the CRLF -> LF doubling)
# Strategy: remove blank lines that are between two non-blank lines where the first
# line doesn't end a block (no {, }, (, ))
# Simpler: remove ALL consecutive duplicate blank lines
fixed = re.sub(r'\n\n\n+', '\n\n', fixed)

with open(path, "w", encoding="utf-8", newline="\n") as f:
    f.write(fixed)

lines = fixed.splitlines()
sys.stdout.write(f"Lines: {len(lines)}\n")
sys.stdout.write(f"Line 1: {lines[0]}\n")
sys.stdout.write(f"Line 2: {lines[1]}\n")
