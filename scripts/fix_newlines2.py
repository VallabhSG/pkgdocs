path = "e:/Java WorkSpace/pkgdocs/src/app/page.tsx"

with open(path, "rb") as f:
    raw = f.read()

# Strip BOM if present
if raw.startswith(b"\xef\xbb\xbf"):
    raw = raw[3:]

# Fix double carriage returns: \r\r\n -> \r\n
cleaned = raw.replace(b"\r\r\n", b"\r\n")
# Also fix any remaining \r\n\r\n doubled blank lines to single \r\n
# (only collapse runs of 3+ newlines to max 2)
import re
cleaned_text = cleaned.decode("utf-8")
# Replace 3+ consecutive newlines with 2
cleaned_text = re.sub(r'\n{3,}', '\n\n', cleaned_text)
# Replace 3+ consecutive \r\n with 2
cleaned_text = re.sub(r'(\r\n){3,}', '\r\n\r\n', cleaned_text)

with open(path, "w", encoding="utf-8", newline="\n") as f:
    f.write(cleaned_text)

lines = cleaned_text.splitlines()
print(f"Lines: {len(lines)}")
# Check no garbled chars
garbled = [l for l in lines if "\u00f0\u009f" in l or "ðŸ" in l]
print(f"Garbled lines: {len(garbled)}")
