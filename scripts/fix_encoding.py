import re

path = "e:/Java WorkSpace/pkgdocs/src/app/page.tsx"

with open(path, "rb") as f:
    raw = f.read()

# The file was written with wrong encoding — UTF-8 bytes misread as latin-1 then re-encoded.
# Re-decode correctly: treat raw bytes as latin-1, then encode to utf-8 bytes, then decode as utf-8
try:
    fixed = raw.decode("utf-8")
    # If emojis still show as mojibake, they were double-encoded
    # Try to detect: if garbled chars exist, re-interpret
    if "\u00f0\u009f" in fixed or "ðŸ" in fixed:
        # Bytes were written as latin-1 representation of utf-8 bytes
        fixed = raw.decode("latin-1").encode("latin-1").decode("utf-8")
except Exception:
    fixed = raw.decode("latin-1").encode("latin-1").decode("utf-8")

# Also fix em-dash mojibake â€" -> —
fixed = fixed.replace("\u00e2\u0080\u0093", "\u2013")
fixed = fixed.replace("\u00e2\u0080\u0094", "\u2014")

# Fix arrow â†' -> →
fixed = fixed.replace("\u00e2\u0086\u0092", "\u2192")

with open(path, "w", encoding="utf-8") as f:
    f.write(fixed)

print("Done. First 200 chars:")
print(repr(fixed[1200:1400]))
