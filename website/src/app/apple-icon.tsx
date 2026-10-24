import { ImageResponse } from "next/og";
import { LOGO_DOT, LOGO_PATH } from "@/components/logo-mark";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#f4f0e6" }}>
        <svg width="116" height="116" viewBox="0 0 32 32" fill="none">
          <path d={LOGO_PATH} stroke="#1f1c15" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={LOGO_DOT.cx} cy={LOGO_DOT.cy} r={LOGO_DOT.r} fill="#1f1c15" />
        </svg>
      </div>
    ),
    size,
  );
}
