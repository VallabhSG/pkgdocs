path = "e:/Java WorkSpace/pkgdocs/src/app/page.tsx"
with open(path, "r", encoding="utf-8") as f:
    lines = f.readlines()
for i, line in enumerate(lines, 1):
    if any(ord(c) > 0xC0 and ord(c) < 0x200 for c in line):
        # Might be garbled latin-1 sequences
        if "\u00f0" in line or "\u00e2" in line or "\u00c3" in line:
            print(f"Line {i}: {repr(line[:100])}")
