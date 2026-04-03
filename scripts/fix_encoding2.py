path = "e:/Java WorkSpace/pkgdocs/src/app/page.tsx"

# Read as UTF-8 (file has double-encoded content)
with open(path, "r", encoding="utf-8") as f:
    garbled = f.read()

# Reverse the double-encoding:
# Original: emoji UTF-8 bytes → misread as cp1252 chars → re-encoded as UTF-8
# Fix:      decode as cp1252 (treating each cp1252 char as a byte back to the original UTF-8 bytes)
try:
    fixed = garbled.encode("cp1252").decode("utf-8")
except (UnicodeEncodeError, UnicodeDecodeError):
    # Fall back: do it in chunks, skipping non-reversible sequences
    # Better: do it line by line
    lines_out = []
    for line in garbled.splitlines(keepends=True):
        try:
            lines_out.append(line.encode("cp1252").decode("utf-8"))
        except (UnicodeEncodeError, UnicodeDecodeError):
            lines_out.append(line)
    fixed = "".join(lines_out)

with open(path, "w", encoding="utf-8", newline="") as f:
    f.write(fixed)

# Verify emoji present
import re
emojis = re.findall(r'emoji: "(.+?)"', fixed)
print("Emojis found:", emojis)
print("Fixed em-dash check:", "—" in fixed)
