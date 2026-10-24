import { ImageResponse } from "next/og";
import { fonts, ink, paper } from "@/app/_og/render";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Home-screen icon (iOS). */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", background: ink, color: paper, fontFamily: "Archivo Expanded", fontSize: 120, paddingTop: 10 }}>
        R
      </div>
    ),
    { ...size, fonts },
  );
}
