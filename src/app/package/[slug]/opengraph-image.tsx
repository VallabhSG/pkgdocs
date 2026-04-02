import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import path from "path";
import type { Package } from "@/lib/types";

export const runtime = "nodejs";
export const alt = "pkgdocs package documentation";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const ECOSYSTEM_COLOR: Record<string, { bg: string; border: string; text: string; label: string }> = {
  npm:  { bg: "#fff1f2", border: "#fda4af", text: "#e11d48", label: "npm" },
  pypi: { bg: "#eff6ff", border: "#93c5fd", text: "#2563eb", label: "Python" },
};

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let pkg: Package | null = null;
  try {
    const file = await readFile(
      path.join(process.cwd(), "public", "data", "packages", `${slug}.json`),
      "utf-8"
    );
    pkg = JSON.parse(file) as Package;
  } catch {
    // fallback to generic
  }

  const eco = ECOSYSTEM_COLOR[pkg?.ecosystem ?? "pypi"];
  const name = pkg?.name ?? slug;
  const summary = pkg?.summary ?? "Visual package documentation";
  const tags = pkg?.tags?.slice(0, 4) ?? [];

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #0f172a 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 72px",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Grid dots */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle, rgba(99,102,241,0.12) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Glow */}
        <div
          style={{
            position: "absolute",
            top: "-80px",
            right: "100px",
            width: "500px",
            height: "400px",
            background:
              "radial-gradient(ellipse, rgba(99,102,241,0.25) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />

        {/* Top: logo + ecosystem badge */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "28px" }}>📦</span>
            <span style={{ fontSize: "28px", fontWeight: 800, color: "#e2e8f0", letterSpacing: "-1px" }}>
              pkgdocs
            </span>
          </div>
          <div
            style={{
              background: eco.bg,
              border: `1px solid ${eco.border}`,
              borderRadius: "999px",
              padding: "6px 18px",
              fontSize: "20px",
              color: eco.text,
              fontWeight: 700,
            }}
          >
            {eco.label}
          </div>
        </div>

        {/* Middle: package name + summary */}
        <div style={{ display: "flex", flexDirection: "column", gap: "18px", position: "relative" }}>
          <div
            style={{
              fontSize: "72px",
              fontWeight: 800,
              color: "#ffffff",
              letterSpacing: "-3px",
              lineHeight: 1.05,
            }}
          >
            {name}
          </div>
          <div
            style={{
              fontSize: "26px",
              color: "#94a3b8",
              lineHeight: 1.4,
              maxWidth: "900px",
            }}
          >
            {summary.length > 120 ? summary.slice(0, 120) + "…" : summary}
          </div>
        </div>

        {/* Bottom: tags + feature pills */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
          <div style={{ display: "flex", gap: "10px" }}>
            {tags.map((tag) => (
              <div
                key={tag}
                style={{
                  background: "rgba(99,102,241,0.15)",
                  border: "1px solid rgba(99,102,241,0.3)",
                  borderRadius: "8px",
                  padding: "6px 14px",
                  fontSize: "18px",
                  color: "#a5b4fc",
                  fontFamily: "monospace",
                }}
              >
                {tag}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            {["Story", "Demo", "API Map", "Recipes"].map((f) => (
              <div
                key={f}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "8px",
                  padding: "6px 14px",
                  fontSize: "17px",
                  color: "#64748b",
                  fontWeight: 600,
                }}
              >
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    size
  );
}
