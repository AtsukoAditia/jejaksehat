import { ImageResponse } from "next/og";

export const dynamic = "force-static";

export function GET() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0d9468", color: "white", fontSize: 110, fontWeight: 900 }}>
      J+
    </div>,
    { width: 192, height: 192 },
  );
}
