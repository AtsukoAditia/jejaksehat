import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "JejakSehat",
    short_name: "JejakSehat",
    description:
      "Catat aktivitas gym, lari, perkembangan tubuh, dan target kesehatan.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f7f3",
    theme_color: "#1f7a4c",
    lang: "id",
    orientation: "portrait",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml"
      }
    ]
  };
}
