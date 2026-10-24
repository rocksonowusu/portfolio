import { ImageResponse } from "next/og";
import { fonts, ink, paper } from "@/app/_og/render";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** Favicon: an ink square with a wide R. */
export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", background: ink, color: paper, fontFamily: "Archivo Expanded", fontSize: 44, paddingTop: 4 }}>
        R
      </div>
    ),
    { ...size, fonts },
  );
}
