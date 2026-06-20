import { ImageResponse } from "next/og";

export const dynamic = "force-static";

export function GET() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0d9468" }}>
      <div style={{ width: 330, height: 330, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 90, background: "#087553", color: "white", fontSize: 180, fontWeight: 900 }}>
        J+
      </div>
    </div>,
    { width: 512, height: 512 },
  );
}
