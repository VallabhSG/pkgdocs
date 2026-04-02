import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "pkgdocs — Visual Package Documentation";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Grid dots background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle, rgba(99,102,241,0.15) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Glow */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "700px",
            height: "400px",
            background:
              "radial-gradient(ellipse, rgba(99,102,241,0.3) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "24px",
            position: "relative",
          }}
        >
          {/* Logo row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <span style={{ fontSize: "52px" }}>📦</span>
            <span
              style={{
                fontSize: "52px",
                fontWeight: 800,
                color: "#ffffff",
                letterSpacing: "-2px",
              }}
            >
              pkgdocs
            </span>
            <div
              style={{
                background: "rgba(99,102,241,0.3)",
                border: "1px solid rgba(99,102,241,0.5)",
                borderRadius: "999px",
                padding: "4px 14px",
                fontSize: "18px",
                color: "#a5b4fc",
                fontWeight: 600,
              }}
            >
              beta
            </div>
          </div>

          {/* Headline */}
          <div
            style={{
              fontSize: "36px",
              fontWeight: 700,
              color: "#94a3b8",
              textAlign: "center",
              maxWidth: "800px",
              lineHeight: 1.3,
            }}
          >
            Visual docs for Python &amp; npm packages
          </div>

          {/* Pills */}
          <div style={{ display: "flex", gap: "16px", marginTop: "8px" }}>
            {[
              { label: "Story View", color: "#6366f1" },
              { label: "Live Demos", color: "#8b5cf6" },
              { label: "API Maps", color: "#06b6d4" },
              { label: "Recipes", color: "#10b981" },
            ].map(({ label, color }) => (
              <div
                key={label}
                style={{
                  background: `${color}22`,
                  border: `1px solid ${color}44`,
                  borderRadius: "999px",
                  padding: "8px 20px",
                  fontSize: "18px",
                  color,
                  fontWeight: 600,
                }}
              >
                {label}
              </div>
            ))}
          </div>

          {/* URL */}
          <div style={{ fontSize: "20px", color: "#475569", marginTop: "8px" }}>
            pkgdocs-swart.vercel.app
          </div>
        </div>
      </div>
    ),
    size
  );
}
