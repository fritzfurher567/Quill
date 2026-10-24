import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { LOGO_DOT, LOGO_PATH } from "@/components/logo-mark";
import { product } from "@/config/site";

export const alt = `${product.name}: ${product.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const fontDir = path.join(process.cwd(), "src/app/fonts");
  const [regular, bold] = await Promise.all([
    readFile(path.join(fontDir, "gelasio-latin-400-normal.ttf")),
    readFile(path.join(fontDir, "gelasio-latin-700-normal.ttf")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 84px",
          background: "#f4f0e6",
          color: "#1f1c15",
          fontFamily: "Gelasio",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="64" height="64" viewBox="0 0 32 32" fill="none">
            <path d={LOGO_PATH} stroke="#1f1c15" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={LOGO_DOT.cx} cy={LOGO_DOT.cy} r={LOGO_DOT.r} fill="#1f1c15" />
          </svg>
          <div style={{ fontSize: 48, fontWeight: 700, letterSpacing: -1 }}>{product.name}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 104, lineHeight: 1.05, letterSpacing: -3, maxWidth: 940 }}>{product.tagline}</div>
          <div style={{ fontSize: 34, color: "#655f51" }}>Free and open source · Windows, macOS and Linux</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Gelasio", data: regular, weight: 400, style: "normal" },
        { name: "Gelasio", data: bold, weight: 700, style: "normal" },
      ],
    },
  );
}
