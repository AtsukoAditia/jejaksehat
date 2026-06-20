import { ImageResponse } from "next/og";

export const alt = "JejakSehat — Gym, Lari dan Progress";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0d9468", color: "white", padding: 80 }}>
      <div style={{ display: "flex", flexDirection: "column", maxWidth: 760 }}>
        <span style={{ fontSize: 30, fontWeight: 800, color: "#dff7eb" }}>JEJAKSEHAT</span>
        <strong style={{ marginTop: 28, fontSize: 86, lineHeight: 1, letterSpacing: -5 }}>Setiap progres meninggalkan jejak.</strong>
        <span style={{ marginTop: 30, fontSize: 28, color: "#dff7eb" }}>Gym · Lari · Progress tubuh · Target kesehatan</span>
      </div>
      <div style={{ width: 250, height: 250, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 70, background: "#087553", fontSize: 125, fontWeight: 900 }}>J+</div>
    </div>,
    size,
  );
}
