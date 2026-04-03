path = "e:/Java WorkSpace/pkgdocs/src/app/page.tsx"

with open(path, "rb") as f:
    raw = f.read()

# Fix: \r\r\n -> \r\n (remove the extra \r introduced by double-newline issue)
cleaned = raw.replace(b"\r\r\n", b"\r\n")

with open(path, "wb") as f:
    f.write(cleaned)

# Verify: count lines
text = cleaned.decode("utf-8")
lines = text.splitlines()
print(f"Lines: {len(lines)}")
print("Line 1:", lines[0])
print("Line 2:", lines[1])
print("Emoji check:", any("\U0001f4ca" in l for l in lines))  # 📊
