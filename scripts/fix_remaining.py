path = "e:/Java WorkSpace/pkgdocs/src/app/page.tsx"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace the 3 garbled emojis by targeting their surrounding unique label strings
# 🌐 = U+1F310 (Globe with Meridians)
content = content.replace(
    '"Web Frameworks",  emoji: "' + content[content.find('"Web Frameworks",  emoji: "')+27:content.find('"Web Frameworks",  emoji: "')+35],
    '"Web Frameworks",  emoji: "\U0001F310'
)

# Better approach: replace whole lines
lines = content.splitlines(keepends=True)
new_lines = []
for line in lines:
    if '"Web Frameworks"' in line and 'emoji:' in line:
        line = '  { label: "Web Frameworks",  emoji: "\U0001F310", ids: ["fastapi", "flask", "django", "express"] },\n'
    elif '"ORM and Database"' in line and 'emoji:' in line:
        line = '  { label: "ORM and Database",emoji: "\U0001F5C4\uFE0F", ids: ["prisma", "drizzle-orm", "sqlalchemy", "redis-py", "alembic"] },\n'
    elif '"CLI and Output"' in line and 'emoji:' in line:
        line = '  { label: "CLI and Output",  emoji: "\U0001F5A5\uFE0F", ids: ["click", "typer", "rich"] },\n'
    new_lines.append(line)

fixed = "".join(new_lines)

with open(path, "w", encoding="utf-8", newline="\n") as f:
    f.write(fixed)

# Verify
garbled = [l for l in fixed.splitlines() if ("ðŸ" in l or "\u00f0\u009f" in l)]
print(f"Remaining garbled: {len(garbled)}")
print("Web Frameworks line:", [l for l in fixed.splitlines() if '"Web Frameworks"' in l and 'emoji' in l])
