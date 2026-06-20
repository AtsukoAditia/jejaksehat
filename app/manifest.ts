import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "JejakSehat — Gym, Lari & Progress",
    short_name: "JejakSehat",
    description:
      "Catat aktivitas gym, lari, perkembangan tubuh, dan target kesehatan dalam satu aplikasi.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#f3f8f4",
    theme_color: "#0d9468",
    lang: "id-ID",
    orientation: "any",
    categories: ["health", "fitness", "lifestyle"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Catat aktivitas",
        short_name: "Aktivitas baru",
        description: "Catat sesi gym atau lari baru.",
        url: "/dashboard/activities/new?source=shortcut",
        icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Lihat progress",
        short_name: "Progress",
        description: "Lihat progress tubuh dan target kesehatan.",
        url: "/dashboard/progress?source=shortcut",
        icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
    ],
  };
}
